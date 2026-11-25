import "server-only";
import {
  FACILITY_KINDS,
  PRODUCT_CATEGORIES,
  type AdminVerificationItem,
  type DirectoryMatch,
  type Facility,
  type FacilityKind,
  type Product,
  type VerificationEvidence,
  type VerificationStatus,
} from "@/lib/inventory-types";
import { query } from "./db";

/* ---------- row mapping ---------- */

interface FacilityRow {
  id: string;
  owner_id: string;
  name: string;
  kind: FacilityKind;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  directions: string;
  opening_hours: string;
  license_number: string;
  services: string[];
  created_at: Date;
  directions_audio_id: string | null;
  verification_status: string;
  verification_note: string;
  verification_url: string;
  verification_evidence: VerificationEvidence[] | null;
  verified_at: Date | null;
  updated_at: Date;
}

interface ProductRow {
  id: string;
  facility_id: string;
  name: string;
  generic_name: string;
  category: string;
  form: string;
  strength: string;
  pack_size: string;
  price_ngn: string | null;
  quantity: number;
  low_stock_at: number;
  batch: string;
  expires_on: Date | null;
  prescription_only: boolean;
  notes: string;
  updated_at: Date;
}

export const toFacility = (r: FacilityRow): Facility => ({
  id: r.id,
  name: r.name,
  kind: r.kind,
  phone: r.phone,
  email: r.email,
  address: r.address,
  city: r.city,
  state: r.state,
  directions: r.directions,
  openingHours: r.opening_hours,
  licenseNumber: r.license_number,
  services: r.services ?? [],
  createdAt: new Date(r.created_at).toISOString(),
  directionsAudioId: r.directions_audio_id ?? null,
  directionsAudioUrl: r.directions_audio_id
    ? `/api/facilities/${r.id}/audio`
    : null,
  verification: {
    status: (["none", "pending", "verified", "rejected"].includes(
      r.verification_status,
    )
      ? r.verification_status
      : "none") as VerificationStatus,
    note: r.verification_note ?? "",
    url: r.verification_url ?? "",
  },
});

const isoDate = (d: Date | null) =>
  d
    ? new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 10)
    : null;

export const toProduct = (r: ProductRow): Product => ({
  id: r.id,
  facilityId: r.facility_id,
  name: r.name,
  genericName: r.generic_name,
  category: r.category,
  form: r.form,
  strength: r.strength,
  packSize: r.pack_size,
  priceNgn: r.price_ngn === null ? null : Number(r.price_ngn),
  quantity: r.quantity,
  lowStockAt: r.low_stock_at,
  batch: r.batch,
  expiresOn: isoDate(r.expires_on),
  prescriptionOnly: r.prescription_only,
  notes: r.notes,
  updatedAt: new Date(r.updated_at).toISOString(),
});

/* ---------- validation ---------- */

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
  ) {
    super(message);
  }
}

const str = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

export function parseFacilityInput(body: Record<string, unknown>) {
  const name = str(body.name, 120);
  if (name.length < 2)
    throw new ValidationError("Enter the facility's name.", "name");
  const kind = FACILITY_KINDS.includes(body.kind as FacilityKind)
    ? (body.kind as FacilityKind)
    : null;
  if (!kind)
    throw new ValidationError("Choose what kind of facility this is.", "kind");
  const city = str(body.city, 80);
  if (!city) throw new ValidationError("Enter the city or town.", "city");
  const address = str(body.address, 240);
  if (!address)
    throw new ValidationError("Enter the street address.", "address");
  const phone = str(body.phone, 40);
  if (!/^[+\d][\d\s()-]{6,}$/.test(phone))
    throw new ValidationError(
      "Enter a phone number patients can call.",
      "phone",
    );
  const services = Array.isArray(body.services)
    ? [...new Set(body.services.map((s) => str(s, 80)).filter(Boolean))].slice(
        0,
        60,
      )
    : [];
  const licenseNumber = str(body.licenseNumber, 80);
  if (licenseNumber) {
    if (
      licenseNumber.replace(/[^a-z0-9]/gi, "").length < 5 ||
      !/^[A-Za-z0-9/.\-\s()]+$/.test(licenseNumber)
    ) {
      throw new ValidationError(
        "Enter a valid licence or registration number (at least 5 letters or digits).",
        "licenseNumber",
      );
    }
  }
  return {
    name,
    kind,
    phone,
    email: str(body.email, 160),
    address,
    city,
    state: str(body.state, 80),
    directions: str(body.directions, 1200),
    openingHours: str(body.openingHours, 160),
    licenseNumber,
    services,
    directionsAudioId:
      typeof body.directionsAudioId === "string" &&
      isUuid(body.directionsAudioId)
        ? body.directionsAudioId
        : null,
  };
}

