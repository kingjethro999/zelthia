import { NextRequest, NextResponse } from "next/server";
import { processChatConversation } from "@/lib/ai/service";
import { BiometricProfile, ChatRequestBody } from "@/lib/ai/types";

export async function POST(req: NextRequest) {
  try {
    let body: ChatRequestBody;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request payload" },
        { status: 400 },
      );
    }

    const { messages, biometrics } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required and must not be empty" },
        { status: 400 },
      );
    }

    const response = await processChatConversation({
      messages,
      biometrics: biometrics as BiometricProfile | undefined,
    });

    return NextResponse.json(response, { status: 200 });
  } catch (err: unknown) {
    console.error("API /api/chat error:", err);
    return NextResponse.json(
      {
        message:
          "Zelthia encountered an unexpected technical issue. For urgent medical symptoms, please visit your nearest healthcare facility or emergency service immediately.",
        triageLevel: "moderate",
        model: "system-error-handler",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
