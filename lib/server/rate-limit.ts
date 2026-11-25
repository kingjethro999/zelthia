import "server-only";
import { query } from "./db";

const buckets = new Map<string, number[]>();

function memoryRateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= max) {
    buckets.set(key, hits);
    return {
      ok: false,
      retryAfter: Math.max(1, Math.ceil((windowMs - (now - hits[0])) / 1000)),
    };
  }
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) {
      if (!v.some((t) => now - t < windowMs)) buckets.delete(k);
    }
  }
  return { ok: true, retryAfter: 0 };
}

/**
 * Sliding-window limiter backed by PostgreSQL so limits hold across
 * serverless instances, falling back to process memory on transient DB errors.
 */
export async function rateLimit(
  key: string,
  max: number,
  windowMs: number,
): Promise<{ ok: boolean; retryAfter: number }> {
  try {
    await query(
      "delete from rate_limits where bucket_key = $1 and hit_at < now() - ($2 * interval '1 millisecond')",
      [key, windowMs],
    );
    const rows = await query<{ n: number; oldest: Date | null }>(
      `select count(*)::int as n, min(hit_at) as oldest
         from rate_limits
        where bucket_key = $1
          and hit_at >= now() - ($2 * interval '1 millisecond')`,
      [key, windowMs],
    );
    const count = rows[0]?.n ?? 0;
    if (count >= max) {
      const oldest = rows[0]?.oldest;
      const retryAfter = oldest
        ? Math.max(1, Math.ceil((oldest.getTime() + windowMs - Date.now()) / 1000))
        : Math.max(1, Math.ceil(windowMs / 1000));
      return { ok: false, retryAfter };
    }
    await query("insert into rate_limits (bucket_key, hit_at) values ($1, now())", [key]);
    if (Math.random() < 0.02) {
      void query("delete from rate_limits where hit_at < now() - interval '2 hours'").catch(() => {});
    }
    return { ok: true, retryAfter: 0 };
  } catch (err) {
    console.warn("Postgres rate limiter unavailable; using memory fallback", (err as Error).message);
    return memoryRateLimit(key, max, windowMs);
  }
}

function rightmostIp(header: string | null): string {
  if (!header) return "";
  const parts = header
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return parts[parts.length - 1] ?? "";
}

/**
 * Extracts the client IP without trusting the leftmost spoofable XFF entry.
 * Prefers platform-verified proxy headers, then the rightmost XFF hop.
 */
export function clientIp(req: Request): string {
  const raw =
    rightmostIp(req.headers.get("x-vercel-forwarded-for")) ||
    req.headers.get("cf-connecting-ip")?.trim() ||
    req.headers.get("x-real-ip")?.trim() ||
    rightmostIp(req.headers.get("x-forwarded-for")) ||
    "unknown";
  return raw.slice(0, 64);
}
