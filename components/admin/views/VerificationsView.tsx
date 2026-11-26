"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BadgeCheck,
  Building2,
  Check,
  ExternalLink,
  FileBadge,
  RefreshCw,
  Search,
  Sparkles,
  XCircle,
} from "lucide-react";
import { VerificationBadge } from "@/components/inventory/VerificationBadge";
import { AudioPlayer } from "@/components/ui/AudioPlayer";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import {
  FACILITY_KINDS,
  FACILITY_KIND_LABEL,
  type AdminVerificationItem,
} from "@/lib/inventory-types";
import { triggerHaptic } from "@/lib/spring";
import { useAdminShell } from "../AdminShell";
import { AdminEmptyState, AdminSkeletonList } from "../ui/AdminStates";
import { useAdminToast } from "../ui/AdminToast";
import { formatRelativeTime, safeHttpUrl } from "../ui/format";
import { GlassCard, GlassInset } from "../ui/GlassPanel";
import { SegmentedControl } from "../ui/SegmentedControl";

type Filter = "pending" | "verified" | "rejected" | "all";

const DECLINE_TEMPLATES = [
  "Licence number could not be matched on an official Nigerian registry.",
  "Facility name does not match the regulatory licence record.",
  "Licence appears expired or incomplete — please upload current registration details.",
];

