import { connection } from "next/server";
import { handle, json, requireAdminRead } from "@/lib/server/api";
import { listFacilitiesForAdmin } from "@/lib/server/admin";

export async function GET(req: Request) {
  await connection();
  try {
    await requireAdminRead();
    const { searchParams } = new URL(req.url);
    const data = await listFacilitiesForAdmin({
      q: searchParams.get("q") ?? undefined,
      kind: searchParams.get("kind") ?? undefined,
      verification: searchParams.get("verification") ?? undefined,
      city: searchParams.get("city") ?? undefined,
      limit: Number(searchParams.get("limit") ?? 50) || 50,
      offset: Number(searchParams.get("offset") ?? 0) || 0,
    });
    return json(data);
  } catch (err) {
    return handle("GET /api/admin/facilities", err);
  }
}
