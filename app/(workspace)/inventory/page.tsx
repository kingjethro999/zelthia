import type { Metadata } from "next";
import { Suspense } from "react";
import { DirectorySearch } from "@/components/inventory/DirectorySearch";

export const metadata: Metadata = {
  title: "Find medicine near you",
  description:
    "Search medicines, skin care, muscle rubs, devices, tests and scans listed by pharmacies, clinics, hospitals and health stores in Nigeria, with stock, prices and landmark directions.",
  keywords: [
    "find medicine near me",
    "pharmacy stock Nigeria",
    "where to buy",
    "scan centre near me",
    "drug availability",
    "skin care pharmacy",
  ],
  alternates: { canonical: "/inventory" },
  openGraph: { title: "Find medicine near you | Zelthia", url: "/inventory" },
};

export default function InventoryPage() {
  return (
    <Suspense>
      <DirectorySearch />
    </Suspense>
  );
}
