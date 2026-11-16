import { NextRequest, NextResponse } from "next/server";
import { processChatConversation } from "@/lib/ai/service";
import type { ChatRequestBody } from "@/lib/ai/types";
import { getSessionUser } from "@/lib/server/auth";
import { getProfile, sanitizeProfile } from "@/lib/server/profile";

const MAX_MESSAGES = 30;
const MAX_CHARS = 4000;

export async function POST(req: NextRequest) {
  let body: ChatRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Send a JSON body." }, { status: 400 });
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json({ error: "Messages are required." }, { status: 400 });
  }

  const messages = body.messages
    .filter(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string",
    )
    .slice(-MAX_MESSAGES)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));

  try {
    // Signed-in users: the saved profile is authoritative. Guests: what the device sent.
    let biometrics = sanitizeProfile(body.biometrics);
    try {
      const user = await getSessionUser();
      if (user) {
        const saved = await getProfile(user.id);
        if (saved) biometrics = sanitizeProfile(saved);
      }
    } catch (err) {
      console.warn("Chat: profile lookup failed, using request profile", err);
    }

    const response = await processChatConversation({ messages, biometrics });
    return NextResponse.json(response);
  } catch (err) {
    console.error("POST /api/chat failed", err);
    return NextResponse.json(
      {
        message:
          "Zelthia couldn't answer just now. If your symptoms are severe, go to the nearest health facility or call 112.",
        triageLevel: "moderate",
        model: "error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