export function parseProductInput(body: Record<string, unknown>) {
  const name = str(body.name, 160);
  if (name.length < 2)
    throw new ValidationError("Enter the product name.", "name");
  const category = str(body.category, 80);
  if (!(PRODUCT_CATEGORIES as readonly string[]).includes(category))
    throw new ValidationError("Choose a category.", "category");
  const quantity = Number(body.quantity);
  if (!Number.isInteger(quantity) || quantity < 0 || quantity > 1_000_000)
    throw new ValidationError(
      "Quantity must be a whole number, 0 or more.",
      "quantity",
    );
  const lowStockAt =
    body.lowStockAt === undefined ? 5 : Number(body.lowStockAt);
  if (!Number.isInteger(lowStockAt) || lowStockAt < 0)
    throw new ValidationError(
      "Low-stock level must be a whole number.",
      "lowStockAt",
    );
  let priceNgn: number | null = null;
  if (
    body.priceNgn !== null &&
    body.priceNgn !== undefined &&
    body.priceNgn !== ""
  ) {
    priceNgn = Number(body.priceNgn);
    if (!Number.isFinite(priceNgn) || priceNgn < 0 || priceNgn > 100_000_000)
      throw new ValidationError("Enter a valid price in naira.", "priceNgn");
  }
  let expiresOn: string | null = null;
  if (typeof body.expiresOn === "string" && body.expiresOn) {
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(body.expiresOn) ||
      Number.isNaN(Date.parse(body.expiresOn))
    )
      throw new ValidationError(
        "Enter the expiry date as YYYY-MM-DD.",
        "expiresOn",
      );
    expiresOn = body.expiresOn;
  }
  return {
    name,
    genericName: str(body.genericName, 160),
    category,
    form: str(body.form, 60),
    strength: str(body.strength, 60),
    packSize: str(body.packSize, 60),
    priceNgn,
    quantity,
    lowStockAt,
    batch: str(body.batch, 60),
    expiresOn,
    prescriptionOnly: body.prescriptionOnly === true,
    notes: str(body.notes, 600),
  };
}

/* ---------- facilities ---------- */

export async function listOwnedFacilities(ownerId: string) {
  const rows = await query<FacilityRow>(
    "select * from facilities where owner_id = $1 order by created_at",
    [ownerId],
  );
  return rows.map(toFacility);
}

/** Returns the facility only if `ownerId` owns it. */
export async function getOwnedFacility(id: string, ownerId: string) {
  if (!isUuid(id)) return null;
  const rows = await query<FacilityRow>(
    "select * from facilities where id = $1 and owner_id = $2",
    [id, ownerId],
  );
  return rows[0] ? toFacility(rows[0]) : null;
}

export async function createFacility(
  ownerId: string,
  f: ReturnType<typeof parseFacilityInput>,
) {
  const rows = await query<FacilityRow>(
    `insert into facilities (owner_id, name, kind, phone, email, address, city, state,
       directions, opening_hours, license_number, services, directions_audio_id)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,
       (select id from attachments where id = $13 and user_id = $1))
     returning *`,
    [
      ownerId,
      f.name,
      f.kind,
      f.phone,
      f.email,
      f.address,
      f.city,
      f.state,
      f.directions,
      f.openingHours,
      f.licenseNumber,
      f.services,
      f.directionsAudioId,
    ],
  );
  await query("update users set role = 'provider' where id = $1", [ownerId]);
  return toFacility(rows[0]);
}

export async function updateFacility(
  id: string,
  ownerId: string,
  f: ReturnType<typeof parseFacilityInput>,
) {
  const rows = await query<FacilityRow>(
    `update facilities set name=$3, kind=$4, phone=$5, email=$6, address=$7, city=$8, state=$9,
       directions=$10, opening_hours=$11, license_number=$12, services=$13,
       directions_audio_id=(select id from attachments where id = $14 and user_id = $2),
       -- A changed licence number has to be reviewed again by an admin.
       verification_status = case when license_number is distinct from $12 then 'none' else verification_status end,
       verification_note = case when license_number is distinct from $12 then '' else verification_note end,
       verification_url = case when license_number is distinct from $12 then '' else verification_url end,
       verification_evidence = case when license_number is distinct from $12 then '[]'::jsonb else verification_evidence end,
       verified_at = case when license_number is distinct from $12 then null else verified_at end,
       verified_by = case when license_number is distinct from $12 then null else verified_by end,
       updated_at=now()
     where id=$1 and owner_id=$2 returning *`,
    [
      id,
      ownerId,
      f.name,
      f.kind,
      f.phone,
      f.email,
      f.address,
      f.city,
      f.state,
      f.directions,
      f.openingHours,
      f.licenseNumber,
      f.services,
      f.directionsAudioId,
    ],
  );
  return rows[0] ? toFacility(rows[0]) : null;
}

