"use client";

import React from "react";
import Link from "next/link";
import {
  MapPin,
  ArrowUpRight,
  Building2,
  Store,
  HeartPulse,
  Siren,
} from "lucide-react";
import { CareReferral } from "@/lib/ai/types";

interface CareReferralCardProps {
  referral: CareReferral;
}

export const CareReferralCard: React.FC<CareReferralCardProps> = ({
  referral,
}) => {
  if (!referral.recommended) return null;

  const searchQuery = referral.searchQuery || "Essential Medicines";
  const inventoryUrl = `/inventory?search=${encodeURIComponent(searchQuery)}`;

  const getIcon = () => {
    switch (referral.facilityType) {
      case "emergency":
        return <Siren className="w-5 h-5 text-red-500 animate-pulse" />;
      case "hospital":
        return <Building2 className="w-5 h-5 text-blue-500" />;
      case "clinic":
        return <HeartPulse className="w-5 h-5 text-emerald-500" />;
      case "pharmacy":
      default:
        return <Store className="w-5 h-5 text-teal-600" />;
    }
  };

  const getBadgeText = () => {
    switch (referral.facilityType) {
      case "emergency":
        return "Emergency Medical Network";
      case "hospital":
        return "Verified Hospital Care";
      case "clinic":
        return "Primary Care Clinic";
      case "pharmacy":
      default:
        return "Verified Pharmacy Partner";
    }
  };

  return (
    <div className="mt-3.5 rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50/70 via-emerald-50/50 to-white p-3.5 sm:p-4 shadow-xs transition-all hover:border-teal-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 text-teal-700 shadow-xs">
            {getIcon()}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block rounded-full bg-teal-100 px-2 py-0.5 text-[11px] font-semibold text-teal-800">
                {getBadgeText()}
              </span>
              <span className="flex items-center text-[11px] font-medium text-slate-500">
                <MapPin className="mr-0.5 h-3 w-3 text-teal-600" />
                Landmark Directions
              </span>
            </div>
            <h4 className="mt-0.5 text-sm font-semibold text-slate-900">
              {searchQuery}
            </h4>
          </div>
        </div>
      </div>

      {referral.reason && (
        <p className="mt-2 text-xs text-slate-600 leading-relaxed">
          {referral.reason}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-teal-100/80 pt-2.5">
        <span className="text-[11px] text-slate-500">
          Check live stock & step-by-step directions
        </span>
        <Link
          href={inventoryUrl}
          className="inline-flex items-center gap-1 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-teal-700 active:scale-95"
        >
          <span>{referral.actionText || "Check Stock on Zelthia"}</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
};
