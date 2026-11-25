import "server-only";
import { NextResponse } from "next/server";
import { SITE_URL } from "@/lib/utils";
import { getSessionUser } from "./auth";
import { ValidationError } from "./inventory";

export const json = (data: unknown, status = 200) =>
  NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) throw new HttpError("Sign in to manage your facility.", 401);
  return user;
}

export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user) throw new HttpError("Sign in to access admin tools.", 401);
  if (!user.isAdmin) throw new HttpError("Administrator access required.", 403);
  return user;
}

export class HttpError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

function isAllowedOrigin(candidate: string, reqUrl: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return false;
  }
  const allowed = new Set<string>();
  try {
    allowed.add(new URL(reqUrl).origin);
  } catch {
    /* ignore malformed req.url */
  }
  try {
    allowed.add(new URL(SITE_URL).origin);
  } catch {
    /* ignore malformed SITE_URL */
  }
  if (allowed.has(parsed.origin)) return true;
  if (
    process.env.NODE_ENV !== "production" &&
    parsed.protocol === "http:" &&
    (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1")
  ) {
    return true;
  }
  return false;
}

/**
 * Defense-in-depth CSRF check for state-changing endpoints. Rejects
 * cross-origin browser requests even if cookies are present.
 */
export function assertSameOrigin(req: Request): void {
  const origin = req.headers.get("origin");
  if (origin) {
    if (!isAllowedOrigin(origin, req.url)) {
      throw new HttpError("Cross-origin request rejected.", 403);
    }
    return;
  }
  const secFetchSite = req.headers.get("sec-fetch-site");
  if (secFetchSite && secFetchSite !== "same-origin" && secFetchSite !== "none") {
    throw new HttpError("Cross-origin request rejected.", 403);
  }
  const referer = req.headers.get("referer");
  if (referer && !isAllowedOrigin(referer, req.url)) {
    throw new HttpError("Cross-origin request rejected.", 403);
  }
}

/** Requires an explicit JSON Content-Type so form/text CSRF payloads are rejected. */
export function assertJson(req: Request): void {
  const ct = (req.headers.get("content-type") ?? "").toLowerCase();
  if (!ct.includes("application/json")) {
    throw new HttpError("Content-Type must be application/json.", 415);
  }
}

export async function readJson(req: Request): Promise<Record<string, unknown>> {
  assertJson(req);
  try {
    const body = await req.json();
    if (body && typeof body === "object" && !Array.isArray(body)) {
      return body as Record<string, unknown>;
    }
  } catch {
    /* handled below */
  }
  throw new HttpError("Send a JSON body.", 400);
}

/** Maps thrown errors to clear JSON responses; unexpected ones are logged. */
export function handle(where: string, err: unknown) {
  if (err instanceof HttpError) return json({ error: err.message }, err.status);
  if (err instanceof ValidationError)
    return json({ error: err.message, field: err.field }, 400);
  console.error(`${where} failed`, err);
  return json(
    { error: "Something went wrong on our side. Try again in a moment." },
    503,
  );
}
