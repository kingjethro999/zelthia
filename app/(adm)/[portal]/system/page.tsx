import type { Metadata } from "next";
import { SystemView } from "@/components/admin/views/SystemView";

export const instant = false;

export const metadata: Metadata = {
  title: "System & privacy",
  robots: { index: false, follow: false },
};

export default function AdminSystemPage() {
  return <SystemView />;
}
