"use client";
import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Choice";

import React, { useState } from "react";
import {
  InventoryItem,
  DrugCategory,
  DosageForm,
  Facility,
} from "@/lib/inventory-data";
import { X, Pill, Sparkles, AlertCircle } from "lucide-react";

interface DrugModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: InventoryItem) => void;
  facilities: Facility[];
  selectedFacilityId?: string;
  itemToEdit?: InventoryItem | null;
}

const CATEGORIES: DrugCategory[] = [
  "Antimalarials",
  "Antibiotics",
  "Pain Relief",
  "Dermatology/Creams",
  "Emergency Supplies",
  "Chronic Care",
  "Vitamins & Supplements",
];

const DOSAGE_FORMS: DosageForm[] = [
  "Tablet",
  "Capsule",
  "Cream",
  "Syrup",
  "Inhaler",
  "Injection",
  "Suspension",
  "Drops",
];

function DrugModalForm({
  onClose,
  onSave,
  facilities,
  selectedFacilityId,
  itemToEdit,
}: Omit<DrugModalProps, "isOpen">) {
  const [facilityId, setFacilityId] = useState(
    itemToEdit?.facilityId || selectedFacilityId || facilities[0]?.id || "",
  );
  const [name, setName] = useState(itemToEdit?.name || "");
  const [genericFormula, setGenericFormula] = useState(
    itemToEdit?.genericFormula || "",
  );
  const [category, setCategory] = useState<DrugCategory>(
    itemToEdit?.category || "Dermatology/Creams",
  );
  const [dosageForm, setDosageForm] = useState<DosageForm>(
    itemToEdit?.dosageForm || "Cream",
  );
  const [strength, setStrength] = useState(
    itemToEdit?.strength || "1% w/w 15g tube",
  );
  const [stockCount, setStockCount] = useState<number>(
    itemToEdit ? itemToEdit.stockCount : 20,
  );
  const [minThreshold, setMinThreshold] = useState<number>(
    itemToEdit ? itemToEdit.minThreshold : 5,
  );
  const [unitPrice, setUnitPrice] = useState<number>(
    itemToEdit ? itemToEdit.unitPrice : 2500,
  );
  const [batchNumber, setBatchNumber] = useState(
    itemToEdit?.batchNumber || "B-STOCK-01",
  );
  const [expiryDate, setExpiryDate] = useState(
    itemToEdit?.expiryDate || "2027-06-30",
  );
  const [requiresPrescription, setRequiresPrescription] = useState(
    Boolean(itemToEdit?.requiresPrescription),
  );
  const [notes, setNotes] = useState(itemToEdit?.notes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please provide a drug/product name.");
      return;
    }
    if (!genericFormula.trim()) {
      setError("Please provide the generic pharmacological formula.");
      return;
    }
    if (!facilityId) {
      setError("Please select a facility for this inventory item.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (itemToEdit) {
        const res = await fetch("/api/inventory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "update_item",
            itemId: itemToEdit.id,
            updates: {
              name: name.trim(),
              genericFormula: genericFormula.trim(),
              category,
              dosageForm,
              strength: strength.trim(),
              stockCount: Number(stockCount),
              minThreshold: Number(minThreshold),
              unitPrice: Number(unitPrice),
              batchNumber: batchNumber.trim(),
              expiryDate,
              requiresPrescription,
              notes: notes.trim() || undefined,
            },
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to update item");
        }
        onSave(data.item);
      } else {
        const res = await fetch("/api/inventory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "add_item",
            item: {
              facilityId,
              name: name.trim(),
              genericFormula: genericFormula.trim(),
              category,
              dosageForm,
              strength: strength.trim(),
              stockCount: Number(stockCount),
              minThreshold: Number(minThreshold),
              unitPrice: Number(unitPrice),
              batchNumber: batchNumber.trim(),
              expiryDate,
              requiresPrescription,
              notes: notes.trim() || undefined,
            },
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to add item");
        }
        onSave(data.item);
      }
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-surface rounded-2xl shadow-2xl border border-line overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-line bg-mist">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-soft text-brand border border-brand/25">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-ink">
                {itemToEdit
                  ? "Edit Medical Inventory Item"
                  : "Add New Drug / Medical Supply"}
              </h2>
              <p className="text-xs text-muted">
                Maintain accurate pharmacological records, pricing, and stock
                alerts.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 text-muted hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 max-h-[75vh] overflow-y-auto"
        >
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-none" />
              <span>{error}</span>
            </div>
          )}

          {/* Facility Selection (if adding) */}
          <div className="space-y-1.5">
            <Select
              label="Facility"
                            value={facilityId}
              onChange={(v) => !itemToEdit && setFacilityId(v)}
              options={facilities.map((fac) => ({
                value: fac.id,
                label: fac.name,
                description: `${fac.type}, ${fac.city}`,
              }))}
            />
          </div>

          {/* Drug Names */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="drug-modal-f1" className="text-xs font-semibold text-ink">
                Drug / Brand Name *
              </label>
              <input
                id="drug-modal-f1"
                type="text"
                required
                placeholder="e.g. Hydrocortisone 1% Topical Cream"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-line bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="drug-modal-f2" className="text-xs font-semibold text-ink">
                Generic Formula / Active Ingredients *
              </label>
              <input
                id="drug-modal-f2"
                type="text"
                required
                placeholder="e.g. Hydrocortisone Acetate (10mg/g)"
                value={genericFormula}
                onChange={(e) => setGenericFormula(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-line bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
            </div>
          </div>

          {/* Category & Dosage Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Select<DrugCategory>
                label="Therapeutic category"
                                value={category}
                onChange={setCategory}
                options={CATEGORIES.map((cat) => ({ value: cat, label: cat }))}
              />
            </div>

            <div className="space-y-1.5">
              <Select<DosageForm>
                label="Dosage form"
                                value={dosageForm}
                onChange={setDosageForm}
                options={DOSAGE_FORMS.map((form) => ({ value: form, label: form }))}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="drug-modal-f3" className="text-xs font-semibold text-ink">
                Strength / Packaging *
              </label>
              <input
                id="drug-modal-f3"
                type="text"
                required
                placeholder="e.g. 15g tube, 500mg (10x10)"
                value={strength}
                onChange={(e) => setStrength(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-line bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
            </div>
          </div>

          {/* Stock Counts & Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="drug-modal-f4" className="text-xs font-semibold text-ink">
                Stock Count (Units) *
              </label>
              <input
                id="drug-modal-f4"
                type="number"
                min="0"
                required
                value={stockCount}
                onChange={(e) => setStockCount(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-line bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="drug-modal-f5" className="text-xs font-semibold text-ink">
                Min. Reorder Threshold *
              </label>
              <input
                id="drug-modal-f5"
                type="number"
                min="1"
                required
                value={minThreshold}
                onChange={(e) => setMinThreshold(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-line bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="drug-modal-f6" className="text-xs font-semibold text-ink">
                Unit Price (₦ NGN) *
              </label>
              <input
                id="drug-modal-f6"
                type="number"
                min="0"
                step="50"
                required
                value={unitPrice}
                onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-line bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
            </div>
          </div>

          {/* Batch & Expiry */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="drug-modal-f7" className="text-xs font-semibold text-ink">
                Batch / Lot Number *
              </label>
              <input
                id="drug-modal-f7"
                type="text"
                required
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-line bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="drug-modal-f8" className="text-xs font-semibold text-ink">
                Expiry Date *
              </label>
              <input
                id="drug-modal-f8"
                type="date"
                required
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-line bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
            </div>
          </div>

          {/* Prescription toggle */}
          <Switch
            className="pt-1"
            checked={requiresPrescription}
            onChange={setRequiresPrescription}
            label="Prescription only"
            description="Patients are told to bring a prescription."
          />

          {/* Clinical / Inventory Notes */}
          <div className="space-y-1.5">
            <label htmlFor="drug-modal-f9" className="text-xs font-semibold text-ink">
              Clinical / Storage Notes (Optional)
            </label>
            <textarea
                id="drug-modal-f9"
              rows={2}
              placeholder="e.g. Store below 25°C. Keep refrigerated for vials."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-line bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-brand/30 placeholder:text-muted"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-muted hover:text-ink dark:hover:text-zinc-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-brand hover:bg-brand-strong active:bg-teal-800 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {isSubmitting
                ? "Saving..."
                : itemToEdit
                  ? "Save Changes"
                  : "Add to Inventory"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function DrugModal(props: DrugModalProps) {
  if (!props.isOpen) return null;
  return (
    <DrugModalForm
      key={props.itemToEdit ? props.itemToEdit.id : "new-drug-form"}
      {...props}
    />
  );
}
