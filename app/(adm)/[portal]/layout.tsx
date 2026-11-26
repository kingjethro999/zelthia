import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { AdminShell } from "@/components/admin/AdminShell";
import { isValidAdminSlug } from "@/lib/server/admin-route";
import { getSessionUser } from "@/lib/server/auth";

export const metadata: Metadata = {
  title: {
    default: "Console",
    template: "%s | Zelthia Console",
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
    },
  },
};

async function AdminPortalGate({
  params,
  children,
}: {
  params: Promise<{ portal: string }>;
  children: React.ReactNode;
}) {
  await connection();
  const { portal } = await params;
  if (!isValidAdminSlug(portal)) {
    notFound();
  }
  const user = await getSessionUser();
  if (!user?.isAdmin) {
    notFound();
  }
  return (
    <AdminShell basePath={`/${portal}`} initialUser={user}>
      {children}
    </AdminShell>
  );
}

export default function AdminPortalLayout({
  params,
  children,
}: {
  params: Promise<{ portal: string }>;
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="h-dvh bg-paper" />}>
      <AdminPortalGate params={params}>{children}</AdminPortalGate>
    </Suspense>
  );
}
