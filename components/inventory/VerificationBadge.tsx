import { BadgeCheck, Clock, ShieldQuestion } from "lucide-react";
import type { Verification } from "@/lib/inventory-types";
import { cn } from "@/lib/utils";

export function VerificationBadge({
  v,
  className,
}: {
  v: Verification;
  className?: string;
}) {
  const map = {
    verified: {
      icon: BadgeCheck,
      text: "Verified",
      cls: "bg-brand-soft text-brand-strong",
    },
    pending: {
      icon: Clock,
      text: "Verification pending",
      cls: "bg-caution-soft text-caution",
    },
    none: {
      icon: ShieldQuestion,
      text: "Not verified",
      cls: "bg-mist text-muted",
    },
  }[v.status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        map.cls,
        className,
      )}
    >
      <map.icon className="h-3.5 w-3.5" aria-hidden />
      {map.text}
    </span>
  );
}

/** What happened to the licence check, in plain words. */
export function verificationMessage(v: Verification) {
  if (v.status === "verified")
    return "Licence confirmed. Your facility now shows a green verified tick.";
  if (v.status === "pending")
    return "Your listing is live. We couldn't confirm the licence online, so a person will review it within 7 days. Until then it shows without the verified tick.";
  return "Your listing is live. Add a licence or registration number in Details to get the verified tick.";
}
