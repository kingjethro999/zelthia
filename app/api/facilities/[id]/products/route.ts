import { connection } from "next/server";
import { createProduct, getOwnedFacility, listProducts, parseProductInput } from "@/lib/server/inventory";
import { HttpError, handle, json, readJson, requireUser } from "@/lib/server/api";

type Ctx = { params: Promise<{ id: string }> };

async function owned(params: Ctx["params"]) {
  const user = await requireUser();
  const { id } = await params;
  const facility = await getOwnedFacility(id, user.id);
  if (!facility) throw new HttpError("Facility not found.", 404);
  return facility;
}

export async function GET(_req: Request, { params }: Ctx) {
  await connection();
  try {
    const facility = await owned(params);
    return json({ products: await listProducts(facility.id) });
  } catch (err) {
    return handle("GET /api/facilities/[id]/products", err);
  }
}

export async function POST(req: Request, { params }: Ctx) {
  try {
    const facility = await owned(params);
    const product = await createProduct(facility.id, parseProductInput(await readJson(req)));
    return json({ product }, 201);
  } catch (err) {
    return handle("POST /api/facilities/[id]/products", err);
  }
}
