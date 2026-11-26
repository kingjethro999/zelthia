import "server-only";
import type {
  AdminAuditEntry,
  AdminFacilityDetail,
  AdminFacilityListItem,
  AdminOverviewData,
  AdminProductListItem,
  AdminProductSummary,
  AdminSystemHealth,
  AdminUserItem,
} from "@/lib/admin-types";
import type { UserRole } from "@/lib/auth-types";
import {
  FACILITY_KINDS,
  type FacilityKind,
  type VerificationEvidence,
  type VerificationStatus,
} from "@/lib/inventory-types";
import { isAdminEmail } from "./auth";
import { readServerEnv } from "./admin-route";
import { query } from "./db";
import {
  isUuid,
  listVerificationsForAdmin,
  toFacility,
  toProduct,
} from "./inventory";
import { deletePrivate } from "./storage";

const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

function getAdminEmailList(): string[] {
  return readServerEnv("ADMIN_EMAIL")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function getServiceStatusList() {
  return [
    {
      id: "database",
      label: "PostgreSQL Database",
      category: "Core",
      configured: Boolean(process.env.DATABASE_URL?.trim()),
    },
    {
      id: "admin_allowlist",
      label: "Admin Allowlist",
      category: "Security",
      configured: getAdminEmailList().length > 0,
    },
    {
      id: "admin_route",
      label: "Stealth Admin Portal Slug",
      category: "Security",
      configured: /^[A-Za-z0-9_-]{16,128}$/.test(
        readServerEnv("ADMIN_ROUTE_SLUG"),
      ),
    },
    {
      id: "cloudinary",
      label: "Cloudinary Private Vault",
      category: "Storage",
      configured: Boolean(
        process.env.CLOUDINARY_CLOUD_NAME?.trim() &&
        process.env.CLOUDINARY_API_KEY?.trim() &&
        process.env.CLOUDINARY_SECRET?.trim(),
      ),
    },
    {
      id: "groq",
      label: "Groq Inference & Whisper",
      category: "AI",
      configured: Boolean(process.env.GROQ_API_KEY?.trim()),
    },
    {
      id: "gemini",
      label: "Google Gemini AI",
      category: "AI",
      configured: Boolean(process.env.GEMINI_API_KEY?.trim()),
    },
    {
      id: "firecrawl",
      label: "Firecrawl Web & .gov.ng Registry",
      category: "Search",
      configured: Boolean(process.env.FIRECRAWL_API_KEY?.trim()),
    },
    {
      id: "tavily",
      label: "Tavily Web Search",
      category: "Search",
      configured: Boolean(process.env.TAVILY_API_KEY?.trim()),
    },
  ];
}

export async function logAdminAction(
  adminId: string,
  action: string,
  targetType: string,
  targetId: string | null,
  details: Record<string, unknown> = {},
): Promise<void> {
  await query(
    `insert into admin_audit_log (admin_id, action, target_type, target_id, details)
     values ($1, $2, $3, $4, $5::jsonb)`,
    [adminId, action, targetType, targetId, JSON.stringify(details)],
  );
}

/* ---------- Overview ---------- */

export async function getAdminOverview(): Promise<AdminOverviewData> {
  const started = Date.now();

  const [
    userAgg,
    facAgg,
    prodAgg,
    actAgg,
    seriesRows,
    pendingPreview,
    recentAudit,
  ] = await Promise.all([
    query<{
      total: number;
      patients: number;
      providers: number;
      encrypted: number;
      onboarded: number;
    }>(`
      select
        count(*)::int as total,
        count(*) filter (where role = 'patient')::int as patients,
        count(*) filter (where role = 'provider')::int as providers,
        count(*) filter (where wrapped_dek is not null)::int as encrypted,
        count(*) filter (where onboarded_at is not null)::int as onboarded
      from users
    `),
    query<{
      total: number;
      verified: number;
      pending: number;
      rejected: number;
      none: number;
      cities_count: number;
    }>(`
      select
        count(*)::int as total,
        count(*) filter (where verification_status = 'verified')::int as verified,
        count(*) filter (where verification_status = 'pending')::int as pending,
        count(*) filter (where verification_status = 'rejected')::int as rejected,
        count(*) filter (where verification_status = 'none')::int as none,
        count(distinct nullif(trim(city), ''))::int as cities_count
      from facilities
    `),
    query<{
      total: number;
      in_stock: number;
      low_stock: number;
      out_of_stock: number;
      expiring_soon: number;
      expired: number;
      rx_only: number;
    }>(`
      select
        count(*)::int as total,
        count(*) filter (where quantity > low_stock_at)::int as in_stock,
        count(*) filter (where quantity > 0 and quantity <= low_stock_at)::int as low_stock,
        count(*) filter (where quantity = 0)::int as out_of_stock,
        count(*) filter (where expires_on is not null and expires_on >= current_date and expires_on <= current_date + interval '30 days')::int as expiring_soon,
        count(*) filter (where expires_on is not null and expires_on < current_date)::int as expired,
        count(*) filter (where prescription_only)::int as rx_only
      from products
    `),
    query<{
      conversations: number;
      messages: number;
      active_sessions: number;
      rate_hits: number;
    }>(`
      select
        (select count(*)::int from conversations) as conversations,
        (select count(*)::int from messages) as messages,
        (select count(*)::int from sessions where expires_at > now()) as active_sessions,
        (select count(*)::int from rate_limits where hit_at >= now() - interval '24 hours') as rate_hits
    `),
    query<{
      day: string;
      users: number;
      conversations: number;
      facilities: number;
    }>(`
      with days as (
        select generate_series(current_date - interval '13 days', current_date, interval '1 day')::date as d
      ),
      u as (
        select created_at::date as d, count(*)::int as n from users
        where created_at >= current_date - interval '13 days' group by 1
      ),
      c as (
        select created_at::date as d, count(*)::int as n from conversations
        where created_at >= current_date - interval '13 days' group by 1
      ),
      f as (
        select created_at::date as d, count(*)::int as n from facilities
        where created_at >= current_date - interval '13 days' group by 1
      )
      select
        to_char(days.d, 'YYYY-MM-DD') as day,
        coalesce(u.n, 0) as users,
        coalesce(c.n, 0) as conversations,
        coalesce(f.n, 0) as facilities
      from days
      left join u on u.d = days.d
      left join c on c.d = days.d
      left join f on f.d = days.d
      order by days.d asc
    `),
    listVerificationsForAdmin("pending"),
    listAuditLogsForAdmin({ limit: 8, offset: 0 }),
  ]);

  const dbLatencyMs = Math.max(1, Date.now() - started);
  const services = getServiceStatusList();
  const u = userAgg[0] ?? {
    total: 0,
    patients: 0,
    providers: 0,
    encrypted: 0,
    onboarded: 0,
  };
  const f = facAgg[0] ?? {
    total: 0,
    verified: 0,
    pending: 0,
    rejected: 0,
    none: 0,
    cities_count: 0,
  };
  const p = prodAgg[0] ?? {
    total: 0,
    in_stock: 0,
    low_stock: 0,
    out_of_stock: 0,
    expiring_soon: 0,
    expired: 0,
    rx_only: 0,
  };
  const a = actAgg[0] ?? {
    conversations: 0,
    messages: 0,
    active_sessions: 0,
    rate_hits: 0,
  };

  return {
    users: u,
    facilities: {
      total: f.total,
      verified: f.verified,
      pending: f.pending,
      rejected: f.rejected,
      none: f.none,
      citiesCount: f.cities_count,
    },
    products: {
      total: p.total,
      inStock: p.in_stock,
      lowStock: p.low_stock,
      outOfStock: p.out_of_stock,
      expiringSoon: p.expiring_soon,
      expired: p.expired,
      rxOnly: p.rx_only,
    },
    activity: {
      conversations: a.conversations,
      messages: a.messages,
      activeSessions: a.active_sessions,
      rateLimitHits24h: a.rate_hits,
    },
    series14d: seriesRows.map((r) => ({
      date: r.day,
      users: r.users,
      conversations: r.conversations,
      facilities: r.facilities,
    })),
    pendingPreview: pendingPreview.slice(0, 5),
    recentAudit: recentAudit.items,
    systemSummary: {
      dbLatencyMs,
      servicesConfigured: services.filter((s) => s.configured).length,
      servicesTotal: services.length,
    },
  };
}

/* ---------- Facilities ---------- */

type FacilityAdminRow = Parameters<typeof toFacility>[0] & {
  owner_id: string;
  owner_name: string;
  owner_email: string;
  product_count: number;
  low_stock_count: number;
  out_of_stock_count: number;
  verified_at: Date | null;
  updated_at: Date;
  verification_evidence: VerificationEvidence[] | null;
};

function toAdminFacilityListItem(r: FacilityAdminRow): AdminFacilityListItem {
  return {
    ...toFacility(r),
    owner: {
      id: r.owner_id,
      name: r.owner_name,
      email: r.owner_email,
    },
    productCount: r.product_count,
    lowStockCount: r.low_stock_count,
    outOfStockCount: r.out_of_stock_count,
    verifiedAt: r.verified_at ? new Date(r.verified_at).toISOString() : null,
    updatedAt: new Date(r.updated_at).toISOString(),
  };
}

export async function listFacilitiesForAdmin(opts: {
  q?: string;
  kind?: string;
  verification?: string;
  city?: string;
  limit?: number;
  offset?: number;
}): Promise<{
  items: AdminFacilityListItem[];
  total: number;
  cities: string[];
}> {
  const q = opts.q?.trim() ? `%${escapeLike(opts.q.trim())}%` : null;
  const kind =
    opts.kind && (FACILITY_KINDS as readonly string[]).includes(opts.kind)
      ? (opts.kind as FacilityKind)
      : null;
  const verification =
    opts.verification &&
    ["none", "pending", "verified", "rejected"].includes(opts.verification)
      ? (opts.verification as VerificationStatus)
      : null;
  const city = opts.city?.trim() ? escapeLike(opts.city.trim()) : null;
  const limit = Math.min(Math.max(opts.limit ?? 40, 1), 100);
  const offset = Math.max(opts.offset ?? 0, 0);

  const [rows, countRows, cityRows] = await Promise.all([
    query<FacilityAdminRow>(
      `select
         f.*,
         u.name as owner_name,
         u.email as owner_email,
         coalesce(ps.total, 0)::int as product_count,
         coalesce(ps.low_stock, 0)::int as low_stock_count,
         coalesce(ps.out_of_stock, 0)::int as out_of_stock_count
       from facilities f
       join users u on u.id = f.owner_id
       left join lateral (
         select
           count(*)::int as total,
           count(*) filter (where quantity > 0 and quantity <= low_stock_at)::int as low_stock,
           count(*) filter (where quantity = 0)::int as out_of_stock
         from products p
         where p.facility_id = f.id
       ) ps on true
       where ($1::text is null or f.name ilike $1 or f.city ilike $1 or f.state ilike $1 or f.license_number ilike $1 or u.email ilike $1 or u.name ilike $1)
         and ($2::text is null or f.kind = $2)
         and ($3::text is null or f.verification_status = $3)
         and ($4::text is null or f.city ilike $4)
       order by f.updated_at desc
       limit $5 offset $6`,
      [q, kind, verification, city, limit, offset],
    ),
    query<{ total: number }>(
      `select count(*)::int as total
       from facilities f
       join users u on u.id = f.owner_id
       where ($1::text is null or f.name ilike $1 or f.city ilike $1 or f.state ilike $1 or f.license_number ilike $1 or u.email ilike $1 or u.name ilike $1)
         and ($2::text is null or f.kind = $2)
         and ($3::text is null or f.verification_status = $3)
         and ($4::text is null or f.city ilike $4)`,
      [q, kind, verification, city],
    ),
    query<{ city: string }>(
      "select distinct city from facilities where city <> '' order by city asc",
    ),
  ]);

  return {
    items: rows.map(toAdminFacilityListItem),
    total: countRows[0]?.total ?? 0,
    cities: cityRows.map((c) => c.city),
  };
}

export async function getFacilityDetailForAdmin(
  id: string,
): Promise<AdminFacilityDetail | null> {
  if (!isUuid(id)) return null;
  const rows = await query<FacilityAdminRow>(
    `select
       f.*,
       u.name as owner_name,
       u.email as owner_email,
       coalesce(ps.total, 0)::int as product_count,
       coalesce(ps.low_stock, 0)::int as low_stock_count,
       coalesce(ps.out_of_stock, 0)::int as out_of_stock_count
     from facilities f
     join users u on u.id = f.owner_id
     left join lateral (
       select
         count(*)::int as total,
         count(*) filter (where quantity > 0 and quantity <= low_stock_at)::int as low_stock,
         count(*) filter (where quantity = 0)::int as out_of_stock
       from products p
       where p.facility_id = f.id
     ) ps on true
     where f.id = $1
     limit 1`,
    [id],
  );
  if (!rows[0]) return null;

  const productRows = await query<Parameters<typeof toProduct>[0]>(
    "select * from products where facility_id = $1 order by updated_at desc limit 200",
    [id],
  );

  return {
    facility: toAdminFacilityListItem(rows[0]),
    evidence: Array.isArray(rows[0].verification_evidence)
      ? rows[0].verification_evidence
      : [],
    products: productRows.map(toProduct),
  };
}

export async function adminDeleteFacility(
  facilityId: string,
  adminId: string,
  reason: string,
): Promise<{ deleted: boolean; name?: string }> {
  if (!isUuid(facilityId)) return { deleted: false };

  const existing = await query<{
    id: string;
    name: string;
    owner_id: string;
    city: string;
    audio_id: string | null;
    storage_id: string | null;
    resource_type: string | null;
    format: string | null;
  }>(
    `select f.id, f.name, f.owner_id, f.city,
            a.id as audio_id, a.storage_id, a.resource_type, a.format
       from facilities f
       left join attachments a on a.id = f.directions_audio_id
      where f.id = $1
      limit 1`,
    [facilityId],
  );
  const target = existing[0];
  if (!target) return { deleted: false };

  const deletedRows = await query<{ id: string }>(
    "delete from facilities where id = $1 returning id",
    [facilityId],
  );
  if (!deletedRows.length) return { deleted: false };

  if (target.audio_id) {
    await query(
      `delete from attachments a
        where a.id = $1
          and not exists (select 1 from facilities f where f.directions_audio_id = a.id)`,
      [target.audio_id],
    ).catch(() => {});

    if (target.storage_id && target.resource_type) {
      await deletePrivate({
        storageId: target.storage_id,
        resourceType: target.resource_type,
        format: target.format ?? "",
      }).catch((err) => {
        console.warn("Admin facility delete: Cloudinary cleanup skipped", err);
      });
    }
  }

  await logAdminAction(adminId, "facility.delete", "facility", facilityId, {
    name: target.name,
    city: target.city,
    ownerId: target.owner_id,
    reason: reason.trim().slice(0, 300),
  });

  return { deleted: true, name: target.name };
}

/* ---------- Products / Global Inventory ---------- */

type ProductAdminRow = Parameters<typeof toProduct>[0] & {
  facility_name: string;
  facility_kind: FacilityKind;
  facility_city: string;
  facility_verified: boolean;
};

export async function listProductsForAdmin(opts: {
  q?: string;
  category?: string;
  stock?: string;
  expiry?: string;
  rx?: string;
  limit?: number;
  offset?: number;
}): Promise<{
  items: AdminProductListItem[];
  total: number;
  summary: AdminProductSummary;
}> {
  const q = opts.q?.trim() ? `%${escapeLike(opts.q.trim())}%` : null;
  const category = opts.category?.trim() || null;
  const stock =
    opts.stock && ["in", "low", "out"].includes(opts.stock) ? opts.stock : null;
  const expiry =
    opts.expiry && ["soon", "expired"].includes(opts.expiry)
      ? opts.expiry
      : null;
  const rx = opts.rx && ["yes", "no"].includes(opts.rx) ? opts.rx : null;
  const limit = Math.min(Math.max(opts.limit ?? 50, 1), 100);
  const offset = Math.max(opts.offset ?? 0, 0);

  const [rows, countRows, summaryRows] = await Promise.all([
    query<ProductAdminRow>(
      `select
         p.*,
         f.name as facility_name,
         f.kind as facility_kind,
         f.city as facility_city,
         (f.verification_status = 'verified') as facility_verified
       from products p
       join facilities f on f.id = p.facility_id
       where ($1::text is null or p.name ilike $1 or p.generic_name ilike $1 or p.batch ilike $1 or f.name ilike $1 or f.city ilike $1)
         and ($2::text is null or p.category = $2)
         and (
           $3::text is null
           or ($3 = 'in' and p.quantity > p.low_stock_at)
           or ($3 = 'low' and p.quantity > 0 and p.quantity <= p.low_stock_at)
           or ($3 = 'out' and p.quantity = 0)
         )
         and (
           $4::text is null
           or ($4 = 'expired' and p.expires_on is not null and p.expires_on < current_date)
           or ($4 = 'soon' and p.expires_on is not null and p.expires_on >= current_date and p.expires_on <= current_date + interval '30 days')
         )
         and (
           $5::text is null
           or ($5 = 'yes' and p.prescription_only = true)
           or ($5 = 'no' and p.prescription_only = false)
         )
       order by p.updated_at desc
       limit $6 offset $7`,
      [q, category, stock, expiry, rx, limit, offset],
    ),
    query<{ total: number }>(
      `select count(*)::int as total
       from products p
       join facilities f on f.id = p.facility_id
       where ($1::text is null or p.name ilike $1 or p.generic_name ilike $1 or p.batch ilike $1 or f.name ilike $1 or f.city ilike $1)
         and ($2::text is null or p.category = $2)
         and (
           $3::text is null
           or ($3 = 'in' and p.quantity > p.low_stock_at)
           or ($3 = 'low' and p.quantity > 0 and p.quantity <= p.low_stock_at)
           or ($3 = 'out' and p.quantity = 0)
         )
         and (
           $4::text is null
           or ($4 = 'expired' and p.expires_on is not null and p.expires_on < current_date)
           or ($4 = 'soon' and p.expires_on is not null and p.expires_on >= current_date and p.expires_on <= current_date + interval '30 days')
         )
         and (
           $5::text is null
           or ($5 = 'yes' and p.prescription_only = true)
           or ($5 = 'no' and p.prescription_only = false)
         )`,
      [q, category, stock, expiry, rx],
    ),
    query<{
      total: number;
      in_stock: number;
      low_stock: number;
      out_of_stock: number;
      expired: number;
      expiring_soon: number;
      rx_only: number;
    }>(`
      select
        count(*)::int as total,
        count(*) filter (where quantity > low_stock_at)::int as in_stock,
        count(*) filter (where quantity > 0 and quantity <= low_stock_at)::int as low_stock,
        count(*) filter (where quantity = 0)::int as out_of_stock,
        count(*) filter (where expires_on is not null and expires_on < current_date)::int as expired,
        count(*) filter (where expires_on is not null and expires_on >= current_date and expires_on <= current_date + interval '30 days')::int as expiring_soon,
        count(*) filter (where prescription_only)::int as rx_only
      from products
    `),
  ]);

  const s = summaryRows[0] ?? {
    total: 0,
    in_stock: 0,
    low_stock: 0,
    out_of_stock: 0,
    expired: 0,
    expiring_soon: 0,
    rx_only: 0,
  };

  return {
    items: rows.map((r) => ({
      ...toProduct(r),
      facilityName: r.facility_name,
      facilityKind: r.facility_kind,
      facilityCity: r.facility_city,
      facilityVerified: r.facility_verified,
    })),
    total: countRows[0]?.total ?? 0,
    summary: {
      total: s.total,
      inStock: s.in_stock,
      lowStock: s.low_stock,
      outOfStock: s.out_of_stock,
      expired: s.expired,
      expiringSoon: s.expiring_soon,
      rxOnly: s.rx_only,
    },
  };
}

export async function adminDeleteProduct(
  productId: string,
  adminId: string,
  reason: string,
): Promise<{ deleted: boolean; name?: string }> {
  if (!isUuid(productId)) return { deleted: false };
  const rows = await query<{
    id: string;
    name: string;
    facility_id: string;
    category: string;
  }>(
    "delete from products where id = $1 returning id, name, facility_id, category",
    [productId],
  );
  const removed = rows[0];
  if (!removed) return { deleted: false };

  await logAdminAction(adminId, "product.delete", "product", productId, {
    name: removed.name,
    facilityId: removed.facility_id,
    category: removed.category,
    reason: reason.trim().slice(0, 300),
  });
  return { deleted: true, name: removed.name };
}

/* ---------- Users (metadata only — strictly zero encrypted content access) ---------- */

interface UserAdminRow {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  encrypted: boolean;
  onboarded_at: Date | null;
  terms_version: string;
  terms_accepted_at: Date | null;
  created_at: Date;
  active_sessions: number;
  facility_count: number;
  conversation_count: number;
  has_profile: boolean;
}

export async function listUsersForAdmin(opts: {
  q?: string;
  role?: string;
  limit?: number;
  offset?: number;
}): Promise<{ items: AdminUserItem[]; total: number }> {
  const q = opts.q?.trim() ? `%${escapeLike(opts.q.trim())}%` : null;
  const roleFilter =
    opts.role && ["patient", "provider", "admin"].includes(opts.role)
      ? opts.role
      : null;
  const adminEmails = getAdminEmailList();
  const limit = Math.min(Math.max(opts.limit ?? 50, 1), 100);
  const offset = Math.max(opts.offset ?? 0, 0);

  const [rows, countRows] = await Promise.all([
    query<UserAdminRow>(
      `select
         u.id,
         u.email,
         u.name,
         u.role,
         (u.wrapped_dek is not null) as encrypted,
         u.onboarded_at,
         u.terms_version,
         u.terms_accepted_at,
         u.created_at,
         (select count(*)::int from sessions s where s.user_id = u.id and s.expires_at > now()) as active_sessions,
         (select count(*)::int from facilities f where f.owner_id = u.id) as facility_count,
         (select count(*)::int from conversations c where c.user_id = u.id) as conversation_count,
         exists(select 1 from health_profiles hp where hp.user_id = u.id) as has_profile
       from users u
       where ($1::text is null or u.name ilike $1 or u.email ilike $1)
         and (
           $2::text is null
           or ($2 = 'patient' and u.role = 'patient')
           or ($2 = 'provider' and u.role = 'provider')
           or ($2 = 'admin' and lower(u.email) = any($3::text[]))
         )
       order by u.created_at desc
       limit $4 offset $5`,
      [q, roleFilter, adminEmails, limit, offset],
    ),
    query<{ total: number }>(
      `select count(*)::int as total
       from users u
       where ($1::text is null or u.name ilike $1 or u.email ilike $1)
         and (
           $2::text is null
           or ($2 = 'patient' and u.role = 'patient')
           or ($2 = 'provider' and u.role = 'provider')
           or ($2 = 'admin' and lower(u.email) = any($3::text[]))
         )`,
      [q, roleFilter, adminEmails],
    ),
  ]);

  return {
    items: rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      role: r.role,
      isAdmin: isAdminEmail(r.email),
      encrypted: r.encrypted,
      onboarded: Boolean(r.onboarded_at),
      termsVersion: r.terms_version ?? "",
      termsAcceptedAt: r.terms_accepted_at
        ? new Date(r.terms_accepted_at).toISOString()
        : null,
      createdAt: new Date(r.created_at).toISOString(),
      activeSessions: r.active_sessions,
      facilityCount: r.facility_count,
      conversationCount: r.conversation_count,
      hasProfile: r.has_profile,
    })),
    total: countRows[0]?.total ?? 0,
  };
}

