"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  Building2,
  Clock,
  Lock,
  PackageSearch,
  RefreshCw,
  ScrollText,
  Users,
} from "lucide-react";
import type { AdminOverviewData } from "@/lib/admin-types";
import { FACILITY_KIND_LABEL } from "@/lib/inventory-types";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useAdminShell } from "../AdminShell";
import { ActivityAreaChart, PipelineBarChart } from "../ui/AdminCharts";
import { AdminSkeletonGrid, AdminSkeletonList } from "../ui/AdminStates";
import { formatRelativeTime } from "../ui/format";
import { GlassBadge, GlassCard, GlassHero, GlassInset } from "../ui/GlassPanel";
import { StatCard } from "../ui/StatCard";

export function OverviewView() {
  const { basePath, user, refreshPendingCount } = useAdminShell();
  const [data, setData] = useState<AdminOverviewData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/overview", { cache: "no-store" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Failed to load overview.");
      setData(body as AdminOverviewData);
      void refreshPendingCount();
    } catch (err) {
      setError((err as Error).message || "Could not load overview.");
    } finally {
      setLoading(false);
    }
  }, [refreshPendingCount]);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/overview", { cache: "no-store" })
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error ?? "Failed to load overview.");
        return body as AdminOverviewData;
      })
      .then((body) => {
        if (!active) return;
        setData(body);
        setLoading(false);
        void refreshPendingCount();
      })
      .catch((err) => {
        if (!active) return;
        setError((err as Error).message || "Could not load overview.");
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [refreshPendingCount]);

  const firstName = user.name.split(/\s+/)[0] || "Admin";
  const pendingCount = data?.facilities.pending ?? 0;

  return (
    <div className="space-y-6">
      {/* Executive liquid-glass hero */}
      <GlassHero>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <GlassBadge tone="brand" icon={Lock}>
                Zero-Knowledge Protected
              </GlassBadge>
              {data && (
                <GlassBadge
                  tone={pendingCount > 0 ? "caution" : "brand"}
                  dot
                >
                  {pendingCount > 0
                    ? `${pendingCount} licence${pendingCount === 1 ? "" : "s"} awaiting review`
                    : "Verification queue clear"}
                </GlassBadge>
              )}
            </div>
            <h1 className="title mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">
              Welcome back, {firstName}.
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
              Monitor facility licence verifications, cross-directory inventory
              health, account activity, and platform security from one frosted
              workspace.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <ButtonLink href={`${basePath}/verifications`} size="md">
              <BadgeCheck className="h-4 w-4" aria-hidden />
              Review licences
            </ButtonLink>
            <ButtonLink
              href={`${basePath}/system`}
              variant="secondary"
              size="md"
            >
              <Activity className="h-4 w-4" aria-hidden />
              System health
            </ButtonLink>
            <Button
              variant="ghost"
              size="md"
              loading={loading}
              onClick={() => void load()}
              aria-label="Refresh overview"
            >
              <RefreshCw className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        </div>
      </GlassHero>

      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-2xl border border-alert/25 bg-alert-soft p-4 text-sm text-alert"
        >
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
          <span>{error}</span>
        </div>
      )}

      {!data ? (
        <>
          <AdminSkeletonGrid count={4} />
          <AdminSkeletonList rows={3} />
        </>
      ) : (
        <>
          {/* 4-column Bento KPI strip */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Accounts"
              value={data.users.total}
              detail={`${data.users.patients} patients · ${data.users.providers} facilities · ${data.users.encrypted} encrypted`}
              icon={Users}
              tone="sky"
              sparkline={data.series14d.map((d) => d.users)}
              href={`${basePath}/users`}
            />
            <StatCard
              label="Facilities"
              value={data.facilities.total}
              detail={`${data.facilities.verified} verified · ${data.facilities.pending} pending · ${data.facilities.citiesCount} cities`}
              icon={Building2}
              tone={data.facilities.pending > 0 ? "caution" : "brand"}
              sparkline={data.series14d.map((d) => d.facilities)}
              href={`${basePath}/facilities`}
            />
            <StatCard
              label="Directory SKUs"
              value={data.products.total}
              detail={`${data.products.lowStock} low · ${data.products.outOfStock} out · ${data.products.expiringSoon + data.products.expired} expiry alerts`}
              icon={PackageSearch}
              tone={
                data.products.expired > 0
                  ? "alert"
                  : data.products.lowStock > 0
                    ? "caution"
                    : "brand"
              }
              href={`${basePath}/inventory`}
            />
            <StatCard
              label="Live Operations"
              value={data.activity.activeSessions}
              detail={`Active sessions · ${data.systemSummary.dbLatencyMs}ms DB · ${data.systemSummary.servicesConfigured}/${data.systemSummary.servicesTotal} services`}
              icon={Activity}
              tone="brand"
              sparkline={data.series14d.map((d) => d.conversations)}
              href={`${basePath}/system`}
            />
          </div>

          {/* Analytics row */}
          <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
            <GlassCard padding="lg">
              <ActivityAreaChart series={data.series14d} />
            </GlassCard>

            <GlassCard padding="lg" className="flex flex-col justify-between gap-6">
              <PipelineBarChart
                title="Facility verification pipeline"
                segments={[
                  {
                    key: "verified",
                    label: "Verified",
                    value: data.facilities.verified,
                    color: "var(--brand)",
                  },
                  {
                    key: "pending",
                    label: "Pending",
                    value: data.facilities.pending,
                    color: "var(--caution)",
                  },
                  {
                    key: "rejected",
                    label: "Declined",
                    value: data.facilities.rejected,
                    color: "var(--alert)",
                  },
                  {
                    key: "none",
                    label: "No licence",
                    value: data.facilities.none,
                    color: "var(--line)",
                  },
                ]}
              />

              <div className="h-px bg-line/70" />

              <PipelineBarChart
                title="Directory stock health"
                segments={[
                  {
                    key: "in",
                    label: "Healthy",
                    value: data.products.inStock,
                    color: "var(--brand)",
                  },
                  {
                    key: "low",
                    label: "Low stock",
                    value: data.products.lowStock,
                    color: "var(--caution)",
                  },
                  {
                    key: "out",
                    label: "Out of stock",
                    value: data.products.outOfStock,
                    color: "var(--alert)",
                  },
                  {
                    key: "rx",
                    label: "Rx only",
                    value: data.products.rxOnly,
                    color: "var(--sky)",
                  },
                ]}
              />
            </GlassCard>
          </div>

          {/* Operational Inbox & Audit Feed */}
          <div className="grid gap-5 lg:grid-cols-2">
            <GlassCard padding="lg">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-caution" aria-hidden />
                  <h2 className="font-display text-lg font-semibold text-ink">
                    Pending verification inbox
                  </h2>
                </div>
                <Link
                  href={`${basePath}/verifications`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
                >
                  Open queue
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </div>

              <div className="mt-4 space-y-2.5">
                {data.pendingPreview.length === 0 ? (
                  <GlassInset className="py-8 text-center">
                    <p className="text-sm font-medium text-ink">
                      All facility licences are up to date.
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      New submissions with a licence number appear here
                      automatically.
                    </p>
                  </GlassInset>
                ) : (
                  data.pendingPreview.map(({ facility: f, owner, evidence }) => (
                    <Link
                      key={f.id}
                      href={`${basePath}/verifications`}
                      className="adm-inner-well press-soft flex items-center justify-between gap-3 rounded-2xl p-3.5 transition-colors hover:border-brand/45"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink">
                          {f.name}
                        </p>
                        <p className="truncate text-xs text-muted">
                          {FACILITY_KIND_LABEL[f.kind]} · {f.city} ·{" "}
                          {owner.name}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <span className="rounded-full bg-mist px-2.5 py-0.5 text-[11px] font-semibold text-ink">
                          {f.licenseNumber}
                        </span>
                        <span className="text-[11px] text-muted">
                          {evidence.length} .gov.ng hit
                          {evidence.length === 1 ? "" : "s"}
                        </span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </GlassCard>

            <GlassCard padding="lg">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ScrollText className="h-4 w-4 text-sky" aria-hidden />
                  <h2 className="font-display text-lg font-semibold text-ink">
                    Recent audit log
                  </h2>
                </div>
                <Link
                  href={`${basePath}/audit`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
                >
                  Full trail
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </div>

              <div className="mt-4 space-y-2.5">
                {data.recentAudit.length === 0 ? (
                  <GlassInset className="py-8 text-center">
                    <p className="text-sm font-medium text-ink">
                      No admin actions recorded yet.
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      Approvals, declines, removals, and maintenance runs are
                      logged here.
                    </p>
                  </GlassInset>
                ) : (
                  data.recentAudit.map((entry) => (
                    <div
                      key={entry.id}
                      className="adm-inner-well flex items-center justify-between gap-3 rounded-2xl p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-ink">
                          {entry.action}
                        </p>
                        <p className="truncate text-[11px] text-muted">
                          {entry.adminName ?? entry.adminEmail ?? "Admin"} ·{" "}
                          {entry.targetType}
                          {entry.targetId
                            ? ` (${entry.targetId.slice(0, 8)})`
                            : ""}
                        </p>
                      </div>
                      <span className="shrink-0 text-[11px] text-muted">
                        {formatRelativeTime(entry.createdAt)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </GlassCard>
          </div>
        </>
      )}
    </div>
  );
}
