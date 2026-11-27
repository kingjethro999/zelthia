import { connection } from "next/server";
import { State } from "country-state-city";
import { HttpError, handle, json } from "@/lib/server/api";
import { cleanCountry, countryName } from "@/lib/server/geo";
import { fetchService, politeThrottle } from "@/lib/server/http";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";

/**
 * Turns browser coordinates (sent only after the person allows location
 * access) into country, region and city using OpenStreetMap Nominatim.
 * Coordinates are rounded to about 100 m before they leave our server and
 * are not stored.
 */
export async function GET(req: Request) {
  await connection();
  try {
    const limit = await rateLimit(`geo:rev:${clientIp(req)}`, 20, 10 * 60_000);
    if (!limit.ok) throw new HttpError("Too many location lookups.", 429);
    const url = new URL(req.url);
    const lat = Number(url.searchParams.get("lat"));
    const lon = Number(url.searchParams.get("lon"));
    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lon) ||
      Math.abs(lat) > 90 ||
      Math.abs(lon) > 180
    ) {
      throw new HttpError("Invalid coordinates.", 400);
    }
    const rLat = lat.toFixed(3);
    const rLon = lon.toFixed(3);
    await politeThrottle("nominatim.openstreetmap.org", 1000);
    const res = await fetchService(
      "Nominatim",
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=10&addressdetails=1&lat=${rLat}&lon=${rLon}`,
      {
        headers: { Accept: "application/json", "Accept-Language": "en" },
        signal: AbortSignal.timeout(6000),
      },
    );
    if (!res.ok) throw new HttpError("Location lookup failed.", 502);
    const d = (await res.json()) as {
      address?: {
        country_code?: string;
        state?: string;
        region?: string;
        city?: string;
        town?: string;
        village?: string;
        county?: string;
        "ISO3166-2-lvl4"?: string;
      };
    };
    const a = d.address ?? {};
    const country = cleanCountry(a.country_code);
    if (!country) throw new HttpError("Location is outside any country.", 404);
    const iso = a["ISO3166-2-lvl4"]?.split("-")[1];
    const region =
      (iso && State.getStateByCodeAndCountry(iso, country)?.name) ||
      a.state ||
      a.region ||
      null;
    return json({
      geo: {
        country,
        countryName: countryName(country),
        region,
        city: a.city || a.town || a.village || a.county || null,
        lat: Number(rLat),
        lon: Number(rLon),
        source: "device",
      },
    });
  } catch (err) {
    return handle("GET /api/geo/reverse", err);
  }
}
