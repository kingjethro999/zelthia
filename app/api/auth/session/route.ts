import { NextResponse, connection } from "next/server";
import { getSessionUser } from "@/lib/server/auth";
import { getProfile } from "@/lib/server/profile";
import type { SessionPayload } from "@/lib/auth-types";

export async function GET() {
  await connection();
  try {
    const user = await getSessionUser();
    const profile = user ? await getProfile(user.id) : null;
    return NextResponse.json<SessionPayload>(
      { user, profile },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (err) {
    console.error("GET /api/auth/session failed", err);
    return NextResponse.json(
      { user: null, profile: null, error: "Session service is unavailable." },
      { status: 503 },
    );
  }
}
