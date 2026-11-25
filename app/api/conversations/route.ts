import { NextResponse, connection } from "next/server";
import { getSessionContext } from "@/lib/server/auth";
import { listConversations } from "@/lib/server/conversations";

export async function GET() {
  await connection();
  try {
    const ctx = await getSessionContext();
    if (!ctx)
      return NextResponse.json(
        { error: "Sign in to see your chats." },
        { status: 401 },
      );
    return NextResponse.json(
      { conversations: await listConversations(ctx.user.id, ctx.dek) },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (err) {
    console.error("GET /api/conversations failed", err);
    return NextResponse.json(
      { error: "Couldn't load your chats." },
      { status: 503 },
    );
  }
}
