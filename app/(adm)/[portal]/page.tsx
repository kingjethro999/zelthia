import type { Metadata } from "next";
import { OverviewView } from "@/components/admin/views/OverviewView";

export const instant = false;

export const metadata: Metadata = {
  title: "Overview",
  robots: { index: false, follow: false },
};

export default function AdminOverviewPage() {
  return <OverviewView />;
}
