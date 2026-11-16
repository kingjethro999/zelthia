"use client";
import { Select } from "@/components/ui/Select";
import { Hospital, Stethoscope, Store } from "lucide-react";

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
      <div className="relative w-full max-w-2xl bg-surface rounded-2xl shadow-2xl border border-line overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-line bg-mist">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-soft text-brand border border-brand/25">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-ink">
                Register Healthcare Facility
              </h2>
              <p className="text-xs text-muted">
                Onboard your hospital, clinic, or community pharmacy into the
                Zelthia Care Network.
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
              <label htmlFor="facility-modal-f1" className="text-xs font-semibold text-ink">
                Facility Name *
              </label>
              <input
                id="facility-modal-f1"
                type="text"
                required
                placeholder="e.g. Lincoln Campus Health Centre or Central Wellness Pharmacy"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-line bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
            </div>

            <div className="space-y-1.5">
              <Select<FacilityType>
                label="Facility type"
                                value={type}
                onChange={setType}
                options={[
                  { value: "Community Pharmacy", label: "Community pharmacy", icon: Store },
                  { value: "Clinic", label: "Clinic or campus health centre", icon: Stethoscope },
                  { value: "Hospital", label: "Hospital or medical centre", icon: Hospital },
                ]}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="facility-modal-f2" className="text-xs font-semibold text-ink flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-brand" />
                License / Registration No. (PCN / MDCN)
              </label>
              <input
                id="facility-modal-f2"
                type="text"
                placeholder="e.g. PCN-ABJ-88412 or MDCN-HOSP-7401"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-line bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="facility-modal-f3" className="text-xs font-semibold text-ink flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-muted" /> Contact Phone *
              </label>
              <input
                id="facility-modal-f3"
                type="tel"
                required
                placeholder="+234 803 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-line bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="facility-modal-f4" className="text-xs font-semibold text-ink flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-muted" /> Operating Hours
                *
              </label>
              <input
                id="facility-modal-f4"
                type="text"
                required
                placeholder="e.g. Daily: 8:00 AM - 10:00 PM or 24/7"
                value={operatingHours}
                onChange={(e) => setOperatingHours(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-line bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="facility-modal-f5" className="text-xs font-semibold text-ink">
                Official Email Address
              </label>
              <input
                id="facility-modal-f5"
                type="email"
                placeholder="dispensary@facility.ng"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-line bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="facility-modal-f6" className="text-xs font-semibold text-ink">
                24/7 Emergency Line
              </label>
              <input
                id="facility-modal-f6"
                type="tel"
                placeholder="+234 809 111 4455"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-line bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
            </div>
          </div>

          {/* Location details */}
          <div className="space-y-3 pt-2 border-t border-line">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Physical Address & Landmark
              Guidance
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2 space-y-1.5">
                <label htmlFor="facility-modal-f7" className="text-xs font-semibold text-ink">
                  Street Address
                </label>
                <input
                id="facility-modal-f7"
                  type="text"
                  placeholder="Plot 412 University Way, Lincoln Campus"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-line bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-brand/30"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="facility-modal-f8" className="text-xs font-semibold text-ink">
                  City & State
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                id="facility-modal-f8"
                    type="text"
                    aria-label="City"
                    placeholder="Abuja"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-2.5 py-2 text-sm rounded-lg border border-line bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-brand/30"
                  />
                  <input
                    type="text"
                    aria-label="State"
                    placeholder="FCT"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-2.5 py-2 text-sm rounded-lg border border-line bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-brand/30"
                  />
                </div>
              </div>
            </div>

            {/* Plain English Landmark Directions */}
            <div className="space-y-1.5 bg-brand-soft p-3.5 rounded-xl border border-teal-200/70 dark:border-teal-800/50">
              <label htmlFor="facility-modal-f9" className="text-xs font-bold text-teal-900 dark:text-teal-200 flex items-center justify-between">
                <span>Plain-English Landmark Directions *</span>
                <span className="text-[11px] font-normal text-brand-strong">
                  Essential for local navigation
                </span>
              </label>
              <textarea
                id="facility-modal-f9"
                rows={2}
                required
                placeholder="e.g. Directly opposite First Bank, 50m past the Total filling station junction, Lincoln University College Campus Gate B ground floor."
                value={landmarkDirections}
                onChange={(e) => setLandmarkDirections(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-brand/25 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-brand/30 placeholder:text-muted"
              />
              <p className="text-[11px] text-muted">
                Describe how a local taxi, student, or first-time patient can
                spot your facility using familiar landmarks rather than just
                street names.
              </p>
            </div>

            {/* Step-by-Step Waypoints */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-ink">
                  Step-by-Step Walking / Driving Waypoints
                </label>
                <button
                  type="button"
                  onClick={handleAddStep}
                  className="inline-flex items-center gap-1 text-xs text-brand hover:underline font-medium"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Step
                </button>
              </div>

              {stepLandmarks.map((step, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="flex-none w-6 h-6 rounded-full bg-mist text-[11px] font-bold text-ink flex items-center justify-center">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    aria-label={`Direction step ${index + 1}`}
                    value={step}
                    onChange={(e) => handleUpdateStep(index, e.target.value)}
                    placeholder={`Waypoint step ${index + 1}`}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-line bg-surface text-ink focus:outline-none focus:ring-1 focus:ring-brand/30"
                  />
                  {stepLandmarks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(index)}
                      className="p-1.5 text-muted hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
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
              {isSubmitting ? "Registering..." : "Complete Registration"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
