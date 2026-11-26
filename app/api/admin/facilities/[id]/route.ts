import { connection } from "next/server";
import {
  HttpError,
  assertSameOrigin,
  handle,
  json,
  readJson,
  requireAdmin,
  requireAdminRead,
} from "@/lib/server/api";
import {
  adminDeleteFacility,
  getFacilityDetailForAdmin,
} from "@/lib/server/admin";
import { isUuid } from "@/lib/server/inventory";
import { rateLimit } from "@/lib/server/rate-limit";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  await connection();
  try {
    await requireAdminRead();
    const { id } = await params;
    if (!isUuid(id)) throw new HttpError("Invalid facility ID.", 400);
    const detail = await getFacilityDetailForAdmin(id);
    if (!detail) throw new HttpError("Facility not found.", 404);
    return json(detail);
  } catch (err) {
    return handle("GET /api/admin/facilities/[id]", err);
  }
}

export async function DELETE(req: Request, { params }: Ctx) {
  try {
    assertSameOrigin(req);
    const admin = await requireAdmin();
    const limit = await rateLimit(`admin:fac:${admin.id}`, 40, 10 * 60_000);
    if (!limit.ok) {
      throw new HttpError(
        `Too many admin actions. Try again in ${limit.retryAfter} seconds.`,
        429,
      );
    }
    const { id } = await params;
    if (!isUuid(id)) throw new HttpError("Invalid facility ID.", 400);
    const body = await readJson(req);
    const reason =
      typeof body.reason === "string" ? body.reason.trim().slice(0, 300) : "";
    if (reason.length < 3) {
      throw new HttpError(
        "Provide a brief reason before removing a facility.",
        400,
      );
    }
    const res = await adminDeleteFacility(id, admin.id, reason);
    if (!res.deleted) throw new HttpError("Facility not found.", 404);
    return json({ deleted: true, name: res.name });
  } catch (err) {
    return handle("DELETE /api/admin/facilities/[id]", err);
  }
}
