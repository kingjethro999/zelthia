import { NextResponse } from "next/server";
import { endSession } from "@/lib/server/auth";
import { assertSameOrigin, handle } from "@/lib/server/api";

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    await endSession();
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Error && "status" in err) {
      return handle("POST /api/auth/signout", err);
    }
    console.error("POST /api/auth/signout failed", err);
    return NextResponse.json(
      { error: "Sign-out failed. Try again." },
      { status: 503 },
    );
  }
}
