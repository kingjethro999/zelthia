"use client";

import type { LucideIcon } from "lucide-react";
import { GlassCard } from "./GlassPanel";

export function AdminEmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <GlassCard padding="lg" className="text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-mist text-muted">
        <Icon className="h-6 w-6" aria-hidden />
      </span>
      <p className="mt-3 font-display text-base font-semibold text-ink">
        {title}
      </p>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted">{description}</p>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </GlassCard>
  );
}

export function AdminSkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="adm-glass-card h-36 animate-pulse rounded-3xl p-5"
        >
          <div className="h-9 w-9 rounded-2xl bg-mist" />
          <div className="mt-5 h-3 w-24 rounded bg-mist" />
          <div className="mt-2 h-7 w-16 rounded bg-mist" />
        </div>
      ))}
    </div>
  );
}

export function AdminSkeletonList({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="adm-glass-card h-24 animate-pulse rounded-3xl p-5"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="h-4 w-48 rounded bg-mist" />
              <div className="h-3 w-72 max-w-full rounded bg-mist" />
            </div>
            <div className="h-6 w-20 rounded-full bg-mist" />
          </div>
        </div>
      ))}
    </div>
  );
}
