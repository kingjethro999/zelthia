import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Zelthia to pick up your health profile and conversations.",
  alternates: { canonical: "/signin" },
  robots: { index: false, follow: true },
};

export default function SignInPage() {
  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue with your health profile.">
      <Suspense>
        <AuthForm mode="signin" />
      </Suspense>
    </AuthShell>
  );
}
