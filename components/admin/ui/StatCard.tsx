"use client";

import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { MiniSparkline } from "./AdminCharts";

type Tone = "brand" | "sky" | "caution" | "alert";

const ICON_TONE: Record<Tone, string> = {
  brand: "bg-brand-soft text-brand-strong",
  sky: "bg-sky-soft text-sky",
  caution: "bg-caution-soft text-caution",
  alert: "bg-alert-soft text-alert",
};

const SPARK_COLOR: Record<Tone, string> = {
  brand: "var(--brand)",
  sky: "var(--sky)",
  caution: "var(--caution)",
  alert: "var(--alert)",
};

export function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = "brand",
  sparkline,
  href,
  className,
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: LucideIcon;
  tone?: Tone;
  sparkline?: number[];
  href?: string;
  className?: string;
}) {
  const inner = (
    <div className="flex h-full flex-col justify-between gap-4">
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-2xl",
            ICON_TONE[tone],
          )}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <div className="flex items-center gap-2">
          {sparkline && sparkline.length > 1 && (
            <MiniSparkline data={sparkline} color={SPARK_COLOR[tone]} />
          )}
          {href && (
            <ArrowUpRight
              className="h-4 w-4 text-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink"
              aria-hidden
            />
          )}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
          {label}
        </p>
        <p className="tabular mt-1 font-display text-3xl font-semibold tracking-tight text-ink">
          {typeof value === "number" ? value.toLocaleString("en-NG") : value}
        </p>
        <p className="mt-1.5 text-xs text-muted">{detail}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          "adm-glass-card adm-glass-card-hover press-soft group block rounded-3xl p-5",
          className,
        )}
      >
        {inner}
      </Link>
    );
  }

  return (
    <div className={cn("adm-glass-card rounded-3xl p-5", className)}>
      {inner}
    </div>
  );
}
