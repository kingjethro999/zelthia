import "server-only";
import { Pool } from "pg";

declare global {
  var __zelthiaPool: Pool | undefined;
  var __zelthiaSchema: { sql: string; ready: Promise<void> } | undefined;
}

function createPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  const local = /localhost|127\.0\.0\.1/.test(connectionString);
  const pool = new Pool({
    connectionString,
    ssl: local ? undefined : { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 30_000,
  });
  // The host drops idle connections; without this listener that error would
  // crash the process. The pool discards the dead client and opens a new one.
  pool.on("error", (err) => console.warn("Postgres idle client error", err.message));
  return pool;
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
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  title text not null default 'New chat',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists conversations_user_idx on conversations(user_id, updated_at desc);
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null default '',
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists messages_conversation_idx on messages(conversation_id, created_at);
create table if not exists attachments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  message_id uuid references messages(id) on delete cascade,
  name text not null,
  mime text not null,
  size integer not null default 0,
  storage_id text,
  resource_type text,
  format text,
  extracted_text text,
  created_at timestamptz not null default now()
);
create index if not exists attachments_message_idx on attachments(message_id);
create table if not exists facilities (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references users(id) on delete cascade,
  name text not null,
  kind text not null check (kind in ('pharmacy', 'clinic', 'hospital', 'diagnostic', 'store')),
  phone text not null default '',
  email text not null default '',
  address text not null default '',
  city text not null default '',
  state text not null default '',
  directions text not null default '',
  opening_hours text not null default '',
  license_number text not null default '',
  services text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists facilities_owner_idx on facilities(owner_id);
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references facilities(id) on delete cascade,
  name text not null,
  generic_name text not null default '',
  category text not null,
  form text not null default '',
  strength text not null default '',
  pack_size text not null default '',
  price_ngn numeric(12, 2),
  quantity integer not null default 0 check (quantity >= 0),
  low_stock_at integer not null default 5 check (low_stock_at >= 0),
  batch text not null default '',
  expires_on date,
  prescription_only boolean not null default false,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists products_facility_idx on products(facility_id);
alter table facilities add column if not exists directions_audio_id uuid references attachments(id) on delete set null;
alter table facilities add column if not exists verification_status text not null default 'none';
alter table facilities add column if not exists verification_note text not null default '';
alter table facilities add column if not exists verification_url text not null default '';
alter table facilities add column if not exists verified_at timestamptz;
`;

/** Creates tables on first use so deploys need no manual migration step. */
export function ensureSchema(): Promise<void> {
  // Keyed by the schema text so a long-running process re-applies new tables.
  if (globalThis.__zelthiaSchema?.sql !== SCHEMA) {
    const ready = pool()
      .query(SCHEMA)
      .then(() => undefined)
      .catch((err) => {
        globalThis.__zelthiaSchema = undefined;
        throw err;
      });
    globalThis.__zelthiaSchema = { sql: SCHEMA, ready };
  }
  return globalThis.__zelthiaSchema.ready;
}

export async function query<T extends object>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  await ensureSchema();
  const res = await pool().query(text, params);
  return res.rows as T[];
}
