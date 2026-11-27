"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { ChoiceGroup } from "@/components/ui/Choice";
import Link from "next/link";
import { Button, ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type Region = "ng" | "intl";

interface Feature {
  text: string;
  /** Not built yet; shown so the plan is honest about what it includes today. */
  soon?: boolean;
}

interface Plan {
  name: string;
  price: Record<Region, string>;
  per: string;
  blurb: string;
  features: Feature[];
  /** Live sign-up link. Plans without one are not on sale yet. */
  cta?: { href: string; label: string };
  highlight?: boolean;
}

/**
 * Purchasing-power pricing: Nigeria pays in naira at local rates, everywhere
 * else pays the same number in US dollars (₦15,000 / $15).
 */
const FACILITY_PLANS: Plan[] = [
  {
    name: "Basic listing",
    price: { ng: "₦0", intl: "$0" },
    per: "forever",
    blurb: "Everything a facility needs to get found and keep stock right.",
    features: [
      { text: "Inventory dashboard with stock, prices, batches and expiry" },
      {
        text: "Scan-to-Stock checks against NAFDAC, US FDA and other registries",
      },
      { text: "Supplier intake history and red-flag warnings" },
      { text: "Listed in patient search and health chat answers" },
      { text: "Public facility page with a QR counter sticker" },
    ],
    cta: { href: "/signup?role=provider", label: "List your facility" },
    highlight: true,
  },
  {
    name: "Verified Pro",
    price: { ng: "₦15,000", intl: "$15" },
    per: "per month",
    blurb:
      "For pharmacies and clinics that want more patients through the door.",
    features: [
      { text: "Everything in Basic" },
      {
        text: "Verified badge after a Zelthia administrator reviews your licence",
      },
      { text: "Verified facilities ranked first in search results" },
      { text: "Printed “Verified on Zelthia” counter sticker" },
      { text: "Search engine indexing of your public page" },
      {
        text: "Monthly report of what nearby patients searched for",
        soon: true,
      },
    ],
    highlight: true,
  },
  {
    name: "Diagnostic & Hospital Plus",
    price: { ng: "₦50,000 – ₦100,000", intl: "$50 – $100" },
    per: "per month, by size",
    blurb: "For scan centres, labs and hospitals with several branches.",
    features: [
      { text: "Everything in Verified Pro" },
      { text: "Several branches under one account" },
      { text: "Scan and test booking requests from patients", soon: true },
      { text: "Search-demand analytics by area", soon: true },
      { text: "Priority placement in health chat answers", soon: true },
    ],
  },
];

const COMPANION: Plan = {
  name: "Zelthia companion",
  price: { ng: "₦3,000", intl: "$5" },
  per: "per month",
  blurb:
    "Darling, the voice companion, and in-app live chat for check-ins, reminders and quick facility lookups.",
  features: [
    { text: "Arrives with the Zelthia mobile app", soon: true },
    {
      text: "Health chat, doctor's note reader and search stay free on the web",
    },
  ],
};

function PlanCard({ plan, region }: { plan: Plan; region: Region }) {
  return (
    <section
      aria-labelledby={`plan-${plan.name}`}
      className={cn(
        "flex flex-col rounded-3xl border bg-surface p-6",
        plan.highlight
          ? "border-brand shadow-[0_0_0_1px_var(--brand)]"
          : "border-line",
      )}
    >
      <h3 id={`plan-${plan.name}`} className="text-base font-semibold text-ink">
        {plan.name}
      </h3>
      <p className="mt-1 text-sm text-muted">{plan.blurb}</p>
      <p className="mt-5">
        <span className="title font-display text-3xl font-semibold tabular-nums text-ink">
          {plan.price[region]}
        </span>
        <span className="ml-1.5 text-sm text-muted">{plan.per}</span>
      </p>
      <ul className="mt-5 flex-1 space-y-2.5 text-sm">
        {plan.features.map((f) => (
          <li key={f.text} className="flex gap-2">
            <Check
              className={cn(
                "mt-0.5 h-4 w-4 shrink-0",
                f.soon ? "text-muted" : "text-brand",
              )}
              aria-hidden
            />
            <span className={f.soon ? "text-muted" : "text-ink"}>
              {f.text}
              {f.soon && (
                <span className="ml-1.5 rounded-full bg-mist px-1.5 py-0.5 text-[11px] font-medium text-muted">
                  Coming soon
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
      {plan.cta ? (
        <ButtonLink href={plan.cta.href} className="mt-6">
          {plan.cta.label}
        </ButtonLink>
      ) : (
        <div className="mt-6">
          <Button variant="secondary" disabled className="w-full">
            Coming soon
          </Button>
          <Link
            href="/coming-soon"
            className="mt-2.5 block text-center text-xs font-medium text-muted underline-offset-4 hover:text-ink hover:underline"
          >
            See what’s coming
          </Link>
        </div>
      )}
    </section>
  );
}

export function PricingPlans() {
  const [region, setRegion] = useState<Region>("ng");
  return (
    <>
      <ChoiceGroup<Region>
        label="Show prices for"
        variant="pills"
        value={region}
        onChange={setRegion}
        options={[
          { value: "ng", label: "Nigeria (₦)" },
          { value: "intl", label: "Other countries ($)" },
        ]}
      />
      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {FACILITY_PLANS.map((p) => (
          <PlanCard key={p.name} plan={p} region={region} />
        ))}
      </div>
      <h2 className="mt-16 text-lg font-semibold text-ink">For patients</h2>
      <div className="mt-4 max-w-md">
        <PlanCard plan={COMPANION} region={region} />
      </div>
    </>
  );
}
