import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";

const SLUG_RE = /^[A-Za-z0-9_-]{16,128}$/;

/**
 * Returns the server-only secret URL segment for the hidden admin portal.
 * Never prefix this variable with NEXT_PUBLIC_ and never expose it to
 * unauthenticated or non-admin callers.
 */
export function getAdminRouteSlug(): string | null {
  const raw = process.env.ADMIN_ROUTE_SLUG?.trim() ?? "";
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
