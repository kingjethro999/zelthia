import "server-only";
import type { SessionUser } from "@/lib/auth-types";
import { getAdminBasePath } from "./admin-route";
import { query } from "./db";

/**
 * Validates that a `next` destination is a safe same-origin workspace path
 * (blocks open redirects, protocol-relative URLs, API paths, and auth loops).
 */
export function safeRelativeNext(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== "string") return null;
  if (!raw.startsWith("/") || raw.startsWith("//")) return null;
  if (
    raw === "/api" ||
    raw.startsWith("/api/") ||
    raw === "/signin" ||
    raw.startsWith("/signin?") ||
    raw === "/signup" ||
    raw.startsWith("/signup?") ||
    raw === "/admin" ||
    raw.startsWith("/admin/")
  ) {
    return null;
  }
  return raw;
}

/** Resolves the authoritative workspace home path for an authenticated user. */
export async function resolveServerHomePath(user: SessionUser): Promise<string> {
  if (user.isAdmin) {
    return getAdminBasePath() ?? "/account";
  }
  if (user.role === "provider") {
    const rows = await query<{ n: number }>(
      "select count(*)::int as n from facilities where owner_id = $1",
      [user.id],
    );
    return (rows[0]?.n ?? 0) === 0 ? "/provider/new?welcome=1" : "/provider";
  }
  return user.onboarded ? "/chat" : "/setup";
}
