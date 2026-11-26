import type { Metadata } from "next";
import { VerificationsView } from "@/components/admin/views/VerificationsView";

export const metadata: Metadata = {
  title: "Licence review",
  robots: { index: false, follow: false },
};

export default function AdminVerificationsPage() {
  return <VerificationsView />;
}
