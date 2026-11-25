import { NextResponse, connection } from "next/server";
import { getSessionUser } from "@/lib/server/auth";
import { getProfile } from "@/lib/server/profile";
import type { SessionPayload } from "@/lib/auth-types";
import { query } from "@/lib/server/db";

export async function GET() {
  await connection();
  try {
    const user = await getSessionUser();
    const profile = user ? await getProfile(user.id) : null;
    let facilityCount: number | null = null;
    if (user?.role === "provider") {
      const rows = await query<{ n: number }>(
        "select count(*)::int as n from facilities where owner_id = $1",
        [user.id],
      );
      facilityCount = rows[0]?.n ?? 0;
    }
    return NextResponse.json<SessionPayload>(
      { user, profile, facilityCount },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (err) {
    console.error("GET /api/auth/session failed", err);
    return NextResponse.json(
      {
        user: null,
        profile: null,
        facilityCount: null,
        error: "Session service is unavailable.",
      },
      { status: 503 },
    );
  }
}
