import { connection } from "next/server";
import { handle, json, requireAdminRead } from "@/lib/server/api";
import { listAuditLogsForAdmin } from "@/lib/server/admin";

export async function GET(req: Request) {
  await connection();
  try {
    await requireAdminRead();
    const { searchParams } = new URL(req.url);
    const data = await listAuditLogsForAdmin({
      q: searchParams.get("q") ?? undefined,
      action: searchParams.get("action") ?? undefined,
      targetType: searchParams.get("targetType") ?? undefined,
      limit: Number(searchParams.get("limit") ?? 60) || 60,
      offset: Number(searchParams.get("offset") ?? 0) || 0,
    });
    return json(data);
  } catch (err) {
    return handle("GET /api/admin/audit", err);
  }
}
