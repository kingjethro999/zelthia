"use client";

import React from "react";
import {
  ShieldCheck,
  ShieldAlert,
  SlidersHorizontal,
} from "lucide-react";
import { BiometricProfile, hasActiveBiometrics } from "@/lib/ai/types";

interface BiometricsBannerProps {
  profile: BiometricProfile;
  onOpenDrawer: () => void;
  onClearProfile?: () => void;
}

export const BiometricsBanner: React.FC<BiometricsBannerProps> = ({
  profile,
  onOpenDrawer,
}) => {
  const isActive = hasActiveBiometrics(profile);

  if (isActive) {
    const summaryChips: string[] = [];
    if (profile.age) summaryChips.push(`${profile.age} yrs`);
    if (
      profile.biologicalSex &&
      profile.biologicalSex !== "prefer-not-to-say"
    ) {
      summaryChips.push(profile.biologicalSex);
    }
    if (profile.bloodGroup && profile.bloodGroup !== "Unknown") {
      summaryChips.push(`Blood: ${profile.bloodGroup}`);
    }
    if (profile.allergies && profile.allergies.length > 0) {
      summaryChips.push(
        `Allergies (${profile.allergies.length}): ${profile.allergies.slice(0, 2).join(", ")}${profile.allergies.length > 2 ? "..." : ""}`,
      );
    }
    if (profile.chronicConditions && profile.chronicConditions.length > 0) {
      summaryChips.push(
        `Conditions: ${profile.chronicConditions.slice(0, 2).join(", ")}${profile.chronicConditions.length > 2 ? "..." : ""}`,
      );
    }
    if (profile.currentMedications && profile.currentMedications.length > 0) {
      summaryChips.push(`Meds: ${profile.currentMedications.length} active`);
    }

    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 rounded-xl border border-teal-200/80 bg-gradient-to-r from-teal-50 via-emerald-50/70 to-teal-50/40 p-2.5 sm:px-4 sm:py-2.5 text-xs text-teal-950 shadow-xs dark:border-teal-800/40 dark:from-teal-950/40 dark:to-slate-900 dark:text-teal-200">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 font-semibold text-teal-800 dark:text-teal-300">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-teal-500"></span>
              </span>
              <ShieldCheck className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              Biometric Context Active
            </span>

            <div className="flex items-center gap-1.5 flex-wrap">
              {summaryChips.map((chip, idx) => (
                <span
                  key={idx}
                  className="rounded-md bg-white/80 px-2 py-0.5 text-[11px] font-medium text-teal-900 border border-teal-200/60 dark:bg-slate-800/80 dark:border-teal-700/50 dark:text-teal-200"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={onOpenDrawer}
            className="inline-flex items-center gap-1 shrink-0 rounded-lg bg-teal-600/10 px-2.5 py-1 text-[11px] font-semibold text-teal-800 transition-colors hover:bg-teal-600/20 dark:bg-teal-400/10 dark:text-teal-300 dark:hover:bg-teal-400/20"
          >
            <SlidersHorizontal className="h-3 w-3" />
            Edit Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-2">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-blue-200/80 bg-gradient-to-r from-blue-50/70 via-sky-50/40 to-white p-3 text-xs text-slate-700 shadow-xs dark:border-blue-900/40 dark:from-slate-900 dark:to-blue-950/30 dark:text-slate-300">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div>
            <p className="font-medium text-slate-800 dark:text-white">
              Personalize Diagnostic Safety with Biometrics
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Add allergies, chronic conditions, and current medications so
              Zelthia AI can check contraindications in real time.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenDrawer}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-blue-700 active:scale-95"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Set Up Biometrics
        </button>
      </div>
    </div>
  );
};
