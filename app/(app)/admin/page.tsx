import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminVerifications } from "@/components/admin/AdminVerifications";

export const metadata: Metadata = {
  title: "Admin verification queue",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <Suspense>
      <AdminVerifications />
    </Suspense>
  );
}
