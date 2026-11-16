import { NextResponse } from "next/server";
import {
  findUserByEmail,
  startSession,
  toSessionUser,
  verifyPassword,
} from "@/lib/server/auth";
import { getProfile } from "@/lib/server/profile";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Send a JSON body." }, { status: 400 });
  }
  const email = String(body.email ?? "")
    .trim()
    .toLowerCase();
  const password = String(body.password ?? "");
  if (!email || !password) {
    return NextResponse.json(
      { error: "Enter your email and password." },
      { status: 400 },
    );
  }

  try {
    const row = await findUserByEmail(email);
    const ok = row ? await verifyPassword(password, row.password_hash) : false;
    if (!row || !ok) {
      return NextResponse.json(
        { error: "Email or password is incorrect." },
        { status: 401 },
      );
    }
    await startSession(row.id);
    const profile = await getProfile(row.id);
    return NextResponse.json({ user: toSessionUser(row), profile });
  } catch (err) {
    console.error("POST /api/auth/signin failed", err);
    return NextResponse.json(
      { error: "Sign-in is unavailable right now. Try again in a moment." },
      { status: 503 },
    );
  }
}
