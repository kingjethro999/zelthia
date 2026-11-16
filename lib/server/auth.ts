import "server-only";
import {
  createHash,
  randomBytes,
  scrypt as scryptCb,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import type { SessionUser, UserRole } from "@/lib/auth-types";
import { query } from "./db";

const scrypt = promisify(scryptCb) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

export const SESSION_COOKIE = "zelthia_session";
const SESSION_DAYS = 30;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString("base64")}$${key.toString("base64")}`;
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [scheme, saltB64, keyB64] = stored.split("$");
  if (scheme !== "scrypt" || !saltB64 || !keyB64) return false;
  const expected = Buffer.from(keyB64, "base64");
  const actual = await scrypt(password, Buffer.from(saltB64, "base64"), 64);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");

interface UserRow {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  onboarded_at: Date | null;
  password_hash: string;
}

export function toSessionUser(row: UserRow): SessionUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    onboarded: Boolean(row.onboarded_at),
  };
}

export async function findUserByEmail(email: string) {
  const rows = await query<UserRow>(
    "select * from users where email = $1 limit 1",
    [email.trim().toLowerCase()],
  );
  return rows[0] ?? null;
}

export async function createUser(input: {
  email: string;
  name: string;
  password: string;
  role: UserRole;
}) {
  const passwordHash = await hashPassword(input.password);
  const rows = await query<UserRow>(
    `insert into users (email, name, password_hash, role)
     values ($1, $2, $3, $4) returning *`,
    [
      input.email.trim().toLowerCase(),
      input.name.trim(),
      passwordHash,
      input.role,
    ],
  );
  return rows[0];
}

/** Issues a random session token; only its hash is stored. */
export async function startSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 864e5);
  await query(
    "insert into sessions (token_hash, user_id, expires_at) values ($1, $2, $3)",
    [sha256(token), userId, expires],
  );
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await query("delete from sessions where token_hash = $1", [sha256(token)]);
  }
  jar.delete(SESSION_COOKIE);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const rows = await query<UserRow>(
    `select u.* from sessions s join users u on u.id = s.user_id
     where s.token_hash = $1 and s.expires_at > now() limit 1`,
    [sha256(token)],
  );
  return rows[0] ? toSessionUser(rows[0]) : null;
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