export async function adminSetUserRole(
  targetUserId: string,
  newRole: UserRole,
  adminId: string,
): Promise<{ id: string; role: UserRole; email: string } | null> {
  if (!isUuid(targetUserId)) return null;
  const rows = await query<{ id: string; role: UserRole; email: string }>(
    "update users set role = $2 where id = $1 returning id, role, email",
    [targetUserId, newRole],
  );
  if (!rows[0]) return null;
  await logAdminAction(adminId, "user.set_role", "user", targetUserId, {
    email: rows[0].email,
    role: newRole,
  });
  return rows[0];
}

export async function adminRevokeUserSessions(
  targetUserId: string,
  adminId: string,
): Promise<{ exists: boolean; revoked: number }> {
  if (!isUuid(targetUserId)) return { exists: false, revoked: 0 };
  const users = await query<{ id: string; email: string }>(
    "select id, email from users where id = $1 limit 1",
    [targetUserId],
  );
  if (!users[0]) return { exists: false, revoked: 0 };

  const rows = await query<{ n: number }>(
    `with deleted as (
       delete from sessions where user_id = $1 returning 1
     )
     select count(*)::int as n from deleted`,
    [targetUserId],
  );
  const revoked = rows[0]?.n ?? 0;
  await logAdminAction(adminId, "user.revoke_sessions", "user", targetUserId, {
    email: users[0].email,
    revoked,
  });
  return { exists: true, revoked };
}

