"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  BadgeCheck,
  CalendarClock,
  PackageSearch,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Choice";
import { TextField } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import type {
  AdminProductListItem,
  AdminProductSummary,
} from "@/lib/admin-types";
import {
  FACILITY_KIND_LABEL,
  PRODUCT_CATEGORIES,
  formatNaira,
  stockStatus,
} from "@/lib/inventory-types";
import { AdminSheet } from "../ui/AdminSheet";
import { AdminEmptyState, AdminSkeletonList } from "../ui/AdminStates";
import { useAdminToast } from "../ui/AdminToast";
import { ConfirmActionDialog } from "../ui/ConfirmActionDialog";
import { formatDateTime } from "../ui/format";
import { GlassBadge, GlassCard, GlassInset } from "../ui/GlassPanel";
import { SegmentedControl } from "../ui/SegmentedControl";

type StockFilter = "all" | "in" | "low" | "out";

export function InventoryView() {
  const toast = useAdminToast();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [stock, setStock] = useState<StockFilter>("all");
  const [expiry, setExpiry] = useState("all");
  const [rxOnly, setRxOnly] = useState(false);

  const [items, setItems] = useState<AdminProductListItem[] | null>(null);
  const [summary, setSummary] = useState<AdminProductSummary | null>(null);
  const [total, setTotal] = useState(0);
  const [todayIso, setTodayIso] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<AdminProductListItem | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (category !== "all") params.set("category", category);
    if (stock !== "all") params.set("stock", stock);
    if (expiry !== "all") params.set("expiry", expiry);
    if (rxOnly) params.set("rx", "yes");
    params.set("limit", "60");

    try {
      const res = await fetch(`/api/admin/products?${params}`, {
        cache: "no-store",
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Failed to load inventory.");
      setItems(body.items ?? []);
      setTotal(body.total ?? 0);
      setSummary(body.summary ?? null);
      setTodayIso(new Date().toISOString().slice(0, 10));
    } catch (err) {
      setError((err as Error).message || "Could not load global inventory.");
    }
  }, [q, category, stock, expiry, rxOnly]);

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 180);
    return () => window.clearTimeout(t);
  }, [load]);

  const handleDelete = async (reason: string) => {
    if (!selected) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${selected.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Removal failed.");
      toast.success(
        "Product listing removed",
        `${selected.name} has been removed from ${selected.facilityName}.`,
      );
      setConfirmDelete(false);
      setSelected(null);
      await load();
    } catch (err) {
      toast.error(
        "Could not remove listing",
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
            Global stock & safety monitor
          </h1>
          <p className="mt-1 text-sm text-muted">
            Audit listed medicines, expiry alerts, prescription flags, and
            availability across every facility.{" "}
            <span className="tabular font-semibold text-ink">{total}</span>{" "}
            matching item{total === 1 ? "" : "s"}.
          </p>
        </div>
        <Button variant="secondary" onClick={() => void load()}>
          <RefreshCw className="h-4 w-4" aria-hidden />
          Refresh
        </Button>
      </div>

      {summary && (
        <div className="flex flex-wrap gap-2">
          <GlassBadge tone="neutral">
            Total <span className="tabular">{summary.total}</span>
          </GlassBadge>
          <GlassBadge tone="brand">
            Healthy <span className="tabular">{summary.inStock}</span>
          </GlassBadge>
          <GlassBadge tone="caution">
            Low <span className="tabular">{summary.lowStock}</span>
          </GlassBadge>
          <GlassBadge tone="alert">
            Out <span className="tabular">{summary.outOfStock}</span>
          </GlassBadge>
          <GlassBadge tone="caution" icon={CalendarClock}>
            Expiring ≤30d{" "}
            <span className="tabular">{summary.expiringSoon}</span>
          </GlassBadge>
          <GlassBadge tone="alert">
            Expired <span className="tabular">{summary.expired}</span>
          </GlassBadge>
          <GlassBadge tone="sky">
            Rx only <span className="tabular">{summary.rxOnly}</span>
          </GlassBadge>
        </div>
      )}

      <GlassCard padding="sm">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
            <TextField
              label="Search stock"
              hideLabel
              icon={Search}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search medicine, generic, batch, or facility…"
              className="flex-1"
            />
            <Select
              label="Category"
              hideLabel
              value={category}
              onChange={setCategory}
              className="lg:w-60"
              options={[
                { value: "all", label: "All categories" },
                ...PRODUCT_CATEGORIES.map((c) => ({ value: c, label: c })),
              ]}
            />
            <Select
              label="Expiry"
              hideLabel
              value={expiry}
              onChange={setExpiry}
              className="lg:w-48"
              options={[
                { value: "all", label: "Any expiry date" },
                { value: "soon", label: "Expiring ≤ 30 days" },
                { value: "expired", label: "Already expired" },
              ]}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <SegmentedControl<StockFilter>
              ariaLabel="Stock status"
              size="sm"
              value={stock}
              onChange={setStock}
              options={[
                { value: "all", label: "All stock" },
                { value: "in", label: "In stock" },
                { value: "low", label: "Low" },
                { value: "out", label: "Out" },
              ]}
            />
            <Switch
              checked={rxOnly}
              onChange={setRxOnly}
              label="Prescription only (Rx)"
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

      {!items ? (
        <AdminSkeletonList rows={4} />
      ) : items.length === 0 ? (
        <AdminEmptyState
          icon={PackageSearch}
          title="No inventory items match"
          description="Try broadening your stock, category, or expiry filters."
        />
      ) : (
        <div className="grid gap-3">
          {items.map((p) => {
            const st = stockStatus(p);
            const isExpired = Boolean(
              p.expiresOn && todayIso && p.expiresOn < todayIso,
            );
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelected(p)}
                className="adm-glass-card adm-glass-card-hover press-soft w-full rounded-3xl p-4 text-left sm:p-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-base font-semibold text-ink">
                        {p.name}
                      </span>
                      {p.genericName && (
                        <span className="text-xs text-muted">
                          ({p.genericName})
                        </span>
                      )}
                      {p.prescriptionOnly && (
                        <GlassBadge tone="sky">Rx</GlassBadge>
                      )}
                      {isExpired && (
                        <GlassBadge tone="alert">Expired</GlassBadge>
                      )}
                    </div>
                    <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted">
                      <span>{p.category}</span>
                      {p.strength && <span>· {p.strength}</span>}
                      {p.form && <span>· {p.form}</span>}
                      <span>·</span>
                      <span className="inline-flex items-center gap-1 font-medium text-ink">
                        {p.facilityName}
                        {p.facilityVerified && (
                          <BadgeCheck
                            className="h-3.5 w-3.5 text-brand"
                            aria-label="Verified facility"
                          />
                        )}
                      </span>
                      <span>({p.facilityCity})</span>
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2.5">
                    <span className="tabular text-sm font-semibold text-ink">
                      {formatNaira(p.priceNgn)}
                    </span>
                    <GlassBadge
                      tone={
                        st === "in"
                          ? "brand"
                          : st === "low"
                            ? "caution"
                            : "alert"
                      }
                    >
                      <span className="tabular">{p.quantity}</span>{" "}
                      {st === "out" ? "out" : "units"}
                    </GlassBadge>
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
        subtitle={
          selected
            ? `${selected.facilityName} · ${FACILITY_KIND_LABEL[selected.facilityKind]} (${selected.facilityCity})`
            : undefined
        }
        footer={
          selected && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="h-4 w-4" aria-hidden />
              Remove listing
            </Button>
          )
        }
      >
        {selected && (
          <div className="space-y-4 text-sm">
            <div className="flex flex-wrap gap-2">
              <GlassBadge
                tone={
                  stockStatus(selected) === "in"
                    ? "brand"
                    : stockStatus(selected) === "low"
                      ? "caution"
                      : "alert"
                }
              >
                Quantity: {selected.quantity} (low at {selected.lowStockAt})
              </GlassBadge>
              {selected.prescriptionOnly && (
                <GlassBadge tone="sky">Prescription required</GlassBadge>
              )}
              {selected.facilityVerified && (
                <GlassBadge tone="brand" icon={BadgeCheck}>
                  Verified facility
                </GlassBadge>
              )}
            </div>

            <GlassInset className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-muted">Generic name</p>
                <p className="mt-0.5 font-semibold text-ink">
                  {selected.genericName || "—"}
                </p>
              </div>
              <div>
                <p className="text-muted">Category</p>
                <p className="mt-0.5 font-semibold text-ink">
                  {selected.category}
                </p>
              </div>
              <div>
                <p className="text-muted">Form & strength</p>
                <p className="mt-0.5 font-semibold text-ink">
                  {[selected.form, selected.strength]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </p>
              </div>
              <div>
                <p className="text-muted">Pack size</p>
                <p className="mt-0.5 font-semibold text-ink">
                  {selected.packSize || "—"}
                </p>
              </div>
              <div>
                <p className="text-muted">Price</p>
                <p className="tabular mt-0.5 font-semibold text-ink">
                  {formatNaira(selected.priceNgn)}
                </p>
              </div>
              <div>
                <p className="text-muted">Batch & expiry</p>
                <p className="tabular mt-0.5 font-semibold text-ink">
                  {selected.batch || "No batch"} · {selected.expiresOn ?? "None"}
                </p>
              </div>
            </GlassInset>

            {selected.notes && (
              <GlassInset className="text-xs">
                <p className="font-semibold uppercase tracking-wide text-muted">
                  Facility notes
                </p>
                <p className="mt-1 leading-relaxed text-ink">
                  {selected.notes}
                </p>
              </GlassInset>
            )}

            <p className="text-xs text-muted">
              Last updated {formatDateTime(selected.updatedAt)}
            </p>
          </div>
        )}
      </AdminSheet>

      <ConfirmActionDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title={`Remove "${selected?.name ?? "listing"}"?`}
        description="Removes this SKU from the public directory and logs the moderation action."
        confirmLabel="Remove listing"
        requireReason
        loading={deleting}
      />
    </div>
  );
}
