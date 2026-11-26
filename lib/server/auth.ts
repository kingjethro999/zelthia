import "server-only";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import type { SessionUser, UserRole } from "@/lib/auth-types";
import { readServerEnv } from "./admin-route";
import {
  CURRENT_TERMS_VERSION,
  aadAttachmentText,
  aadConvTitle,
  aadMessage,
  aadProfile,
  encryptText,
  hashPassword,
  sha256Hex,
  verifyPassword,
} from "./crypto";
import { query } from "./db";

export { hashPassword, verifyPassword };

export const SESSION_COOKIE = "zelthia_session";
const SESSION_DAYS = 30;

function adminEmails(): Set<string> {
  const raw = readServerEnv("ADMIN_EMAIL");
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isAdminEmail(email: string): boolean {
  return adminEmails().has(email.trim().toLowerCase());
}

export interface UserRow {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  onboarded_at: Date | null;
  password_hash: string;
  wrapped_dek: string | null;
}

export interface SessionContext {
  user: SessionUser;
  dek: Buffer;
  tokenHash: string;
}

export function toSessionUser(row: UserRow): SessionUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    onboarded: Boolean(row.onboarded_at),
    isAdmin: isAdminEmail(row.email),
    encrypted: Boolean(row.wrapped_dek),
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
  wrappedDek: string;
  termsVersion?: string;
}) {
  const passwordHash = await hashPassword(input.password);
  const rows = await query<UserRow>(
    `insert into users (email, name, password_hash, role, wrapped_dek, onboarded_at, terms_accepted_at, terms_version)
     values ($1, $2, $3, $4, $5, $6, now(), $7) returning *`,
    [
      input.email.trim().toLowerCase(),
      input.name.trim(),
      passwordHash,
      input.role,
      input.wrappedDek,
      input.role === "provider" ? new Date() : null,
      input.termsVersion ?? CURRENT_TERMS_VERSION,
    ],
  );
  return rows[0];
}

/**
 * Issues a split-key session cookie (`<sessionToken>.<dekBase64Url>`).
 * The database stores ONLY `sha256(sessionToken)`, never the DEK, so
 * database backups or staff cannot decrypt user data without an active user cookie.
 */
export async function startSession(userId: string, dek: Buffer) {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 864e5);
  await query("delete from sessions where expires_at <= now()").catch(() => {});
  await query(
    "insert into sessions (token_hash, user_id, expires_at) values ($1, $2, $3)",
    [sha256Hex(token), userId, expires],
  );
  const cookieValue = `${token}.${dek.toString("base64url")}`;
  (await cookies()).set(SESSION_COOKIE, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

function parseSessionCookie(
  raw: string | undefined,
): { token: string; dek: Buffer } | null {
  if (!raw) return null;
  const dot = raw.indexOf(".");
  if (dot <= 0) return null;
  const token = raw.slice(0, dot);
  const dekB64 = raw.slice(dot + 1);
  if (!token || !dekB64) return null;
  try {
    const dek = Buffer.from(dekB64, "base64url");
    if (dek.length !== 32) return null;
    return { token, dek };
  } catch {
    return null;
  }
}

export async function endSession() {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  const parsed = parseSessionCookie(raw);
  const token = parsed?.token ?? raw;
  if (token) {
    await query("delete from sessions where token_hash = $1", [
      sha256Hex(token),
    ]);
  }
  jar.delete(SESSION_COOKIE);
}

export async function getSessionContext(): Promise<SessionContext | null> {
  const raw = (await cookies()).get(SESSION_COOKIE)?.value;
  const parsed = parseSessionCookie(raw);
  if (!parsed) return null;
  const tokenHash = sha256Hex(parsed.token);
  const rows = await query<UserRow>(
    `select u.* from sessions s join users u on u.id = s.user_id
      where s.token_hash = $1 and s.expires_at > now() and u.wrapped_dek is not null limit 1`,
    [tokenHash],
  );
  if (!rows[0]) return null;
  return { user: toSessionUser(rows[0]), dek: parsed.dek, tokenHash };
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const ctx = await getSessionContext();
  return ctx?.user ?? null;
}

export async function revokeOtherSessions(
  userId: string,
  currentTokenHash: string,
) {
  const rows = await query<{ n: string }>(
    `with deleted as (
       delete from sessions where user_id = $1 and token_hash <> $2 returning 1
     )
     select count(*)::text as n from deleted`,
    [userId, currentTokenHash],
  );
  return Number(rows[0]?.n ?? 0);
}

/**
 * Encrypts any legacy plaintext profile, conversations, messages, and chat
 * attachment transcripts for `userId` on first sign-in after encryption rollout,
 * then wipes the plaintext columns.
 */
export async function migrateUserPlaintextData(
  userId: string,
  dek: Buffer,
): Promise<void> {
  const profiles = await query<{ data: unknown }>(
    "select data from health_profiles where user_id = $1 and data_enc is null",
    [userId],
  );
  if (profiles[0]) {
    const enc = encryptText(
      JSON.stringify(profiles[0].data ?? {}),
      dek,
      aadProfile(userId),
    );
    await query(
      "update health_profiles set data_enc = $2, data = '{}'::jsonb, updated_at = now() where user_id = $1",
      [userId, enc],
    );
  }

  const convs = await query<{ id: string; title: string }>(
    "select id, title from conversations where user_id = $1 and title_enc is null",
    [userId],
  );
  for (const c of convs) {
    const titleEnc = encryptText(c.title, dek, aadConvTitle(userId, c.id));
    await query(
      "update conversations set title_enc = $2, title = 'Encrypted chat' where id = $1 and user_id = $3",
      [c.id, titleEnc, userId],
    );
  }

  const msgs = await query<{
    id: string;
    conversation_id: string;
    content: string;
    meta: unknown;
  }>(
    `select m.id, m.conversation_id, m.content, m.meta
       from messages m join conversations c on c.id = m.conversation_id
      where c.user_id = $1 and m.payload_enc is null`,
    [userId],
  );
  for (const m of msgs) {
    const payloadEnc = encryptText(
      JSON.stringify({ content: m.content, meta: m.meta ?? {} }),
      dek,
      aadMessage(userId, m.conversation_id, m.id),
    );
    await query(
      "update messages set payload_enc = $2, content = '', meta = '{}'::jsonb where id = $1",
      [m.id, payloadEnc],
    );
  }

  const atts = await query<{ id: string; extracted_text: string | null }>(
    "select id, extracted_text from attachments where user_id = $1 and message_id is not null and extracted_enc is null",
    [userId],
  );
  for (const a of atts) {
    const extractedEnc = encryptText(
      a.extracted_text ?? "",
      dek,
      aadAttachmentText(userId, a.id),
    );
    await query(
      "update attachments set extracted_enc = $2, extracted_text = '' where id = $1 and user_id = $3",
      [a.id, extractedEnc, userId],
    );
  }
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
