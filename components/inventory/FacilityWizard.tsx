"use client";

import { useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  MapPin,
  Stethoscope,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  BasicsSection,
  EMPTY_FACILITY,
  LocationSection,
  ServicesSection,
  type FacilityDraft,
} from "./FacilityForm";

const STEPS = [
  {
    key: "basics",
    label: "Basics",
    hint: "What it is and how to reach you",
    icon: Store,
  },
  {
    key: "where",
    label: "Where to find you",
    hint: "Address, landmarks and hours",
    icon: MapPin,
  },
  {
    key: "services",
    label: "Services and tests",
    hint: "What people can come for",
    icon: Stethoscope,
  },
] as const;

/** Which step each server-side field error belongs to, so a rejection jumps back to it. */
const FIELD_STEP: Record<string, number> = {
  kind: 0,
  country: 0,
  name: 0,
  phone: 0,
  email: 0,
  licenseNumber: 0,
  address: 1,
  city: 1,
  state: 1,
  directions: 1,
  openingHours: 1,
  services: 2,
};

type Local = Partial<Record<string, string>>;

function validate(step: number, f: FacilityDraft): Local {
  const e: Local = {};
  if (step === 0) {
    if (!f.name.trim()) e.name = "Add the name patients will see.";
    if (!f.country) e.country = "Choose the country this facility is in.";
    if (f.phone.replace(/\D/g, "").length < 7)
      e.phone = "Add a phone number patients can call.";
  }
  if (step === 1) {
    if (!f.address.trim()) e.address = "Add the street address.";
    if (!f.city.trim()) e.city = "Add the city or town.";
  }
  if (step === 2 && f.services.length === 0)
    e.services = "Add at least one service or test.";
  return e;
}

/**
 * Registers a facility in three short steps. Each step checks only its own
 * fields, so the person is never handed one long list of errors.
 */
export function FacilityWizard({
  submitLabel,
  onSubmit,
}: {
  submitLabel: string;
  onSubmit: (
    draft: FacilityDraft,
  ) => Promise<{ ok: boolean; error?: string; field?: string }>;
}) {
  const [f, setF] = useState<FacilityDraft>(EMPTY_FACILITY);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [local, setLocal] = useState<Local>({});
  const [server, setServer] = useState<{
    message: string;
    field?: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof FacilityDraft>(k: K, v: FacilityDraft[K]) => {
    setF((d) => ({ ...d, [k]: v }));
    setLocal((l) => (l[k as string] ? { ...l, [k as string]: undefined } : l));
  };
  const fieldError = (k: string) =>
    local[k] ?? (server?.field === k ? server.message : undefined);
  const last = step === STEPS.length - 1;

  const go = (to: number) => {
    setDir(to > step ? 1 : -1);
    setStep(to);
  };

  const next = async () => {
    const errs = validate(step, f);
    setLocal(errs);
    if (Object.values(errs).some(Boolean)) return;
    setServer(null);
    if (!last) return go(step + 1);
    setSaving(true);
    const res = await onSubmit(f);
    setSaving(false);
    if (!res.ok) {
      setServer({ message: res.error ?? "Not saved.", field: res.field });
      if (res.field && FIELD_STEP[res.field] !== undefined)
        go(FIELD_STEP[res.field]);
    }
  };

  const props = { f, set, setF, fieldError };

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        void next();
      }}
    >
      <ol className="flex items-start" aria-label="Progress">
        {STEPS.map((s, i) => {
          const done = i < step;
          const active = i === step;
          const Icon = s.icon;
          return (
            <li
              key={s.key}
              className={cn(
                "flex items-start",
                i < STEPS.length - 1 && "flex-1",
              )}
              aria-current={active ? "step" : undefined}
            >
              <button
                type="button"
                disabled={i > step}
                onClick={() => go(i)}
                className="press group flex flex-col items-center gap-2 text-center disabled:cursor-default"
              >
                <span
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border transition-colors duration-300",
                    done &&
                      "border-brand bg-brand text-white dark:text-[#06231a]",
                    active && "border-brand bg-brand-soft text-brand-strong",
                    !done && !active && "border-line bg-surface text-muted",
                  )}
                >
                  {done ? (
                    <Check className="tick-pop h-5 w-5" aria-hidden />
                  ) : (
                    <Icon className="h-5 w-5" aria-hidden />
                  )}
                </span>
                <span
                  className={cn(
                    "hidden max-w-28 text-xs font-medium sm:block",
                    active ? "text-ink" : "text-muted",
                  )}
                >
                  {s.label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <span
                  className="relative mx-2 mt-5 h-0.5 flex-1 overflow-hidden rounded-full bg-line"
                  aria-hidden
                >
                  <span
                    className="absolute inset-0 origin-left bg-brand transition-transform duration-500 ease-[var(--ease-out)] motion-reduce:transition-none"
                    style={{ transform: `scaleX(${done ? 1 : 0})` }}
                  />
                </span>
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-8">
        <p className="text-sm font-medium text-muted">
          Step {step + 1} of {STEPS.length}
        </p>
        <h2 className="mt-1 title font-display text-2xl font-semibold text-ink">
          {STEPS[step].label}
        </h2>
        <p className="mt-1 text-sm text-muted">{STEPS[step].hint}</p>
      </div>

      <div
        key={step}
        className={cn("mt-6", dir === 1 ? "step-in-next" : "step-in-prev")}
      >
        {step === 0 && <BasicsSection {...props} />}
        {step === 1 && <LocationSection {...props} />}
        {step === 2 && (
          <>
            <ServicesSection {...props} />
            {fieldError("services") && (
              <p
                role="alert"
                className="mt-3 flex items-center gap-2 text-sm font-medium text-alert"
              >
                <AlertCircle className="h-4 w-4" aria-hidden />
                {fieldError("services")}
              </p>
            )}
          </>
        )}
      </div>

      {server && !(server.field && FIELD_STEP[server.field] !== undefined) && (
        <p
          role="alert"
          className="mt-5 flex items-start gap-2 rounded-xl border border-alert/25 bg-alert-soft p-3 text-sm text-alert"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {server.message}
        </p>
      )}

      <div className="mt-8 flex items-center justify-between gap-3">
        {step > 0 ? (
          <Button type="button" variant="ghost" onClick={() => go(step - 1)}>
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back
          </Button>
        ) : (
          <span />
        )}
        <Button type="submit" size="lg" loading={saving}>
          {last
            ? saving && f.licenseNumber
              ? "Saving and checking licence"
              : submitLabel
            : "Continue"}
          {!last && <ArrowRight className="h-4 w-4" aria-hidden />}
        </Button>
      </div>
    </form>
  );
}
