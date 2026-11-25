import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthScreen } from "@/components/auth/AuthScreen";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to Zelthia to pick up your health profile and conversations.",
  alternates: { canonical: "/signin" },
  robots: { index: false, follow: true },
};

export default function SignInPage() {
  return (
    <Suspense>
      <AuthScreen mode="signin" />
    </Suspense>
  );
}
