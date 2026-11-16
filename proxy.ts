import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "zelthia_session";

/** Fast cookie check; the API re-validates the session against the database. */
export function proxy(request: NextRequest) {
  if (!request.cookies.has(SESSION_COOKIE)) {
    const url = new URL("/signin", request.url);
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/setup", "/account"],
};
