import { NextResponse } from "next/server";
import {
  EMAIL_RE,
  createUser,
  findUserByEmail,
  startSession,
  toSessionUser,
} from "@/lib/server/auth";
import type { UserRole } from "@/lib/auth-types";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Send a JSON body." }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "")
    .trim()
    .toLowerCase();
  const password = String(body.password ?? "");
  const role: UserRole = body.role === "provider" ? "provider" : "patient";

  if (name.length < 2 || name.length > 80) {
    return NextResponse.json(
      { error: "Enter your full name.", field: "name" },
      { status: 400 },
    );
  }
  if (!EMAIL_RE.test(email) || email.length > 160) {
    return NextResponse.json(
      { error: "Enter a valid email address.", field: "email" },
      { status: 400 },
    );
  }
  if (password.length < 8 || password.length > 128) {
    return NextResponse.json(
      {
        error: "Use at least 8 characters for your password.",
        field: "password",
      },
      { status: 400 },
    );
  }

  try {
    if (await findUserByEmail(email)) {
      return NextResponse.json(
        {
          error: "An account with this email already exists. Sign in instead.",
          field: "email",
        },
        { status: 409 },
      );
    }
    const row = await createUser({ name, email, password, role });
    await startSession(row.id);
    return NextResponse.json({ user: toSessionUser(row) }, { status: 201 });
  } catch (err) {
    console.error("POST /api/auth/signup failed", err);
    return NextResponse.json(
      {
        error:
          "We couldn't create your account right now. Try again in a moment.",
      },
      { status: 503 },
    );
  }
}