export function VerificationsView() {
  const { refreshPendingCount } = useAdminShell();
  const toast = useAdminToast();
  const [filter, setFilter] = useState<Filter>("pending");
  const [kindFilter, setKindFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<AdminVerificationItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(`/api/admin/verifications?status=${filter}`, {
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to load queue.");
      setItems(data.items ?? []);
      void refreshPendingCount();
    } catch (err) {
      setError((err as Error).message || "Could not load verification queue.");
    }
  }, [filter, refreshPendingCount]);

  useEffect(() => {
    let active = true;
    fetch(`/api/admin/verifications?status=${filter}`, { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error ?? "Failed to load queue.");
        return (data.items ?? []) as AdminVerificationItem[];
      })
      .then((next) => {
        if (!active) return;
        setError(null);
        setItems(next);
        void refreshPendingCount();
      })
      .catch((err) => {
        if (!active) return;
        setError(
          (err as Error).message || "Could not load verification queue.",
        );
      });
    return () => {
      active = false;
    };
  }, [filter, refreshPendingCount]);

  const filtered = useMemo(() => {
    if (!items) return null;
    const q = search.trim().toLowerCase();
    return items.filter(({ facility: f, owner }) => {
      if (kindFilter !== "all" && f.kind !== kindFilter) return false;
      if (!q) return true;
      return (
        f.name.toLowerCase().includes(q) ||
        f.licenseNumber.toLowerCase().includes(q) ||
        f.city.toLowerCase().includes(q) ||
        owner.name.toLowerCase().includes(q) ||
        owner.email.toLowerCase().includes(q)
      );
    });
  }, [items, kindFilter, search]);

  const decide = async (
    facilityId: string,
    facilityName: string,
    action: "approve" | "reject" | "recheck",
  ) => {
    const note = (notes[facilityId] ?? "").trim();
    const url = (urls[facilityId] ?? "").trim();
    if (action === "reject" && note.length < 4) {
      toast.warning(
        "Decline reason needed",
        "Add or pick a brief review note before declining.",
      );
      return;
    }
    if (url && !/^https:\/\//i.test(url)) {
      toast.warning(
        "Invalid proof URL",
        "Official registry proof URL must start with https://.",
      );
      return;
    }

    setBusy(`${facilityId}:${action}`);
    setError(null);
    try {
      const res = await fetch(`/api/admin/verifications/${facilityId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, note, url }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Action failed.");

      if (action === "approve") {
        toast.success(
          "Facility verified",
          `${facilityName} now shows a verified badge.`,
        );
      } else if (action === "reject") {
        toast.info(
          "Verification declined",
          `${facilityName} has been updated.`,
        );
      } else {
        const hitCount = Array.isArray(data.evidence)
          ? data.evidence.length
          : 0;
        toast.info(
          "Registry portals checked",
          `Found ${hitCount} .gov.ng matching result${hitCount === 1 ? "" : "s"}.`,
        );
      }
      await load();
    } catch (err) {
      const msg = (err as Error).message || "Could not update verification.";
      setError(msg);
      toast.error("Verification action failed", msg);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="title font-display text-3xl font-semibold text-ink">
            Facility licence review
          </h1>
          <p className="mt-1 text-sm text-muted">
            Inspect submitted licences, listen to recorded directions, and
            cross-check official <code className="text-ink">.gov.ng</code>{" "}
            registries before granting a verified badge.
          </p>
        </div>
        <Button variant="secondary" onClick={() => void load()}>
          <RefreshCw className="h-4 w-4" aria-hidden />
          Refresh
        </Button>
      </div>

      <GlassCard padding="sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SegmentedControl<Filter>
            ariaLabel="Filter verification status"
            value={filter}
            onChange={setFilter}
            options={[
              { value: "pending", label: "Pending" },
              { value: "verified", label: "Verified" },
              { value: "rejected", label: "Declined" },
              { value: "all", label: "All with licence" },
            ]}
          />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <TextField
              label="Search submissions"
              hideLabel
              icon={Search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search facility, licence, city, owner…"
              className="sm:w-64"
            />
            <Select
              label="Facility type"
              hideLabel
              value={kindFilter}
              onChange={setKindFilter}
              className="sm:w-52"
              options={[
                { value: "all", label: "All facility types" },
                ...FACILITY_KINDS.map((k) => ({
                  value: k,
                  label: FACILITY_KIND_LABEL[k],
                })),
              ]}
            />
          </div>
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

      {!filtered ? (
        <AdminSkeletonList rows={3} />
      ) : filtered.length === 0 ? (
        <AdminEmptyState
          icon={Building2}
          title="No facilities match this view"
          description="Try switching the verification status tab or clearing your search filter."
        />
      ) : (
        <ul className="space-y-5">
          {filtered.map(({ facility: f, owner, evidence, updatedAt }) => {
            const noteVal = notes[f.id] ?? f.verification.note;
            const urlVal = urls[f.id] ?? f.verification.url;
            const trimmedUrl = urlVal.trim();
            const urlError =
              trimmedUrl && !/^https:\/\//i.test(trimmedUrl)
                ? "Proof URL must begin with https://"
                : undefined;
            const noteHint =
              noteVal.trim().length < 4
                ? "At least 4 characters required when declining."
                : undefined;
            return (
              <li key={f.id}>
                <GlassCard padding="lg">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h2 className="font-display text-xl font-semibold text-ink">
                          {f.name}
                        </h2>
                        <VerificationBadge v={f.verification} />
                      </div>
                      <p className="mt-1 text-sm text-muted">
                        {FACILITY_KIND_LABEL[f.kind]} · {f.address}, {f.city}
                        {f.state ? `, ${f.state}` : ""} · {f.phone}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        Submitted by {owner.name} ({owner.email}) · Updated{" "}
                        {formatRelativeTime(updatedAt)}
                      </p>
                    </div>

                    <div className="adm-inner-well flex items-center gap-2 rounded-2xl px-3.5 py-2 text-sm font-semibold text-ink">
                      <FileBadge className="h-4 w-4 text-brand" aria-hidden />
                      <span>{f.licenseNumber || "No licence"}</span>
                    </div>
                  </div>

                  {f.directionsAudioUrl && (
                    <div className="mt-4">
                      <AudioPlayer
                        src={f.directionsAudioUrl}
                        label={`Recorded directions for ${f.name}`}
                      />
                    </div>
                  )}

                  <GlassInset className="mt-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                        Preliminary .gov.ng registry findings
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        loading={busy === `${f.id}:recheck`}
                        onClick={() => void decide(f.id, f.name, "recheck")}
                      >
                        <RefreshCw className="h-3.5 w-3.5" aria-hidden />
                        Re-check portals
                      </Button>
                    </div>

                    {evidence.length === 0 ? (
                      <p className="mt-2 text-sm text-muted">
                        No matching .gov.ng portal records found automatically.
                        Verify manually with PCN, MDCN, HEFAMAA, or NAFDAC
                        before approving.
                      </p>
                    ) : (
                      <ul className="mt-3 space-y-2.5">
                        {evidence.map((ev) => {
                          const safeHref = safeHttpUrl(ev.url);
                          const isSelectedProof =
                            safeHref !== null && urlVal === safeHref;
                          return (
                            <li
                              key={ev.url}
                              className="rounded-xl border border-line bg-surface p-3 text-sm"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                {safeHref ? (
                                  <a
                                    href={safeHref}
                                    target="_blank"
                                    rel="noopener noreferrer nofollow"
                                    className="inline-flex items-center gap-1 font-semibold text-brand hover:underline"
                                  >
                                    {ev.title || ev.domain}
                                    <ExternalLink
                                      className="h-3.5 w-3.5"
                                      aria-hidden
                                    />
                                  </a>
                                ) : (
                                  <span className="font-semibold text-ink">
                                    {ev.title || ev.domain}
                                  </span>
                                )}

                                <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium">
                                  <span className="rounded-full bg-mist px-2 py-0.5 text-muted">
                                    {ev.domain}
                                  </span>
                                  {ev.licenceMatch && (
                                    <span className="rounded-full bg-brand-soft px-2 py-0.5 text-brand-strong">
                                      Licence matched
                                    </span>
                                  )}
                                  {ev.nameMatch && (
                                    <span className="rounded-full bg-sky-soft px-2 py-0.5 text-sky">
                                      Name matched
                                    </span>
                                  )}
                                  {safeHref &&
                                    safeHref.startsWith("https://") && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          triggerHaptic("tick");
                                          setUrls((u) => ({
                                            ...u,
                                            [f.id]: safeHref,
                                          }));
                                        }}
                                        className="press-soft inline-flex items-center gap-1 rounded-full border border-line bg-paper px-2 py-0.5 text-xs font-semibold text-ink transition-colors hover:border-brand hover:text-brand"
                                      >
                                        {isSelectedProof ? (
                                          <>
                                            <Check
                                              className="h-3 w-3 text-brand"
                                              aria-hidden
                                            />
                                            Proof linked
                                          </>
                                        ) : (
                                          <>
                                            <Sparkles
                                              className="h-3 w-3 text-brand"
                                              aria-hidden
                                            />
                                            Use as proof URL
                                          </>
                                        )}
                                      </button>
                                    )}
                                </div>
                              </div>
                              {ev.snippet && (
                                <p className="mt-1 text-xs text-muted">
                                  {ev.snippet}
                                </p>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </GlassInset>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <TextField
                      label="Review note"
                      value={noteVal}
                      onChange={(e) =>
                        setNotes((n) => ({ ...n, [f.id]: e.target.value }))
                      }
                      hint={noteHint}
                      placeholder="Reason for approval or decline"
                    />
                    <TextField
                      label="Official registry proof URL (optional, https://)"
                      value={urlVal}
                      onChange={(e) =>
                        setUrls((u) => ({ ...u, [f.id]: e.target.value }))
                      }
                      error={urlError}
                      placeholder="https://pcn.gov.ng/..."
                    />
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <span className="adm-caption text-[11px] font-medium text-muted">
                      Quick decline notes:
                    </span>
                    {DECLINE_TEMPLATES.map((tpl) => (
                      <button
                        key={tpl}
                        type="button"
                        onClick={() => {
                          triggerHaptic("tick");
                          setNotes((n) => ({ ...n, [f.id]: tpl }));
                        }}
                        className="press-soft rounded-full border border-line bg-surface/80 px-2.5 py-1 text-[11px] text-muted transition-colors hover:border-brand/50 hover:text-ink"
                      >
                        {tpl.slice(0, 44)}…
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap justify-end gap-2">
                    <Button
                      variant="danger"
                      loading={busy === `${f.id}:reject`}
                      onClick={() => void decide(f.id, f.name, "reject")}
                    >
                      <XCircle className="h-4 w-4" aria-hidden />
                      Decline
                    </Button>
                    <Button
                      loading={busy === `${f.id}:approve`}
                      onClick={() => void decide(f.id, f.name, "approve")}
                    >
                      <BadgeCheck className="h-4 w-4" aria-hidden />
                      Approve verified badge
                    </Button>
                  </div>
                </GlassCard>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
