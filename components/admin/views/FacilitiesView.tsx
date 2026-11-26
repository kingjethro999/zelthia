"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  BadgeCheck,
  Building2,
  Clock,
  ExternalLink,
  LoaderCircle,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { VerificationBadge } from "@/components/inventory/VerificationBadge";
import { AudioPlayer } from "@/components/ui/AudioPlayer";
import { Button, ButtonLink } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import type {
  AdminFacilityDetail,
  AdminFacilityListItem,
} from "@/lib/admin-types";
import {
  FACILITY_KINDS,
  FACILITY_KIND_LABEL,
  formatNaira,
  stockStatus,
} from "@/lib/inventory-types";
import { useAdminShell } from "../AdminShell";
import { AdminSheet } from "../ui/AdminSheet";
import { AdminEmptyState, AdminSkeletonList } from "../ui/AdminStates";
import { useAdminToast } from "../ui/AdminToast";
import { ConfirmActionDialog } from "../ui/ConfirmActionDialog";
import { formatDateTime, formatRelativeTime, safeHttpUrl } from "../ui/format";
import { GlassBadge, GlassCard, GlassInset } from "../ui/GlassPanel";
import { SegmentedControl } from "../ui/SegmentedControl";

type VerFilter = "all" | "verified" | "pending" | "rejected" | "none";

