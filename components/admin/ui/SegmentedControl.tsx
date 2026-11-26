"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SegmentOption<T extends string = string> {
  value: T;
  label: string;
  count?: number;
  icon?: LucideIcon;
}

/**
 * Apple-style segmented control with a sliding glass-lit thumb.
 * Measures active item geometry via ResizeObserver so pill transitions glide smoothly.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  size = "md",
  className,
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (next: T) => void;
  ariaLabel: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [thumb, setThumb] = useState<{ left: number; width: number } | null>(
    null,
  );

  const measure = useCallback(() => {
    const idx = options.findIndex((o) => o.value === value);
    const btn = idx >= 0 ? btnRefs.current[idx] : null;
    if (!btn) {
      setThumb(null);
      return;
    }
    setThumb({ left: btn.offsetLeft, width: btn.offsetWidth });
  }, [options, value]);

  useLayoutEffect(() => {
    measure();
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  const onKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = (idx + 1) % options.length;
      onChange(options[next].value);
      btnRefs.current[next]?.focus();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prev = (idx - 1 + options.length) % options.length;
      onChange(options[prev].value);
      btnRefs.current[prev]?.focus();
    }
  };

  return (
    <div
      ref={containerRef}
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        "relative inline-flex max-w-full flex-wrap items-center gap-0.5 rounded-2xl border border-line/80 bg-mist/75 p-1 backdrop-blur-md",
        className,
      )}
    >
      {thumb && (
        <span
          aria-hidden
          className="pointer-events-none absolute top-1 bottom-1 left-0 rounded-xl bg-surface shadow-[0_1px_2px_rgb(6_25_26/0.12),0_4px_12px_-4px_rgb(6_25_26/0.16)] transition-[transform,width] duration-[280ms] ease-[var(--ease-out)] motion-reduce:transition-none"
          style={{
            width: `${thumb.width}px`,
            transform: `translate3d(${thumb.left}px, 0, 0)`,
          }}
        />
      )}
      {options.map((opt, i) => {
        const active = opt.value === value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            ref={(el) => {
              btnRefs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(opt.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              "press-soft relative z-10 inline-flex items-center gap-1.5 rounded-xl font-medium transition-colors",
              size === "sm" ? "h-8 px-2.5 text-xs" : "h-9 px-3.5 text-sm",
              active ? "text-ink" : "text-muted hover:text-ink",
            )}
          >
            {Icon && (
              <Icon
                className={cn(
                  "h-3.5 w-3.5 shrink-0",
                  active ? "text-brand" : "text-muted",
                )}
                aria-hidden
              />
            )}
            <span>{opt.label}</span>
            {opt.count !== undefined && (
              <span
                className={cn(
                  "tabular rounded-full px-1.5 py-0.5 text-[11px] font-semibold leading-none",
                  active
                    ? "bg-brand-soft text-brand-strong"
                    : "bg-surface/70 text-muted",
                )}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
