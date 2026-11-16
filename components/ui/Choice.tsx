"use client";

import { useId, useRef } from "react";
import { Check, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChoiceOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
  icon?: LucideIcon;
}

interface ChoiceGroupProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: ChoiceOption<T>[];
  label: string;
  hideLabel?: boolean;
  /** "cards" for large tappable tiles, "pills" for a compact segmented row. */
  variant?: "cards" | "pills";
  columns?: 2 | 3 | 4;
  className?: string;
  /** Tighter tiles that hide descriptions on small screens. */
  dense?: boolean;
}

/** Accessible radio group rendered as tiles or pills (no native radios). */
export function ChoiceGroup<T extends string>({
  value,
  onChange,
  options,
  label,
  hideLabel,
  variant = "cards",
  columns = 2,
  className,
  dense,
}: ChoiceGroupProps<T>) {
  const id = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIndex = options.findIndex((o) => o.value === value);

  const move = (from: number, delta: number) => {
    const next = (from + delta + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      move(i, 1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      move(i, -1);
    }
  };

  const grid =
    variant === "cards"
      ? {
          2: "grid grid-cols-2 gap-2.5",
          3: "grid grid-cols-2 gap-2.5 sm:grid-cols-3",
          4: "grid grid-cols-2 gap-2.5 sm:grid-cols-4",
        }[columns]
      : "inline-flex flex-wrap gap-1 rounded-xl border border-line bg-mist p-1";

  return (
    <div className={className}>
      <span
        id={`${id}-label`}
        className={cn(
          "mb-2 block text-sm font-medium text-ink",
          hideLabel && "sr-only",
        )}
      >
        {label}
      </span>
      <div role="radiogroup" aria-labelledby={`${id}-label`} className={grid}>
        {options.map((opt, i) => {
          const checked = opt.value === value;
          const Icon = opt.icon;
          const tabbable = checked || (selectedIndex === -1 && i === 0);
          if (variant === "pills") {
            return (
              <button
                key={opt.value}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                type="button"
                role="radio"
                aria-checked={checked}
                tabIndex={tabbable ? 0 : -1}
                onClick={() => onChange(opt.value)}
                onKeyDown={(e) => onKeyDown(e, i)}
                className={cn(
                  "inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors",
                  checked
                    ? "bg-surface text-ink shadow-sm"
                    : "text-muted hover:text-ink",
                )}
              >
                {Icon && <Icon className="h-4 w-4" aria-hidden />}
                {opt.label}
              </button>
            );
          }
          return (
            <button
              key={opt.value}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={tabbable ? 0 : -1}
              onClick={() => onChange(opt.value)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cn(
                "relative flex items-start gap-2.5 rounded-xl border text-left transition-[border-color,background-color] duration-150",
                dense ? "p-2.5 sm:p-3" : "min-h-14 p-3",
                checked
                  ? "border-brand bg-brand-soft"
                  : "border-line bg-surface hover:border-brand/40",
              )}
            >
              {Icon && (
                <Icon
                  className={cn(
                    "mt-0.5 h-5 w-5 shrink-0",
                    checked ? "text-brand" : "text-muted",
                  )}
                  aria-hidden
                />
              )}
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-ink">
                  {opt.label}
                </span>
                {opt.description && (
                  <span className={cn("mt-0.5 text-xs text-muted", dense ? "hidden sm:block" : "block")}>
                    {opt.description}
                  </span>
                )}
              </span>
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                  checked
                    ? "border-brand bg-brand text-white"
                    : "border-line bg-surface",
                )}
                aria-hidden
              >
                {checked && <Check className="h-3 w-3" strokeWidth={3} />}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  className?: string;
}

export function Switch({
  checked,
  onChange,
  label,
  description,
  className,
}: SwitchProps) {
  const id = useId();
  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <span className="min-w-0">
        <span id={`${id}-l`} className="block text-sm font-medium text-ink">
          {label}
        </span>
        {description && (
          <span id={`${id}-d`} className="block text-xs text-muted">
            {description}
          </span>
        )}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-l`}
        aria-describedby={description ? `${id}-d` : undefined}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
          checked ? "bg-brand" : "bg-line",
        )}
      >
        <span
          className={cn(
            "inline-block h-5 w-5 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-5" : "translate-x-0.5",
          )}
        />
      </button>
    </div>
  );
}
