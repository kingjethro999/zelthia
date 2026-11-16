import Link from "next/link";
import { ArrowUpRight, Building2, HeartPulse, Siren, Store } from "lucide-react";
import type { CareReferral } from "@/lib/ai/types";
import { cn } from "@/lib/utils";

const KIND = {
  emergency: { icon: Siren, label: "Emergency care", tone: "text-alert bg-alert-soft" },
  hospital: { icon: Building2, label: "Hospital", tone: "text-sky bg-sky-soft" },
  clinic: { icon: HeartPulse, label: "Clinic", tone: "text-brand bg-brand-soft" },
  pharmacy: { icon: Store, label: "Pharmacy", tone: "text-brand bg-brand-soft" },
};

export function CareReferralCard({ referral }: { referral: CareReferral }) {
  if (!referral.recommended) return null;
  const kind = KIND[referral.facilityType ?? "pharmacy"];
  const query = referral.searchQuery || "Essential medicines";
  const Icon = kind.icon;

  return (
    <div className="mt-3 rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-start gap-3">
        <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", kind.tone)}>
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted">{kind.label} near you</p>
          <p className="font-semibold text-ink">{query}</p>
          {referral.reason && <p className="mt-1 text-sm text-muted">{referral.reason}</p>}
        </div>
      </div>
      <Link
        href={`/inventory?search=${encodeURIComponent(query)}`}
        className="mt-3 inline-flex h-10 items-center gap-1.5 rounded-xl bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-strong dark:text-[#06231a]"
      >
        {referral.actionText || "Check stock nearby"}
        <ArrowUpRight className="h-4 w-4" aria-hidden />
      </Link>
    </div>
  );
}
