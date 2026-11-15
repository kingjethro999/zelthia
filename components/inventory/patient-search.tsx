"use client";

import React, { useState, useMemo } from "react";
import {
  Facility,
  InventoryItem,
  StockStatus,
  computeStockStatus,
} from "@/lib/inventory-data";
import {
  Search,
  MapPin,
  Phone,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  Building2,
  Pill,
  Sparkles,
  Navigation,
  Compass,
  HeartHandshake,
  ExternalLink,
} from "lucide-react";

interface PatientSearchProps {
  items: (InventoryItem & {
    facility: Facility;
    status: StockStatus;
    isExpiringSoon: boolean;
  })[];
  facilities: Facility[];
  initialSearchQuery?: string;
  onShowToast: (msg: string) => void;
}

export function PatientSearch({
  items,
  facilities,
  initialSearchQuery = "",
  onShowToast,
}: PatientSearchProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedCity, setSelectedCity] = useState<string>("ALL");
  const [selectedDosageForm, setSelectedDosageForm] = useState<string>("ALL");
  const [onlyInStock, setOnlyInStock] = useState<boolean>(true);
  const [copiedFacilityId, setCopiedFacilityId] = useState<string | null>(null);
  const [expandedDirectionsId, setExpandedDirectionsId] = useState<
    string | null
  >(null);

  // Quick suggestion pills
  const SUGGESTIONS = [
    "Hydrocortisone cream",
    "Artemether / Lumefantrine",
    "Amoxicillin",
    "Salbutamol Inhaler",
    "Paracetamol",
    "Insulin",
    "Ketoconazole",
  ];

  // Unique cities from facilities
  const cities = useMemo(() => {
    const set = new Set(facilities.map((f) => f.city));
    return Array.from(set);
  }, [facilities]);

  // Filtered Results
  const filteredResults = useMemo(() => {
    return items.filter((item) => {
      // In Stock filter
      if (onlyInStock && item.stockCount <= 0) {
        return false;
      }
      // Category filter
      if (selectedCategory !== "ALL" && item.category !== selectedCategory) {
        return false;
      }
      // City filter
      if (selectedCity !== "ALL" && item.facility.city !== selectedCity) {
        return false;
      }
      // Dosage Form filter
      if (
        selectedDosageForm !== "ALL" &&
        item.dosageForm !== selectedDosageForm
      ) {
        return false;
      }
      // Text Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = item.name.toLowerCase().includes(q);
        const matchGeneric = item.genericFormula.toLowerCase().includes(q);
        const matchCategory = item.category.toLowerCase().includes(q);
        const matchFacility = item.facility.name.toLowerCase().includes(q);
        const matchCity = item.facility.city.toLowerCase().includes(q);
        const matchLandmark = item.facility.landmarkDirections
          .toLowerCase()
          .includes(q);
        return (
          matchName ||
          matchGeneric ||
          matchCategory ||
          matchFacility ||
          matchCity ||
          matchLandmark
        );
      }
      return true;
    });
  }, [
    items,
    searchQuery,
    selectedCategory,
    selectedCity,
    selectedDosageForm,
    onlyInStock,
  ]);

  const handleCopyLandmark = (item: (typeof items)[0]) => {
    const text = `Facility: ${item.facility.name}\nAddress: ${item.facility.address}\n\nLandmark Directions:\n${item.facility.landmarkDirections}\n\nNavigation Steps:\n${item.facility.stepByStepLandmarks.map((s: string, i: number) => `${i + 1}. ${s}`).join("\n")}\n\nContact Phone: ${item.facility.phone}`;
    navigator.clipboard.writeText(text);
    setCopiedFacilityId(item.id);
    onShowToast(`Landmark directions for ${item.facility.name} copied!`);
    setTimeout(() => setCopiedFacilityId(null), 2500);
  };

  const formatNaira = (amount: number) => {
    return "₦" + amount.toLocaleString("en-NG");
  };

  return (
    <div className="space-y-6">
      {/* Patient Search Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-teal-900 via-teal-800 to-emerald-900 text-white p-6 sm:p-10 shadow-xl border border-teal-700/50">
        {/* Subtle background glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-teal-400/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-teal-700/80 text-teal-100 border border-teal-500/40 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            <span>Verified Medicine Stock & Landmark Guidance</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Find Available Medicine Near You — Without the Guesswork.
          </h1>

          <p className="text-sm sm:text-base text-teal-100/90 leading-relaxed max-w-2xl">
            Never walk from pharmacy to pharmacy again. Search live medication
            stocks across verified university clinics, community pharmacies, and
            hospitals with plain-English landmark directions to guide you
            straight to the counter.
          </p>

          {/* Search Input Bar */}
          <div className="pt-2">
            <div className="relative flex items-center bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-1.5 border border-teal-200/50 dark:border-zinc-700">
              <div className="p-3 text-teal-600 dark:text-teal-400">
                <Search className="w-6 h-6" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search medication (e.g. Hydrocortisone cream, Artemether, Insulin, Paracetamol)..."
                className="w-full py-2.5 pr-4 text-sm sm:text-base text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 bg-transparent focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="px-3 py-1 text-xs font-semibold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Quick Suggestions Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs font-medium text-teal-200/80">
              Popular searches:
            </span>
            {SUGGESTIONS.map((item) => (
              <button
                key={item}
                onClick={() => setSearchQuery(item)}
                className="px-3 py-1 text-xs rounded-full bg-teal-800/60 hover:bg-teal-700/80 text-teal-100 border border-teal-600/40 transition-colors backdrop-blur-xs"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Category Dropdown */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs font-medium rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="ALL">All Categories</option>
              <option value="Dermatology/Creams">Dermatology / Creams</option>
              <option value="Antimalarials">Antimalarials</option>
              <option value="Antibiotics">Antibiotics</option>
              <option value="Pain Relief">Pain Relief</option>
              <option value="Emergency Supplies">Emergency Supplies</option>
              <option value="Chronic Care">Chronic Care</option>
              <option value="Vitamins & Supplements">
                Vitamins & Supplements
              </option>
            </select>

            {/* City Dropdown */}
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-3 py-2 text-xs font-medium rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="ALL">All Cities / Regions</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            {/* Dosage Form Dropdown */}
            <select
              value={selectedDosageForm}
              onChange={(e) => setSelectedDosageForm(e.target.value)}
              className="px-3 py-2 text-xs font-medium rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="ALL">All Dosage Forms</option>
              <option value="Cream">Cream / Ointment</option>
              <option value="Tablet">Tablet</option>
              <option value="Capsule">Capsule</option>
              <option value="Syrup">Syrup</option>
              <option value="Inhaler">Inhaler</option>
              <option value="Injection">Injection</option>
              <option value="Suspension">Suspension</option>
            </select>
          </div>

          {/* In Stock Only Checkbox */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded border-zinc-300 dark:border-zinc-700 focus:ring-teal-500"
              />
              <span>In Stock Only</span>
            </label>

            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              Found <strong>{filteredResults.length}</strong> available options
            </span>
          </div>
        </div>
      </div>

      {/* Campus Survey Inspiration Note (Founder Story) */}
      <div className="bg-teal-50/70 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800/60 rounded-2xl p-4 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 flex-none">
          <HeartHandshake className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-teal-900 dark:text-teal-200">
            Real Community Impact — Grounded in Lincoln University College
            Campus Surveys
          </h4>
          <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
            Zelthia was built directly from our campus survey experience when
            students and residents walked through streets looking for specific
            treatments (like hydrocortisone skin cream) only to find them out of
            stock until the following day. Zelthia gives you real-time stock
            verification with landmark navigation so you know exactly where to
            go before leaving your room.
          </p>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {filteredResults.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-12 text-center shadow-xs">
            <div className="w-12 h-12 mx-auto rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
              No matching medications in stock
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
              We couldn't find any medications matching "{searchQuery}". Try
              loosening your search filters or unchecking "In Stock Only" to
              view out-of-stock items.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("ALL");
                setSelectedCity("ALL");
                setSelectedDosageForm("ALL");
                setOnlyInStock(false);
              }}
              className="mt-4 px-4 py-2 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          filteredResults.map((item) => {
            const status = computeStockStatus(item);
            const isDirectionsOpen = expandedDirectionsId === item.id;

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs hover:border-teal-500/40 dark:hover:border-teal-500/40 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                  {/* Left: Drug Details */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50">
                        {item.name}
                      </h3>
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                        {item.dosageForm}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                        {item.category}
                      </span>
                      {item.requiresPrescription && (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          Prescription (Rx) Required
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-zinc-400 font-mono">
                      Formula: <strong>{item.genericFormula}</strong> (
                      {item.strength})
                    </p>

                    {item.notes && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 italic">
                        "{item.notes}"
                      </p>
                    )}

                    {/* Facility Identity Card */}
                    <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400">
                      <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-zinc-100">
                        <Building2 className="w-4 h-4 text-teal-600 flex-none" />
                        <span>{item.facility.name}</span>
                      </div>
                      <span className="text-zinc-300 dark:text-zinc-700">
                        •
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {item.facility.type}
                      </span>
                      <span className="text-zinc-300 dark:text-zinc-700">
                        •
                      </span>
                      <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verified</span>
                      </div>
                      <span className="text-zinc-300 dark:text-zinc-700">
                        •
                      </span>
                      <div className="flex items-center gap-1 text-zinc-500">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>
                          {item.facility.city}, {item.facility.state}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Availability, Price & Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 flex-none lg:w-56 pt-2 lg:pt-0 border-t sm:border-t-0 border-zinc-200 dark:border-zinc-800">
                    <div className="text-left lg:text-right">
                      <div className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-50">
                        {formatNaira(item.unitPrice)}
                      </div>
                      <div className="mt-1">
                        {status === "IN_STOCK" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5" /> In Stock (
                            {item.stockCount} units)
                          </span>
                        )}
                        {status === "LOW_STOCK" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            <AlertTriangle className="w-3.5 h-3.5" /> Only{" "}
                            {item.stockCount} left
                          </span>
                        )}
                        {status === "OUT_OF_STOCK" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                            <XCircle className="w-3.5 h-3.5" /> Currently Out of
                            Stock
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                      <a
                        href={`tel:${item.facility.phone}`}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl transition-colors flex-1 sm:flex-none"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call Facility</span>
                      </a>

                      <button
                        onClick={() =>
                          setExpandedDirectionsId(
                            isDirectionsOpen ? null : item.id,
                          )
                        }
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors flex-1 sm:flex-none shadow-xs"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>
                          {isDirectionsOpen
                            ? "Hide Waypoints"
                            : "Landmark Route"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Plain-English Landmark Navigation Card */}
                <div className="mt-4 pt-3.5 border-t border-zinc-200 dark:border-zinc-800/80">
                  <div className="bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200/80 dark:border-teal-800/60 rounded-xl p-3.5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded-md bg-teal-600 text-white">
                          <Compass className="w-3.5 h-3.5" />
                        </span>
                        <h4 className="text-xs font-bold text-teal-950 dark:text-teal-200">
                          Plain-English Landmark Navigation:
                        </h4>
                      </div>

                      <button
                        onClick={() => handleCopyLandmark(item)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 dark:text-teal-300 hover:underline"
                      >
                        {copiedFacilityId === item.id ? (
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

                    <p className="text-xs text-zinc-800 dark:text-zinc-200 font-medium leading-relaxed">
                      "{item.facility.landmarkDirections}"
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-zinc-500 dark:text-zinc-400 mt-2 pt-2 border-t border-teal-200/50 dark:border-teal-800/40">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-zinc-400" />
                        {item.facility.operatingHours}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-zinc-400" />
                        {item.facility.phone}
                      </span>
                      <span className="flex items-center gap-1 text-teal-600 dark:text-teal-400 font-medium">
                        <ShieldCheck className="w-3 h-3" />
                        License: {item.facility.licenseNumber}
                      </span>
                    </div>

                    {/* Expanded Step-by-Step Waypoints */}
                    {isDirectionsOpen &&
                      item.facility.stepByStepLandmarks.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-teal-200 dark:border-teal-800 space-y-2">
                          <h5 className="text-[11px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
                            Step-by-Step Walking / Driving Turn Guidance:
                          </h5>
                          <div className="space-y-1.5">
                            {item.facility.stepByStepLandmarks.map(
                              (step: string, idx: number) => (
                                <div
                                  key={idx}
                                  className="flex items-start gap-2 text-xs text-zinc-800 dark:text-zinc-200"
                                >
                                  <span className="flex-none w-5 h-5 rounded-full bg-teal-200/80 dark:bg-teal-900/60 text-teal-900 dark:text-teal-200 text-[10px] font-bold flex items-center justify-center">
                                    {idx + 1}
                                  </span>
                                  <span className="pt-0.5">{step}</span>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