export function FacilitiesView() {
  const { basePath, refreshPendingCount } = useAdminShell();
  const toast = useAdminToast();
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("all");
  const [verification, setVerification] = useState<VerFilter>("all");
  const [city, setCity] = useState("all");
  const [items, setItems] = useState<AdminFacilityListItem[] | null>(null);
  const [total, setTotal] = useState(0);
  const [cities, setCities] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminFacilityDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (kind !== "all") params.set("kind", kind);
    if (verification !== "all") params.set("verification", verification);
    if (city !== "all") params.set("city", city);
    params.set("limit", "60");

    try {
      const res = await fetch(`/api/admin/facilities?${params}`, {
        cache: "no-store",
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Failed to load facilities.");
      setItems(body.items ?? []);
      setTotal(body.total ?? 0);
      setCities(body.cities ?? []);
    } catch (err) {
      setError((err as Error).message || "Could not load facilities.");
    }
  }, [q, kind, verification, city]);

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 180);
    return () => window.clearTimeout(t);
  }, [load]);

  const openInspector = async (id: string) => {
    setSelectedId(id);
    setDetail(null);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/facilities/${id}`, {
        cache: "no-store",
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Failed to load facility.");
      setDetail(body as AdminFacilityDetail);
    } catch (err) {
      toast.error(
        "Could not inspect facility",
        (err as Error).message || "Try again.",
      );
      setSelectedId(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDelete = async (reason: string) => {
    if (!detail) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/facilities/${detail.facility.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Removal failed.");
      toast.success(
        "Facility removed",
        `${detail.facility.name} and its stock were deleted.`,
      );
      setConfirmDelete(false);
      setSelectedId(null);
      setDetail(null);
      void refreshPendingCount();
      await load();
    } catch (err) {
      toast.error(
        "Could not remove facility",
        (err as Error).message || "Try again.",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="title font-display text-3xl font-semibold text-ink">
            Facilities directory
          </h1>
          <p className="mt-1 text-sm text-muted">
            Inspect listed pharmacies, clinics, hospitals, and diagnostic
            centres across Nigeria.{" "}
            <span className="tabular font-semibold text-ink">{total}</span>{" "}
            matching listing{total === 1 ? "" : "s"}.
          </p>
        </div>
        <Button variant="secondary" onClick={() => void load()}>
          <RefreshCw className="h-4 w-4" aria-hidden />
          Refresh
        </Button>
      </div>

      <GlassCard padding="sm">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
            <TextField
              label="Search facilities"
              hideLabel
              icon={Search}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, city, licence, or owner email…"
              className="flex-1"
            />
            <Select
              label="Kind"
              hideLabel
              value={kind}
              onChange={setKind}
              className="lg:w-52"
              options={[
                { value: "all", label: "All types" },
                ...FACILITY_KINDS.map((k) => ({
                  value: k,
                  label: FACILITY_KIND_LABEL[k],
                })),
              ]}
            />
            <Select
              label="City"
              hideLabel
              value={city}
              onChange={setCity}
              className="lg:w-48"
              options={[
                { value: "all", label: "All cities" },
                ...cities.map((c) => ({ value: c, label: c })),
              ]}
            />
          </div>

          <SegmentedControl<VerFilter>
            ariaLabel="Verification status"
            size="sm"
            value={verification}
            onChange={setVerification}
            options={[
              { value: "all", label: "All" },
              { value: "verified", label: "Verified" },
              { value: "pending", label: "Pending" },
              { value: "rejected", label: "Declined" },
              { value: "none", label: "Unverified" },
            ]}
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
          icon={Building2}
          title="No facilities found"
          description="Adjust your search query or clear one of the active filters."
        />
      ) : (
        <div className="grid gap-3">
          {items.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => void openInspector(f.id)}
              className="adm-glass-card adm-glass-card-hover press-soft w-full rounded-3xl p-5 text-left"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-lg font-semibold text-ink">
                      {f.name}
                    </span>
                    <VerificationBadge v={f.verification} />
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {FACILITY_KIND_LABEL[f.kind]} · {f.city}
                    {f.state ? `, ${f.state}` : ""} · Owner: {f.owner.name} (
                    {f.owner.email})
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <GlassBadge tone="sky" icon={Package}>
                    <span className="tabular">{f.productCount}</span> SKUs
                  </GlassBadge>
                  {f.lowStockCount > 0 && (
                    <GlassBadge tone="caution">
                      <span className="tabular">{f.lowStockCount}</span> low
                    </GlassBadge>
                  )}
                  {f.outOfStockCount > 0 && (
                    <GlassBadge tone="alert">
                      <span className="tabular">{f.outOfStockCount}</span> out
                    </GlassBadge>
                  )}
                  <span className="text-xs text-muted">
                    {formatRelativeTime(f.updatedAt)}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <AdminSheet
        open={Boolean(selectedId)}
        onClose={() => {
          setSelectedId(null);
          setDetail(null);
        }}
        title={detail?.facility.name ?? "Loading facility…"}
        subtitle={
          detail
            ? `${FACILITY_KIND_LABEL[detail.facility.kind]} · ${detail.facility.city}${detail.facility.state ? `, ${detail.facility.state}` : ""}`
            : undefined
        }
        footer={
          detail && (
            <>
              <ButtonLink
                href={`${basePath}/verifications`}
                variant="secondary"
                size="sm"
              >
                <BadgeCheck className="h-4 w-4" aria-hidden />
                Licence review
              </ButtonLink>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="h-4 w-4" aria-hidden />
                Remove facility
              </Button>
            </>
          )
        }
      >
        {detailLoading || !detail ? (
          <div className="flex items-center gap-2 py-12 text-sm text-muted">
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
            Loading facility record…
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <VerificationBadge v={detail.facility.verification} />
              {detail.facility.licenseNumber && (
                <GlassBadge tone="neutral">
                  Licence: {detail.facility.licenseNumber}
                </GlassBadge>
              )}
            </div>

            <GlassInset className="space-y-2.5 text-sm">
              <div className="flex items-start gap-2.5">
                <MapPin
                  className="mt-0.5 h-4 w-4 shrink-0 text-muted"
                  aria-hidden
                />
                <div>
                  <p className="font-medium text-ink">
                    {detail.facility.address}
                  </p>
                  <p className="text-xs text-muted">
                    {detail.facility.city}
                    {detail.facility.state ? `, ${detail.facility.state}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-muted" aria-hidden />
                <span className="text-ink">{detail.facility.phone}</span>
                {detail.facility.email && (
                  <span className="text-xs text-muted">
                    · {detail.facility.email}
                  </span>
                )}
              </div>
              {detail.facility.openingHours && (
                <div className="flex items-center gap-2.5">
                  <Clock className="h-4 w-4 shrink-0 text-muted" aria-hidden />
                  <span className="text-xs text-muted">
                    {detail.facility.openingHours}
                  </span>
                </div>
              )}
              {detail.facility.directions && (
                <p className="border-t border-line/70 pt-2 text-xs leading-relaxed text-muted">
                  <strong className="text-ink">Directions:</strong>{" "}
                  {detail.facility.directions}
                </p>
              )}
            </GlassInset>

            {detail.facility.directionsAudioUrl && (
              <AudioPlayer
                src={detail.facility.directionsAudioUrl}
                label={`Recorded directions`}
              />
            )}

            <GlassInset className="space-y-1.5 text-xs">
              <p className="font-semibold uppercase tracking-wide text-muted">
                Owner & verification metadata
              </p>
              <p className="text-ink">
                {detail.facility.owner.name} ({detail.facility.owner.email})
              </p>
              <p className="text-muted">
                Created {formatDateTime(detail.facility.createdAt)} · Verified{" "}
                {formatDateTime(detail.facility.verifiedAt)}
              </p>
              {detail.facility.verification.note && (
                <p className="text-muted">
                  Note: {detail.facility.verification.note}
                </p>
              )}
              {safeHttpUrl(detail.facility.verification.url) && (
                <a
                  href={safeHttpUrl(detail.facility.verification.url)!}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex items-center gap-1 font-semibold text-brand hover:underline"
                >
                  Official proof URL
                  <ExternalLink className="h-3 w-3" aria-hidden />
                </a>
              )}
            </GlassInset>

            {detail.facility.services.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                  Listed services ({detail.facility.services.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {detail.facility.services.map((s) => (
                    <GlassBadge key={s} tone="neutral">
                      {s}
                    </GlassBadge>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Stocked items ({detail.products.length})
                </p>
                <Link
                  href={`${basePath}/inventory`}
                  className="text-xs font-semibold text-brand hover:underline"
                >
                  Open global stock
                </Link>
              </div>
              {detail.products.length === 0 ? (
                <GlassInset className="text-xs text-muted">
                  No products listed by this facility yet.
                </GlassInset>
              ) : (
                <ul className="space-y-2">
                  {detail.products.slice(0, 30).map((p) => {
                    const st = stockStatus(p);
                    return (
                      <li
                        key={p.id}
                        className="adm-inner-well flex items-center justify-between gap-2 rounded-xl p-2.5 text-xs"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink">
                            {p.name}
                          </p>
                          <p className="truncate text-muted">
                            {p.category} · {formatNaira(p.priceNgn)}
                          </p>
                        </div>
                        <GlassBadge
                          tone={
                            st === "in"
                              ? "brand"
                              : st === "low"
                                ? "caution"
                                : "alert"
                          }
                        >
                          <span className="tabular">{p.quantity}</span>
                        </GlassBadge>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        )}
      </AdminSheet>

      <ConfirmActionDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title={`Remove ${detail?.facility.name ?? "facility"}?`}
        description="This deletes the facility, its products, and its recorded directions permanently."
        confirmLabel="Remove facility"
        requireReason
        confirmText={detail?.facility.name}
        loading={deleting}
      />
    </div>
  );
}
