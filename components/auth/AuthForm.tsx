"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  Building2,
  Lock,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { ChoiceGroup } from "@/components/ui/Choice";
import { useSession } from "@/lib/store/session";
import type { UserRole } from "@/lib/auth-types";
import { cn } from "@/lib/utils";

/** Only same-site relative paths are allowed as post-auth destinations. */
function safeNext(raw: string | null) {
  return raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : null;
}

export function AuthForm({
  mode,
  role,
  onRoleChange,
}: {
  mode: "signin" | "signup";
  role: UserRole;
  onRoleChange: (r: UserRole) => void;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const signIn = useSession((s) => s.signIn);
  const signUp = useSession((s) => s.signUp);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<{
    message: string;
    field?: string;
  } | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "signup" && !acceptedTerms) {
      setError({
        message:
          "Please accept the Terms of use and Privacy policy to create an account.",
        field: "acceptedTerms",
      });
      return;
    }
    setPending(true);
    setError(null);
    const result =
      mode === "signin"
        ? await signIn(email, password)
        : await signUp({ name, email, password, role, acceptedTerms });
    setPending(false);
    if (!result.ok) {
      setError({
        message: result.error ?? "Something went wrong.",
        field: result.field,
      });
      return;
    }
    const adminDest =
      "redirectTo" in result && typeof result.redirectTo === "string"
        ? safeNext(result.redirectTo)
        : null;
    if (adminDest) {
      router.replace(adminDest);
      return;
    }
    const state = useSession.getState();
    const user = state.user;
    if (user?.role === "provider") {
      if (mode === "signup") {
        router.replace(
          next && next.startsWith("/provider")
            ? next
            : "/provider/new?welcome=1",
        );
      } else {
        router.replace(
          next ??
            (state.facilityCount === 0
              ? "/provider/new?welcome=1"
              : "/provider"),
        );
      }
      return;
    }
    if (user && !user.onboarded) {
      router.replace(
        `/setup${next ? `?next=${encodeURIComponent(next)}` : ""}`,
      );
    } else {
      router.replace(next ?? "/chat");
    }
  };

  const fieldError = (f: string) =>
    error?.field === f ? error.message : undefined;

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {mode === "signup" && (
        <>
          <ChoiceGroup<UserRole>
            label="I'm joining as"
            dense
            value={role}
            onChange={onRoleChange}
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
                description: "List stock, services and directions",
                icon: Building2,
              },
            ]}
          />
          <TextField
            label={role === "provider" ? "Your name" : "Full name"}
            placeholder={
              role === "provider" ? "e.g. Amaka Okafor" : "e.g. Chidi Eze"
            }
            hint={
              role === "provider"
                ? "The person managing the facility account."
                : undefined
            }
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
        label={
          mode === "signup" && role === "provider" ? "Work email" : "Email"
        }
        placeholder={
          mode === "signup" && role === "provider"
            ? "desk@greenfieldpharmacy.com"
            : "you@example.com"
        }
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
        placeholder={
          mode === "signup" ? "At least 8 characters" : "Your password"
        }
        type="password"
        autoComplete={mode === "signin" ? "current-password" : "new-password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        icon={LockKeyhole}
        hint={
          mode === "signup"
            ? "Also locks your encrypted health profile and saved chats, so keep it safe."
            : undefined
        }
        error={fieldError("password")}
        required
        minLength={mode === "signup" ? 8 : undefined}
      />

      {mode === "signup" && (
        <>
          <div className="rounded-2xl border border-brand/25 bg-brand-soft/45 p-3 text-xs leading-relaxed text-ink">
            <p className="flex items-center gap-1.5 font-semibold text-brand-strong">
              <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Your health data is encrypted with your password key
            </p>
            <p className="mt-1 text-muted">
              We never sell or mine your personal data. Your health profile,
              saved chats, and uploaded notes are encrypted before storage,
              never saved as plain text in our database, and unreadable to
              Zelthia staff.
            </p>
          </div>

          <div>
            <label className="flex cursor-pointer items-start gap-2.5 text-xs leading-relaxed text-muted">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => {
                  setAcceptedTerms(e.target.checked);
                  if (error?.field === "acceptedTerms") setError(null);
                }}
                aria-invalid={Boolean(fieldError("acceptedTerms")) || undefined}
                className={cn(
                  "mt-0.5 h-4 w-4 shrink-0 rounded border-line accent-brand",
                  fieldError("acceptedTerms") && "ring-2 ring-alert/40",
                )}
                required
              />
              <span>
                I accept the{" "}
                <Link
                  href="/terms"
                  target="_blank"
                  className="font-semibold text-ink underline underline-offset-2 hover:text-brand"
                >
                  Terms of use
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  target="_blank"
                  className="font-semibold text-ink underline underline-offset-2 hover:text-brand"
                >
                  Privacy policy
                </Link>
                , and give explicit consent under the Nigeria Data Protection
                Act (NDPA) 2023 for Zelthia to process my encrypted health
                profile solely to answer my requests.
              </span>
            </label>
            {fieldError("acceptedTerms") && (
              <p className="mt-1.5 text-xs font-medium text-alert">
                {fieldError("acceptedTerms")}
              </p>
            )}
          </div>
        </>
      )}

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
        <Link
          href="/chat"
          className="font-medium text-ink underline-offset-4 hover:underline"
        >
          Continue as a guest
        </Link>
      </p>

      <p className="text-center text-sm text-muted">
        {mode === "signin" ? "New to Zelthia? " : "Already have an account? "}
        <Link
          href={`${mode === "signin" ? "/signup" : "/signin"}?${new URLSearchParams(
            {
              ...(next ? { next } : {}),
              ...(role === "provider" ? { role: "provider" } : {}),
            },
          )}`}
          className="font-semibold text-brand underline-offset-4 hover:underline"
        >
          {mode === "signin" ? "Create an account" : "Sign in"}
        </Link>
      </p>
    </form>
  );
}
