import Link from "next/link";
import { Check } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { formatPrice, price, type PriceRegion } from "@/lib/pricing";
import { cn } from "@/lib/utils";

interface Feature {
  text: string;
  /** Not built yet. Shown so a plan is honest about what it has today. */
  soon?: boolean;
}

interface Plan {
  name: string;
  price: string;
  per: string;
  blurb: string;
  features: Feature[];
  /** Live sign-up link. Plans without one are not on sale yet. */
  cta?: { href: string; label: string };
  highlight?: boolean;
  children?: React.ReactNode;
}

function PlanCard({ plan }: { plan: Plan }) {
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
      <p className="mt-1 text-sm leading-relaxed text-muted">{plan.blurb}</p>
      <p className="mt-5">
        <span className="title font-display text-3xl font-semibold tabular-nums text-ink">
          {plan.price}
        </span>
        <span className="ml-1.5 text-sm text-muted">{plan.per}</span>
      </p>
      <ul className="mt-5 space-y-2.5 text-sm">
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
      {plan.children}
      <div className="mt-auto pt-6">
        {plan.cta ? (
          <ButtonLink href={plan.cta.href} className="w-full">
            {plan.cta.label}
          </ButtonLink>
        ) : (
          <>
            <Button variant="secondary" disabled className="w-full">
              Coming soon
            </Button>
            <Link
              href="/coming-soon"
              className="mt-2.5 block text-center text-xs font-medium text-muted underline-offset-4 hover:text-ink hover:underline"
            >
              See what’s coming
            </Link>
          </>
        )}
      </div>
    </section>
  );
}

/** How the Diagnostic & Hospital Plus price is worked out. */
function PlusBreakdown({ region }: { region: PriceRegion }) {
  const rows = [
    ["1 location", price("plusOneSite", region)],
    ["2 locations", price("plusTwoSites", region)],
    ["3 or more locations", price("plusCap", region)],
  ];
  return (
    <div className="mt-5 rounded-2xl bg-mist/70 p-4 text-sm">
      <p className="font-medium text-ink">How the price is set</p>
      <p className="mt-1 leading-relaxed text-muted">
        You pay for the number of branches you run under one account. From the
        third branch on, nothing more is added, so a group with ten sites pays
        the same as one with three.
      </p>
      <table className="mt-3 w-full text-left">
        <caption className="sr-only">
          Monthly price by number of locations
        </caption>
        <tbody className="divide-y divide-line">
          {rows.map(([label, amount]) => (
            <tr key={label}>
              <th scope="row" className="py-2 font-normal text-ink">
                {label}
              </th>
              <td className="py-2 text-right font-semibold tabular-nums text-ink">
                {amount}
                <span className="font-normal text-muted"> /month</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PricingPlans({ region }: { region: PriceRegion }) {
  const facilityPlans: Plan[] = [
    {
      name: "Basic listing",
      price: formatPrice(0, region),
      per: "free, for good",
      blurb:
        "For any pharmacy, clinic, hospital, scan centre or health store. This is what every facility uses today.",
      features: [
        { text: "Stock, prices, batches and expiry dates in one dashboard" },
        {
          text: "Scan-to-Stock: check each carton against public medicine registers before it goes on the shelf",
        },
        { text: "A record of every delivery and which supplier brought it" },
        {
          text: "Your stock shows up when patients nearby search or ask the health chat",
        },
        {
          text: "A public page for your facility and a QR sticker for your counter",
        },
      ],
      cta: { href: "/signup?role=provider", label: "List your facility" },
      highlight: true,
    },
    {
      name: "Verified Pro",
      price: price("verifiedPro", region),
      per: "a month",
      blurb:
        "For a facility that wants more patients to find it and trust it before they arrive.",
      features: [
        { text: "Everything in Basic" },
        {
          text: "A green verified badge once a Zelthia reviewer has checked your licence",
        },
        { text: "Your listings shown above unverified ones in search" },
        {
          text: "A printed Verified on Zelthia sticker posted to you",
          soon: true,
        },
        {
          text: "A monthly report of what people near you searched for",
          soon: true,
        },
      ],
    },
    {
      name: "Diagnostic & Hospital Plus",
      price: `From ${price("plusOneSite", region)}`,
      per: "a month",
      blurb:
        "For scan centres, labs and hospitals, including groups with several branches.",
      features: [
        { text: "Everything in Verified Pro, for every branch" },
        { text: "All branches managed from one account" },
        { text: "Patients can request a slot for a scan or test", soon: true },
        { text: "What people search for, broken down by area", soon: true },
      ],
      children: <PlusBreakdown region={region} />,
    },
  ];

  const companion: Plan = {
    name: "Zelthia companion",
    price: price("companion", region),
    per: "a month",
    blurb:
      "Darling, the voice companion, and live chat inside the Zelthia app, for check-ins, reminders and finding care quickly.",
    features: [
      { text: "Comes with the Zelthia mobile app", soon: true },
      {
        text: "Health chat, the doctor’s note reader and medicine search stay free on the web",
      },
    ],
  };

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-3">
        {facilityPlans.map((p) => (
          <PlanCard key={p.name} plan={p} />
        ))}
      </div>
      <h2 className="mt-16 text-lg font-semibold text-ink">For patients</h2>
      <div className="mt-4 max-w-md">
        <PlanCard plan={companion} />
      </div>
    </>
  );
}
