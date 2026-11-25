import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import {
  findUserByEmail,
  startSession,
  toSessionUser,
  verifyPassword,
} from "@/lib/server/auth";
import { assertJson, assertSameOrigin, handle } from "@/lib/server/api";
import { getProfile } from "@/lib/server/profile";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    assertJson(req);
  } catch (err) {
    return handle("POST /api/auth/signin", err);
  }

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

  const ip = clientIp(req);
  const emailHash = createHash("sha256").update(email).digest("hex");
  const [ipLimit, emailLimit] = await Promise.all([
    rateLimit(`signin:ip:${ip}`, 15, 15 * 60_000),
    rateLimit(`signin:email:${emailHash}`, 8, 15 * 60_000),
  ]);
  if (!ipLimit.ok || !emailLimit.ok) {
    const retryAfter = Math.max(ipLimit.retryAfter, emailLimit.retryAfter);
    return NextResponse.json(
      { error: `Too many sign-in attempts. Try again in ${retryAfter} seconds.` },
      { status: 429 },
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