export async function deleteFacility(id: string, ownerId: string) {
  const rows = await query<{ id: string }>(
    "delete from facilities where id=$1 and owner_id=$2 returning id",
    [id, ownerId],
  );
  return rows.length > 0;
}

/* ---------- products ---------- */

export async function listProducts(facilityId: string) {
  const rows = await query<ProductRow>(
    "select * from products where facility_id = $1 order by name",
    [facilityId],
  );
  return rows.map(toProduct);
}

export async function createProduct(
  facilityId: string,
  p: ReturnType<typeof parseProductInput>,
) {
  const rows = await query<ProductRow>(
    `insert into products (facility_id, name, generic_name, category, form, strength, pack_size,
       price_ngn, quantity, low_stock_at, batch, expires_on, prescription_only, notes)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) returning *`,
    [
      facilityId,
      p.name,
      p.genericName,
      p.category,
      p.form,
      p.strength,
      p.packSize,
      p.priceNgn,
      p.quantity,
      p.lowStockAt,
      p.batch,
      p.expiresOn,
      p.prescriptionOnly,
      p.notes,
    ],
  );
  return toProduct(rows[0]);
}

/** Updates a product only when it belongs to a facility `ownerId` owns. */
export async function updateProduct(
  id: string,
  ownerId: string,
  p: ReturnType<typeof parseProductInput>,
) {
  if (!isUuid(id)) return null;
  const rows = await query<ProductRow>(
    `update products set name=$3, generic_name=$4, category=$5, form=$6, strength=$7,
       pack_size=$8, price_ngn=$9, quantity=$10, low_stock_at=$11, batch=$12, expires_on=$13,
       prescription_only=$14, notes=$15, updated_at=now()
     where id=$1 and facility_id in (select id from facilities where owner_id=$2)
     returning *`,
    [
      id,
      ownerId,
      p.name,
      p.genericName,
      p.category,
      p.form,
      p.strength,
      p.packSize,
      p.priceNgn,
      p.quantity,
      p.lowStockAt,
      p.batch,
      p.expiresOn,
      p.prescriptionOnly,
      p.notes,
    ],
  );
  return rows[0] ? toProduct(rows[0]) : null;
}

export async function adjustProductQuantity(
  id: string,
  ownerId: string,
  delta: number,
) {
  if (!isUuid(id)) return null;
  const rows = await query<ProductRow>(
    `update products set quantity = greatest(0, quantity + $3), updated_at = now()
     where id=$1 and facility_id in (select id from facilities where owner_id=$2)
     returning *`,
    [id, ownerId, delta],
  );
  return rows[0] ? toProduct(rows[0]) : null;
}

export async function deleteProduct(id: string, ownerId: string) {
  if (!isUuid(id)) return false;
  const rows = await query<{ id: string }>(
    `delete from products where id=$1
       and facility_id in (select id from facilities where owner_id=$2) returning id`,
    [id, ownerId],
  );
  return rows.length > 0;
}

/* ---------- public directory search ---------- */

const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

/**
 * Searches real listings only: products with stock and facility services.
 * Returns an empty list when nothing matches; never invents results.
 */
export async function searchDirectory(opts: {
  terms: string[];
  city?: string | null;
  category?: string | null;
  inStockOnly?: boolean;
  limit?: number;
}): Promise<DirectoryMatch[]> {
  const terms = opts.terms
    .map((t) => t.trim())
    .filter((t) => t.length >= 2)
    .slice(0, 5);
  const limit = Math.min(opts.limit ?? 30, 60);
  const city = opts.city?.trim() || null;
  const results: DirectoryMatch[] = [];

  const patterns = terms.map((t) => `%${escapeLike(t)}%`);
  const productRows = await query<ProductRow & { f: FacilityRow }>(
    `select p.*, row_to_json(f.*) as f
       from products p join facilities f on f.id = p.facility_id
      where ($1::text[] = '{}' or exists (
              select 1 from unnest($1::text[]) pat
               where p.name ilike pat or p.generic_name ilike pat or p.category ilike pat
                  or p.notes ilike pat))
        and ($2::text is null or f.city ilike $2 or f.state ilike $2)
        and ($3::text is null or p.category = $3)
        and (not $4 or p.quantity > 0)
      order by (p.quantity > 0) desc, p.updated_at desc
      limit $5`,
    [patterns, city, opts.category ?? null, opts.inStockOnly ?? false, limit],
  );
  for (const r of productRows) {
    results.push({ facility: toFacility(r.f), product: toProduct(r) });
  }

  if (terms.length && !opts.category) {
    const serviceRows = await query<FacilityRow & { matched: string }>(
      `select f.*, s as matched
         from facilities f, unnest(f.services) s
        where exists (select 1 from unnest($1::text[]) pat where s ilike pat)
          and ($2::text is null or f.city ilike $2 or f.state ilike $2)
        limit $3`,
      [patterns, city, limit],
    );
    for (const r of serviceRows) {
      results.push({ facility: toFacility(r), service: r.matched });
    }
  }
  return results;
}

