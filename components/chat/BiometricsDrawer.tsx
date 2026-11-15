"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Shield,
  HeartPulse,
  AlertTriangle,
  Pill,
  Activity,
  Plus,
  Trash2,
  CheckCircle2,
  Info,
} from "lucide-react";
import { BiometricProfile, BiologicalSex, BloodGroup } from "@/lib/ai/types";

interface BiometricsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profile: BiometricProfile;
  onSave: (updated: BiometricProfile) => void;
}

const ALLERGY_PRESETS = [
  "Penicillin",
  "Sulfa Drugs",
  "Aspirin / NSAIDs",
  "Peanuts",
  "Latex",
  "Codeine",
];

const CONDITION_PRESETS = [
  "Hypertension",
  "Asthma",
  "Type 2 Diabetes",
  "Sickle Cell Disease",
  "Peptic Ulcer Disease",
  "Migraines",
];

const MEDICATION_PRESETS = [
  "Lisinopril",
  "Metformin",
  "Salbutamol Inhaler",
  "Amlodipine",
  "Omeprazole",
  "Hydrochlorothiazide",
];

export const BiometricsDrawer: React.FC<BiometricsDrawerProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
}) => {
  const [formData, setFormData] = useState<BiometricProfile>(profile);
  const [allergyInput, setAllergyInput] = useState("");
  const [conditionInput, setConditionInput] = useState("");
  const [medicationInput, setMedicationInput] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setFormData(profile);
  }, [profile, isOpen]);

  if (!isOpen) return null;

  const handleAddAllergy = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    const current = formData.allergies || [];
    if (!current.includes(trimmed)) {
      setFormData({ ...formData, allergies: [...current, trimmed] });
    }
    setAllergyInput("");
  };

  const handleRemoveAllergy = (tag: string) => {
    setFormData({
      ...formData,
      allergies: (formData.allergies || []).filter((a) => a !== tag),
    });
  };

  const handleAddCondition = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    const current = formData.chronicConditions || [];
    if (!current.includes(trimmed)) {
      setFormData({ ...formData, chronicConditions: [...current, trimmed] });
    }
    setConditionInput("");
  };

  const handleRemoveCondition = (tag: string) => {
    setFormData({
      ...formData,
      chronicConditions: (formData.chronicConditions || []).filter(
        (c) => c !== tag,
      ),
    });
  };

  const handleAddMedication = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    const current = formData.currentMedications || [];
    if (!current.includes(trimmed)) {
      setFormData({ ...formData, currentMedications: [...current, trimmed] });
    }
    setMedicationInput("");
  };

  const handleRemoveMedication = (tag: string) => {
    setFormData({
      ...formData,
      currentMedications: (formData.currentMedications || []).filter(
        (m) => m !== tag,
      ),
    });
  };

  const handleSave = () => {
    onSave(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 600);
  };

  const handleClear = () => {
    const empty: BiometricProfile = {
      age: "",
      biologicalSex: "",
      bloodGroup: "",
      allergies: [],
      chronicConditions: [],
      currentMedications: [],
      notes: "",
    };
    setFormData(empty);
    onSave(empty);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs transition-opacity animate-fade-in">
      {/* Backdrop click area */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer Container */}
      <div className="relative flex h-full w-full max-w-lg flex-col bg-white shadow-2xl transition-transform duration-300 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:bg-teal-400/10 dark:text-teal-400">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Biometric Health Profile
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Powers contraindication alerts & personalized triage
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Close biometrics drawer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Privacy Alert */}
          <div className="flex items-start gap-2.5 rounded-xl border border-teal-100 bg-teal-50/60 p-3 text-xs text-teal-900 dark:border-teal-900/50 dark:bg-teal-950/30 dark:text-teal-200">
            <Info className="h-4 w-4 shrink-0 text-teal-600 mt-0.5" />
            <p>
              Your health profile is stored in your local browser and used in
              real time to screen for medication contraindications and emergency
              risks.
            </p>
          </div>

          {/* Demographics: Age & Biological Sex & Blood Group */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
              <HeartPulse className="h-3.5 w-3.5 text-teal-600" />
              Core Demographics
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  min="0"
                  max="125"
                  value={formData.age || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, age: e.target.value })
                  }
                  placeholder="e.g. 29"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Biological Sex
                </label>
                <select
                  value={formData.biologicalSex || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      biologicalSex: e.target.value as BiologicalSex,
                    })
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="">Select...</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="intersex">Intersex</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Blood Group
                </label>
                <select
                  value={formData.bloodGroup || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bloodGroup: e.target.value as BloodGroup,
                    })
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="">Select...</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>
            </div>
          </div>

          {/* Allergies */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                Allergies & Drug Sensitivities
              </h3>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                Strict Contraindication Check
              </span>
            </div>

            {/* Active Allergies Chips */}
            <div className="flex flex-wrap gap-1.5 min-h-8 mb-2 p-2 rounded-lg bg-slate-50 border border-slate-100 dark:bg-slate-800/60 dark:border-slate-800">
              {(!formData.allergies || formData.allergies.length === 0) && (
                <span className="text-xs text-slate-400 italic">
                  No allergies recorded yet
                </span>
              )}
              {(formData.allergies || []).map((allergy) => (
                <span
                  key={allergy}
                  className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-900 dark:bg-amber-950/50 dark:text-amber-200"
                >
                  {allergy}
                  <button
                    onClick={() => handleRemoveAllergy(allergy)}
                    className="hover:text-amber-700 dark:hover:text-amber-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Input to add allergy */}
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={allergyInput}
                onChange={(e) => setAllergyInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddAllergy(allergyInput);
                  }
                }}
                placeholder="Type allergy (e.g. Penicillin, Peanuts)..."
                className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <button
                type="button"
                onClick={() => handleAddAllergy(allergyInput)}
                className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </button>
            </div>

            {/* Preset quick buttons */}
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-[10px] text-slate-400">Quick add:</span>
              {ALLERGY_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleAddAllergy(preset)}
                  className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-600 hover:border-amber-400 hover:text-amber-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  + {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Chronic Conditions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-teal-600" />
                Chronic Conditions
              </h3>
            </div>

            <div className="flex flex-wrap gap-1.5 min-h-8 mb-2 p-2 rounded-lg bg-slate-50 border border-slate-100 dark:bg-slate-800/60 dark:border-slate-800">
              {(!formData.chronicConditions ||
                formData.chronicConditions.length === 0) && (
                <span className="text-xs text-slate-400 italic">
                  No chronic conditions listed
                </span>
              )}
              {(formData.chronicConditions || []).map((cond) => (
                <span
                  key={cond}
                  className="inline-flex items-center gap-1 rounded-md bg-teal-100 px-2.5 py-1 text-xs font-medium text-teal-900 dark:bg-teal-950/50 dark:text-teal-200"
                >
                  {cond}
                  <button
                    onClick={() => handleRemoveCondition(cond)}
                    className="hover:text-teal-700 dark:hover:text-teal-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={conditionInput}
                onChange={(e) => setConditionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCondition(conditionInput);
                  }
                }}
                placeholder="Type condition (e.g. Asthma, Hypertension)..."
                className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <button
                type="button"
                onClick={() => handleAddCondition(conditionInput)}
                className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1">
              <span className="text-[10px] text-slate-400">Quick add:</span>
              {CONDITION_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleAddCondition(preset)}
                  className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-600 hover:border-teal-400 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  + {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Current Medications */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Pill className="h-3.5 w-3.5 text-blue-500" />
                Current Medications
              </h3>
              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                Drug-Drug Interaction Check
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 min-h-8 mb-2 p-2 rounded-lg bg-slate-50 border border-slate-100 dark:bg-slate-800/60 dark:border-slate-800">
              {(!formData.currentMedications ||
                formData.currentMedications.length === 0) && (
                <span className="text-xs text-slate-400 italic">
                  No regular medications listed
                </span>
              )}
              {(formData.currentMedications || []).map((med) => (
                <span
                  key={med}
                  className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-900 dark:bg-blue-950/50 dark:text-blue-200"
                >
                  {med}
                  <button
                    onClick={() => handleRemoveMedication(med)}
                    className="hover:text-blue-700 dark:hover:text-blue-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={medicationInput}
                onChange={(e) => setMedicationInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddMedication(medicationInput);
                  }
                }}
                placeholder="Type medication (e.g. Metformin 500mg)..."
                className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <button
                type="button"
                onClick={() => handleAddMedication(medicationInput)}
                className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1">
              <span className="text-[10px] text-slate-400">Quick add:</span>
              {MEDICATION_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleAddMedication(preset)}
                  className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-600 hover:border-blue-400 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  + {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Notes / Special considerations */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Special Notes (Pregnancy, Nursing, Recent Surgeries)
            </label>
            <textarea
              rows={2}
              value={formData.notes || ""}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="e.g. Currently in second trimester, or recent gallbladder surgery..."
              className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-100 p-4 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-red-600 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Reset All
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-teal-700 active:scale-95"
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                  Saved!
                </>
              ) : (
                "Save Profile"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
