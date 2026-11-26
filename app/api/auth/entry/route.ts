import { NextResponse, connection } from "next/server";
import { SESSION_COOKIE, getSessionUser } from "@/lib/server/auth";
import { getAdminBasePath } from "@/lib/server/admin-route";
import { resolveServerHomePath, safeRelativeNext } from "@/lib/server/home";

export async function GET(req: Request) {
  await connection();
  const url = new URL(req.url);
  const next = safeRelativeNext(url.searchParams.get("next"));
  const user = await getSessionUser();

  if (!user) {
    const res = NextResponse.redirect(new URL("/", req.url), {
      status: 307,
      headers: { "Cache-Control": "private, no-store" },
    });
    res.cookies.delete(SESSION_COOKIE);
    return res;
  }

  const home = await resolveServerHomePath(user);
  let dest = home;
  if (user.isAdmin) {
    const adminBase = getAdminBasePath();
    if (
      next &&
      adminBase &&
      (next === adminBase || next.startsWith(`${adminBase}/`))
    ) {
      dest = next;
    }
  } else if (next) {
    dest = next;
  }

  return NextResponse.redirect(new URL(dest, req.url), {
    status: 307,
    headers: { "Cache-Control": "private, no-store" },
  });
}
