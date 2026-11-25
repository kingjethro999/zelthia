import {
  adjustProductQuantity,
  deleteProduct,
  parseProductInput,
  updateProduct,
} from "@/lib/server/inventory";
import {
  HttpError,
  assertSameOrigin,
  handle,
  json,
  readJson,
  requireProvider,
} from "@/lib/server/api";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  try {
    assertSameOrigin(req);
    const user = await requireProvider();
    const { id } = await params;
    const product = await updateProduct(
      id,
      user.id,
      parseProductInput(await readJson(req)),
    );
    if (!product) throw new HttpError("Product not found.", 404);
    return json({ product });
  } catch (err) {
    return handle("PUT /api/products/[id]", err);
  }
}

/** Quick stock change: { "delta": number }. */
export async function PATCH(req: Request, { params }: Ctx) {
  try {
    assertSameOrigin(req);
    const user = await requireProvider();
    const { id } = await params;
    const delta = Number((await readJson(req)).delta);
    if (!Number.isInteger(delta) || Math.abs(delta) > 100_000) {
      throw new HttpError("Change stock by a whole number.", 400);
    }
    const product = await adjustProductQuantity(id, user.id, delta);
    if (!product) throw new HttpError("Product not found.", 404);
    return json({ product });
  } catch (err) {
    return handle("PATCH /api/products/[id]", err);
  }
}

export async function DELETE(req: Request, { params }: Ctx) {
  try {
    assertSameOrigin(req);
    const user = await requireProvider();
    const { id } = await params;
    if (!(await deleteProduct(id, user.id)))
      throw new HttpError("Product not found.", 404);
    return json({ ok: true });
  } catch (err) {
    return handle("DELETE /api/products/[id]", err);
  }
}
