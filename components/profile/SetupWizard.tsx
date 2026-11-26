"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  ClipboardList,
  HeartPulse,
  NotebookPen,
  Ruler,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { useSession } from "@/lib/store/session";
import type { BiometricProfile } from "@/lib/ai/types";
import { cn } from "@/lib/utils";
import {
  AboutFields,
  BodyFields,
  HistoryFields,
  NotesField,
} from "./ProfileSections";

const STEPS = [
  {
    key: "about",
    title: "About you",
    blurb: "The basics that change what's safe for you.",
    icon: UserRound,
  },
  {
    key: "body",
    title: "Body measurements",
    blurb: "Height, weight and blood group.",
    icon: Ruler,
  },
  {
    key: "history",
    title: "Health history",
    blurb: "Allergies, conditions and regular medicines.",
    icon: HeartPulse,
  },
  {
    key: "notes",
    title: "Anything else",
    blurb: "Notes, then review and finish.",
    icon: NotebookPen,
  },
] as const;

function safeNext(raw: string | null) {
  return raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : null;
}

export function SetupWizard() {
  const router = useRouter();
  const status = useSession((s) => s.status);
  const user = useSession((s) => s.user);

  useEffect(() => {
    if (status === "ready" && !user) router.replace("/signin?next=/setup");
  }, [status, user, router]);

  if (status !== "ready" || !user) {
    return (
      <div className="flex h-dvh items-center justify-center text-muted">
        Loading your profile…
      </div>
    );
  }
  // Form state is seeded from the confirmed server session.
  return <SetupForm />;
}

function SetupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, profile: saved, saveProfile } = useSession();

  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<BiometricProfile>(saved);
  const [name, setName] = useState(user?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const patch = (p: Partial<BiometricProfile>) =>
    setDraft((d) => ({ ...d, ...p }));
  const last = step === STEPS.length - 1;
  const current = STEPS[step];

  const finish = async () => {
    setSaving(true);
    setError(null);
    const res = await saveProfile(draft, { complete: true, name });
    setSaving(false);
    if (!res.ok) return setError(res.error ?? "Your profile wasn't saved.");
    const next = safeNext(params.get("next"));
    router.replace(
      next ??
        (user?.role === "provider" && !useSession.getState().facilityCount
          ? "/provider/new?welcome=1"
          : user?.role === "provider"
            ? "/provider"
            : "/chat"),
    );
  };

  const go = (to: number) => {
    setStep(to);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isProvider = user?.role === "provider";
  const skipTo =
    safeNext(params.get("next")) ??
    (isProvider ? "/provider/new?welcome=1" : "/chat");

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-line px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2"
          aria-label="Zelthia home"
        >
          <Image
            src="/icons/icon-96.png"
            alt=""
            width={26}
            height={26}
            unoptimized
          />
          <span className="font-display text-lg font-semibold text-ink">
            Zelthia
          </span>
        </Link>
        <Link
          href={skipTo}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted hover:bg-mist hover:text-ink"
        >
          Skip for now
        </Link>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-12 lg:py-12">
          {/* Step rail: horizontal progress on mobile, vertical list on desktop */}
          <nav
            aria-label="Setup progress"
            className="lg:sticky lg:top-24 lg:self-start"
          >
            <p className="mb-1 text-sm text-muted">
              Step {step + 1} of {STEPS.length}
            </p>
            {isProvider && (
              <p className="mb-3 text-sm font-medium text-brand">
                Next: your facility details
              </p>
            )}
            <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-line lg:hidden">
              <div
                className="h-full rounded-full bg-brand transition-[width] duration-300"
                style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              />
            </div>
            <ol className="hidden space-y-1 lg:block">
              {STEPS.map((s, i) => {
                const done = i < step;
                const active = i === step;
                const Icon = s.icon;
                return (
                  <li key={s.key}>
                    <button
                      type="button"
                      onClick={() => go(i)}
                      aria-current={active ? "step" : undefined}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                        active
                          ? "bg-surface shadow-sm ring-1 ring-line"
                          : "hover:bg-mist",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors",
                          done && "border-brand bg-brand text-white",
                          active && "border-brand text-brand",
                          !done && !active && "border-line text-muted",
                        )}
                      >
                        {done ? (
                          <Check className="h-4 w-4" aria-hidden />
                        ) : (
                          <Icon className="h-4 w-4" aria-hidden />
                        )}
                      </span>
                      <span
                        className={cn(
                          "text-sm",
                          active ? "font-semibold text-ink" : "text-muted",
                        )}
                      >
                        {s.title}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>

          <section className="min-w-0">
            <div key={current.key} className="animate-rise">
              <h1 className="title font-display text-3xl font-semibold text-ink sm:text-4xl">
                {current.title}
              </h1>
              <p className="mt-2 text-muted">
                {current.blurb} You can skip anything and add it later.
              </p>

              <div className="mt-8 rounded-3xl border border-line bg-surface p-5 sm:p-8">
                {current.key === "about" && (
                  <div className="space-y-6">
                    <TextField
                      label="Your name"
                      placeholder="e.g. Chidi Eze"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      icon={UserRound}
                      className="max-w-md"
                    />
                    <AboutFields profile={draft} patch={patch} />
                  </div>
                )}
                {current.key === "body" && (
                  <BodyFields profile={draft} patch={patch} />
                )}
                {current.key === "history" && (
                  <HistoryFields profile={draft} patch={patch} />
                )}
                {current.key === "notes" && (
                  <div className="space-y-8">
                    <NotesField profile={draft} patch={patch} />
                    <Review profile={draft} onEdit={go} />
                  </div>
                )}
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="mt-4 flex items-start gap-2 rounded-xl border border-alert/25 bg-alert-soft p-3 text-sm text-alert"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                {error}
              </p>
            )}

            <div className="sticky bottom-0 -mx-4 mt-6 flex items-center justify-between gap-3 border-t border-line bg-paper/95 px-4 py-4 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0">
              <Button
                variant="ghost"
                onClick={() => go(step - 1)}
                disabled={step === 0}
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Back
              </Button>
              {last ? (
                <Button onClick={finish} loading={saving} size="lg">
                  <Check className="h-4 w-4" aria-hidden />
                  Finish setup
                </Button>
              ) : (
                <Button onClick={() => go(step + 1)} size="lg">
                  Continue
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Review({
  profile,
  onEdit,
}: {
  profile: BiometricProfile;
  onEdit: (step: number) => void;
}) {
  const rows: { label: string; value: string; step: number }[] = [
    { label: "Age", value: profile.age ? `${profile.age} years` : "", step: 0 },
    { label: "Location", value: profile.location ?? "", step: 0 },
    {
      label: "Sex",
      value: (profile.biologicalSex ?? "").replace(/-/g, " "),
      step: 0,
    },
    {
      label: "Height",
      value: profile.heightCm ? `${profile.heightCm} cm` : "",
      step: 1,
    },
    {
      label: "Weight",
      value: profile.weightKg ? `${profile.weightKg} kg` : "",
      step: 1,
    },
    { label: "Blood group", value: profile.bloodGroup ?? "", step: 1 },
    {
      label: "Allergies",
      value: (profile.allergies ?? []).join(", "),
      step: 2,
    },
    {
      label: "Conditions",
      value: (profile.chronicConditions ?? []).join(", "),
      step: 2,
    },
    {
      label: "Medicines",
      value: (profile.currentMedications ?? []).join(", "),
      step: 2,
    },
    { label: "Notes", value: profile.notes ?? "", step: 3 },
  ];
  return (
    <div>
      <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-ink">
        <ClipboardList className="h-4 w-4 text-muted" aria-hidden />
        Review
      </h2>
      <dl className="divide-y divide-line rounded-2xl border border-line">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-3 px-4 py-3">
            <dt className="w-28 shrink-0 text-sm text-muted">{r.label}</dt>
            <dd
              className={cn(
                "min-w-0 flex-1 text-sm capitalize",
                r.value ? "text-ink" : "text-muted/70",
              )}
            >
              {r.value || "Not added"}
            </dd>
            <button
              type="button"
              onClick={() => onEdit(r.step)}
              className="rounded-lg px-2 py-1 text-sm font-medium text-brand hover:bg-brand-soft"
              aria-label={`Edit ${r.label.toLowerCase()}`}
            >
              Edit
            </button>
          </div>
        ))}
      </dl>
    </div>
  );
}
