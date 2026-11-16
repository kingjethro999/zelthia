import { deleteFacility, parseFacilityInput, updateFacility } from "@/lib/server/inventory";
import { HttpError, handle, json, readJson, requireUser } from "@/lib/server/api";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const facility = await updateFacility(id, user.id, parseFacilityInput(await readJson(req)));
    if (!facility) throw new HttpError("Facility not found.", 404);
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
