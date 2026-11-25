import { connection } from "next/server";
import { handle, json, requireAdmin } from "@/lib/server/api";
import { listVerificationsForAdmin } from "@/lib/server/inventory";
import type { VerificationStatus } from "@/lib/inventory-types";

const ALLOWED_FILTERS = new Set<string>(["pending", "verified", "rejected", "all"]);

export async function GET(req: Request) {
  await connection();
  try {
    await requireAdmin();
    const url = new URL(req.url);
    const raw = url.searchParams.get("status") ?? "pending";
    const status = ALLOWED_FILTERS.has(raw)
      ? (raw as VerificationStatus | "all")
      : "pending";
    const items = await listVerificationsForAdmin(status);
    return json({ items });
  } catch (err) {
    return handle("GET /api/admin/verifications", err);
  }
}
