import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "zelthia_session";

/**
 * Fast cookie-presence check at the edge; server layouts and APIs re-validate
 * the session token against the database and resolve role-specific destinations.
 */
export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  // Old provider link: the dashboard now lives at /provider.
  if (pathname === "/inventory" && searchParams.get("mode") === "provider") {
    return NextResponse.redirect(new URL("/provider", request.url));
  }

  if (pathname === "/inventory") return NextResponse.next();

  // Signed-in users hitting "/" land inside their role workspace unless previewing "/?landing=1".
  if (pathname === "/") {
    if (hasSession && searchParams.get("landing") !== "1") {
      return NextResponse.redirect(new URL("/api/auth/entry", request.url));
    }
    return NextResponse.next();
  }

  // Signed-in users visiting /signin or /signup jump to their workspace unless switching accounts.
  if (pathname === "/signin" || pathname === "/signup") {
    if (hasSession && searchParams.get("switch") !== "1") {
      const entry = new URL("/api/auth/entry", request.url);
      const next = searchParams.get("next");
      if (next) entry.searchParams.set("next", next);
      return NextResponse.redirect(entry);
    }
    return NextResponse.next();
  }

  if (!hasSession) {
    const url = new URL("/signin", request.url);
    url.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    if (pathname.startsWith("/provider")) {
      url.searchParams.set("role", "provider");
    }
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/signin",
    "/signup",
    "/setup",
    "/account",
    "/provider",
    "/provider/:path*",
    "/inventory",
  ],
};
