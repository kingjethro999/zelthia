import { connection } from "next/server";
import { handle, json, requireAdmin } from "@/lib/server/api";
import { listUsersForAdmin } from "@/lib/server/admin";

export async function GET(req: Request) {
  await connection();
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const data = await listUsersForAdmin({
      q: searchParams.get("q") ?? undefined,
      role: searchParams.get("role") ?? undefined,
      limit: Number(searchParams.get("limit") ?? 50) || 50,
      offset: Number(searchParams.get("offset") ?? 0) || 0,
    });
    return json(data);
  } catch (err) {
    return handle("GET /api/admin/users", err);
  }
}
