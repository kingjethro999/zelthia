import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "zelthia_session";

/** Fast cookie check; APIs re-validate the session against the database. */
export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Old provider link: the dashboard now lives at /provider.
  if (pathname === "/inventory" && searchParams.get("mode") === "provider") {
    return NextResponse.redirect(new URL("/provider", request.url));
  }

  if (pathname === "/inventory") return NextResponse.next();

  if (!request.cookies.has(SESSION_COOKIE)) {
    const url = new URL("/signin", request.url);
    url.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    if (pathname.startsWith("/provider"))
      url.searchParams.set("role", "provider");
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/setup",
    "/account",
    "/provider",
    "/provider/:path*",
    "/inventory",
  ],
};
