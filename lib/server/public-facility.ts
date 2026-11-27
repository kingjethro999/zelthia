import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { Facility, Product } from "@/lib/inventory-types";
import { query } from "./db";
import { isUuid, toFacility, toProduct } from "./inventory";

/**
 * Public, read-only view of one facility for its profile page and QR sticker.
 * Cached for a few minutes so a shared or scanned link is fast, while stock
 * shown to patients stays close to what the facility last saved.
 */
export interface PublicFacility {
  facility: Omit<Facility, "email" | "licenseNumber" | "verification"> & {
    verified: boolean;
  };
  products: Pick<
    Product,
    | "id"
    | "name"
    | "genericName"
    | "category"
    | "form"
    | "strength"
    | "packSize"
    | "priceNgn"
    | "quantity"
    | "lowStockAt"
    | "prescriptionOnly"
    | "regulatoryStatus"
    | "updatedAt"
  >[];
}

export async function getPublicFacility(
  id: string,
): Promise<PublicFacility | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag(`facility:${id}`);

  if (!isUuid(id)) return null;
  const rows = await query<Parameters<typeof toFacility>[0]>(
    "select * from facilities where id = $1 limit 1",
    [id],
  );
  if (!rows[0]) return null;
  const f = toFacility(rows[0]);
  const productRows = await query<Parameters<typeof toProduct>[0]>(
    `select * from products where facility_id = $1
      order by (quantity > 0) desc, name limit 200`,
    [id],
  );

  return {
    facility: {
      id: f.id,
      name: f.name,
      kind: f.kind,
      phone: f.phone,
      address: f.address,
      city: f.city,
      state: f.state,
      directions: f.directions,
      openingHours: f.openingHours,
      services: f.services,
      createdAt: f.createdAt,
      directionsAudioUrl: f.directionsAudioUrl,
      directionsAudioId: f.directionsAudioId,
      verified: f.verification.status === "verified",
    },
    products: productRows.map(toProduct).map((p) => ({
      id: p.id,
      name: p.name,
      genericName: p.genericName,
      category: p.category,
      form: p.form,
      strength: p.strength,
      packSize: p.packSize,
      priceNgn: p.priceNgn,
      quantity: p.quantity,
      lowStockAt: p.lowStockAt,
      prescriptionOnly: p.prescriptionOnly,
      regulatoryStatus: p.regulatoryStatus,
      updatedAt: p.updatedAt,
    })),
  };
}

/** Verified facilities for the sitemap. */
export async function listVerifiedFacilityIds(): Promise<
  { id: string; updatedAt: string }[]
> {
  "use cache";
  cacheLife("hours");
  const rows = await query<{ id: string; created_at: Date }>(
    `select id, created_at from facilities
      where verification_status = 'verified'
      order by created_at desc limit 5000`,
  );
  return rows.map((r) => ({
    id: r.id,
    updatedAt: new Date(r.created_at).toISOString(),
  }));
}
