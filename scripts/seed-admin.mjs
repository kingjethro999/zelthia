import fs from "node:fs";
import path from "node:path";
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scrypt as scryptCb,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import pg from "pg";

const scrypt = promisify(scryptCb);
const SCRYPT_OPTS = { N: 16384, r: 8, p: 1, maxmem: 32 * 1024 * 1024 };
const DEK_BYTES = 32;
const IV_BYTES = 12;
const DEK_AAD = Buffer.from("zelthia:dek:v1", "utf8");
const CURRENT_TERMS_VERSION = "2026-11-25";

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  if (typeof process.loadEnvFile === "function") {
    try {
      process.loadEnvFile(filePath);
      return;
    } catch {
      /* fall back to manual parse */
    }
  }
  const raw = fs.readFileSync(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) {
      process.env[key] = val;
    }
  }
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const [k, inline] = a.slice(2).split("=");
      if (inline !== undefined) out[k] = inline;
      else if (argv[i + 1] && !argv[i + 1].startsWith("--")) out[k] = argv[++i];
    }
  }
  return out;
}

async function hashPassword(password) {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, 64, SCRYPT_OPTS);
  return `scrypt$${salt.toString("base64")}$${key.toString("base64")}`;
}

async function verifyPassword(password, stored) {
  const [scheme, saltB64, keyB64] = stored.split("$");
  if (scheme !== "scrypt" || !saltB64 || !keyB64) return false;
  const expected = Buffer.from(keyB64, "base64");
  const actual = await scrypt(
    password,
    Buffer.from(saltB64, "base64"),
    64,
    SCRYPT_OPTS,
  );
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

async function wrapDek(dek, password) {
  const salt = randomBytes(16);
  const kek = await scrypt(password, salt, DEK_BYTES, SCRYPT_OPTS);
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", kek, iv);
  cipher.setAAD(DEK_AAD);
  const ct = Buffer.concat([cipher.update(dek), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [
    "v1",
    salt.toString("base64"),
    iv.toString("base64"),
    tag.toString("base64"),
    ct.toString("base64"),
  ].join("$");
}

async function unwrapDek(wrapped, password) {
  const [version, saltB64, ivB64, tagB64, ctB64] = wrapped.split("$");
  if (version !== "v1" || !saltB64 || !ivB64 || !tagB64 || !ctB64) {
    throw new Error("Invalid wrapped DEK format");
  }
  const kek = await scrypt(
    password,
    Buffer.from(saltB64, "base64"),
    DEK_BYTES,
    SCRYPT_OPTS,
  );
  const decipher = createDecipheriv(
    "aes-256-gcm",
    kek,
    Buffer.from(ivB64, "base64"),
  );
  decipher.setAAD(DEK_AAD);
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(ctB64, "base64")),
    decipher.final(),
  ]);
}

async function main() {
  loadEnvFile(path.join(process.cwd(), ".env"));
  const args = parseArgs(process.argv.slice(2));

  const email = (args.email || process.env.ADMIN_SEED_EMAIL || "")
    .trim()
    .toLowerCase();
  const password = args.password || process.env.ADMIN_SEED_PASSWORD || "";
  const name = (
    args.name ||
    process.env.ADMIN_SEED_NAME ||
    "Zelthia Admin"
  ).trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    throw new Error("Provide a valid admin email via ADMIN_SEED_EMAIL or --email.");
  }
  if (!password || password.length < 8) {
    throw new Error(
      "Provide a password (min 8 chars) via ADMIN_SEED_PASSWORD or --password.",
    );
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set in environment or .env.");
  }

  const local = /localhost|127\.0\.0\.1/.test(connectionString);
  const ca = process.env.DATABASE_CA_CERT?.replace(/\\n/g, "\n");
  const pool = new pg.Pool({
    connectionString,
    ssl: local ? undefined : { rejectUnauthorized: true, ...(ca ? { ca } : {}) },
    max: 2,
  });

  try {
    await pool.query(`
      create table if not exists users (
        id uuid primary key default gen_random_uuid(),
        email text not null unique,
        name text not null,
        password_hash text not null,
        role text not null default 'patient' check (role in ('patient', 'provider')),
        onboarded_at timestamptz,
        created_at timestamptz not null default now()
      );
      create table if not exists sessions (
        token_hash text primary key,
        user_id uuid not null references users(id) on delete cascade,
        expires_at timestamptz not null,
        created_at timestamptz not null default now()
      );
      alter table users add column if not exists wrapped_dek text;
      alter table users add column if not exists terms_accepted_at timestamptz;
      alter table users add column if not exists terms_version text not null default '';
    `);

    const passwordHash = await hashPassword(password);
    const dek = randomBytes(DEK_BYTES);
    const wrappedDek = await wrapDek(dek, password);

    const res = await pool.query(
      `insert into users (email, name, password_hash, role, wrapped_dek, onboarded_at, terms_accepted_at, terms_version)
       values ($1, $2, $3, 'patient', $4, now(), now(), $5)
       on conflict (email) do update
         set name = excluded.name,
             password_hash = excluded.password_hash,
             wrapped_dek = excluded.wrapped_dek,
             onboarded_at = coalesce(users.onboarded_at, now()),
             terms_accepted_at = coalesce(users.terms_accepted_at, now()),
             terms_version = excluded.terms_version
       returning id, email, name, role, password_hash, wrapped_dek, onboarded_at`,
      [email, name, passwordHash, wrappedDek, CURRENT_TERMS_VERSION],
    );

    const row = res.rows[0];
    await pool.query("delete from sessions where user_id = $1", [row.id]);

    const passOk = await verifyPassword(password, row.password_hash);
    const unwrapped = await unwrapDek(row.wrapped_dek, password);
    const dekOk = unwrapped.equals(dek);

    if (!passOk || !dekOk) {
      throw new Error("Post-seed verification failed.");
    }

    const adminEmails = (process.env.ADMIN_EMAIL || "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    const inAllowlist = adminEmails.includes(email);

    console.log(
      JSON.stringify({
        seeded: true,
        id: row.id,
        email: row.email,
        name: row.name,
        role: row.role,
        onboarded: Boolean(row.onboarded_at),
        passwordVerified: passOk,
        dekVerified: dekOk,
        inAdminEmailAllowlist: inAllowlist,
      }),
    );
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
