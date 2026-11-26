import { connection } from "next/server";
import { handle, json, requireAdmin } from "@/lib/server/api";
import { getAdminOverview } from "@/lib/server/admin";

export async function GET() {
  await connection();
  try {
    await requireAdmin();
    const overview = await getAdminOverview();
    return json(overview);
  } catch (err) {
    return handle("GET /api/admin/overview", err);
  }
}
