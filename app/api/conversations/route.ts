import { NextResponse, connection } from "next/server";
import { getSessionUser } from "@/lib/server/auth";
import { listConversations } from "@/lib/server/conversations";

export async function GET() {
  await connection();
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Sign in to see your chats." }, { status: 401 });
    return NextResponse.json(
      { conversations: await listConversations(user.id) },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (err) {
    console.error("GET /api/conversations failed", err);
    return NextResponse.json({ error: "Couldn't load your chats." }, { status: 503 });
  }
}
