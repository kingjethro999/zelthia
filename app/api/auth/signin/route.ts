import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getAdminBasePath } from "@/lib/server/admin-route";
import {
  findUserByEmail,
  migrateUserPlaintextData,
  startSession,
  toSessionUser,
  verifyPassword,
} from "@/lib/server/auth";
import {
  DUMMY_PASSWORD_HASH,
  generateDek,
  unwrapDek,
  wrapDek,
} from "@/lib/server/crypto";
import { query } from "@/lib/server/db";
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
      {
        error: `Too many sign-in attempts. Try again in ${retryAfter} seconds.`,
      },
      { status: 429 },
    );
  }

  try {
    const row = await findUserByEmail(email);
    // Always run scrypt even when the email does not exist to prevent timing enumeration.
    const ok = await verifyPassword(
      password,
      row?.password_hash ?? DUMMY_PASSWORD_HASH,
    );
    if (!row || !ok) {
      return NextResponse.json(
        { error: "Email or password is incorrect." },
        { status: 401 },
      );
    }

    let dek: Buffer;
    if (row.wrapped_dek) {
      dek = await unwrapDek(row.wrapped_dek, password);
    } else {
      dek = generateDek();
      const wrappedDek = await wrapDek(dek, password);
      await query("update users set wrapped_dek = $2 where id = $1", [
        row.id,
        wrappedDek,
      ]);
      row.wrapped_dek = wrappedDek;
      await migrateUserPlaintextData(row.id, dek);
    }

    await startSession(row.id, dek);
    const profile = await getProfile(row.id, dek);
    const sessionUser = toSessionUser(row);
    const adminPath = sessionUser.isAdmin ? getAdminBasePath() : null;
    return NextResponse.json(
      {
        user: sessionUser,
        profile,
        ...(adminPath ? { redirectTo: adminPath, adminPath } : {}),
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (err) {
    console.error("POST /api/auth/signin failed", err);
    return NextResponse.json(
      { error: "Sign-in is unavailable right now. Try again in a moment." },
      { status: 503 },
    );
  }
}
