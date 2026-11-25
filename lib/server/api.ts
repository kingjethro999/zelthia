import "server-only";
import { NextResponse } from "next/server";
import { getSessionUser } from "./auth";
import { ValidationError } from "./inventory";

export const json = (data: unknown, status = 200) =>
  NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) throw new HttpError("Sign in to manage your facility.", 401);
  return user;
}

export class HttpError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export async function readJson(req: Request): Promise<Record<string, unknown>> {
  try {
    const body = await req.json();
    if (body && typeof body === "object") return body;
  } catch {
    /* handled below */
  }
  throw new HttpError("Send a JSON body.", 400);
}

/** Maps thrown errors to clear JSON responses; unexpected ones are logged. */
export function handle(where: string, err: unknown) {
  if (err instanceof HttpError) return json({ error: err.message }, err.status);
  if (err instanceof ValidationError)
    return json({ error: err.message, field: err.field }, 400);
  console.error(`${where} failed`, err);
  return json(
    { error: "Something went wrong on our side. Try again in a moment." },
    503,
  );
}
