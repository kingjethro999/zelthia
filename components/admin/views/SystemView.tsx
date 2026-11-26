"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Database,
  Lock,
  RefreshCw,
  Server,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { AdminSystemHealth } from "@/lib/admin-types";
import { cn } from "@/lib/utils";
import { AdminSkeletonGrid, AdminSkeletonList } from "../ui/AdminStates";
import { useAdminToast } from "../ui/AdminToast";
import { formatBytes } from "../ui/format";
import { GlassBadge, GlassCard, GlassInset } from "../ui/GlassPanel";

function CoverageRow({
  label,
  encrypted,
  total,
}: {
  label: string;
  encrypted: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((encrypted / total) * 100) : 100;
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-ink">{label}</span>
        <span className="tabular text-muted">
          {encrypted.toLocaleString("en-NG")} / {total.toLocaleString("en-NG")}{" "}
          (<strong className="text-ink">{pct}%</strong>)
        </span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-mist">
        <div
          className="h-full rounded-full bg-brand transition-[width] duration-500 ease-[var(--ease-out)]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function SystemView() {
  const toast = useAdminToast();
  const [data, setData] = useState<AdminSystemHealth | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/admin/system", { cache: "no-store" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Failed to load system health.");
      setData(body as AdminSystemHealth);
    } catch (err) {
      setError((err as Error).message || "Could not load system health.");
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/system", { cache: "no-store" })
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error ?? "Failed to load system health.");
        return body as AdminSystemHealth;
      })
      .then((body) => {
        if (active) {
          setError(null);
          setData(body);
        }
      })
      .catch((err) => {
        if (active) {
          setError((err as Error).message || "Could not load system health.");
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const runMaintenance = async (
    action: "prune_sessions" | "prune_rate_limits",
  ) => {
    setBusy(action);
    try {
      const res = await fetch("/api/admin/system/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Maintenance run failed.");
      toast.success(
        "Maintenance complete",
        `Removed ${body.deleted ?? 0} expired record(s).`,
      );
      await load();
    } catch (err) {
      toast.error(
        "Maintenance failed",
        (err as Error).message || "Try again.",
      );
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="title font-display text-3xl font-semibold text-ink">
            System health & privacy
          </h1>
          <p className="mt-1 text-sm text-muted">
            PostgreSQL telemetry, zero-knowledge encryption coverage, service
            readiness, and housekeeping tools.
          </p>
        </div>
        <Button variant="secondary" onClick={() => void load()}>
          <RefreshCw className="h-4 w-4" aria-hidden />
          Refresh
        </Button>
      </div>

      {error && (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-2xl border border-alert/25 bg-alert-soft p-3.5 text-sm text-alert"
        >
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}

      {!data ? (
        <>
          <AdminSkeletonGrid count={4} />
          <AdminSkeletonList rows={3} />
        </>
      ) : (
        <>
          <div className="grid gap-5 lg:grid-cols-2">
            {/* Database status & table sizes */}
            <GlassCard padding="lg">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-soft text-brand-strong">
                    <Database className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <h2 className="font-display text-lg font-semibold text-ink">
                      PostgreSQL cluster
                    </h2>
                    <p className="text-xs text-muted">
                      TLS verified · Parameterized queries
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <GlassBadge tone="brand" dot>
                    <span className="tabular">{data.dbLatencyMs} ms</span>
                  </GlassBadge>
                  <GlassBadge tone="neutral">
                    <span className="tabular">
                      {formatBytes(data.dbSizeBytes)}
                    </span>
                  </GlassBadge>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {data.tables.map((t) => (
                  <GlassInset key={t.name} className="p-3">
                    <p className="truncate text-[11px] font-medium text-muted">
                      {t.name}
                    </p>
                    <p className="tabular mt-0.5 font-display text-xl font-semibold text-ink">
                      {t.count.toLocaleString("en-NG")}
                    </p>
                  </GlassInset>
                ))}
              </div>
            </GlassCard>

            {/* Encryption coverage */}
            <GlassCard padding="lg">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-soft text-sky">
                    <Lock className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <h2 className="font-display text-lg font-semibold text-ink">
                      Zero-Knowledge encryption coverage
                    </h2>
                    <p className="text-xs text-muted">
                      Split-key AES-256-GCM sealing status
                    </p>
                  </div>
                </div>
                <GlassBadge tone="brand" icon={ShieldCheck}>
                  Active
                </GlassBadge>
              </div>

              <div className="mt-5 space-y-4">
                <CoverageRow
                  label="User accounts (wrapped DEK)"
                  encrypted={data.encryption.usersEncrypted}
                  total={data.encryption.usersTotal}
                />
                <CoverageRow
                  label="Health profiles (data_enc)"
                  encrypted={data.encryption.profilesEncrypted}
                  total={data.encryption.profilesTotal}
                />
                <CoverageRow
                  label="Conversation titles (title_enc)"
                  encrypted={data.encryption.conversationsEncrypted}
                  total={data.encryption.conversationsTotal}
                />
                <CoverageRow
                  label="Chat messages (payload_enc)"
                  encrypted={data.encryption.messagesEncrypted}
                  total={data.encryption.messagesTotal}
                />
              </div>
            </GlassCard>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {/* External integration readiness (booleans only) */}
            <GlassCard padding="lg">
              <div className="flex items-center gap-2.5">
                <Server className="h-5 w-5 text-brand" aria-hidden />
                <h2 className="font-display text-lg font-semibold text-ink">
                  Service readiness
                </h2>
              </div>
              <p className="mt-1 text-xs text-muted">
                Configuration checks report presence only; environment secrets
                are never exposed to clients.
              </p>

              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {data.services.map((svc) => (
                  <li
                    key={svc.id}
                    className="adm-inner-well flex items-center justify-between gap-2 rounded-2xl p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-ink">
                        {svc.label}
                      </p>
                      <p className="text-[11px] text-muted">{svc.category}</p>
                    </div>
                    <span
                      className={cn(
                        "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                        svc.configured
                          ? "bg-brand-soft text-brand-strong"
                          : "bg-caution-soft text-caution",
                      )}
                    >
                      {svc.configured && (
                        <CheckCircle2 className="h-3 w-3" aria-hidden />
                      )}
                      {svc.configured ? "Ready" : "Unset"}
                    </span>
                  </li>
                ))}
              </ul>
            </GlassCard>

            {/* Rate-limit telemetry & housekeeping */}
            <GlassCard padding="lg" className="flex flex-col justify-between gap-5">
              <div>
                <div className="flex items-center gap-2.5">
                  <Activity className="h-5 w-5 text-sky" aria-hidden />
                  <h2 className="font-display text-lg font-semibold text-ink">
                    24h rate-limit telemetry & cleanup
                  </h2>
                </div>
                {data.rateLimits24h.length === 0 ? (
                  <GlassInset className="mt-4 text-xs text-muted">
                    No rate-limited bursts logged in the last 24 hours.
                  </GlassInset>
                ) : (
                  <ul className="mt-4 space-y-2">
                    {data.rateLimits24h.map((r) => (
                      <li
                        key={r.group}
                        className="adm-inner-well flex items-center justify-between rounded-xl px-3 py-2 text-xs"
                      >
                        <span className="font-mono font-medium text-ink">
                          {r.group}
                        </span>
                        <span className="tabular font-semibold text-ink">
                          {r.hits.toLocaleString("en-NG")} hits
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="space-y-2.5 border-t border-line/70 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Database housekeeping
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    loading={busy === "prune_sessions"}
                    disabled={data.maintenance.expiredSessions === 0}
                    onClick={() => void runMaintenance("prune_sessions")}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    Prune expired sessions ({data.maintenance.expiredSessions})
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    loading={busy === "prune_rate_limits"}
                    disabled={data.maintenance.staleRateLimits === 0}
                    onClick={() => void runMaintenance("prune_rate_limits")}
                  >
                    <Sparkles className="h-3.5 w-3.5" aria-hidden />
                    Prune stale rate limits ({data.maintenance.staleRateLimits})
                  </Button>
                </div>
              </div>
            </GlassCard>
          </div>
        </>
      )}
    </div>
  );
}
