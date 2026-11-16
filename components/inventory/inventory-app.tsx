"use client";
import Link from "next/link";
import { Info } from "lucide-react";
import { ChoiceGroup } from "@/components/ui/Choice";
import { useSession } from "@/lib/store/session";

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
  const user = useSession((st) => st.user);
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
      showToast("Couldn't refresh stock. Check your connection and try again.");
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
    <div className="w-full px-4 py-8 sm:px-6 lg:py-12">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
              {activeMode === "patient" ? "Find medicine near you" : "Manage your stock"}
            </h1>
            <p className="mt-2 max-w-xl text-muted">
              {activeMode === "patient"
                ? "See which pharmacy, clinic or hospital has it, what it costs, and how to get there."
                : "Keep quantities, prices and expiry dates current so patients find you."}
            </p>
          </div>
          <ChoiceGroup<"patient" | "provider">
            label="View"
            hideLabel
            variant="pills"
            value={activeMode}
            onChange={setActiveMode}
            options={[
              { value: "patient", label: "Find medicine", icon: Search },
              { value: "provider", label: "Manage stock", icon: Building2 },
            ]}
          />
        </div>

        {activeMode === "provider" && !user && (
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-2xl border border-sky/25 bg-sky-soft px-4 py-3 text-sm text-ink">
            <Info className="h-4 w-4 shrink-0 text-sky" aria-hidden />
            You&apos;re viewing sample facilities.
            <Link href="/signup" className="font-semibold text-sky underline-offset-4 hover:underline">
              Create a facility account
            </Link>
            to list your own stock.
          </p>
        )}

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
          <div
            role="status"
            className="animate-rise fixed inset-x-4 bottom-4 z-50 flex items-center gap-2 rounded-2xl bg-ink px-4 py-3 text-sm font-medium text-paper shadow-2xl sm:inset-x-auto sm:right-6 sm:bottom-6"
          >
            <CheckCircle2 className="h-4 w-4 flex-none" aria-hidden />
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
        <div className="flex flex-1 items-center justify-center py-24">
          <div className="flex items-center gap-3 text-sm font-medium text-muted">
            <RefreshCw className="h-5 w-5 animate-spin text-brand" aria-hidden />
            <span>Loading stock</span>
          </div>
        </div>
      }
    >
      <InventoryAppContent {...props} />
    </Suspense>
  );
}