/* ---------- Audit Log ---------- */

interface AuditRow {
  id: string;
  admin_id: string | null;
  admin_name: string | null;
  admin_email: string | null;
  action: string;
  target_type: string;
  target_id: string | null;
  details: Record<string, unknown> | null;
  created_at: Date;
}

export async function listAuditLogsForAdmin(opts: {
  q?: string;
  action?: string;
  targetType?: string;
  limit?: number;
  offset?: number;
}): Promise<{ items: AdminAuditEntry[]; total: number; actions: string[] }> {
  const q = opts.q?.trim() ? `%${escapeLike(opts.q.trim())}%` : null;
  const actionPrefix = opts.action?.trim()
    ? `${escapeLike(opts.action.trim())}%`
    : null;
  const targetType = opts.targetType?.trim() || null;
  const limit = Math.min(Math.max(opts.limit ?? 50, 1), 200);
  const offset = Math.max(opts.offset ?? 0, 0);

  const [rows, countRows, actionRows] = await Promise.all([
    query<AuditRow>(
      `select
         l.id,
         l.admin_id,
         u.name as admin_name,
         u.email as admin_email,
         l.action,
         l.target_type,
         l.target_id,
         l.details,
         l.created_at
       from admin_audit_log l
       left join users u on u.id = l.admin_id
       where ($1::text is null or l.action ilike $1 or l.target_type ilike $1 or coalesce(l.target_id::text, '') ilike $1 or coalesce(u.email, '') ilike $1 or coalesce(u.name, '') ilike $1 or l.details::text ilike $1)
         and ($2::text is null or l.action ilike $2)
         and ($3::text is null or l.target_type = $3)
       order by l.created_at desc
       limit $4 offset $5`,
      [q, actionPrefix, targetType, limit, offset],
    ),
    query<{ total: number }>(
      `select count(*)::int as total
       from admin_audit_log l
       left join users u on u.id = l.admin_id
       where ($1::text is null or l.action ilike $1 or l.target_type ilike $1 or coalesce(l.target_id::text, '') ilike $1 or coalesce(u.email, '') ilike $1 or coalesce(u.name, '') ilike $1 or l.details::text ilike $1)
         and ($2::text is null or l.action ilike $2)
         and ($3::text is null or l.target_type = $3)`,
      [q, actionPrefix, targetType],
    ),
    query<{ action: string }>(
      "select distinct action from admin_audit_log order by action asc",
    ),
  ]);

  return {
    items: rows.map((r) => ({
      id: r.id,
      adminId: r.admin_id,
      adminName: r.admin_name,
      adminEmail: r.admin_email,
      action: r.action,
      targetType: r.target_type,
      targetId: r.target_id,
      details: r.details && typeof r.details === "object" ? r.details : {},
      createdAt: new Date(r.created_at).toISOString(),
    })),
    total: countRows[0]?.total ?? 0,
    actions: actionRows.map((a) => a.action),
  };
}

