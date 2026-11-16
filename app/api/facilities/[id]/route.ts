import { deleteFacility, parseFacilityInput, setVerification, updateFacility } from "@/lib/server/inventory";
import { verifyFacility } from "@/lib/server/verify";

export const maxDuration = 60;
import { HttpError, handle, json, readJson, requireUser } from "@/lib/server/api";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  try {
    const user = await requireUser();
    const { id } = await params;
    let facility = await updateFacility(id, user.id, parseFacilityInput(await readJson(req)));
    if (!facility) throw new HttpError("Facility not found.", 404);
    // A new or changed licence number resets status to "none"; check it again.
    if (facility.licenseNumber && facility.verification.status === "none") {
      facility = (await setVerification(facility.id, await verifyFacility(facility))) ?? facility;
    }
    return json({ facility });
  } catch (err) {
    return handle("PUT /api/facilities/[id]", err);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const user = await requireUser();
    const { id } = await params;
    if (!(await deleteFacility(id, user.id))) throw new HttpError("Facility not found.", 404);
    return json({ ok: true });
  } catch (err) {
    return handle("DELETE /api/facilities/[id]", err);
  }
}
