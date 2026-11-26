"use client";

import {
  AlertTriangle,
  BadgeCheck,
  Clock,
  ExternalLink,
  Info,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
} from "lucide-react";
import type {
  RegulatoryAlertFlag,
  RegulatoryReport,
  RegistrySourceFinding,
} from "@/lib/inventory-types";
import { cn } from "@/lib/utils";

const safeHttpUrl = (raw?: string): string | null => {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    return u.protocol === "https:" || u.protocol === "http:"
      ? u.toString()
      : null;
  } catch {
    return null;
  }
};

const VERDICT_META = {
  verified: {
    icon: ShieldCheck,
    badge: "Registry match",
    surface: "border-brand/30 bg-brand-soft/60",
    pill: "bg-brand text-white dark:text-[#06231a]",
    iconCls: "text-brand-strong",
  },
  caution: {
    icon: AlertTriangle,
    badge: "Caution",
    surface: "border-caution/35 bg-caution-soft/70",
    pill: "bg-caution text-white dark:text-[#1b1403]",
    iconCls: "text-caution",
  },
  unverified: {
    icon: ShieldQuestion,
    badge: "No listing found",
    surface: "border-caution/35 bg-caution-soft/55",
    pill: "bg-caution text-white dark:text-[#1b1403]",
    iconCls: "text-caution",
  },
  danger: {
    icon: ShieldAlert,
    badge: "Red Flag Alert",
    surface: "border-alert/45 bg-alert-soft/85",
    pill: "bg-alert text-white dark:text-[#2a0c05]",
    iconCls: "text-alert",
  },
} as const;

const FLAG_STYLE: Record<RegulatoryAlertFlag["severity"], string> = {
  danger: "border-alert/30 bg-alert-soft text-alert",
  caution: "border-caution/30 bg-caution-soft text-caution",
  info: "border-sky/25 bg-sky-soft text-sky",
};

const FINDING_BADGE: Record<RegistrySourceFinding["status"], string> = {
  matched: "bg-brand-soft text-brand-strong",
  warning: "bg-caution-soft text-caution",
  discontinued: "bg-caution-soft text-caution",
  recalled: "bg-alert-soft text-alert",
  not_found: "bg-mist text-muted",
};

export function RegulatoryReportCard({
  report,
  onRefresh,
  refreshing,
  compact = false,
  className,
}: {
  report: RegulatoryReport;
  onRefresh?: () => void;
  refreshing?: boolean;
  compact?: boolean;
  className?: string;
}) {
  const ui = VERDICT_META[report.verdict];
  const Icon = ui.icon;
  const checkedDate = report.checkedAt
    ? new Date(report.checkedAt).toLocaleDateString("en-NG", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <section
      aria-label={`Regulatory verification for ${report.query}`}
      className={cn(
        "overflow-hidden rounded-2xl border transition-colors",
        ui.surface,
        className,
      )}
    >
      <div className="flex items-start gap-3 p-4">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface/80 shadow-xs",
            ui.iconCls,
          )}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                ui.pill,
              )}
            >
              {ui.badge}
            </span>
            {report.nafdacCode && (
              <span className="rounded-full border border-line bg-surface px-2.5 py-0.5 text-xs font-medium text-ink">
                NAFDAC {report.nafdacCode}
              </span>
            )}
            {report.barcode && (
              <span className="rounded-full border border-line bg-surface px-2.5 py-0.5 font-mono text-xs text-muted">
                GTIN {report.barcode}
              </span>
            )}
            {report.foreignCodes?.map((c) => (
              <span
                key={c}
                className="rounded-full border border-line bg-surface px-2.5 py-0.5 text-xs text-muted"
              >
                {c}
              </span>
            ))}
            {report.staleFallback && report.staleFromDate ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-xs font-medium text-caution">
                <Clock className="h-3 w-3" aria-hidden />
                Cached {report.staleFromDate}
              </span>
            ) : report.cached && checkedDate ? (
              <span className="text-xs text-muted">
                Checked {checkedDate}
              </span>
            ) : null}
          </div>

          <h4 className="mt-2 font-display text-base font-semibold leading-snug text-ink">
            {report.headline}
          </h4>
          {report.summary && (
            <p className="mt-1 text-sm leading-relaxed text-ink/85">
              {report.summary}
            </p>
          )}
        </div>

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="press flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-muted hover:text-ink disabled:opacity-50"
            title="Re-verify live against public registries"
            aria-label="Re-verify live against public registries"
          >
            <RefreshCw
              className={cn("h-4 w-4", refreshing && "animate-spin")}
              aria-hidden
            />
          </button>
        )}
      </div>

      {report.flags.length > 0 && (
        <ul className="space-y-2 border-t border-line/70 bg-surface/85 px-4 py-3">
          {report.flags.map((flag, i) => (
            <li
              key={`${flag.code}-${i}`}
              className={cn(
                "flex items-start gap-2 rounded-xl border px-3 py-2 text-xs leading-relaxed",
                FLAG_STYLE[flag.severity],
              )}
            >
              {flag.severity === "info" ? (
                <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              ) : (
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              )}
              <div>
                <p className="font-semibold">{flag.title}</p>
                <p className="mt-0.5 opacity-90">{flag.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!compact && report.findings.length > 0 && (
        <ul className="divide-y divide-line border-t border-line bg-surface">
          {report.findings.map((f, i) => {
            const href = safeHttpUrl(f.url);
            return (
              <li key={`${f.registry}-${i}`} className="p-3.5 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-ink">
                    {f.status === "matched" && (
                      <BadgeCheck
                        className="h-3.5 w-3.5 text-brand"
                        aria-hidden
                      />
                    )}
                    {f.registry}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 font-semibold capitalize",
                      FINDING_BADGE[f.status],
                    )}
                  >
                    {f.status.replace("_", " ")}
                  </span>
                </div>
                <p className="mt-1 font-medium text-ink">{f.title}</p>
                {f.detail && (
                  <p className="mt-0.5 text-muted">{f.detail}</p>
                )}
                <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted">
                  <span>{f.sourceAttribution}</span>
                  {href && (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="inline-flex items-center gap-1 font-medium text-brand hover:underline"
                    >
                      Open registry
                      <ExternalLink className="h-3 w-3" aria-hidden />
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="border-t border-line bg-surface/95 px-4 py-2.5 text-[11px] leading-relaxed text-muted">
        {report.disclaimer}
      </p>
    </section>
  );
}
