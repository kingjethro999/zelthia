import "server-only";
import { Pool } from "pg";

declare global {
  var __zelthiaPool: Pool | undefined;
  var __zelthiaSchema: Promise<void> | undefined;
}

function createPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  const local = /localhost|127\.0\.0\.1/.test(connectionString);
  return new Pool({
    connectionString,
    ssl: local ? undefined : { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 30_000,
  });
}

export function pool(): Pool {
  globalThis.__zelthiaPool ??= createPool();
  return globalThis.__zelthiaPool;
}

const SCHEMA = `
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
create index if not exists sessions_user_idx on sessions(user_id);
create table if not exists health_profiles (
  user_id uuid primary key references users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
`;

/** Creates tables on first use so deploys need no manual migration step. */
export function ensureSchema(): Promise<void> {
  globalThis.__zelthiaSchema ??= pool()
    .query(SCHEMA)
    .then(() => undefined)
    .catch((err) => {
      globalThis.__zelthiaSchema = undefined;
      throw err;
    });
  return globalThis.__zelthiaSchema;
}

export async function query<T extends object>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  await ensureSchema();
  const res = await pool().query(text, params);
  return res.rows as T[];
}
