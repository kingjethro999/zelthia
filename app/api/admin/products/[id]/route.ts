import {
  HttpError,
  assertSameOrigin,
  handle,
  json,
  readJson,
  requireAdmin,
} from "@/lib/server/api";
import { adminDeleteProduct } from "@/lib/server/admin";
import { isUuid } from "@/lib/server/inventory";
import { rateLimit } from "@/lib/server/rate-limit";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(req: Request, { params }: Ctx) {
  try {
    assertSameOrigin(req);
    const admin = await requireAdmin();
    const limit = await rateLimit(`admin:prod:${admin.id}`, 60, 10 * 60_000);
    if (!limit.ok) {
      throw new HttpError(
        `Too many admin actions. Try again in ${limit.retryAfter} seconds.`,
        429,
      );
    }
    const { id } = await params;
    if (!isUuid(id)) throw new HttpError("Invalid product ID.", 400);
    const body = await readJson(req);
    const reason =
      typeof body.reason === "string" ? body.reason.trim().slice(0, 300) : "";
    if (reason.length < 3) {
      throw new HttpError(
        "Provide a brief reason before removing a listing.",
        400,
      );
    }
    const res = await adminDeleteProduct(id, admin.id, reason);
    if (!res.deleted) throw new HttpError("Product not found.", 404);
    return json({ deleted: true, name: res.name });
  } catch (err) {
    return handle("DELETE /api/admin/products/[id]", err);
  }
}
