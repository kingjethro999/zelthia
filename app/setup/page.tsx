import type { Metadata } from "next";
import { Suspense } from "react";
import { SetupWizard } from "@/components/profile/SetupWizard";

export const metadata: Metadata = {
  title: "Set up your health profile",
  robots: { index: false, follow: false },
};

export default function SetupPage() {
  return (
    <Suspense>
      <SetupWizard />
    </Suspense>
  );
}
