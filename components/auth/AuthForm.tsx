"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  Building2,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { ChoiceGroup } from "@/components/ui/Choice";
import { useSession } from "@/lib/store/session";
import type { UserRole } from "@/lib/auth-types";

/** Only same-site relative paths are allowed as post-auth destinations. */
function safeNext(raw: string | null) {
  return raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : null;
}

export function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const signIn = useSession((s) => s.signIn);
  const signUp = useSession((s) => s.signUp);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(
    params.get("role") === "provider" || next?.startsWith("/provider") ? "provider" : "patient",
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<{ message: string; field?: string } | null>(
    null,
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError(null);
    const result =
      mode === "signin"
        ? await signIn(email, password)
        : await signUp({ name, email, password, role });
    setPending(false);
    if (!result.ok) {
      setError({ message: result.error ?? "Something went wrong.", field: result.field });
      return;
    }
    const user = useSession.getState().user;
    if (user && !user.onboarded) {
      const dest = next && next !== "/provider" ? next : role === "provider" ? "/provider/new?welcome=1" : next;
      router.replace(`/setup${dest ? `?next=${encodeURIComponent(dest)}` : ""}`);
    } else {
      router.replace(next ?? (user?.role === "provider" ? "/provider" : "/chat"));
    }
  };

  const fieldError = (f: string) => (error?.field === f ? error.message : undefined);

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {mode === "signup" && (
        <>
          <ChoiceGroup<UserRole>
            label="I'm joining as"
            dense
            value={role}
            onChange={setRole}
            options={[
              {
                value: "patient",
                label: "Myself",
                description: "Health chat and medicine search",
                icon: UserRound,
              },
              {
                value: "provider",
                label: "A facility",
                description: "List stock and services",
                icon: Building2,
              },
            ]}
          />
          <TextField
            label="Full name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            icon={UserRound}
            error={fieldError("name")}
            required
          />
        </>
      )}

      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        inputMode="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        icon={Mail}
        error={fieldError("email")}
        required
      />
      <TextField
        label="Password"
        type="password"
        autoComplete={mode === "signin" ? "current-password" : "new-password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        icon={LockKeyhole}
        hint={mode === "signup" ? "At least 8 characters." : undefined}
        error={fieldError("password")}
        required
        minLength={mode === "signup" ? 8 : undefined}
      />

      {error && !error.field && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-alert/25 bg-alert-soft p-3 text-sm text-alert"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {error.message}
        </p>
      )}

      <Button type="submit" size="lg" loading={pending} className="w-full">
        {mode === "signin" ? "Sign in" : "Create account"}
      </Button>

      <p className="text-center text-sm text-muted">
        <Link href="/chat" className="font-medium text-ink underline-offset-4 hover:underline">
          Continue as a guest
        </Link>
      </p>

      <p className="text-center text-sm text-muted">
        {mode === "signin" ? "New to Zelthia? " : "Already have an account? "}
        <Link
          href={`${mode === "signin" ? "/signup" : "/signin"}?${new URLSearchParams({
            ...(next ? { next } : {}),
            ...(role === "provider" ? { role: "provider" } : {}),
          })}`}
          className="font-semibold text-brand underline-offset-4 hover:underline"
        >
          {mode === "signin" ? "Create an account" : "Sign in"}
        </Link>
      </p>
    </form>
  );
}
