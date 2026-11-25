export const FACILITY_KINDS = [
  "pharmacy",
  "clinic",
  "hospital",
  "diagnostic",
  "store",
] as const;
export type FacilityKind = (typeof FACILITY_KINDS)[number];

export const FACILITY_KIND_LABEL: Record<FacilityKind, string> = {
  pharmacy: "Pharmacy",
  clinic: "Clinic",
  hospital: "Hospital",
  diagnostic: "Diagnostic or scan centre",
  store: "Health or beauty store",
};

/** Everything health: medicines, skin care, devices, tests and more. */
export const PRODUCT_CATEGORIES = [
  "Medicine",
  "Skin care and cosmetics",
  "Pain relief and muscle care",
  "Vitamins and supplements",
  "Medical devices",
  "Test kits and diagnostics",
  "First aid",
  "Mother and baby",
  "Personal and sexual health",
  "Other health products",
] as const;
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const PRODUCT_FORMS = [
  "Tablet",
  "Capsule",
  "Syrup or suspension",
  "Injection",
  "Cream, gel or ointment",
  "Lotion or oil",
  "Drops",
  "Inhaler",
  "Spray",
  "Powder or sachet",
  "Device",
  "Kit",
  "Other",
] as const;

export interface Facility {
  id: string;
  name: string;
  kind: FacilityKind;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  directions: string;
  openingHours: string;
  licenseNumber: string;
  services: string[];
  createdAt: string;
  /** Public URL of the recorded directions, if any. */
  directionsAudioUrl: string | null;
  directionsAudioId: string | null;
  verification: Verification;
}

/** "verified" is set by an automated check that found proof, or by an admin. */
export type VerificationStatus = "none" | "pending" | "verified";

export interface Verification {
  status: VerificationStatus;
  note: string;
  url: string;
}

export interface Product {
  id: string;
  facilityId: string;
  name: string;
  genericName: string;
  category: string;
  form: string;
  strength: string;
  packSize: string;
  priceNgn: number | null;
  quantity: number;
  lowStockAt: number;
  batch: string;
  expiresOn: string | null;
  prescriptionOnly: boolean;
  notes: string;
  updatedAt: string;
}

export type StockStatus = "in" | "low" | "out";

export function stockStatus(
  p: Pick<Product, "quantity" | "lowStockAt">,
): StockStatus {
  if (p.quantity <= 0) return "out";
  if (p.quantity <= p.lowStockAt) return "low";
  return "in";
}

/** A match from the Zelthia directory: a stocked product or a listed service. */
export interface DirectoryMatch {
  facility: Facility;
  product?: Product;
  service?: string;
}

/** A place found on the open web; never verified by Zelthia. */
export interface WebPlace {
  title: string;
  url: string;
  description: string;
  source: "firecrawl" | "tavily" | "jina";
}

/** A photo found by web search, linked to the page it came from. */
export interface WebImage {
  imageUrl: string;
  title: string;
  /** Page the image appears on; falls back to the image's own site. */
  sourceUrl: string;
  width?: number;
  height?: number;
}

export function formatNaira(n: number | null) {
  return n === null ? "Price not listed" : `₦${n.toLocaleString("en-NG")}`;
}
