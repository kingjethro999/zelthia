import type { Metadata } from "next";
import { Suspense } from "react";
import { PricingPlans } from "@/components/marketing/PricingPlans";
import { visitorGeo } from "@/lib/server/geo";
import { price, regionForCountry, type PriceRegion } from "@/lib/pricing";
import { SITE_URL } from "@/lib/utils";

const title = "Pricing";
const description =
  "Zelthia is free for pharmacies, clinics, hospitals and scan centres. Paid plans for extra visibility open later, priced for your country.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/pricing" },
  openGraph: { title: `${title} | Zelthia`, description, url: "/pricing" },
};

function faqsFor(region: PriceRegion) {
  return [
    {
      q: "Do I pay anything today?",
      a: "No. Payments are not switched on yet, so nothing can be charged. Basic listing is free now and stays free.",
    },
    {
      q: "What happens when paid plans open?",
      a: "You choose a plan from your dashboard if you want one. If you do nothing, you stay on Basic listing and keep everything you have today.",
    },
    {
      q: "Can I buy the verified badge?",
      a: "No. The badge appears only after a Zelthia reviewer checks your licence or registration number with your regulator. Paying for Verified Pro does not skip that check, and a facility on Basic can still be verified.",
    },
    {
      q: "How is Diagnostic & Hospital Plus priced?",
      a: `By the number of locations on one account: ${price("plusOneSite", region)} a month for one, ${price("plusTwoSites", region)} for two, and ${price("plusCap", region)} for three or more. It never goes above ${price("plusCap", region)}.`,
    },
    {
      q: "Does Zelthia sell or deliver medicine?",
      a: "No. Zelthia never sells, dispenses or delivers medicine and takes no cut of what you sell. Facilities pay for tools and visibility.",
    },
  ];
}

export default function PricingPage() {
  return (
    <article className="mx-auto w-full max-w-6xl px-4 pb-20 pt-12 sm:px-6 lg:pt-20">
      <header className="max-w-2xl">
        <h1 className="display font-display text-4xl font-semibold text-ink sm:text-5xl">
          Pricing
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-muted">
          Everything a facility uses on Zelthia today is free. Paid plans add
          visibility once payments open. None of them lets anyone skip the
          licence check.
        </p>
      </header>
      <Suspense fallback={<PlansSkeleton />}>
        <LocalPricing />
      </Suspense>
    </article>
  );
}

function PlansSkeleton() {
  return (
    <div className="mt-10 grid gap-4 lg:grid-cols-3" aria-busy>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-96 animate-pulse rounded-3xl bg-mist motion-reduce:animate-none"
        />
      ))}
    </div>
  );
}

/** Prices for the visitor's own country only, from their IP location. */
async function LocalPricing() {
  const geo = await visitorGeo();
  const region = regionForCountry(geo.country);
  const faqs = faqsFor(region);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    url: `${SITE_URL}/pricing`,
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <p className="mt-6 text-sm text-muted">
        Prices for {geo.countryName}, per month.
      </p>
      <div className="mt-6">
        <PricingPlans region={region} />
      </div>
      <section aria-labelledby="pricing-faq" className="mt-20 max-w-3xl">
        <h2 id="pricing-faq" className="text-lg font-semibold text-ink">
          Questions
        </h2>
        <dl className="mt-4 divide-y divide-line border-y border-line">
          {faqs.map((f) => (
            <div key={f.q} className="py-5">
              <dt className="font-medium text-ink">{f.q}</dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-muted">
                {f.a}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
