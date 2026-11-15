"use client";

import React, { useState } from "react";
import { Facility, FacilityType } from "@/lib/inventory-data";
import {
  X,
  Building2,
  MapPin,
  Phone,
  Clock,
  ShieldCheck,
  Plus,
  Trash2,
} from "lucide-react";

interface FacilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFacilityRegistered: (facility: Facility) => void;
}

export function FacilityModal({
  isOpen,
  onClose,
  onFacilityRegistered,
}: FacilityModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<FacilityType>("Community Pharmacy");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [operatingHours, setOperatingHours] = useState(
    "Mon-Sat: 8:00 AM - 9:00 PM",
  );
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Abuja");
  const [state, setState] = useState("FCT");
  const [landmarkDirections, setLandmarkDirections] = useState("");
  const [stepLandmarks, setStepLandmarks] = useState<string[]>([
    "Turn off the main commercial road at the central junction.",
    "Continue 100 meters forward past the recognizable landmark.",
  ]);
  const [emergencyContact, setEmergencyContact] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddStep = () => {
    setStepLandmarks([...stepLandmarks, ""]);
  };

  const handleUpdateStep = (index: number, val: string) => {
    const updated = [...stepLandmarks];
    updated[index] = val;
    setStepLandmarks(updated);
  };

  const handleRemoveStep = (index: number) => {
    if (stepLandmarks.length <= 1) return;
    setStepLandmarks(stepLandmarks.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please provide a facility name.");
      return;
    }
    if (!phone.trim()) {
      setError("Please provide a contact phone number.");
      return;
    }
    if (!landmarkDirections.trim()) {
      setError(
        "Please provide plain-English landmark directions to help patients find your facility.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanSteps = stepLandmarks.filter((s) => s.trim().length > 0);
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register_facility",
          facility: {
            name: name.trim(),
            type,
            licenseNumber: licenseNumber.trim() || "PCN-PENDING",
            phone: phone.trim(),
            email: email.trim() || "info@facility.ng",
            operatingHours: operatingHours.trim(),
            address: address.trim() || `${city}, ${state}`,
            city: city.trim(),
            state: state.trim(),
            landmarkDirections: landmarkDirections.trim(),
            stepByStepLandmarks:
              cleanSteps.length > 0 ? cleanSteps : [landmarkDirections.trim()],
            emergencyContact: emergencyContact.trim() || phone.trim(),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to onboard facility");
      }

      onFacilityRegistered(data.facility);
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
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Register Healthcare Facility
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Onboard your hospital, clinic, or community pharmacy into the
                Zelthia Care Network.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-5 max-h-[75vh] overflow-y-auto"
        >
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Facility Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Lincoln Campus Health Centre or Central Wellness Pharmacy"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Facility Type *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as FacilityType)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="Community Pharmacy">Community Pharmacy</option>
                <option value="Clinic">Clinic / Campus Health Bay</option>
                <option value="Hospital">Hospital / Medical Center</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                License / Registration No. (PCN / MDCN)
              </label>
              <input
                type="text"
                placeholder="e.g. PCN-ABJ-88412 or MDCN-HOSP-7401"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-zinc-500" /> Contact Phone *
              </label>
              <input
                type="tel"
                required
                placeholder="+234 803 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-500" /> Operating Hours
                *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Daily: 8:00 AM - 10:00 PM or 24/7"
                value={operatingHours}
                onChange={(e) => setOperatingHours(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Location details */}
          <div className="space-y-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Physical Address & Landmark
              Guidance
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Street Address
                </label>
                <input
                  type="text"
                  placeholder="Plot 412 University Way, Lincoln Campus"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  City & State
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="text"
                    placeholder="Abuja"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-2.5 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <input
                    type="text"
                    placeholder="FCT"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-2.5 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>

            {/* Plain English Landmark Directions */}
            <div className="space-y-1.5 bg-teal-50/50 dark:bg-teal-950/20 p-3.5 rounded-xl border border-teal-200/70 dark:border-teal-800/50">
              <label className="text-xs font-bold text-teal-900 dark:text-teal-200 flex items-center justify-between">
                <span>Plain-English Landmark Directions *</span>
                <span className="text-[11px] font-normal text-teal-700 dark:text-teal-300">
                  Essential for local navigation
                </span>
              </label>
              <textarea
                rows={2}
                required
                placeholder="e.g. Directly opposite First Bank, 50m past the Total filling station junction, Lincoln University College Campus Gate B ground floor."
                value={landmarkDirections}
                onChange={(e) => setLandmarkDirections(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-teal-200 dark:border-teal-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder:text-zinc-400"
              />
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Describe how a local taxi, student, or first-time patient can
                spot your facility using familiar landmarks rather than just
                street names.
              </p>
            </div>

            {/* Step-by-Step Waypoints */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Step-by-Step Walking / Driving Waypoints
                </label>
                <button
                  type="button"
                  onClick={handleAddStep}
                  className="inline-flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400 hover:underline font-medium"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Step
                </button>
              </div>

              {stepLandmarks.map((step, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="flex-none w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 text-[11px] font-bold text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={step}
                    onChange={(e) => handleUpdateStep(index, e.target.value)}
                    placeholder={`Waypoint step ${index + 1}`}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                  {stepLandmarks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(index)}
                      className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? "Registering..." : "Complete Registration"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
