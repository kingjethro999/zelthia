import {
  HttpError,
  assertSameOrigin,
  handle,
  json,
  readJson,
  requireAdmin,
} from "@/lib/server/api";
import { runAdminMaintenance } from "@/lib/server/admin";
import { rateLimit } from "@/lib/server/rate-limit";

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const admin = await requireAdmin();
    const limit = await rateLimit(`admin:maint:${admin.id}`, 20, 10 * 60_000);
    if (!limit.ok) {
      throw new HttpError(
        `Too many maintenance runs. Try again in ${limit.retryAfter} seconds.`,
        429,
      );
    }
    const body = await readJson(req);
    if (
      body.action !== "prune_sessions" &&
      body.action !== "prune_rate_limits"
    ) {
      throw new HttpError(
        "Choose prune_sessions or prune_rate_limits.",
        400,
      );
    }
    const res = await runAdminMaintenance(body.action, admin.id);
    return json(res);
  } catch (err) {
    return handle("POST /api/admin/system/maintenance", err);
  }
}
