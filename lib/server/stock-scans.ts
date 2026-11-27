import "server-only";
import type {
  RegulatoryAlertFlag,
  RegulatoryReport,
} from "@/lib/inventory-types";
import { query } from "./db";

/**
 * Scan-to-Stock intake log. Every carton a facility checks is recorded with
 * its verdict and supplier, so the facility keeps a delivery history and
 * Zelthia can warn when other facilities flagged the same supplier.
 */

export interface StockScan {
  id: string;
  productName: string;
  nafdacNumber: string;
  barcode: string;
  batch: string;
  expiresOn: string | null;
  supplier: string;
  verdict: string;
  headline: string;
  createdAt: string;
}

const SUPPLIER_STOPWORDS =
  /\b(ltd|limited|plc|nig|nigeria|enterprises?|ventures?|pharma(ceuticals?)?|co|company|and|the|global|int(ernational)?|services?)\b/g;

/** "Alpha Pharma Ventures Ltd." and "ALPHA PHARMACEUTICALS" share the key "alpha". */
export function supplierKey(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(SUPPLIER_STOPWORDS, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

export async function recordStockScan(opts: {
  facilityId: string;
  userId: string;
  productName: string;
  nafdacNumber: string;
  barcode: string;
  batch: string;
  expiresOn: string | null;
  supplier: string;
  report: RegulatoryReport;
}): Promise<void> {
  await query(
    `insert into stock_scans (facility_id, user_id, product_name, nafdac_no, barcode,
       batch, expires_on, supplier, supplier_key, verdict, headline)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
    [
      opts.facilityId,
      opts.userId,
      opts.productName.slice(0, 160),
      opts.nafdacNumber.slice(0, 64),
      opts.barcode.slice(0, 64),
      opts.batch.slice(0, 60),
      opts.expiresOn,
      opts.supplier.slice(0, 120),
      supplierKey(opts.supplier),
      opts.report.verdict,
      opts.report.headline.slice(0, 200),
    ],
  );
}

/**
 * Counts other facilities that flagged a carton from this supplier as a red
 * flag in the last 90 days. Returns a caution flag, never an accusation:
 * supplier names are typed by facilities and are not verified.
 */
export async function supplierRiskFlag(
  supplier: string,
  facilityId: string,
): Promise<RegulatoryAlertFlag | null> {
  const key = supplierKey(supplier);
  if (key.length < 3) return null;
  const rows = await query<{ facilities: number; scans: number }>(
    `select count(distinct facility_id)::int as facilities, count(*)::int as scans
       from stock_scans
      where supplier_key = $1 and facility_id <> $2 and verdict = 'danger'
        and created_at > now() - interval '90 days'`,
    [key, facilityId],
  );
  const r = rows[0];
  if (!r || r.facilities < 1) return null;
  return {
    code: "SUPPLIER_RISK",
    severity: "caution",
    title: `${r.facilities} other ${r.facilities === 1 ? "facility" : "facilities"} flagged cartons from a supplier with this name`,
    detail: `In the last 90 days, ${r.scans} carton${r.scans === 1 ? "" : "s"} from a supplier recorded as "${supplier.slice(0, 80)}" got a red flag at ${r.facilities === 1 ? "another facility" : "other facilities"} on Zelthia. Supplier names are entered by facilities and are not verified. Check this delivery carefully.`,
  };
}

export async function listStockScans(
  facilityId: string,
  limit = 50,
): Promise<StockScan[]> {
  const rows = await query<{
    id: string;
    product_name: string;
    nafdac_no: string;
    barcode: string;
    batch: string;
    expires_on: Date | null;
    supplier: string;
    verdict: string;
    headline: string;
    created_at: Date;
  }>(
    `select id, product_name, nafdac_no, barcode, batch, expires_on, supplier,
            verdict, headline, created_at
       from stock_scans where facility_id = $1
      order by created_at desc limit $2`,
    [facilityId, Math.min(200, Math.max(1, limit))],
  );
  return rows.map((r) => ({
    id: r.id,
    productName: r.product_name,
    nafdacNumber: r.nafdac_no,
    barcode: r.barcode,
    batch: r.batch,
    expiresOn: r.expires_on
      ? new Date(
          r.expires_on.getTime() - r.expires_on.getTimezoneOffset() * 60000,
        )
          .toISOString()
          .slice(0, 10)
      : null,
    supplier: r.supplier,
    verdict: r.verdict,
    headline: r.headline,
    createdAt: new Date(r.created_at).toISOString(),
  }));
}
