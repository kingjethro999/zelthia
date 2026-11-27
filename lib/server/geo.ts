import "server-only";
import { Country, State } from "country-state-city";
import { headers } from "next/headers";
import { clientIp, ipFromHeaders } from "./rate-limit";
import { fetchService } from "./http";

/**
 * Where a request comes from, worked out without asking the user:
 * 1. Hosting platform geo headers (Vercel, Cloudflare), which cost nothing and
 *    never leave our infrastructure.
 * 2. A lookup of the public IP address (ipwho.is) when no header is present.
 * 3. DEFAULT_COUNTRY (Nigeria if unset) for local development, where the IP is
 *    a loopback address and cannot be placed.
 *
 * This is approximate (city level at best). A precise position only comes
 * from the browser, after the person allows location access.
 */

export interface GeoInfo {
  /** ISO 3166-1 alpha-2, e.g. "NG", "GB", "US". */
  country: string;
  countryName: string;
  /** First-level region name when known, e.g. "Lagos", "England", "California". */
  region: string | null;
  city: string | null;
  lat: number | null;
  lon: number | null;
  source: "header" | "ip" | "default" | "device";
}

export function countryName(code: string): string {
  return Country.getCountryByCode(code)?.name ?? code;
}

export function isCountryCode(code: unknown): code is string {
  return (
    typeof code === "string" &&
    /^[A-Z]{2}$/.test(code) &&
    Boolean(Country.getCountryByCode(code))
  );
}

/** Country code from a client-supplied value, or null when it is not real. */
export function cleanCountry(raw: unknown): string | null {
  const code = typeof raw === "string" ? raw.trim().toUpperCase() : "";
  return isCountryCode(code) ? code : null;
}

export function defaultCountry(): string {
  return cleanCountry(process.env.DEFAULT_COUNTRY) ?? "NG";
}

const decode = (v: string | null) => {
  if (!v) return null;
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
};

const num = (v: string | null) => {
  const n = v == null ? NaN : Number(v);
  return Number.isFinite(n) ? n : null;
};

function fromHeaders(h: Headers): GeoInfo | null {
  const country =
    cleanCountry(h.get("x-vercel-ip-country")) ??
    cleanCountry(h.get("cf-ipcountry"));
  if (!country) return null;
  const regionCode = h.get("x-vercel-ip-country-region");
  const region = regionCode
    ? (State.getStateByCodeAndCountry(regionCode, country)?.name ?? null)
    : null;
  return {
    country,
    countryName: countryName(country),
    region,
    city: decode(h.get("x-vercel-ip-city")),
    lat: num(h.get("x-vercel-ip-latitude")),
    lon: num(h.get("x-vercel-ip-longitude")),
    source: "header",
  };
}

const isPublicIp = (ip: string) =>
  Boolean(ip) &&
  ip !== "unknown" &&
  !/^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|::1$|fc|fd|fe80)/i.test(
    ip,
  );

const ipCache = new Map<string, { at: number; geo: GeoInfo }>();
const IP_CACHE_MS = 6 * 60 * 60 * 1000;

async function fromIpLookup(ip: string): Promise<GeoInfo | null> {
  if (!isPublicIp(ip)) return null;
  const hit = ipCache.get(ip);
  if (hit && Date.now() - hit.at < IP_CACHE_MS) return hit.geo;
  try {
    const res = await fetchService(
      "IP location",
      `https://ipwho.is/${encodeURIComponent(ip)}?fields=success,country_code,region,city,latitude,longitude`,
      { signal: AbortSignal.timeout(2500) },
    );
    if (!res.ok) return null;
    const d = (await res.json()) as {
      success?: boolean;
      country_code?: string;
      region?: string;
      city?: string;
      latitude?: number;
      longitude?: number;
    };
    const country = cleanCountry(d.country_code);
    if (!d.success || !country) return null;
    const geo: GeoInfo = {
      country,
      countryName: countryName(country),
      region: d.region || null,
      city: d.city || null,
      lat: typeof d.latitude === "number" ? d.latitude : null,
      lon: typeof d.longitude === "number" ? d.longitude : null,
      source: "ip",
    };
    if (ipCache.size > 2000) ipCache.clear();
    ipCache.set(ip, { at: Date.now(), geo });
    return geo;
  } catch {
    return null;
  }
}

/** Approximate location of a request from its IP address. Never throws. */
export async function geoFromRequest(req: Request): Promise<GeoInfo> {
  return geoFromHeaders(req.headers, clientIp(req));
}

export async function geoFromHeaders(
  h: Headers,
  ip?: string,
): Promise<GeoInfo> {
  const header = fromHeaders(h);
  if (header) return header;
  const looked = await fromIpLookup(ip ?? "");
  if (looked) return looked;
  const country = defaultCountry();
  return {
    country,
    countryName: countryName(country),
    region: null,
    city: null,
    lat: null,
    lon: null,
    source: "default",
  };
}

/**
 * The country to scope results to: a device-confirmed country sent by the
 * browser wins over the IP guess (VPNs and roaming SIMs skew IP location).
 */
export async function resolveCountry(
  req: Request,
  clientCountry?: unknown,
): Promise<string> {
  return cleanCountry(clientCountry) ?? (await geoFromRequest(req)).country;
}

/** First-level regions (states, provinces, nations) of a country. */
export function regionsOf(country: string): { code: string; name: string }[] {
  if (!isCountryCode(country)) return [];
  return State.getStatesOfCountry(country)
    .map((s) => ({ code: s.isoCode, name: s.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function listCountries(): {
  code: string;
  name: string;
  phoneCode: string;
}[] {
  return Country.getAllCountries()
    .map((c) => ({ code: c.isoCode, name: c.name, phoneCode: c.phonecode }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

const shortText = (v: unknown) =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, 80) : null;
const coord = (v: unknown, max: number) =>
  typeof v === "number" && Number.isFinite(v) && Math.abs(v) <= max
    ? Number(v.toFixed(3))
    : null;

/**
 * Location for one request: the browser-confirmed position the client sent
 * (validated, rounded to ~100 m) or, when there is none, the IP location.
 */
export async function requestGeo(
  req: Request,
  clientGeo: unknown,
): Promise<GeoInfo> {
  const g =
    clientGeo && typeof clientGeo === "object"
      ? (clientGeo as Record<string, unknown>)
      : null;
  const country = cleanCountry(g?.country);
  if (g && country && g.source === "device") {
    return {
      country,
      countryName: countryName(country),
      region: shortText(g.region),
      city: shortText(g.city),
      lat: coord(g.lat, 90),
      lon: coord(g.lon, 180),
      source: "device",
    };
  }
  return geoFromRequest(req);
}

/** Visitor location inside a server component (reads request headers). */
export async function visitorGeo(): Promise<GeoInfo> {
  const h = await headers();
  return geoFromHeaders(h, ipFromHeaders(h));
}

/** ISO 4217 currency of a country, e.g. "NG" -> "NGN", "GB" -> "GBP". */
export function currencyOf(country: string): string {
  return Country.getCountryByCode(country)?.currency || "USD";
}
