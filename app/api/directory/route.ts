import { connection } from "next/server";
import { directoryCities, searchDirectory } from "@/lib/server/inventory";
import { handle, json } from "@/lib/server/api";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";

/** Public search over real facility listings only. */
export async function GET(req: Request) {
  await connection();
  try {
    const limit = rateLimit(`dir:${clientIp(req)}`, 120, 10 * 60_000);
    if (!limit.ok) return json({ error: `Too many searches. Try again in ${limit.retryAfter} seconds.` }, 429);
    const url = new URL(req.url);
    const q = (url.searchParams.get("q") ?? "").trim().slice(0, 80);
    const city = url.searchParams.get("city")?.trim() || null;
    const category = url.searchParams.get("category")?.trim() || null;
    const inStock = url.searchParams.get("inStock") === "1";
    const terms = q ? [q, ...q.split(/\s+/).filter((w) => w.length > 3)] : [];
    const [matches, cities] = await Promise.all([
      searchDirectory({ terms, city, category, inStockOnly: inStock, limit: 40 }),
      directoryCities(),
    ]);
    return json({ matches, cities });
  } catch (err) {
    return handle("GET /api/directory", err);
  }
}
