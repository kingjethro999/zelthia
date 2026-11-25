import { NextResponse, connection } from "next/server";
import { getSessionContext } from "@/lib/server/auth";
import { exportUserConversations } from "@/lib/server/conversations";
import { getProfile } from "@/lib/server/profile";

/** Exports the authenticated user's decrypted profile and chat history (NDPA/GDPR portability). */
export async function GET() {
  await connection();
  try {
    const ctx = await getSessionContext();
    if (!ctx) {
      return NextResponse.json({ error: "Sign in to export your data." }, { status: 401 });
    }
    const [profile, conversations] = await Promise.all([
      getProfile(ctx.user.id, ctx.dek),
      exportUserConversations(ctx.user.id, ctx.dek),
    ]);
    const payload = {
      exportedAt: new Date().toISOString(),
      account: {
        id: ctx.user.id,
        name: ctx.user.name,
        email: ctx.user.email,
        role: ctx.user.role,
        encryptedAtRest: Boolean(ctx.user.encrypted),
      },
      healthProfile: profile,
      conversations,
    };
    return new NextResponse(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": 'attachment; filename="zelthia-my-data.json"',
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("GET /api/account/export failed", err);
    return NextResponse.json(
      { error: "Could not export your data right now." },
      { status: 503 },
    );
  }
}
