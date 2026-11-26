import type { Metadata } from "next";
import { InventoryView } from "@/components/admin/views/InventoryView";

export const instant = false;

export const metadata: Metadata = {
  title: "Global stock",
  robots: { index: false, follow: false },
};

export default function AdminInventoryPage() {
  return <InventoryView />;
}
