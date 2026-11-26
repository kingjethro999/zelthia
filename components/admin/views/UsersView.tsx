"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  Building2,
  KeyRound,
  LoaderCircle,
  Lock,
  MessageSquare,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import type { AdminUserItem } from "@/lib/admin-types";
import type { UserRole } from "@/lib/auth-types";
import { useAdminShell } from "../AdminShell";
import { AdminSheet } from "../ui/AdminSheet";
import { AdminEmptyState, AdminSkeletonList } from "../ui/AdminStates";
import { useAdminToast } from "../ui/AdminToast";
import { ConfirmActionDialog } from "../ui/ConfirmActionDialog";
import { formatDateTime, formatRelativeTime } from "../ui/format";
import { GlassBadge, GlassCard, GlassInset } from "../ui/GlassPanel";
import { SegmentedControl } from "../ui/SegmentedControl";

type RoleFilter = "all" | "patient" | "provider" | "admin";

export function UsersView() {
  const { user: currentAdmin } = useAdminShell();
  const toast = useAdminToast();
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [role, setRole] = useState<RoleFilter>("all");
  const [items, setItems] = useState<AdminUserItem[] | null>(null);
  const [fetching, setFetching] = useState(false);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<AdminUserItem | null>(null);
  const [roleBusy, setRoleBusy] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState(false);
  const [revoking, setRevoking] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQ(q), 140);
    return () => window.clearTimeout(t);
  }, [q]);

  const buildParams = useCallback(() => {
    const params = new URLSearchParams();
    if (debouncedQ.trim()) params.set("q", debouncedQ.trim());
    if (role !== "all") params.set("role", role);
    params.set("limit", "60");
    return params;
  }, [debouncedQ, role]);

  const load = useCallback(async () => {
    setError(null);
    setFetching(true);
    try {
      const res = await fetch(`/api/admin/users?${buildParams()}`, {
        cache: "no-store",
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Failed to load accounts.");
      const nextItems: AdminUserItem[] = body.items ?? [];
      setItems(nextItems);
      setTotal(body.total ?? 0);
      setSelected((prev) =>
        prev ? (nextItems.find((u) => u.id === prev.id) ?? null) : null,
      );
    } catch (err) {
      setError((err as Error).message || "Could not load accounts.");
    } finally {
      setFetching(false);
    }
  }, [buildParams]);

  useEffect(() => {
    const ac = new AbortController();
    fetch(`/api/admin/users?${buildParams()}`, {
      cache: "no-store",
      signal: ac.signal,
    })
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error ?? "Failed to load accounts.");
        return body;
      })
      .then((body) => {
        const nextItems: AdminUserItem[] = body.items ?? [];
        setError(null);
        setItems(nextItems);
        setTotal(body.total ?? 0);
        setSelected((prev) =>
          prev ? (nextItems.find((u) => u.id === prev.id) ?? null) : null,
        );
        setFetching(false);
      })
      .catch((err) => {
        if ((err as Error).name === "AbortError") return;
        setError((err as Error).message || "Could not load accounts.");
        setFetching(false);
      });
    return () => ac.abort();
  }, [buildParams]);

  const hasFilters = Boolean(q.trim()) || role !== "all";

  const changeRole = async (
    targetId: string,
    newRole: UserRole,
    targetName: string,
    previousRole?: UserRole,
  ) => {
    setRoleBusy(true);
    try {
      const res = await fetch(`/api/admin/users/${targetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_role", role: newRole }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Could not update role.");
      toast.success(
        "Account role updated",
        `${targetName} is now a ${newRole} account.`,
        previousRole
          ? {
              label: "Undo",
              onClick: () => changeRole(targetId, previousRole, targetName),
            }
          : undefined,
      );
      await load();
    } catch (err) {
      toast.error("Role update failed", (err as Error).message || "Try again.");
    } finally {
      setRoleBusy(false);
    }
  };

  const revokeSessions = async () => {
    if (!selected) return;
    setRevoking(true);
    try {
      const res = await fetch(`/api/admin/users/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revoke_sessions" }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Could not revoke sessions.");
      toast.success(
        "Sessions revoked",
        `Signed out ${body.revoked ?? 0} active session(s) for ${selected.email}.`,
      );
      setConfirmRevoke(false);
      await load();
    } catch (err) {
      toast.error("Revoke failed", (err as Error).message || "Try again.");
    } finally {
      setRevoking(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="title font-display text-3xl font-semibold text-ink">
            Accounts & governance
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
            <span>
              Manage account roles and session security.{" "}
              <span className="tabular font-semibold text-ink">{total}</span>{" "}
              account{total === 1 ? "" : "s"} in view.
            </span>
            {fetching && (
              <LoaderCircle
                className="h-3.5 w-3.5 animate-spin text-brand"
                aria-label="Updating"
              />
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setQ("");
                setDebouncedQ("");
                setRole("all");
              }}
            >
              Clear filters
            </Button>
          )}
          <Button
            variant="secondary"
            loading={fetching}
            onClick={() => void load()}
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            Refresh
          </Button>
        </div>
      </div>

      {/* Zero-Knowledge Privacy Shield */}
      <GlassCard padding="md" className="border-brand/25">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand-strong">
            <Lock className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">
              Zero-Knowledge clinical privacy enforced
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted">
              Administrators can view non-clinical account metadata (role,
              onboarding, session counts, encryption key status) only. Health
              profiles, chats, and uploaded medical documents are split-key
              AES-GCM encrypted and mathematically unreadable without the
              user&apos;s session key.
            </p>
          </div>
        </div>
      </GlassCard>

      <GlassCard padding="sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SegmentedControl<RoleFilter>
            ariaLabel="Filter account role"
            value={role}
            onChange={setRole}
            options={[
              { value: "all", label: "All" },
              { value: "patient", label: "Patients" },
              { value: "provider", label: "Facilities" },
              { value: "admin", label: "Admins" },
            ]}
          />
          <TextField
            label="Search users"
            hideLabel
            icon={Search}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or email…"
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
        <AdminSkeletonList rows={4} />
      ) : items.length === 0 ? (
        <AdminEmptyState
          icon={Users}
          title="No accounts match"
          description="Try clearing the search box or switching the role filter."
        />
      ) : (
        <div className="grid gap-3">
          {items.map((u) => {
            const initials = u.name
              .split(/\s+/)
              .slice(0, 2)
              .map((p) => p[0]?.toUpperCase())
              .join("");
            return (
              <button
                key={u.id}
                type="button"
                onClick={() => setSelected(u)}
                className="adm-glass-card adm-glass-card-hover press-soft w-full rounded-3xl p-4 text-left sm:p-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-xs font-semibold text-brand-strong">
                      {initials || "U"}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate font-display text-base font-semibold text-ink">
                          {u.name}
                        </span>
                        <GlassBadge
                          tone={u.role === "provider" ? "sky" : "neutral"}
                        >
                          {u.role === "provider" ? "Facility" : "Patient"}
                        </GlassBadge>
                        {u.isAdmin && (
                          <GlassBadge tone="brand" icon={ShieldCheck}>
                            Admin
                          </GlassBadge>
                        )}
                      </div>
                      <p className="truncate text-xs text-muted">{u.email}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {u.encrypted && (
                      <GlassBadge tone="brand" icon={Lock}>
                        E2E
                      </GlassBadge>
                    )}
                    <GlassBadge tone="neutral">
                      <span className="tabular">{u.activeSessions}</span>{" "}
                      session{u.activeSessions === 1 ? "" : "s"}
                    </GlassBadge>
                    {u.facilityCount > 0 && (
                      <GlassBadge tone="sky" icon={Building2}>
                        <span className="tabular">{u.facilityCount}</span>
                      </GlassBadge>
                    )}
                    <span className="text-muted">
                      Joined {formatRelativeTime(u.createdAt)}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <AdminSheet
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.name ?? ""}
        subtitle={selected?.email}
        footer={
          selected && (
            <Button
              variant="danger"
              size="sm"
              disabled={selected.activeSessions === 0}
              onClick={() => setConfirmRevoke(true)}
            >
              <KeyRound className="h-4 w-4" aria-hidden />
              Revoke all sessions ({selected.activeSessions})
            </Button>
          )
        }
      >
        {selected && (
          <div className="space-y-5 text-sm">
            <div className="flex flex-wrap gap-2">
              <GlassBadge
                tone={selected.role === "provider" ? "sky" : "neutral"}
              >
                {selected.role === "provider"
                  ? "Facility account"
                  : "Patient account"}
              </GlassBadge>
              {selected.isAdmin && (
                <GlassBadge tone="brand" icon={ShieldCheck}>
                  Admin allowlisted
                </GlassBadge>
              )}
              <GlassBadge
                tone={selected.encrypted ? "brand" : "caution"}
                icon={Lock}
              >
                {selected.encrypted ? "DEK wrapped" : "Legacy unmigrated"}
              </GlassBadge>
            </div>

            <GlassInset className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-muted">Joined</p>
                <p className="mt-0.5 font-semibold text-ink">
                  {formatDateTime(selected.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-muted">Onboarding</p>
                <p className="mt-0.5 font-semibold text-ink">
                  {selected.onboarded ? "Completed" : "Incomplete"}
                </p>
              </div>
              <div>
                <p className="text-muted">Terms accepted</p>
                <p className="mt-0.5 font-semibold text-ink">
                  {selected.termsVersion || "None"}{" "}
                  {selected.termsAcceptedAt
                    ? `(${formatRelativeTime(selected.termsAcceptedAt)})`
                    : ""}
                </p>
              </div>
              <div>
                <p className="text-muted">Encrypted profile record</p>
                <p className="mt-0.5 font-semibold text-ink">
                  {selected.hasProfile ? "Present (sealed)" : "None"}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5 text-muted" aria-hidden />
                <span className="tabular font-semibold text-ink">
                  {selected.conversationCount}
                </span>
                <span className="text-muted">sealed chats</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-muted" aria-hidden />
                <span className="tabular font-semibold text-ink">
                  {selected.facilityCount}
                </span>
                <span className="text-muted">facilities</span>
              </div>
            </GlassInset>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                Account type
              </p>
              <SegmentedControl<UserRole>
                ariaLabel="Account role"
                value={selected.role}
                onChange={(r) => {
                  if (r !== selected.role) {
                    void changeRole(
                      selected.id,
                      r,
                      selected.name,
                      selected.role,
                    );
                  }
                }}
                options={[
                  { value: "patient", label: "Patient" },
                  { value: "provider", label: "Facility provider" },
                ]}
              />
              {roleBusy && (
                <p className="mt-1.5 text-xs text-muted">Updating role…</p>
              )}
            </div>

            {selected.id === currentAdmin.id && (
              <p className="rounded-xl border border-caution/25 bg-caution-soft p-3 text-xs text-caution">
                You are inspecting your own active administrator account.
                Revoking all sessions will sign you out immediately.
              </p>
            )}
          </div>
        )}
      </AdminSheet>

      <ConfirmActionDialog
        open={confirmRevoke}
        onClose={() => setConfirmRevoke(false)}
        onConfirm={revokeSessions}
        title={`Revoke sessions for ${selected?.email ?? "user"}?`}
        description="Every signed-in browser and device for this user will need to sign in again with their password."
        confirmLabel="Revoke all sessions"
        loading={revoking}
      />
    </div>
  );
}
