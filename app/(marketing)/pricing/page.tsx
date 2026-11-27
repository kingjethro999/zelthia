import type { Metadata } from "next";
import { PricingPlans } from "@/components/marketing/PricingPlans";
import { SITE_URL } from "@/lib/utils";

const title = "Pricing";
const description =
  "Zelthia is free for pharmacies, clinics, hospitals and scan centres. Paid plans are coming: Verified Pro will be ₦15,000 a month in Nigeria and $15 elsewhere.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/pricing" },
  openGraph: { title: `${title} | Zelthia`, description, url: "/pricing" },
};

const faqs = [
  {
    q: "Do I pay anything today?",
    a: "No. Payments are not live yet, so nothing can be charged. Basic listing is free now and stays free. Paid plans will only apply to facilities that choose them once payments open.",
  },
  {
    q: "Why are prices lower in Nigeria?",
    a: "Prices follow local purchasing power. Facilities in Nigeria pay in naira at local rates; everywhere else pays the same figure in US dollars, so ₦15,000 becomes $15.",
  },
  {
    q: "Does Zelthia sell or deliver medicine?",
    a: "No. Zelthia never sells, dispenses or delivers medicine. Facilities pay for visibility and tools, not for sales.",
  },
  {
    q: "Is the verified badge something I can buy?",
    a: "No. The badge appears only after a Zelthia administrator reviews your licence or registration number. Paying for Verified Pro does not skip that review.",
  },
];

export default function PricingPage() {
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
    <article className="mx-auto w-full max-w-6xl px-4 pb-20 pt-12 sm:px-6 lg:pt-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <header className="max-w-2xl">
        <h1 className="display font-display text-4xl font-semibold text-ink sm:text-5xl">
          Pricing
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-muted">
          Almost everything on Zelthia is free today. Paid plans open once
          payments go live, and they add visibility, never a shortcut past
          licence review.
        </p>
      </header>
      <div className="mt-10">
        <PricingPlans />
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
    </article>
  );
}
