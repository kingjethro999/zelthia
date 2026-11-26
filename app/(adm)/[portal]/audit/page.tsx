import type { Metadata } from "next";
import { AuditView } from "@/components/admin/views/AuditView";

export const instant = false;

export const metadata: Metadata = {
  title: "Audit trail",
  robots: { index: false, follow: false },
};

export default function AdminAuditPage() {
  return <AuditView />;
}
