import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthScreen } from "@/components/auth/AuthScreen";

export const metadata: Metadata = {
  title: "Create your account",
  description:
    "Create a free Zelthia account to save your health profile, get guidance that accounts for your allergies, and find medicine in stock near you.",
  alternates: { canonical: "/signup" },
};

export default function SignUpPage() {
  return (
    <Suspense>
      <AuthScreen mode="signup" />
    </Suspense>
  );
}
