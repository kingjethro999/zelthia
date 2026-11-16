import type { Metadata } from "next";
import { Suspense } from "react";
import { NewFacility } from "@/components/inventory/ProviderDashboard";

export const metadata: Metadata = {
  title: "Register your facility",
  robots: { index: false, follow: false },
};

export default function NewFacilityPage() {
  return (
    <Suspense>
      <NewFacility />
    </Suspense>
  );
}
