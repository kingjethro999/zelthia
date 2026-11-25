"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  BadgeCheck,
  Building2,
  ExternalLink,
  FileBadge,
  LoaderCircle,
  RefreshCw,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ChoiceGroup } from "@/components/ui/Choice";
import { TextField } from "@/components/ui/Field";
import { VerificationBadge } from "@/components/inventory/VerificationBadge";
import {
  FACILITY_KIND_LABEL,
  type AdminVerificationItem,
} from "@/lib/inventory-types";
import { useSession } from "@/lib/store/session";

type Filter = "pending" | "verified" | "rejected" | "all";

function safeHttpUrl(raw: string): string | null {
  try {
    const parsed = new URL(raw);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

export function AdminVerifications() {
  const user = useSession((s) => s.user);
  const status = useSession((s) => s.status);
  const [filter, setFilter] = useState<Filter>("pending");
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
    } catch (err) {
      setError((err as Error).message || "Could not load verification queue.");
    }
  }, [filter]);

  useEffect(() => {
    if (status === "ready" && user?.isAdmin) {
      void load();
    }
  }, [status, user?.isAdmin, load]);

  if (status !== "ready") {
    return (
      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 text-muted">
        Loading…
      </div>
    );
  }

  if (!user?.isAdmin) {
    return (
      <div className="mx-auto w-full max-w-xl flex-1 px-4 py-16 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-alert-soft text-alert">
          <ShieldAlert className="h-7 w-7" aria-hidden />
        </span>
        <h1 className="mt-5 title font-display text-3xl font-semibold text-ink">
          Administrator access only
        </h1>
        <p className="mt-2 text-muted">
          This review queue is restricted to authorised Zelthia administrators.
        </p>
      </div>
    );
  }

  const decide = async (
    facilityId: string,
    action: "approve" | "reject" | "recheck",
  ) => {
    setBusy(`${facilityId}:${action}`);
    setError(null);
    try {
      const res = await fetch(`/api/admin/verifications/${facilityId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          note: notes[facilityId] ?? "",
          url: urls[facilityId] ?? "",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Action failed.");
      await load();
    } catch (err) {
      setError((err as Error).message || "Could not update verification.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 pb-12 pt-2 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="title font-display text-3xl font-semibold text-ink">
            Facility licence review
          </h1>
          <p className="mt-1 text-muted">
            Inspect submitted facility licences and official .gov.ng registry
            findings before granting a verified badge.
          </p>
        </div>
        <Button variant="secondary" onClick={() => void load()}>
          <RefreshCw className="h-4 w-4" aria-hidden />
          Refresh
        </Button>
      </div>

      <ChoiceGroup<Filter>
        label="Filter verifications"
        hideLabel
        variant="pills"
        value={filter}
        onChange={setFilter}
        className="mt-6"
        options={[
          { value: "pending", label: "Pending" },
          { value: "verified", label: "Verified" },
          { value: "rejected", label: "Declined" },
          { value: "all", label: "All with licence" },
        ]}
      />

      {error && (
        <p
          role="alert"
          className="mt-5 flex items-center gap-2 rounded-xl border border-alert/25 bg-alert-soft p-3 text-sm text-alert"
        >
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}

      {!items ? (
        <p className="mt-8 flex items-center gap-2 text-sm text-muted">
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
          Loading submissions
        </p>
      ) : items.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-line p-8 text-center">
          <Building2 className="mx-auto h-8 w-8 text-muted" aria-hidden />
          <p className="mt-3 font-medium text-ink">
            No facilities in this view.
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-5">
          {items.map(({ facility: f, owner, evidence }) => {
            const noteVal = notes[f.id] ?? f.verification.note;
            const urlVal = urls[f.id] ?? f.verification.url;
            return (
              <li
                key={f.id}
                className="rounded-3xl border border-line bg-surface p-5 sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-xl font-semibold text-ink">
                        {f.name}
                      </h2>
                      <VerificationBadge v={f.verification} />
                    </div>
                    <p className="mt-1 text-sm text-muted">
                      {FACILITY_KIND_LABEL[f.kind]} &middot; {f.address},{" "}
                      {f.city}
                      {f.state ? `, ${f.state}` : ""} &middot; {f.phone}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      Submitted by {owner.name} ({owner.email})
                    </p>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-line bg-paper px-3 py-2 text-sm font-semibold text-ink">
                    <FileBadge className="h-4 w-4 text-brand" aria-hidden />
                    <span>{f.licenseNumber || "No licence"}</span>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-line bg-paper p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                      Preliminary .gov.ng registry findings
                    </p>
                    <Button
                      size="sm"
                      variant="ghost"
                      loading={busy === `${f.id}:recheck`}
                      onClick={() => void decide(f.id, "recheck")}
                    >
                      <RefreshCw className="h-3.5 w-3.5" aria-hidden />
                      Re-check portals
                    </Button>
                  </div>
                  {evidence.length === 0 ? (
                    <p className="mt-2 text-sm text-muted">
                      No matching .gov.ng portal records found automatically.
                      Verify manually with the regulator before approving.
                    </p>
                  ) : (
                    <ul className="mt-3 space-y-2.5">
                      {evidence.map((ev) => {
                        const safeHref = safeHttpUrl(ev.url);
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
                                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                              </a>
                            ) : (
                              <span className="font-semibold text-ink">
                                {ev.title || ev.domain}
                              </span>
                            )}
                            <div className="flex flex-wrap gap-1.5 text-xs font-medium">
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
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <TextField
                    label="Review note"
                    value={noteVal}
                    onChange={(e) =>
                      setNotes((n) => ({ ...n, [f.id]: e.target.value }))
                    }
                    placeholder="Reason for approval or decline"
                  />
                  <TextField
                    label="Official registry proof URL (optional, https://)"
                    value={urlVal}
                    onChange={(e) =>
                      setUrls((u) => ({ ...u, [f.id]: e.target.value }))
                    }
                    placeholder="https://pcn.gov.ng/..."
                  />
                </div>

                <div className="mt-4 flex flex-wrap justify-end gap-2">
                  <Button
                    variant="danger"
                    loading={busy === `${f.id}:reject`}
                    onClick={() => void decide(f.id, "reject")}
                  >
                    <XCircle className="h-4 w-4" aria-hidden />
                    Decline
                  </Button>
                  <Button
                    loading={busy === `${f.id}:approve`}
                    onClick={() => void decide(f.id, "approve")}
                  >
                    <BadgeCheck className="h-4 w-4" aria-hidden />
                    Approve verified badge
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
