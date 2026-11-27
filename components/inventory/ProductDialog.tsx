"use client";

import { useState } from "react";
import {
  AlertCircle,
  Barcode,
  Factory,
  Globe,
  Layers,
  Package,
  ScanLine,
  ShieldCheck,
} from "lucide-react";
import { Dialog } from "@/components/ui/Dialog";
import { usePresence } from "@/lib/motion";
import { Button } from "@/components/ui/Button";
import { Stepper, TextArea, TextField } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Choice";
import { regulatorCopy } from "@/lib/regulators";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_FORMS,
  type Product,
  currencySymbol,
} from "@/lib/inventory-types";
import { RegulatoryReportCard } from "./RegulatoryReportCard";

export type ProductDraft = Omit<Product, "id" | "facilityId" | "updatedAt">;

export const EMPTY_PRODUCT: ProductDraft = {
  name: "",
  genericName: "",
  category: "Medicine",
  form: "",
  strength: "",
  packSize: "",
  priceNgn: null,
  quantity: 0,
  lowStockAt: 5,
  batch: "",
  expiresOn: null,
  prescriptionOnly: false,
  notes: "",
  barcode: "",
  nafdacNumber: "",
  manufacturer: "",
  countryOfOrigin: "",
  regulatoryStatus: "none",
  regulatorySummary: null,
  regulatoryCheckedAt: null,
};

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** Expiry is chosen as month and year; stored as the last day of that month. */
function lastDay(year: number, month: number) {
  const d = new Date(Date.UTC(year, month + 1, 0));
  return d.toISOString().slice(0, 10);
}

export function ProductDialog({
  open,
  initial,
  onClose,
  onSave,
  onOpenScanner,
  currency = "NGN",
  country,
}: {
  open: boolean;
  initial: ProductDraft | null;
  onClose: () => void;
  onSave: (
    draft: ProductDraft,
  ) => Promise<{ ok: boolean; error?: string; field?: string }>;
  onOpenScanner?: () => void;
  /** ISO 4217 currency of the facility, for the price field. */
  currency?: string;
  /** Facility country, for registration-number wording. */
  country?: string;
}) {
  // Stay mounted through the exit so the sheet leaves the way it came; a
  // fresh open after that starts from a clean draft.
  const { mounted } = usePresence(open);
  if (!mounted) return null;
  return (
    <ProductDialogInner
      open={open}
      initial={initial}
      onClose={onClose}
      onSave={onSave}
      onOpenScanner={onOpenScanner}
      currency={currency}
      country={country}
    />
  );
}

