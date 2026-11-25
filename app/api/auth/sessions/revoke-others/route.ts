import { NextResponse } from "next/server";
import { getSessionContext, revokeOtherSessions } from "@/lib/server/auth";
import { assertSameOrigin, handle } from "@/lib/server/api";

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const ctx = await getSessionContext();
    if (!ctx) {
      return NextResponse.json({ error: "Sign in first." }, { status: 401 });
    }
    const revoked = await revokeOtherSessions(ctx.user.id, ctx.tokenHash);
    return NextResponse.json(
      { ok: true, revoked },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (err) {
    if (err instanceof Error && "status" in err) {
      return handle("POST /api/auth/sessions/revoke-others", err);
    }
    console.error("POST /api/auth/sessions/revoke-others failed", err);
    return NextResponse.json(
      { error: "Could not sign out other devices." },
      { status: 503 },
    );
  }
}
