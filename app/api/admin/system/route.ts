import { connection } from "next/server";
import { handle, json, requireAdminRead } from "@/lib/server/api";
import { getAdminSystemHealth } from "@/lib/server/admin";

export async function GET() {
  await connection();
  try {
    await requireAdminRead();
    const health = await getAdminSystemHealth();
    return json(health);
  } catch (err) {
    return handle("GET /api/admin/system", err);
  }
}