function ProductDialogInner({
  open,
  initial,
  onClose,
  onSave,
  onOpenScanner,
  currency = "NGN",
  country,
}: {
  open: boolean;
  initial: ProductDraft | null;
  onClose: () => void;
  onSave: (
    draft: ProductDraft,
  ) => Promise<{ ok: boolean; error?: string; field?: string }>;
  onOpenScanner?: () => void;
  /** ISO 4217 currency of the facility, for the price field. */
  currency?: string;
  country?: string;
}) {
  const [p, setP] = useState<ProductDraft>(initial ?? EMPTY_PRODUCT);
  const [saving, setSaving] = useState(false);
  const [checkingReg, setCheckingReg] = useState(false);
  const [error, setError] = useState<{
    message: string;
    field?: string;
  } | null>(null);
  const set = <K extends keyof ProductDraft>(k: K, v: ProductDraft[K]) =>
    setP((d) => ({ ...d, [k]: v }));
  const fe = (k: string) => (error?.field === k ? error.message : undefined);

  const verifyAuthenticity = async () => {
    if (!p.name.trim() && !p.nafdacNumber.trim() && !p.barcode.trim()) {
      setError({
        message: `Enter a product name, ${regulatorCopy(country).code} or barcode first.`,
        field: "name",
      });
      return;
    }
    setCheckingReg(true);
    setError(null);
    try {
      const res = await fetch("/api/inventory/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: p.name,
          code: p.nafdacNumber || undefined,
          barcode: p.barcode || undefined,
          category: p.category,
          forceRefresh: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Verification check failed.");
      setP((prev) => ({
        ...prev,
        nafdacNumber: prev.nafdacNumber || data.report.nafdacCode || "",
        barcode: prev.barcode || data.report.barcode || "",
        manufacturer: prev.manufacturer || data.report.manufacturer || "",
        countryOfOrigin:
          prev.countryOfOrigin || data.report.countryOfOrigin || "",
        regulatoryStatus: data.report.verdict,
        regulatorySummary: data.report,
        regulatoryCheckedAt: data.report.checkedAt,
      }));
    } catch (err) {
      setError({
        message: (err as Error).message || "Couldn't run registry check.",
      });
    } finally {
      setCheckingReg(false);
    }
  };

  const thisYear = new Date().getFullYear();
  const [expYear, expMonth] = p.expiresOn
    ? [Number(p.expiresOn.slice(0, 4)), Number(p.expiresOn.slice(5, 7)) - 1]
    : [null, null];
  const setExpiry = (y: number | null, m: number | null) =>
    set("expiresOn", y !== null && m !== null ? lastDay(y, m) : null);

  const save = async () => {
    setSaving(true);
    setError(null);
    const res = await onSave(p);
    setSaving(false);
    if (!res.ok)
      setError({ message: res.error ?? "Not saved.", field: res.field });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      variant="sheet"
      title={initial ? "Edit product" : "Add a product"}
      description="Medicines, skin care, devices, test kits: anything health."
      footer={
        <>
          {error && (
            <p
              role="alert"
              className="mr-auto flex items-center gap-1.5 text-sm text-alert"
            >
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
              {error.message}
            </p>
          )}
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} loading={saving}>
            {initial ? "Save changes" : "Add product"}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {!initial && onOpenScanner && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand/25 bg-brand-soft/45 px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">
                Have the carton nearby?
              </p>
              <p className="text-xs text-muted">
                Scan the barcode or snap the pack to fill these fields and
                check it with {regulatorCopy(country).regulator}.
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                onClose();
                onOpenScanner();
              }}
            >
              <ScanLine className="h-4 w-4" aria-hidden />
              Scan to stock
            </Button>
          </div>
        )}
        <TextField
          label="Product name"
          icon={Package}
          value={p.name}
          onChange={(e) => set("name", e.target.value)}
          error={fe("name")}
          placeholder="e.g. Deep Heat Rub 35 g"
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label={`${regulatorCopy(country).codeLabel} (optional)`}
            value={p.nafdacNumber}
            onChange={(e) =>
              set(
                "nafdacNumber",
                e.target.value.toUpperCase().replace(/\s+/g, ""),
              )
            }
            placeholder={`e.g. ${regulatorCopy(country).example}`}
          />
          <TextField
            label="Barcode / GTIN (optional)"
            icon={Barcode}
            value={p.barcode}
            onChange={(e) => set("barcode", e.target.value.trim())}
            placeholder="EAN-13 / UPC-A"
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Manufacturer (optional)"
            icon={Factory}
            value={p.manufacturer}
            onChange={(e) => set("manufacturer", e.target.value)}
            placeholder="e.g. Emzor Pharmaceutical"
          />
          <TextField
            label="Country of origin (optional)"
            icon={Globe}
            value={p.countryOfOrigin}
            onChange={(e) => set("countryOfOrigin", e.target.value)}
            placeholder="Where it was made, e.g. India"
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-line bg-mist/45 px-4 py-3">
          <p className="text-xs text-muted">
            Check it with {regulatorCopy(country).regulator} and other public
            registers before saving.
          </p>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            loading={checkingReg}
            onClick={verifyAuthenticity}
          >
            <ShieldCheck className="h-4 w-4" aria-hidden />
            Verify authenticity
          </Button>
        </div>
        {p.regulatorySummary && (
          <RegulatoryReportCard report={p.regulatorySummary} compact />
        )}
        <div className="grid gap-5 sm:grid-cols-2">
          <Select
            label="Category"
            value={p.category}
            onChange={(v) => set("category", v)}
            icon={Layers}
            options={PRODUCT_CATEGORIES.map((c) => ({ value: c, label: c }))}
          />
          <Select
            label="Form (optional)"
            value={p.form}
            onChange={(v) => set("form", v)}
            placeholder="Choose a form"
            options={PRODUCT_FORMS.map((c) => ({ value: c, label: c }))}
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Active ingredient (optional)"
            value={p.genericName}
            onChange={(e) => set("genericName", e.target.value)}
            placeholder="e.g. Methyl salicylate"
          />
          <TextField
            label="Strength (optional)"
            value={p.strength}
            onChange={(e) => set("strength", e.target.value)}
            placeholder="e.g. 500 mg"
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Stepper
            label="Quantity in stock"
            min={0}
            max={1000000}
            start={1}
            value={p.quantity}
            onChange={(v) => set("quantity", v ?? 0)}
          />
          <Stepper
            label="Warn me when stock is at"
            min={0}
            max={100000}
            value={p.lowStockAt}
            onChange={(v) => set("lowStockAt", v ?? 0)}
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label={`Price in ${currency} (${currencySymbol(currency)}, optional)`}
            inputMode="decimal"
            value={p.priceNgn ?? ""}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^\d.]/g, "");
              set("priceNgn", raw === "" ? null : Number(raw));
            }}
            error={fe("priceNgn")}
            placeholder="e.g. 2500"
          />
          <TextField
            label="Pack size (optional)"
            value={p.packSize}
            onChange={(e) => set("packSize", e.target.value)}
            placeholder="e.g. 35 g tube"
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-[1fr_1fr_1.2fr]">
          <Select
            label="Expiry month"
            value={expMonth === null ? "" : String(expMonth)}
            onChange={(v) => setExpiry(expYear ?? thisYear, Number(v))}
            placeholder="Month"
            options={MONTHS.map((m, i) => ({ value: String(i), label: m }))}
          />
          <Select
            label="Expiry year"
            value={expYear === null ? "" : String(expYear)}
            onChange={(v) => setExpiry(Number(v), expMonth ?? 0)}
            placeholder="Year"
            options={Array.from({ length: 8 }, (_, i) => thisYear - 1 + i).map(
              (y) => ({ value: String(y), label: String(y) }),
            )}
          />
          <TextField
            label="Batch (optional)"
            placeholder="e.g. BN2406A"
            icon={Barcode}
            value={p.batch}
            onChange={(e) => set("batch", e.target.value)}
          />
        </div>
        {p.expiresOn && (
          <button
            type="button"
            onClick={() => set("expiresOn", null)}
            className="text-sm font-medium text-muted underline-offset-4 hover:text-ink hover:underline"
          >
            Clear expiry date
          </button>
        )}
        <Switch
          checked={p.prescriptionOnly}
          onChange={(v) => set("prescriptionOnly", v)}
          label="Prescription only"
          description="Patients are told to bring a prescription."
        />
        <TextArea
          label="Notes for patients (optional)"
          value={p.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="e.g. Also available in 100 g"
          rows={2}
        />
      </div>
    </Dialog>
  );
}
