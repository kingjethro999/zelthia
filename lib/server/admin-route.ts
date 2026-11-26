import "server-only";
import fs from "node:fs";
import path from "node:path";
import { createHash, timingSafeEqual } from "node:crypto";

const SLUG_RE = /^[A-Za-z0-9_-]{16,128}$/;

let cachedDevEnv: {
  mtimeKey: string;
  values: Record<string, string>;
} | null = null;

function parseEnvFileInto(filePath: string, out: Record<string, string>): void {
  if (!fs.existsSync(filePath)) return;
  const raw = fs.readFileSync(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
}

/**
 * Reads a server-only environment variable. In non-production builds, checks
 * `.env` / `.env.local` mtimes so long-lived `next dev` worker pools observe
 * edits immediately without requiring a dev server restart.
 */
export function readServerEnv(key: string): string {
  if (process.env.NODE_ENV !== "production") {
    try {
      const root = process.cwd();
      const files = [".env", ".env.local"].map((f) => path.join(root, f));
      const mtimeKey = files
        .map((f) => {
          try {
            return String(fs.statSync(f).mtimeMs);
          } catch {
            return "0";
          }
        })
        .join("|");
      if (!cachedDevEnv || cachedDevEnv.mtimeKey !== mtimeKey) {
        const values: Record<string, string> = {};
        for (const f of files) parseEnvFileInto(f, values);
        cachedDevEnv = { mtimeKey, values };
      }
      if (key in cachedDevEnv.values) {
        return cachedDevEnv.values[key].trim();
      }
    } catch {
      /* fall through to process.env */
    }
  }
  return (process.env[key] ?? "").trim();
}

/**
 * Returns the server-only secret URL segment for the hidden admin portal.
 * Never prefix this variable with NEXT_PUBLIC_ and never expose it to
 * unauthenticated or non-admin callers.
 */
export function getAdminRouteSlug(): string | null {
  const raw = readServerEnv("ADMIN_ROUTE_SLUG");
  return SLUG_RE.test(raw) ? raw : null;
}

export function getAdminBasePath(): string | null {
  const slug = getAdminRouteSlug();
  return slug ? `/${slug}` : null;
}

/** Constant-time slug check using fixed-length SHA-256 digests. */
export function isValidAdminSlug(candidate: string): boolean {
  const slug = getAdminRouteSlug();
  if (!slug || !SLUG_RE.test(candidate)) return false;
  const a = createHash("sha256").update(candidate, "utf8").digest();
  const b = createHash("sha256").update(slug, "utf8").digest();
  return timingSafeEqual(a, b);
}
