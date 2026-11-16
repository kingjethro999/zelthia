import { NextResponse } from "next/server";
import { endSession } from "@/lib/server/auth";

export async function POST() {
  try {
    await endSession();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/auth/signout failed", err);
    return NextResponse.json(
      { error: "Sign-out failed. Try again." },
      { status: 503 },
    );
  }
}
