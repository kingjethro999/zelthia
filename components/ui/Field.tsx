"use client";

import { forwardRef, useId, useState } from "react";
import { Eye, EyeOff, Minus, Plus, X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const inputBase =
  "w-full rounded-xl border border-line bg-surface px-3.5 text-sm text-ink placeholder:text-muted/70 transition-colors hover:border-brand/40 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hideLabel?: boolean;
  hint?: string;
  error?: string;
  icon?: LucideIcon;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    { label, hideLabel, hint, error, icon: Icon, className, type, ...props },
    ref,
  ) {
    const id = useId();
    const [reveal, setReveal] = useState(false);
    const isPassword = type === "password";
    return (
      <div className={className}>
        <label
          htmlFor={id}
          className={cn(
            "mb-1.5 block text-sm font-medium text-ink",
            hideLabel && "sr-only",
          )}
        >
          {label}
        </label>
        <div className="relative">
          {Icon && (
            <Icon
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              aria-hidden
            />
          )}
          <input
            ref={ref}
            id={id}
            type={isPassword && reveal ? "text" : type}
            aria-label={label}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={
              error ? `${id}-err` : hint ? `${id}-hint` : undefined
            }
            className={cn(
              inputBase,
              "h-11",
              Icon && "pl-10",
              isPassword && "pr-11",
              error && "border-alert focus:border-alert focus:ring-alert/20",
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setReveal((r) => !r)}
              className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted hover:bg-mist hover:text-ink"
              aria-label={reveal ? "Hide password" : "Show password"}
            >
              {reveal ? (
                <EyeOff className="h-4 w-4" aria-hidden />
              ) : (
                <Eye className="h-4 w-4" aria-hidden />
              )}
            </button>
          )}
        </div>
        {error ? (
          <p id={`${id}-err`} className="mt-1.5 text-xs font-medium text-alert">
            {error}
          </p>
        ) : hint ? (
          <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted">
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
}

export function TextArea({ label, hint, className, ...props }: TextAreaProps) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      <textarea
        id={id}
        aria-label={label}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className={cn(inputBase, "min-h-24 resize-y py-2.5")}
        {...props}
      />
      {hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}

interface StepperProps {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  hint?: string;
  className?: string;
  hideLabel?: boolean;
  /** Value the first +/- press starts from when empty. */
  start?: number;
}

/** Number input with large +/- targets; supports press-and-type too. */
export function Stepper({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  hint,
  className,
  hideLabel,
  start,
}: StepperProps) {
  const id = useId();
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  const bump = (delta: number) =>
    onChange(value === null ? clamp(start ?? min) : clamp(value + delta));

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className={cn(
          "mb-1.5 block text-sm font-medium text-ink",
          hideLabel && "sr-only",
        )}
      >
        {label}
      </label>
      <div className="flex h-12 items-stretch overflow-hidden rounded-xl border border-line bg-surface focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
        <button
          type="button"
          onClick={() => bump(-step)}
          disabled={value !== null && value <= min}
          className="flex w-12 items-center justify-center text-muted transition-colors hover:bg-mist hover:text-ink disabled:opacity-40"
          aria-label={`Decrease ${label.toLowerCase()}`}
        >
          <Minus className="h-4 w-4" aria-hidden />
        </button>
        <div className="flex flex-1 items-center justify-center gap-1 border-x border-line">
          <input
            id={id}
            aria-label={unit ? `${label} (${unit})` : label}
            inputMode="numeric"
            value={value ?? ""}
            placeholder="--"
            onChange={(e) => {
              const raw = e.target.value.replace(/[^\d.]/g, "");
              if (!raw) return onChange(null);
              const n = Number(raw);
              if (!Number.isNaN(n)) onChange(Math.min(max, n));
            }}
            onBlur={() => value !== null && onChange(clamp(value))}
            aria-describedby={hint ? `${id}-hint` : undefined}
            className="w-16 bg-transparent text-center font-display text-lg font-semibold tabular-nums text-ink placeholder:text-muted/60 focus:outline-none"
          />
          {unit && <span className="text-sm text-muted">{unit}</span>}
        </div>
        <button
          type="button"
          onClick={() => bump(step)}
          disabled={value !== null && value >= max}
          className="flex w-12 items-center justify-center text-muted transition-colors hover:bg-mist hover:text-ink disabled:opacity-40"
          aria-label={`Increase ${label.toLowerCase()}`}
        >
          <Plus className="h-4 w-4" aria-hidden />
        </button>
      </div>
      {hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}

interface TagInputProps {
  label: string;
  hint?: string;
  values: string[];
  onChange: (values: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  tone?: "caution" | "brand" | "sky";
  icon?: LucideIcon;
}

const toneClass = {
  caution: "bg-caution-soft text-caution border-caution/25",
  brand: "bg-brand-soft text-brand-strong border-brand/25",
  sky: "bg-sky-soft text-sky border-sky/25",
};

/** Chip list with free-text entry and tappable suggestions. */
export function TagInput({
  label,
  hint,
  values,
  onChange,
  suggestions = [],
  placeholder = "Type and press Enter",
  tone = "brand",
  icon: Icon,
}: TagInputProps) {
  const id = useId();
  const [draft, setDraft] = useState("");

  const add = (raw: string) => {
    const v = raw.trim().replace(/\s+/g, " ");
    if (!v) return;
    if (!values.some((x) => x.toLowerCase() === v.toLowerCase())) {
      onChange([...values, v]);
    }
    setDraft("");
  };
  const remove = (v: string) => onChange(values.filter((x) => x !== v));
  const open = suggestions.filter(
    (s) =>
      !values.some((v) => v.toLowerCase() === s.toLowerCase()) &&
      s.toLowerCase().includes(draft.trim().toLowerCase()),
  );

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      <div className="flex min-h-12 flex-wrap items-center gap-1.5 rounded-xl border border-line bg-surface p-1.5 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
        {Icon && <Icon className="ml-1.5 h-4 w-4 text-muted" aria-hidden />}
        {values.map((v) => (
          <span
            key={v}
            className={cn(
              "animate-pop inline-flex h-8 items-center gap-1 rounded-lg border pl-2.5 pr-1 text-sm font-medium",
              toneClass[tone],
            )}
          >
            {v}
            <button
              type="button"
              onClick={() => remove(v)}
              className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-black/5 dark:hover:bg-white/10"
              aria-label={`Remove ${v}`}
            >
              <X className="h-3.5 w-3.5" aria-hidden />
            </button>
          </span>
        ))}
        <input
          id={id}
          aria-label={label}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add(draft);
            } else if (e.key === "Backspace" && !draft && values.length) {
              remove(values[values.length - 1]);
            }
          }}
          onBlur={() => add(draft)}
          placeholder={values.length ? "Add another" : placeholder}
          aria-describedby={hint ? `${id}-hint` : undefined}
          className="h-8 min-w-36 flex-1 bg-transparent px-2 text-sm text-ink placeholder:text-muted/70 focus:outline-none"
        />
      </div>
      {hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      )}
      {open.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Suggestions">
          {open.slice(0, 8).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-dashed border-line px-2.5 text-sm text-muted transition-colors hover:border-brand hover:text-ink"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
