import { Metadata } from "next";
import {
  getAllFacilities,
  queryInventory,
  getFacilityMetrics,
} from "@/lib/inventory-data";
import { InventoryApp } from "@/components/inventory/inventory-app";

export const metadata: Metadata = {
  alternates: { canonical: "/inventory" },
  title: "Find medicine in stock near you",
  description:
    "Verified multi-tenant pharmaceutical inventory and clinic directory for Zelthia. Find live drug availability, check pharmacy stock near you, and navigate with plain-English landmark directions.",
  keywords: [
    "medical inventory",
    "pharmacy stock tracker",
    "hospital drug directory",
    "Zelthia pharmacy portal",
    "find medicine near me",
    "landmark health directions",
    "Lincoln campus health",
    "verified pharmaceuticals",
    "Abuja pharmacy",
    "Nsukka clinic",
    "hydrocortisone cream availability",
    "antimalarials stock",
  ],
  openGraph: {
    title: "Find medicine in stock near you | Zelthia",
    description:
      "Search live medication stocks across verified university clinics, community pharmacies, and hospitals with plain-English landmark directions.",
    type: "website",
    siteName: "Zelthia",
  },
  twitter: {
    card: "summary_large_image",
    title: "Find medicine in stock near you | Zelthia",
    description:
      "Live medicine stock tracker and verified healthcare facility directory with landmark navigation.",
  },
};

export default function InventoryPage() {
  const facilities = getAllFacilities();
  const { items } = queryInventory();
  const metrics = getFacilityMetrics();

  // Strip circular/redundant facility field from items when passing to client initial props
  const initialItems = items.map((enrichedItem) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { facility, status, isExpiringSoon, ...item } = enrichedItem;
    return item;
  });

  return (
    <InventoryApp
      initialFacilities={facilities}
      initialItems={initialItems}
      initialMetrics={metrics}
    />
  );
}
