import "server-only";
import { isIP } from "node:net";

export const ZELTHIA_USER_AGENT =
  "ZelthiaBot/1.0 (+https://zelthia.vercel.app; health-verification)";

const lastHostHit = new Map<string, number>();

function isPrivateIpv4(ip: string): boolean {
  const parts = ip.split(".").map((p) => Number.parseInt(p, 10));
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) {
    return true;
  }
  const [a, b] = parts;
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a >= 224) return true;
  return false;
}

function isPrivateIp(host: string): boolean {
  const bare = host.replace(/^\[|\]$/g, "").split("%")[0].toLowerCase();
  const kind = isIP(bare);
  if (kind === 4) return isPrivateIpv4(bare);
  if (kind === 6) {
    if (bare === "::" || bare === "::1") return true;
    if (bare.startsWith("fc") || bare.startsWith("fd")) return true;
    if (/^fe[89ab]/.test(bare)) return true;
    const mapped = bare.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isPrivateIpv4(mapped[1]);
    return false;
  }
  return false;
}

/**
 * Validates outbound HTTP(S) destinations against SSRF (localhost, metadata
 * endpoints, private/loopback IPv4/IPv6 ranges, and embedded credentials).
 */
export function assertSafeExternalUrl(rawUrl: string): URL {
  let u: URL;
  try {
    u = new URL(rawUrl);
  } catch {
    throw new Error("Invalid external URL");
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") {
    throw new Error("Unsupported external URL protocol");
  }
  if (u.username || u.password) {
    throw new Error("External URL credentials are not permitted");
  }
  const host = u.hostname.toLowerCase();
  if (
    !host ||
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host === "metadata.google.internal" ||
    isPrivateIp(host)
  ) {
    throw new Error(`Blocked internal or unsafe external host: ${host}`);
  }
  return u;
}

/**
 * Polite per-host throttling for direct government registry queries
 * (such as `.gov.ng` and `.gov.cn`) so fragile public servers are never flooded.
 */
export async function politeThrottle(
  hostname: string,
  minGapMs = 1500,
): Promise<void> {
  const key = hostname.toLowerCase();
  const now = Date.now();
  const prev = lastHostHit.get(key) ?? 0;
  const wait = prev + minGapMs - now;
  lastHostHit.set(key, now + Math.max(0, wait));
  if (wait > 0) {
    await new Promise((r) => setTimeout(r, wait));
  }
  if (lastHostHit.size > 200) {
    const oldest = lastHostHit.keys().next().value;
    if (oldest) lastHostHit.delete(oldest);
  }
}

/**
 * fetch() for third-party APIs. Validates destination safety, identifies
 * ZelthiaBot politely, and rethrows network/timeout failures clearly.
 */
export async function fetchService(
  service: string,
  url: string,
  init: RequestInit = {},
): Promise<Response> {
  assertSafeExternalUrl(url);
  const headers = new Headers(init.headers);
  if (!headers.has("user-agent")) {
    headers.set("User-Agent", ZELTHIA_USER_AGENT);
  }
  try {
    const res = await fetch(url, { ...init, headers });
    if (res.url) {
      assertSafeExternalUrl(res.url);
    }
    return res;
  } catch (err) {
    const e = err as Error;
    const reason =
      e.name === "TimeoutError" || e.name === "AbortError"
        ? "timed out"
        : `was unreachable (${e.message})`;
    throw new Error(`${service} ${reason}`, { cause: err });
  }
}
