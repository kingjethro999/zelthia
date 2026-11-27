import { handle, json } from "@/lib/server/api";
import { cleanCountry, regionsOf } from "@/lib/server/geo";

/** States, provinces or nations of one country: /api/geo/regions?country=GB */
export async function GET(req: Request) {
  try {
    const country = cleanCountry(new URL(req.url).searchParams.get("country"));
    return json({ regions: country ? regionsOf(country) : [] });
  } catch (err) {
    return handle("GET /api/geo/regions", err);
  }
}
