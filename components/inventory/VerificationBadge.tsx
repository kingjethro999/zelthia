import { BadgeCheck, Clock, ShieldQuestion, XCircle } from "lucide-react";
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
      text: "Pending admin review",
      cls: "bg-caution-soft text-caution",
    },
    rejected: {
      icon: XCircle,
      text: "Verification declined",
      cls: "bg-alert-soft text-alert",
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
    return "Licence confirmed by a Zelthia administrator. Your facility now shows a green verified tick.";
  if (v.status === "pending")
    return "Your listing is live. Your licence has been submitted to a Zelthia administrator for manual review before the verified tick is shown.";
  if (v.status === "rejected")
    return v.note
      ? `Verification was declined: ${v.note} Update your licence details in Details to submit for review again.`
      : "Verification was declined. Check and update your licence number in Details to submit for review again.";
  return "Your listing is live. Add a licence or registration number in Details to request admin verification.";
}
