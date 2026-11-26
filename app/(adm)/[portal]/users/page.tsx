import type { Metadata } from "next";
import { UsersView } from "@/components/admin/views/UsersView";

export const metadata: Metadata = {
  title: "Accounts",
  robots: { index: false, follow: false },
};

export default function AdminUsersPage() {
  return <UsersView />;
}
