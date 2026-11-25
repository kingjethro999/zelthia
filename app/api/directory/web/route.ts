import { connection } from "next/server";
import { searchImages, searchPlaces } from "@/lib/server/web-search";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";
import { handle, json } from "@/lib/server/api";

/** Live web search, used when nothing is listed on Zelthia. */
export async function GET(req: Request) {
  await connection();
  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get("q") ?? "").trim().slice(0, 80);
    if (q.length < 2)
      return json({ error: "Type what you're looking for." }, 400);
    const limit = await rateLimit(`web:${clientIp(req)}`, 10, 10 * 60_000);
    if (!limit.ok)
      return json(
        {
          error: `Too many searches. Try again in ${limit.retryAfter} seconds.`,
        },
        429,
      );
    const city = url.searchParams.get("city")?.trim() || null;
    const [{ places }, images] = await Promise.all([
      searchPlaces(q, city, 8),
      searchImages(q, city, 8),
    ]);
    return json({ places, images });
  } catch (err) {
    return handle("GET /api/directory/web", err);
  }
}
