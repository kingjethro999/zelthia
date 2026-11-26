import type { Metadata } from "next";
import { FacilitiesView } from "@/components/admin/views/FacilitiesView";

export const metadata: Metadata = {
  title: "Facilities",
  robots: { index: false, follow: false },
};

export default function AdminFacilitiesPage() {
  return <FacilitiesView />;
}
