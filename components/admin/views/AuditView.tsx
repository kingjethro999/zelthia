"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  ChevronDown,
  Download,
  LoaderCircle,
  RefreshCw,
  ScrollText,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import type { AdminAuditEntry } from "@/lib/admin-types";
import { cn } from "@/lib/utils";
import { AdminEmptyState, AdminSkeletonList } from "../ui/AdminStates";
import {
  exportCsv,
  exportJson,
  formatDateTime,
  formatRelativeTime,
} from "../ui/format";
import { GlassBadge, GlassCard, GlassInset } from "../ui/GlassPanel";
import { SegmentedControl } from "../ui/SegmentedControl";

type ActionFilter =
  "" | "verification." | "facility." | "product." | "user." | "system.";

function actionTone(action: string) {
  if (action.includes("approve") || action.includes("prune")) return "brand";
  if (
    action.includes("reject") ||
    action.includes("delete") ||
    action.includes("revoke")
  )
    return "alert";
  return "sky";
}

export function AuditView() {
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [actionFilter, setActionFilter] = useState<ActionFilter>("");
  const [items, setItems] = useState<AdminAuditEntry[] | null>(null);
  const [fetching, setFetching] = useState(false);
  const [total, setTotal] = useState(0);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQ(q), 140);
    return () => window.clearTimeout(t);
  }, [q]);

  const buildParams = useCallback(() => {
    const params = new URLSearchParams();
    if (debouncedQ.trim()) params.set("q", debouncedQ.trim());
    if (actionFilter) params.set("action", actionFilter);
    params.set("limit", "100");
    return params;
  }, [debouncedQ, actionFilter]);

  const load = useCallback(async () => {
    setError(null);
    setFetching(true);
    try {
      const res = await fetch(`/api/admin/audit?${buildParams()}`, {
        cache: "no-store",
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Failed to load audit log.");
      setItems(body.items ?? []);
      setTotal(body.total ?? 0);
    } catch (err) {
      setError((err as Error).message || "Could not load audit trail.");
    } finally {
      setFetching(false);
    }
  }, [buildParams]);

  useEffect(() => {
    const ac = new AbortController();
    fetch(`/api/admin/audit?${buildParams()}`, {
      cache: "no-store",
      signal: ac.signal,
    })
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error ?? "Failed to load audit log.");
        return body;
      })
      .then((body) => {
        setError(null);
        setItems(body.items ?? []);
        setTotal(body.total ?? 0);
        setFetching(false);
      })
      .catch((err) => {
        if ((err as Error).name === "AbortError") return;
        setError((err as Error).message || "Could not load audit trail.");
        setFetching(false);
      });
    return () => ac.abort();
  }, [buildParams]);

  const hasFilters = Boolean(q.trim()) || Boolean(actionFilter);

  const handleExportCsv = () => {
    if (!items?.length) return;
    exportCsv(
      `zelthia-audit-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        "Timestamp",
        "Action",
        "Admin Name",
        "Admin Email",
        "Target Type",
        "Target ID",
        "Details",
      ],
      items.map((e) => [
        e.createdAt,
        e.action,
        e.adminName ?? "",
        e.adminEmail ?? "",
        e.targetType,
        e.targetId ?? "",
        JSON.stringify(e.details),
      ]),
    );
  };

  const handleExportJson = () => {
    if (!items?.length) return;
    exportJson(
      `zelthia-audit-${new Date().toISOString().slice(0, 10)}.json`,
      items,
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="title font-display text-3xl font-semibold text-ink">
            Administrator audit trail
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
            <span>
              Immutable record of verification decisions, moderations, role
              changes, and maintenance runs.{" "}
              <span className="tabular font-semibold text-ink">{total}</span>{" "}
              matching event{total === 1 ? "" : "s"}.
            </span>
            {fetching && (
              <LoaderCircle
                className="h-3.5 w-3.5 animate-spin text-brand"
                aria-label="Updating"
              />
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setQ("");
                setDebouncedQ("");
                setActionFilter("");
              }}
            >
              Clear filters
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            disabled={!items?.length}
            onClick={handleExportCsv}
          >
            <Download className="h-4 w-4" aria-hidden />
            CSV
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={!items?.length}
            onClick={handleExportJson}
          >
            <Download className="h-4 w-4" aria-hidden />
            JSON
          </Button>
          <Button
            variant="secondary"
            size="sm"
            loading={fetching}
            onClick={() => void load()}
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            Refresh
          </Button>
        </div>
      </div>

      <GlassCard padding="sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SegmentedControl<ActionFilter>
            ariaLabel="Filter audit category"
            value={actionFilter}
            onChange={setActionFilter}
            options={[
              { value: "", label: "All events" },
              { value: "verification.", label: "Verifications" },
              { value: "facility.", label: "Facilities" },
              { value: "product.", label: "Stock" },
              { value: "user.", label: "Users" },
              { value: "system.", label: "System" },
            ]}
          />
          <TextField
            label="Search audit events"
            hideLabel
            icon={Search}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search action, admin, target ID, or details…"
            className="lg:w-72"
          />
        </div>
      </GlassCard>

      {error && (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-2xl border border-alert/25 bg-alert-soft p-3.5 text-sm text-alert"
        >
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}

      {!items ? (
        <AdminSkeletonList rows={5} />
      ) : items.length === 0 ? (
        <AdminEmptyState
          icon={ScrollText}
          title="No audit events found"
          description="Actions performed across the admin console will appear here chronologically."
        />
      ) : (
        <GlassCard padding="md">
          <ul className="space-y-2.5">
            {items.map((entry) => {
              const isOpen = Boolean(expanded[entry.id]);
              return (
                <li
                  key={entry.id}
                  className="adm-inner-well rounded-2xl p-3.5 transition-colors"
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() =>
                      setExpanded((prev) => ({
                        ...prev,
                        [entry.id]: !prev[entry.id],
                      }))
                    }
                    className="flex w-full items-center justify-between gap-3 text-left"
                  >
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <GlassBadge tone={actionTone(entry.action)}>
                        {entry.action}
                      </GlassBadge>
                      <span className="truncate text-xs font-medium text-ink">
                        {entry.adminName ?? entry.adminEmail ?? "System"}
                      </span>
                      <span className="truncate text-xs text-muted">
                        → {entry.targetType}
                        {entry.targetId
                          ? ` (${entry.targetId.slice(0, 8)}…)`
                          : ""}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 text-xs text-muted">
                      <span title={formatDateTime(entry.createdAt)}>
                        {formatRelativeTime(entry.createdAt)}
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          isOpen && "rotate-180",
                        )}
                        aria-hidden
                      />
                    </div>
                  </button>

                  {isOpen && (
                    <GlassInset className="mt-3 overflow-x-auto bg-paper/70 p-3 text-xs">
                      <p className="mb-1.5 text-[11px] text-muted">
                        {formatDateTime(entry.createdAt)} · Target ID:{" "}
                        <code className="text-ink">
                          {entry.targetId ?? "—"}
                        </code>
                      </p>
                      <pre className="whitespace-pre-wrap break-words font-mono text-[11px] text-ink">
                        {JSON.stringify(entry.details, null, 2)}
                      </pre>
                    </GlassInset>
                  )}
                </li>
              );
            })}
          </ul>
        </GlassCard>
      )}
    </div>
  );
}
