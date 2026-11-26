import {
  deleteFacility,
  parseFacilityInput,
  setVerificationEvidence,
  updateFacility,
} from "@/lib/server/inventory";
import { deletePrivate } from "@/lib/server/storage";
import { gatherVerificationEvidence } from "@/lib/server/verify";
import {
  HttpError,
  assertSameOrigin,
  handle,
  json,
  readJson,
  requireProvider,
} from "@/lib/server/api";
import { rateLimit } from "@/lib/server/rate-limit";

export const maxDuration = 60;

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  try {
    assertSameOrigin(req);
    const user = await requireProvider();
    const limit = await rateLimit(`fac:update:${user.id}`, 20, 15 * 60_000);
    if (!limit.ok) {
      throw new HttpError(
        `Too many facility updates. Try again in ${limit.retryAfter} seconds.`,
        429,
      );
    }
    const { id } = await params;
    const updated = await updateFacility(
      id,
      user.id,
      parseFacilityInput(await readJson(req)),
    );
    if (!updated) throw new HttpError("Facility not found.", 404);

    if (updated.orphanedAudio) {
      void deletePrivate(updated.orphanedAudio).catch((err) =>
        console.warn("Orphaned facility audio cleanup failed", err),
      );
    }

    let facility = updated.facility;
    // A new or changed licence number resets status to "none"; queue preliminary evidence for admin review.
    if (facility.licenseNumber && facility.verification.status === "none") {
      const checkLimit = await rateLimit(
        `fac:verify:${user.id}`,
        5,
        60 * 60_000,
      );
      if (checkLimit.ok) {
        facility =
          (await setVerificationEvidence(
            facility.id,
            await gatherVerificationEvidence(facility),
          )) ?? facility;
      } else {
        facility =
          (await setVerificationEvidence(facility.id, {
            status: "pending",
            note: "Submitted for admin review.",
            url: "",
            evidence: [],
          })) ?? facility;
      }
    }
    return json({ facility });
  } catch (err) {
    return handle("PUT /api/facilities/[id]", err);
  }
}

export async function DELETE(req: Request, { params }: Ctx) {
  try {
    assertSameOrigin(req);
    const user = await requireProvider();
    const { id } = await params;
    const { deleted, orphanedAudio } = await deleteFacility(id, user.id);
    if (!deleted) throw new HttpError("Facility not found.", 404);
    if (orphanedAudio) {
      void deletePrivate(orphanedAudio).catch((err) =>
        console.warn("Deleted facility audio cleanup failed", err),
      );
    }
    return json({ ok: true });
  } catch (err) {
    return handle("DELETE /api/facilities/[id]", err);
  }
}
