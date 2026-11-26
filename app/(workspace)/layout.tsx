import { Suspense } from "react";
import { AppShell } from "@/components/shared/AppShell";

/** Search, stock and account share one persistent sidebar frame. */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
