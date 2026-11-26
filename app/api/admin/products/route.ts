import { connection } from "next/server";
import { handle, json, requireAdminRead } from "@/lib/server/api";
import { listProductsForAdmin } from "@/lib/server/admin";

export async function GET(req: Request) {
  await connection();
  try {
    await requireAdminRead();
    const { searchParams } = new URL(req.url);
    const data = await listProductsForAdmin({
      q: searchParams.get("q") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      stock: searchParams.get("stock") ?? undefined,
      expiry: searchParams.get("expiry") ?? undefined,
      rx: searchParams.get("rx") ?? undefined,
      limit: Number(searchParams.get("limit") ?? 50) || 50,
      offset: Number(searchParams.get("offset") ?? 0) || 0,
    });
    return json(data);
  } catch (err) {
    return handle("GET /api/admin/products", err);
  }
}