export async function directoryCities() {
  const rows = await query<{ city: string }>(
    "select distinct city from facilities where city <> '' order by city",
  );
  return rows.map((r) => r.city);
}

export function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    v,
  );
}

export async function setVerificationEvidence(
  id: string,
  v: {
    status: "none" | "pending";
    note: string;
    url: string;
    evidence: VerificationEvidence[];
  },
) {
  const rows = await query<FacilityRow>(
    `update facilities
        set verification_status=$2,
            verification_note=$3,
            verification_url=$4,
            verification_evidence=$5::jsonb,
            verified_at=null,
            verified_by=null
      where id=$1 returning *`,
    [id, v.status, v.note, v.url, JSON.stringify(v.evidence)],
  );
  return rows[0] ? toFacility(rows[0]) : null;
}

export async function getFacilityForAdmin(id: string): Promise<Facility | null> {
  if (!isUuid(id)) return null;
  const rows = await query<FacilityRow>(
    "select * from facilities where id = $1 limit 1",
    [id],
  );
  return rows[0] ? toFacility(rows[0]) : null;
}

export async function listVerificationsForAdmin(
  statusFilter: VerificationStatus | "all" = "pending",
): Promise<AdminVerificationItem[]> {
  const rows = await query<
    FacilityRow & {
      owner_email: string;
      owner_name: string;
      verification_evidence: VerificationEvidence[] | null;
      verified_at: Date | null;
      updated_at: Date;
    }
  >(
    `select f.*, u.email as owner_email, u.name as owner_name
       from facilities f
       join users u on u.id = f.owner_id
      where f.license_number <> ''
        and ($1::text = 'all' or f.verification_status = $1)
      order by
        case f.verification_status when 'pending' then 0 when 'rejected' then 1 when 'verified' then 2 else 3 end,
        f.updated_at desc
      limit 100`,
    [statusFilter],
  );
  return rows.map((r) => ({
    facility: toFacility(r),
    owner: {
      id: r.owner_id,
      name: r.owner_name,
      email: r.owner_email,
    },
    evidence: Array.isArray(r.verification_evidence) ? r.verification_evidence : [],
    verifiedAt: r.verified_at ? new Date(r.verified_at).toISOString() : null,
    updatedAt: new Date(r.updated_at).toISOString(),
  }));
}

export async function adminDecideVerification(
  facilityId: string,
  adminId: string,
  input: { action: "approve" | "reject"; note: string; url: string },
) {
  if (!isUuid(facilityId)) return null;
  const status: VerificationStatus =
    input.action === "approve" ? "verified" : "rejected";
  const note =
    input.note ||
    (input.action === "approve"
      ? "Confirmed by Zelthia administrator."
      : "Licence could not be confirmed.");
  const rows = await query<FacilityRow>(
    `update facilities
        set verification_status = $2,
            verification_note = $3,
            verification_url = $4,
            verified_at = case when $2 = 'verified' then now() else null end,
            verified_by = $5,
            updated_at = now()
      where id = $1 returning *`,
    [facilityId, status, note, input.url, adminId],
  );
  if (!rows[0]) return null;
  await query(
    `insert into admin_audit_log (admin_id, action, target_type, target_id, details)
     values ($1, $2, 'facility', $3, $4::jsonb)`,
    [
      adminId,
      `verification.${input.action}`,
      facilityId,
      JSON.stringify({ status, note, url: input.url }),
    ],
  );
  return toFacility(rows[0]);
}

/** Public: the recorded directions for a facility (directions are public info). */
export async function getFacilityAudio(facilityId: string) {
  if (!isUuid(facilityId)) return null;
  const rows = await query<{
    mime: string;
    storage_id: string;
    resource_type: string;
    format: string;
  }>(
    `select a.mime, a.storage_id, a.resource_type, a.format
       from facilities f join attachments a on a.id = f.directions_audio_id
      where f.id = $1 and a.storage_id is not null`,
    [facilityId],
  );
  return rows[0] ?? null;
}