/* ---------- System Health & Maintenance ---------- */

export async function getAdminSystemHealth(): Promise<AdminSystemHealth> {
  const started = Date.now();
  await query("select 1");
  const dbLatencyMs = Math.max(1, Date.now() - started);

  const [sizeRow, countsRow, encRow, maintRow, rateRows] = await Promise.all([
    query<{ bytes: string }>(
      "select pg_database_size(current_database())::text as bytes",
    ),
    query<{
      users: number;
      sessions: number;
      health_profiles: number;
      conversations: number;
      messages: number;
      attachments: number;
      facilities: number;
      products: number;
      admin_audit_log: number;
    }>(`
      select
        (select count(*)::int from users) as users,
        (select count(*)::int from sessions) as sessions,
        (select count(*)::int from health_profiles) as health_profiles,
        (select count(*)::int from conversations) as conversations,
        (select count(*)::int from messages) as messages,
        (select count(*)::int from attachments) as attachments,
        (select count(*)::int from facilities) as facilities,
        (select count(*)::int from products) as products,
        (select count(*)::int from admin_audit_log) as admin_audit_log
    `),
    query<{
      users_total: number;
      users_enc: number;
      profiles_total: number;
      profiles_enc: number;
      convs_total: number;
      convs_enc: number;
      msgs_total: number;
      msgs_enc: number;
    }>(`
      select
        (select count(*)::int from users) as users_total,
        (select count(*)::int from users where wrapped_dek is not null) as users_enc,
        (select count(*)::int from health_profiles) as profiles_total,
        (select count(*)::int from health_profiles where data_enc is not null) as profiles_enc,
        (select count(*)::int from conversations) as convs_total,
        (select count(*)::int from conversations where title_enc is not null) as convs_enc,
        (select count(*)::int from messages) as msgs_total,
        (select count(*)::int from messages where payload_enc is not null) as msgs_enc
    `),
    query<{ expired_sessions: number; stale_rate_limits: number }>(`
      select
        (select count(*)::int from sessions where expires_at <= now()) as expired_sessions,
        (select count(*)::int from rate_limits where hit_at < now() - interval '24 hours') as stale_rate_limits
    `),
    query<{ grp: string; hits: number }>(`
      select split_part(bucket_key, ':', 1) as grp, count(*)::int as hits
      from rate_limits
      where hit_at >= now() - interval '24 hours'
      group by 1
      order by hits desc
      limit 12
    `),
  ]);

  const c = countsRow[0] ?? {
    users: 0,
    sessions: 0,
    health_profiles: 0,
    conversations: 0,
    messages: 0,
    attachments: 0,
    facilities: 0,
    products: 0,
    admin_audit_log: 0,
  };
  const e = encRow[0] ?? {
    users_total: 0,
    users_enc: 0,
    profiles_total: 0,
    profiles_enc: 0,
    convs_total: 0,
    convs_enc: 0,
    msgs_total: 0,
    msgs_enc: 0,
  };
  const m = maintRow[0] ?? { expired_sessions: 0, stale_rate_limits: 0 };

  return {
    dbLatencyMs,
    dbSizeBytes: Number(sizeRow[0]?.bytes ?? 0),
    tables: [
      { name: "users", count: c.users },
      { name: "sessions", count: c.sessions },
      { name: "health_profiles", count: c.health_profiles },
      { name: "conversations", count: c.conversations },
      { name: "messages", count: c.messages },
      { name: "attachments", count: c.attachments },
      { name: "facilities", count: c.facilities },
      { name: "products", count: c.products },
      { name: "admin_audit_log", count: c.admin_audit_log },
    ],
    encryption: {
      usersTotal: e.users_total,
      usersEncrypted: e.users_enc,
      profilesTotal: e.profiles_total,
      profilesEncrypted: e.profiles_enc,
      conversationsTotal: e.convs_total,
      conversationsEncrypted: e.convs_enc,
      messagesTotal: e.msgs_total,
      messagesEncrypted: e.msgs_enc,
    },
    maintenance: {
      expiredSessions: m.expired_sessions,
      staleRateLimits: m.stale_rate_limits,
    },
    rateLimits24h: rateRows.map((r) => ({
      group: r.grp || "unknown",
      hits: r.hits,
    })),
    services: getServiceStatusList(),
  };
}

export async function runAdminMaintenance(
  action: "prune_sessions" | "prune_rate_limits",
  adminId: string,
): Promise<{ deleted: number }> {
  const rows =
    action === "prune_sessions"
      ? await query<{ n: number }>(`
          with deleted as (
            delete from sessions where expires_at <= now() returning 1
          )
          select count(*)::int as n from deleted
        `)
      : await query<{ n: number }>(`
          with deleted as (
            delete from rate_limits where hit_at < now() - interval '24 hours' returning 1
          )
          select count(*)::int as n from deleted
        `);
  const deleted = rows[0]?.n ?? 0;
  await logAdminAction(adminId, `system.${action}`, "system", null, {
    deleted,
  });
  return { deleted };
}
