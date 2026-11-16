import type { Metadata } from "next";
import { Suspense } from "react";
import { ProviderDashboard } from "@/components/inventory/ProviderDashboard";

export const metadata: Metadata = {
  title: "Inventory dashboard",
  robots: { index: false, follow: false },
};

export default function ProviderPage() {
  return (
    <Suspense>
      <ProviderDashboard />
    </Suspense>
  );
}
