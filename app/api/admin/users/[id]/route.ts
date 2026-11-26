import {
  HttpError,
  assertSameOrigin,
  handle,
  json,
  readJson,
  requireAdmin,
} from "@/lib/server/api";
import { adminRevokeUserSessions, adminSetUserRole } from "@/lib/server/admin";
import { isUuid } from "@/lib/server/inventory";
import { rateLimit } from "@/lib/server/rate-limit";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    assertSameOrigin(req);
    const admin = await requireAdmin();
    const limit = await rateLimit(`admin:user:${admin.id}`, 60, 10 * 60_000);
    if (!limit.ok) {
      throw new HttpError(
        `Too many admin actions. Try again in ${limit.retryAfter} seconds.`,
        429,
      );
    }
    const { id } = await params;
    if (!isUuid(id)) throw new HttpError("Invalid user ID.", 400);

    const body = await readJson(req);
    if (body.action === "set_role") {
      if (body.role !== "patient" && body.role !== "provider") {
        throw new HttpError("Role must be patient or provider.", 400);
      }
      const updated = await adminSetUserRole(id, body.role, admin.id);
      if (!updated) throw new HttpError("User not found.", 404);
      return json({ user: updated });
    }

    if (body.action === "revoke_sessions") {
      const res = await adminRevokeUserSessions(id, admin.id);
      if (!res.exists) throw new HttpError("User not found.", 404);
      return json({ revoked: res.revoked });
    }

    throw new HttpError("Choose set_role or revoke_sessions.", 400);
  } catch (err) {
    return handle("PATCH /api/admin/users/[id]", err);
  }
}
