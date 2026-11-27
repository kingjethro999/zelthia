import "server-only";
import { readServerEnv } from "./admin-route";
import { fetchService, politeThrottle } from "./http";

/**
 * Direct client for the NAFDAC Greenbook (greenbook.nafdac.gov.ng), Nigeria's
 * public register of drugs, biologics, medical devices, veterinary products,
 * herbals, nutraceuticals and disinfectants.
 *
 * The site's own search table is fed by a server-side DataTables JSON endpoint.
 * We call that endpoint the way the page does, one request at a time with a
 * polite gap, instead of relying on search engines to have indexed a record.
 *
 * The Greenbook only lists registrations whose status is "Active" or
 * "Ongoing Renewal". Cosmetics and food are not on it.
 */

const GREENBOOK_URL = "http://greenbook.nafdac.gov.ng/";
const GREENBOOK_HOST = "greenbook.nafdac.gov.ng";
const TIMEOUT_MS = 12_000;

const COLUMNS = [
  "product_name",
  "ingredient.ingredient_name",
  "product_category.name",
  "product_category_id",
  "ingredient.synonym",
  "NAFDAC",
  "form.name",
  "route.name",
  "strength",
  "applicant.name",
  "approval_date",
  "status",
] as const;

const NRN_COLUMN = 5;
const NAME_COLUMN = 0;

export interface GreenbookRecord {
  productId: number;
  productName: string;
  nrn: string;
  ingredient: string;
  category: string;
  form: string;
  strength: string;
  applicant: string;
  approvalDate: string | null;
  expiryDate: string | null;
  status: string;
  url: string;
}

interface RawRow {
  product_id?: number;
  product_name?: string;
  NAFDAC?: string;
  strength?: string;
  approval_date?: string | null;
  expiry_date?: string | null;
  status?: string;
  ingredient?: { ingredient_name?: string } | null;
  product_category?: { name?: string } | null;
  form?: { name?: string } | null;
  applicant?: { name?: string } | null;
}

/** Uppercase, no spaces, "/" as "-". "a4 / 9674" -> "A4-9674". */
export function normalizeNrn(raw: string): string {
  return raw.toUpperCase().replace(/\s+/g, "").replace(/\//g, "-");
}

const decode = (s: string) =>
  s
    .replace(/&#0?39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/[#*]+/g, "")
    .replace(/\s*\(check description\)\s*/i, " ")
    .replace(/\s+/g, " ")
    .trim();

function toRecord(r: RawRow): GreenbookRecord | null {
  if (!r.NAFDAC || !r.product_name) return null;
  return {
    productId: Number(r.product_id ?? 0),
    productName: decode(r.product_name),
    nrn: normalizeNrn(r.NAFDAC),
    ingredient: decode(r.ingredient?.ingredient_name ?? ""),
    category: r.product_category?.name ?? "",
    form: r.form?.name ?? "",
    strength: decode(r.strength ?? ""),
    applicant: decode(r.applicant?.name ?? ""),
    approvalDate: r.approval_date ?? null,
    expiryDate: r.expiry_date ?? null,
    status: r.status ?? "",
    url: r.product_id
      ? `https://${GREENBOOK_HOST}/products/details/${r.product_id}`
      : `https://${GREENBOOK_HOST}/`,
  };
}

async function queryColumn(
  column: number,
  term: string,
  length: number,
): Promise<GreenbookRecord[]> {
  const params = new URLSearchParams({
    draw: "1",
    start: "0",
    length: String(length),
    "search[value]": "",
    "search[regex]": "false",
    search_ingredient: "",
  });
  COLUMNS.forEach((name, i) => {
    params.set(`columns[${i}][data]`, name);
    params.set(`columns[${i}][name]`, name);
    params.set(`columns[${i}][searchable]`, "true");
    params.set(`columns[${i}][orderable]`, "false");
    params.set(`columns[${i}][search][value]`, i === column ? term : "");
    params.set(`columns[${i}][search][regex]`, "false");
  });

  const target = `${GREENBOOK_URL}?${params}`;
  // The endpoint only answers with JSON for XHR-style requests.
  const headers = {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  };

  await politeThrottle(GREENBOOK_HOST, 1200);
  try {
    const res = await fetchService("NAFDAC Greenbook", target, {
      headers,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    return await parseRows(res);
  } catch (directErr) {
    // Government hosts often block or drop datacenter IPs. Relay the same
    // request through ZenRows (headers forwarded) before giving up.
    const key = readServerEnv("ZENROWS_API_KEY");
    if (!key) throw directErr;
    const res = await fetchService(
      "NAFDAC Greenbook via ZenRows",
      `https://api.zenrows.com/v1/?url=${encodeURIComponent(target)}&apikey=${encodeURIComponent(key)}&custom_headers=true`,
      { headers, signal: AbortSignal.timeout(30_000) },
    );
    return parseRows(res);
  }
}

async function parseRows(res: Response): Promise<GreenbookRecord[]> {
  if (!res.ok) throw new Error(`NAFDAC Greenbook ${res.status}`);
  const body = (await res.json()) as { data?: RawRow[] };
  if (!Array.isArray(body.data)) {
    throw new Error("NAFDAC Greenbook returned an unexpected response");
  }
  return body.data.map(toRecord).filter((r): r is GreenbookRecord => !!r);
}

/**
 * Looks up one NAFDAC registration number. The register matches with LIKE, so
 * "04-0411" also returns "A4-100411"; only exact matches are returned here.
 * Throws when the register cannot be reached, so callers can tell
 * "not listed" apart from "could not check".
 */
export async function greenbookByNrn(nrn: string): Promise<GreenbookRecord[]> {
  const wanted = normalizeNrn(nrn);
  if (wanted.length < 4) return [];
  const rows = await queryColumn(NRN_COLUMN, wanted, 25);
  return rows.filter((r) => r.nrn === wanted);
}

/** Searches the register by product name. Throws when it cannot be reached. */
export async function greenbookByName(
  name: string,
  limit = 8,
): Promise<GreenbookRecord[]> {
  const term = name.replace(/["%_]/g, " ").replace(/\s+/g, " ").trim();
  if (term.length < 3) return [];
  return queryColumn(NAME_COLUMN, term.slice(0, 80), limit);
}
