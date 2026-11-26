import {
  HttpError,
  assertSameOrigin,
  handle,
  json,
  readJson,
  requireAdmin,
} from "@/lib/server/api";
import {
  adminDecideVerification,
  getFacilityForAdmin,
  isUuid,
  setVerificationEvidence,
} from "@/lib/server/inventory";
import { rateLimit } from "@/lib/server/rate-limit";
import { gatherVerificationEvidence } from "@/lib/server/verify";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Ctx) {
  try {
    assertSameOrigin(req);
    const admin = await requireAdmin();
    const limit = await rateLimit(`admin:ver:${admin.id}`, 60, 10 * 60_000);
    if (!limit.ok) {
      throw new HttpError(
        `Too many admin actions. Try again in ${limit.retryAfter} seconds.`,
        429,
      );
    }
    const { id } = await params;
    if (!isUuid(id)) throw new HttpError("Invalid facility ID.", 400);

    const body = await readJson(req);
    const action = body.action;
    if (action !== "approve" && action !== "reject" && action !== "recheck") {
      throw new HttpError("Choose approve, reject, or recheck.", 400);
    }

    if (action === "recheck") {
      const facility = await getFacilityForAdmin(id);
      if (!facility) throw new HttpError("Facility not found.", 404);
      const result = await gatherVerificationEvidence(facility);
      const updated = await setVerificationEvidence(id, result);
      return json({ facility: updated, evidence: result.evidence });
    }

    const note = typeof body.note === "string" ? body.note.trim().slice(0, 300) : "";
    const rawUrl = typeof body.url === "string" ? body.url.trim().slice(0, 300) : "";
    if (action === "reject" && note.length < 4) {
      throw new HttpError(
        "Provide a brief reason when declining verification.",
        400,
      );
    }
    let url = "";
    if (rawUrl) {
      let parsed: URL;
      try {
        parsed = new URL(rawUrl);
      } catch {
        throw new HttpError("Enter a valid https:// proof URL.", 400);
      }
      if (parsed.protocol !== "https:") {
        throw new HttpError("Verification proof URL must start with https://.", 400);
      }
      url = parsed.toString();
    }

    const updated = await adminDecideVerification(id, admin.id, {
      action,
      note,
      url,
    });
    if (!updated) throw new HttpError("Facility not found.", 404);
    return json({ facility: updated });
  } catch (err) {
    return handle("POST /api/admin/verifications/[id]", err);
  }
}
