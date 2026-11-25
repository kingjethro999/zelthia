"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { AuthShell } from "./AuthShell";
import { AuthForm } from "./AuthForm";
import type { UserRole } from "@/lib/auth-types";

/**
 * Owns the chosen role so the form and the illustration beside it stay in
 * step: pick "A facility" and the left side shows stock, not a doctor's note.
 */
export function AuthScreen({ mode }: { mode: "signin" | "signup" }) {
  const params = useSearchParams();
  const next = params.get("next");
  const [role, setRole] = useState<UserRole>(
    params.get("role") === "provider" || next?.startsWith("/provider") ? "provider" : "patient",
  );
  const facility = role === "provider";

  const copy =
    mode === "signup"
      ? facility
        ? { title: "List your facility", subtitle: "Free to list. Takes about a minute." }
        : { title: "Create your account", subtitle: "Free for patients. Takes about a minute." }
      : facility
        ? { title: "Welcome back", subtitle: "Sign in to manage your stock." }
        : { title: "Welcome back", subtitle: "Sign in to continue with your health profile." };

  return (
    <AuthShell {...copy} role={role}>
      <AuthForm mode={mode} role={role} onRoleChange={setRole} />
    </AuthShell>
  );
}
