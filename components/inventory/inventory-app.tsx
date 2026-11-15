"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Facility,
  InventoryItem,
  InventoryMetrics,
  computeStockStatus,
  isExpiringSoon,
} from "@/lib/inventory-data";
import { ProviderPortal } from "./provider-portal";
import { PatientSearch } from "./patient-search";
import { FacilityModal } from "./facility-modal";
import { DrugModal } from "./drug-modal";
import {
  Search,
  Building2,
  Layers,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

interface InventoryAppContentProps {
  initialFacilities: Facility[];
  initialItems: InventoryItem[];
  initialMetrics: InventoryMetrics;
}

function InventoryAppContent({
  initialFacilities,
  initialItems,
  initialMetrics,
}: InventoryAppContentProps) {
  const searchParams = useSearchParams();
  const querySearch = searchParams?.get("search") || "";
  const queryMode = searchParams?.get("mode") || "";

  // Dual-mode state: 'patient' (Find Meds) vs 'provider' (Manage Inventory)
  const [activeMode, setActiveMode] = useState<"patient" | "provider">(
    queryMode === "provider" ? "provider" : "patient",
  );

  const [facilities, setFacilities] = useState<Facility[]>(initialFacilities);
  const [items, setItems] = useState<InventoryItem[]>(initialItems);
  const [metrics, setMetrics] = useState<InventoryMetrics>(initialMetrics);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>("ALL");

  // Modal states
  const [isFacilityModalOpen, setIsFacilityModalOpen] = useState(false);
  const [isDrugModalOpen, setIsDrugModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<InventoryItem | null>(null);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3500);
  };

  // Re-fetch helper
  const refreshData = async () => {
    try {
      const res = await fetch("/api/inventory");
      const data = await res.json();
      if (data.success) {
        setFacilities(data.facilities);
        setItems(data.items);
        setMetrics(data.metrics);
        showToast("Inventory catalog updated with latest live data.");
      }
    } catch (err) {
      console.error("Failed to refresh data", err);
    }
  };

  // Quick Restock handler
  const handleQuickRestock = async (itemId: string, delta: number) => {
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "quick_restock",
          itemId,
          delta,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setItems((prev) =>
          prev.map((item) => (item.id === itemId ? data.item : item)),
        );
        if (data.metrics) {
          setMetrics(data.metrics);
        }
        showToast(`Stock updated (+${delta} units).`);
      }
    } catch (err) {
      console.error("Restock error", err);
      showToast("Error updating stock count.");
    }
  };

  // Delete Item handler
  const handleDeleteItem = async (itemId: string) => {
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_item",
          itemId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setItems((prev) => prev.filter((item) => item.id !== itemId));
        showToast("Item removed from inventory.");
      }
    } catch (err) {
      console.error("Delete error", err);
      showToast("Error deleting item.");
    }
  };

  // Enrich items with facility object and computed flags
  const facilityMap = new Map(facilities.map((f) => [f.id, f]));
  const enrichedItems = items.map((item) => {
    const facility = facilityMap.get(item.facilityId) || {
      id: item.facilityId,
      name: "Unknown Facility",
      type: "Clinic" as const,
      licenseNumber: "N/A",
      phone: "N/A",
      email: "N/A",
      operatingHours: "Regular Hours",
      address: "Nigeria",
      city: "Abuja",
      state: "FCT",
      landmarkDirections: "Contact clinic.",
      stepByStepLandmarks: [],
      emergencyContact: "N/A",
      verified: false,
      rating: 4.5,
    };
    return {
      ...item,
      facility,
      status: computeStockStatus(item),
      isExpiringSoon: isExpiringSoon(item.expiryDate),
    };
  });

  return (
    <div className="min-h-screen bg-zinc-50/70 dark:bg-black text-zinc-900 dark:text-zinc-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation / Mode Switcher Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 sm:p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-600 text-white shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                  Zelthia Health Directory & Inventory Network
                </h2>
                <span className="hidden md:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  Multi-Tenant
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Bridging patient drug discovery with provider supply-chain
                transparency.
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <button
              onClick={() => setActiveMode("patient")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeMode === "patient"
                  ? "bg-white dark:bg-zinc-900 text-teal-700 dark:text-teal-400 shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Patient Drug Finder</span>
            </button>

            <button
              onClick={() => setActiveMode("provider")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeMode === "provider"
                  ? "bg-white dark:bg-zinc-900 text-teal-700 dark:text-teal-400 shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Provider Portal Mode</span>
            </button>
          </div>
        </div>

        {/* Mode Explainer Pill */}
        <div className="flex items-center justify-between text-xs px-2 text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-1.5">
            {activeMode === "patient" ? (
              <>
                <Search className="w-3.5 h-3.5 text-teal-600" />
                <span>
                  Currently in <strong>Patient Mode</strong>: Search verified
                  medication stock and landmark directions across registered
                  care centers.
                </span>
              </>
            ) : (
              <>
                <Building2 className="w-3.5 h-3.5 text-teal-600" />
                <span>
                  Currently in <strong>Provider Portal Mode</strong>: Managing
                  live medical inventory, thresholds, and facility profile for
                  accredited tenants.
                </span>
              </>
            )}
          </div>

          <button
            onClick={() =>
              setActiveMode(activeMode === "patient" ? "provider" : "patient")
            }
            className="text-teal-600 dark:text-teal-400 hover:underline font-medium inline-flex items-center gap-1"
          >
            <span>
              Switch to{" "}
              {activeMode === "patient" ? "Provider Portal" : "Patient Search"}
            </span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Main Content Area */}
        {activeMode === "patient" ? (
          <PatientSearch
            items={enrichedItems}
            facilities={facilities}
            initialSearchQuery={querySearch}
            onShowToast={showToast}
          />
        ) : (
          <ProviderPortal
            facilities={facilities}
            items={enrichedItems}
            metrics={metrics}
            selectedFacilityId={selectedFacilityId}
            onSelectFacility={(id) => setSelectedFacilityId(id)}
            onOpenAddFacility={() => setIsFacilityModalOpen(true)}
            onOpenAddDrug={() => {
              setItemToEdit(null);
              setIsDrugModalOpen(true);
            }}
            onOpenEditDrug={(item) => {
              setItemToEdit(item);
              setIsDrugModalOpen(true);
            }}
            onQuickRestock={handleQuickRestock}
            onDeleteItem={handleDeleteItem}
            onRefreshData={refreshData}
            onShowToast={showToast}
          />
        )}

        {/* Modals */}
        <FacilityModal
          isOpen={isFacilityModalOpen}
          onClose={() => setIsFacilityModalOpen(false)}
          onFacilityRegistered={(newFac) => {
            setFacilities((prev) => [newFac, ...prev]);
            setSelectedFacilityId(newFac.id);
            showToast(`Facility "${newFac.name}" onboarded successfully!`);
          }}
        />

        <DrugModal
          isOpen={isDrugModalOpen}
          onClose={() => {
            setIsDrugModalOpen(false);
            setItemToEdit(null);
          }}
          facilities={facilities}
          selectedFacilityId={
            selectedFacilityId === "ALL" ? undefined : selectedFacilityId
          }
          itemToEdit={itemToEdit}
          onSave={(savedItem) => {
            setItems((prev) => {
              const idx = prev.findIndex((i) => i.id === savedItem.id);
              if (idx !== -1) {
                const next = [...prev];
                next[idx] = savedItem;
                return next;
              }
              return [savedItem, ...prev];
            });
            showToast(
              itemToEdit
                ? `Updated "${savedItem.name}" successfully.`
                : `Added "${savedItem.name}" to inventory.`,
            );
          }}
        />

        {/* Global Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-2xl shadow-2xl text-xs font-semibold border border-zinc-700/50 dark:border-zinc-300 animate-in fade-in slide-in-from-bottom-4">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 flex-none" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function InventoryApp(props: InventoryAppContentProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black">
          <div className="flex items-center gap-3 text-zinc-500 text-sm font-medium">
            <RefreshCw className="w-5 h-5 animate-spin text-teal-600" />
            <span>Loading Zelthia Inventory & Care Directory...</span>
          </div>
        </div>
      }
    >
      <InventoryAppContent {...props} />
    </Suspense>
  );
}
