"use client";

import React, { useState } from "react";
import {
  Facility,
  InventoryItem,
  InventoryMetrics,
  StockStatus,
  computeStockStatus,
  isExpiringSoon,
} from "@/lib/inventory-data";
import {
  Building2,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  ShieldCheck,
  MapPin,
  TrendingUp,
  Package,
  RotateCcw,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Phone,
  Calendar,
  AlertOctagon,
  Sparkles,
} from "lucide-react";

interface ProviderPortalProps {
  facilities: Facility[];
  items: (InventoryItem & {
    facility: Facility;
    status: StockStatus;
    isExpiringSoon: boolean;
  })[];
  metrics: InventoryMetrics;
  selectedFacilityId: string;
  onSelectFacility: (id: string) => void;
  onOpenAddFacility: () => void;
  onOpenAddDrug: () => void;
  onOpenEditDrug: (item: InventoryItem) => void;
  onQuickRestock: (itemId: string, delta: number) => Promise<void>;
  onDeleteItem: (itemId: string) => Promise<void>;
  onRefreshData: () => Promise<void>;
  onShowToast: (msg: string) => void;
}

export function ProviderPortal({
  facilities,
  items,
  metrics,
  selectedFacilityId,
  onSelectFacility,
  onOpenAddFacility,
  onOpenAddDrug,
  onOpenEditDrug,
  onQuickRestock,
  onDeleteItem,
  onRefreshData,
  onShowToast,
}: ProviderPortalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | StockStatus>(
    "ALL",
  );
  const [copiedDirections, setCopiedDirections] = useState(false);
  const [showExpiringBanner, setShowExpiringBanner] = useState(true);
  const [customRestockItemId, setCustomRestockItemId] = useState<string | null>(
    null,
  );
  const [customRestockAmount, setCustomRestockAmount] = useState<number>(25);

  const currentFacility =
    facilities.find((f) => f.id === selectedFacilityId) || facilities[0];

  // Filter items for the selected facility (or all if ALL selected)
  const facilityItems = items.filter((item) => {
    if (
      selectedFacilityId !== "ALL" &&
      item.facilityId !== selectedFacilityId
    ) {
      return false;
    }
    if (selectedCategory !== "ALL" && item.category !== selectedCategory) {
      return false;
    }
    if (selectedStatus !== "ALL" && item.status !== selectedStatus) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchFormula = item.genericFormula.toLowerCase().includes(q);
      const matchBatch = item.batchNumber.toLowerCase().includes(q);
      return matchName || matchFormula || matchBatch;
    }
    return true;
  });

  const expiringItems = items.filter(
    (item) =>
      (selectedFacilityId === "ALL" ||
        item.facilityId === selectedFacilityId) &&
      isExpiringSoon(item.expiryDate),
  );

  const lowStockItems = items.filter(
    (item) =>
      (selectedFacilityId === "ALL" ||
        item.facilityId === selectedFacilityId) &&
      (item.status === "LOW_STOCK" || item.status === "OUT_OF_STOCK"),
  );

  const handleCopyDirections = () => {
    if (!currentFacility) return;
    const text = `${currentFacility.name}\n${currentFacility.address}\n\nLandmark Directions:\n${currentFacility.landmarkDirections}\n\nStep-by-step:\n${currentFacility.stepByStepLandmarks.map((s: string, i: number) => `${i + 1}. ${s}`).join("\n")}`;
    navigator.clipboard.writeText(text);
    setCopiedDirections(true);
    onShowToast("Landmark directions copied to clipboard!");
    setTimeout(() => setCopiedDirections(false), 2500);
  };

  const handleApplyCustomRestock = async (itemId: string) => {
    if (customRestockAmount <= 0) return;
    await onQuickRestock(itemId, customRestockAmount);
    setCustomRestockItemId(null);
    onShowToast(`Restocked +${customRestockAmount} units successfully!`);
  };

  const formatNaira = (amount: number) => {
    return "₦" + amount.toLocaleString("en-NG");
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Facility Selector & Action Buttons */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Active Medical Tenant
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                Multi-Tenant Architecture
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[280px] sm:min-w-[340px]">
                <select
                  value={selectedFacilityId}
                  onChange={(e) => onSelectFacility(e.target.value)}
                  className="w-full appearance-none px-4 py-2.5 pr-10 text-sm font-semibold rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-xs cursor-pointer"
                >
                  <option value="ALL">
                    All Facilities (Consolidated Network View)
                  </option>
                  {facilities.map((fac) => (
                    <option key={fac.id} value={fac.id}>
                      {fac.name} ({fac.type} • {fac.city})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {currentFacility && selectedFacilityId !== "ALL" && (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified: {currentFacility.licenseNumber}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60">
                    <Building2 className="w-3.5 h-3.5" />
                    {currentFacility.type}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center flex-wrap gap-2.5">
            <button
              onClick={onOpenAddFacility}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700/60 transition-colors shadow-xs"
            >
              <Building2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>+ Register New Facility</span>
            </button>

            <button
              onClick={onOpenAddDrug}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Drug / Item</span>
            </button>

            <button
              onClick={onRefreshData}
              title="Refresh inventory data"
              className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Selected Facility Details Card with Plain English Landmark Directions */}
        {currentFacility && selectedFacilityId !== "ALL" && (
          <div className="mt-5 pt-4 border-t border-zinc-200 dark:border-zinc-800/80">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1 space-y-2">
                <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-semibold text-sm">
                  <MapPin className="w-4 h-4 text-teal-600 flex-none" />
                  <span>{currentFacility.address}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                  <Clock className="w-3.5 h-3.5 text-zinc-400 flex-none" />
                  <span>{currentFacility.operatingHours}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                  <Phone className="w-3.5 h-3.5 text-zinc-400 flex-none" />
                  <span>{currentFacility.phone}</span>
                </div>
              </div>

              {/* Landmark Directions Box */}
              <div className="lg:col-span-2 bg-teal-50/70 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800/60 rounded-xl p-3.5 relative">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="p-1 rounded-md bg-teal-600 text-white">
                      <MapPin className="w-3 h-3" />
                    </span>
                    <h4 className="text-xs font-bold text-teal-900 dark:text-teal-200">
                      Plain-English Landmark Navigation (Public Patient
                      Directions)
                    </h4>
                  </div>
                  <button
                    onClick={handleCopyDirections}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-teal-700 dark:text-teal-300 bg-white dark:bg-zinc-800 rounded-lg border border-teal-300 dark:border-teal-700 hover:bg-teal-50 dark:hover:bg-zinc-700 transition-colors"
                  >
                    {copiedDirections ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Directions</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed font-medium">
                  "{currentFacility.landmarkDirections}"
                </p>

                {currentFacility.stepByStepLandmarks.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-teal-200/50 dark:border-teal-800/40 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {currentFacility.stepByStepLandmarks.map((step: string, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-start gap-1.5 text-[11px] text-zinc-700 dark:text-zinc-300"
                      >
                        <span className="flex-none font-bold text-teal-600 dark:text-teal-400">
                          {idx + 1}.
                        </span>
                        <span className="line-clamp-2">{step}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Health Metrics & Quick Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total SKUs */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>Total SKUs</span>
            <Package className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {metrics.totalSKUs}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">
            Cataloged items
          </div>
        </div>

        {/* In Stock */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>In Stock</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {metrics.inStockCount}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Optimal levels</div>
        </div>

        {/* Low Stock Warnings */}
        <div className="bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-900/60 rounded-xl p-3.5 shadow-xs bg-amber-50/20 dark:bg-amber-950/10">
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 text-xs font-medium">
            <span>Low Stock</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">
            {metrics.lowStockCount}
          </div>
          <div className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-0.5">
            Below reorder min
          </div>
        </div>

        {/* Out of Stock */}
        <div className="bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-900/60 rounded-xl p-3.5 shadow-xs bg-red-50/20 dark:bg-red-950/10">
          <div className="flex items-center justify-between text-red-700 dark:text-red-400 text-xs font-medium">
            <span>Out of Stock</span>
            <XCircle className="w-4 h-4 text-red-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-red-600 dark:text-red-400">
            {metrics.outOfStockCount}
          </div>
          <div className="text-[11px] text-red-600/80 dark:text-red-400/80 mt-0.5">
            Immediate reorder
          </div>
        </div>

        {/* Expiring Soon (< 90 Days) */}
        <div className="bg-white dark:bg-zinc-900 border border-purple-200 dark:border-purple-900/60 rounded-xl p-3.5 shadow-xs bg-purple-50/20 dark:bg-purple-950/10">
          <div className="flex items-center justify-between text-purple-700 dark:text-purple-400 text-xs font-medium">
            <span>Expiring Soon</span>
            <Calendar className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-purple-600 dark:text-purple-400">
            {metrics.expiringSoonCount}
          </div>
          <div className="text-[11px] text-purple-600/80 dark:text-purple-400/80 mt-0.5">
            Within 90 days
          </div>
        </div>

        {/* Total Inventory Value */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>Valuation</span>
            <TrendingUp className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-2 text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-50 truncate">
            {formatNaira(metrics.totalInventoryValue)}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">
            Current stock asset
          </div>
        </div>
      </div>

      {/* Expiring Soon & Low Stock Alert Banner */}
      {(expiringItems.length > 0 || lowStockItems.length > 0) &&
        showExpiringBanner && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/80 rounded-2xl p-4 shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
                  <AlertOctagon className="w-5 h-5 flex-none" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
                    <span>Inventory Health Attention Required</span>
                    <span className="px-2 py-0.5 text-[11px] rounded-full bg-amber-200/70 dark:bg-amber-800/60 font-semibold text-amber-900 dark:text-amber-100">
                      {lowStockItems.length} low stock • {expiringItems.length}{" "}
                      expiring soon
                    </span>
                  </h4>
                  <p className="text-xs text-amber-800 dark:text-amber-300/90 leading-relaxed">
                    Items below their safety reorder buffer or nearing
                    expiration will trigger pharmacy out-of-stock notices in
                    patient search results. Use the quick-restock actions below
                    to adjust levels.
                  </p>

                  {/* Quick chip pills for expiring / low stock */}
                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    {lowStockItems.slice(0, 3).map((item) => (
                      <span
                        key={item.id}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-medium rounded-full bg-white dark:bg-zinc-800 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800"
                      >
                        <AlertTriangle className="w-3 h-3 text-amber-500" />
                        {item.name}: <strong>{item.stockCount} left</strong>
                      </span>
                    ))}
                    {expiringItems.slice(0, 2).map((item) => (
                      <span
                        key={item.id}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-medium rounded-full bg-white dark:bg-zinc-800 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-800"
                      >
                        <Calendar className="w-3 h-3 text-purple-500" />
                        {item.name}: exp {item.expiryDate}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowExpiringBanner(false)}
                className="text-amber-600 hover:text-amber-900 dark:hover:text-amber-100 p-1 text-xs"
                title="Dismiss warning banner"
              >
                ✕
              </button>
            </div>
          </div>
        )}

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search drug, generic formula, batch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="ALL">All Categories</option>
              <option value="Antimalarials">Antimalarials</option>
              <option value="Antibiotics">Antibiotics</option>
              <option value="Pain Relief">Pain Relief</option>
              <option value="Dermatology/Creams">Dermatology / Creams</option>
              <option value="Emergency Supplies">Emergency Supplies</option>
              <option value="Chronic Care">Chronic Care</option>
              <option value="Vitamins & Supplements">
                Vitamins & Supplements
              </option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) =>
                setSelectedStatus(e.target.value as "ALL" | StockStatus)
              }
              className="px-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="ALL">All Stock Status</option>
              <option value="IN_STOCK">In Stock</option>
              <option value="LOW_STOCK">Low Stock</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>

            <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-auto font-medium">
              Showing {facilityItems.length} of {items.length} SKUs
            </span>
          </div>
        </div>
      </div>

      {/* Live Inventory Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-800/50 text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                <th className="py-3.5 px-4">Medication & Formula</th>
                <th className="py-3.5 px-3">Category & Form</th>
                {selectedFacilityId === "ALL" && (
                  <th className="py-3.5 px-3">Facility</th>
                )}
                <th className="py-3.5 px-3">Live Stock & Status</th>
                <th className="py-3.5 px-3">Unit Price</th>
                <th className="py-3.5 px-3">Batch & Expiry</th>
                <th className="py-3.5 px-4 text-right">
                  Quick Restock & Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/80 text-xs">
              {facilityItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={selectedFacilityId === "ALL" ? 7 : 6}
                    className="py-12 text-center text-zinc-500 dark:text-zinc-400"
                  >
                    <Package className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-600 mb-2" />
                    <p className="font-medium">
                      No inventory items matched your filter criteria.
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Try resetting your search query or add a new drug SKU to
                      this facility.
                    </p>
                  </td>
                </tr>
              ) : (
                facilityItems.map((item) => {
                  const status = computeStockStatus(item);
                  const expiring = isExpiringSoon(item.expiryDate);

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      {/* Name & Formula */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                          <span>{item.name}</span>
                          {item.requiresPrescription && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              Rx
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">
                          {item.genericFormula} • {item.strength}
                        </div>
                      </td>

                      {/* Category & Form */}
                      <td className="py-3.5 px-3">
                        <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                          {item.category}
                        </span>
                        <div className="text-[11px] text-zinc-500 mt-0.5">
                          {item.dosageForm}
                        </div>
                      </td>

                      {/* Facility (if ALL selected) */}
                      {selectedFacilityId === "ALL" && (
                        <td className="py-3.5 px-3">
                          <div className="font-medium text-zinc-800 dark:text-zinc-200 text-xs">
                            {item.facility.name}
                          </div>
                          <div className="text-[10px] text-zinc-500">
                            {item.facility.city}
                          </div>
                        </td>
                      )}

                      {/* Stock Count & Status Badge */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                            {item.stockCount}
                          </span>
                          <span className="text-[11px] text-zinc-400">
                            / min {item.minThreshold}
                          </span>
                        </div>

                        <div className="mt-1">
                          {status === "IN_STOCK" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100/70 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 className="w-2.5 h-2.5" /> In Stock
                            </span>
                          )}
                          {status === "LOW_STOCK" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100/70 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              <AlertTriangle className="w-2.5 h-2.5" /> Low
                              Stock
                            </span>
                          )}
                          {status === "OUT_OF_STOCK" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100/70 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                              <XCircle className="w-2.5 h-2.5" /> Out of Stock
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Unit Price */}
                      <td className="py-3.5 px-3 font-semibold text-zinc-900 dark:text-zinc-100">
                        {formatNaira(item.unitPrice)}
                      </td>

                      {/* Batch & Expiry */}
                      <td className="py-3.5 px-3">
                        <div className="font-mono text-[11px] text-zinc-700 dark:text-zinc-300">
                          {item.batchNumber}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span
                            className={`text-[11px] font-medium ${
                              expiring
                                ? "text-purple-600 dark:text-purple-400 font-bold"
                                : "text-zinc-500 dark:text-zinc-400"
                            }`}
                          >
                            Exp: {item.expiryDate}
                          </span>
                          {expiring && (
                            <span
                              className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"
                              title="Expiring soon"
                            />
                          )}
                        </div>
                      </td>

                      {/* Actions & Quick Restock */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick restock buttons */}
                          <button
                            onClick={() => onQuickRestock(item.id, 10)}
                            title="Quick restock +10 units"
                            className="px-2 py-1 text-[11px] font-bold rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/60 border border-teal-200 dark:border-teal-800 transition-colors"
                          >
                            +10
                          </button>
                          <button
                            onClick={() => onQuickRestock(item.id, 50)}
                            title="Quick restock +50 units"
                            className="px-2 py-1 text-[11px] font-bold rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/60 border border-teal-200 dark:border-teal-800 transition-colors"
                          >
                            +50
                          </button>

                          {/* Custom restock trigger */}
                          <button
                            onClick={() =>
                              setCustomRestockItemId(
                                customRestockItemId === item.id
                                  ? null
                                  : item.id,
                              )
                            }
                            title="Custom restock"
                            className="p-1 text-zinc-500 hover:text-teal-600 dark:hover:text-teal-400 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => onOpenEditDrug(item)}
                            title="Edit drug details"
                            className="p-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (
                                confirm(`Remove "${item.name}" from inventory?`)
                              ) {
                                onDeleteItem(item.id);
                              }
                            }}
                            title="Delete item"
                            className="p-1 text-zinc-400 hover:text-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Inline custom restock popover */}
                        {customRestockItemId === item.id && (
                          <div className="mt-2 p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg inline-flex items-center gap-1.5 shadow-md">
                            <span className="text-[11px] text-zinc-500">
                              Add:
                            </span>
                            <input
                              type="number"
                              min="1"
                              value={customRestockAmount}
                              onChange={(e) =>
                                setCustomRestockAmount(
                                  parseInt(e.target.value) || 0,
                                )
                              }
                              className="w-16 px-1.5 py-0.5 text-xs rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-center font-bold"
                            />
                            <button
                              onClick={() => handleApplyCustomRestock(item.id)}
                              className="px-2 py-0.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded transition-colors"
                            >
                              Apply
                            </button>
                            <button
                              onClick={() => setCustomRestockItemId(null)}
                              className="text-zinc-400 hover:text-zinc-600 text-xs px-1"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
