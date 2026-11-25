import type { Metadata } from "next";
import {
  ArrowRight,
  BellRing,
  Building2,
  CalendarClock,
  ChevronDown,
  CircleCheck,
  Layers,
  MapPinned,
  MessageCircleHeart,
  Pill,
  ScanText,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { FAQ_DATA } from "@/components/marketing/faq-data";
import { SITE_URL } from "@/lib/utils";

export const metadata: Metadata = {
  title: {
    absolute: "Zelthia: Inventory for pharmacies, clinics and hospitals, with a health companion",
  },
  description:
    "Pharmacies, clinics and hospitals keep live stock on Zelthia. Patients check what is available before they travel, and a health companion helps with the rest. Free to use, with paid add-ons for verification and extra features.",
  alternates: { canonical: "/" },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Zelthia",
    url: SITE_URL,
    logo: `${SITE_URL}/icons/icon-512.png`,
    slogan: "Know what is in stock before you go",
    description:
      "Inventory for pharmacies, clinics and hospitals in Nigeria. Patients check live stock and landmark directions before they travel, with a health companion for guidance. Free to use, with paid add-ons for verification and extra features.",
    areaServed: { "@type": "Country", name: "Nigeria" },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Zelthia",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/inventory?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Zelthia",
    url: SITE_URL,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "NGN" },
    featureList: [
      "Stock, price, batch and expiry tracking for pharmacies, clinics and hospitals",
      "Low-stock and expiry warnings",
      "Public search so patients see what is in stock nearby",
      "Landmark directions facilities write once",
      "Verified badge for facilities with a confirmed licence number",
      "Health companion that accounts for allergies, conditions and medicines",
      "Reads doctor's notes, prescriptions and results from a photo or PDF",
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_DATA.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  },
];

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <ForFacilities />
      <HowItWorks />
      <Companion />
      <Faq />
      <Closing />
    </>
  );
}

function Hero() {
  return (
    <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-16 lg:pb-24 lg:pt-20">
      <div>
        <h1 className="display font-display text-[2.6rem] font-semibold text-ink sm:text-6xl">
          Keep your stock live. Be found by the patients who need it.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
          Zelthia is inventory for pharmacies, clinics and hospitals. Patients
          see what you have, what it costs and the way in by landmarks, before
          they leave home. A health companion helps them with the rest.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/signup?role=provider" size="lg">
            <Building2 className="h-5 w-5" aria-hidden />
            List your facility
          </ButtonLink>
          <ButtonLink href="/inventory" size="lg" variant="secondary">
            <Pill className="h-5 w-5" aria-hidden />
            Find medicine
          </ButtonLink>
        </div>
        <p className="mt-6 text-sm text-muted">
          Free to use. Paid add-ons for verification and extra features are coming.
        </p>
      </div>

      <StockPreview />
    </section>
  );
}

/** Static illustration of the two sides meeting; no client JS. */
function StockPreview() {
  return (
    <figure
      aria-label="Example of a facility listing and a patient search"
      className="relative rounded-[28px] border border-line bg-surface p-4 sm:p-6"
    >
      <figcaption className="mb-4 text-xs font-medium text-muted">Illustrative example</figcaption>

      <div className="flex items-center gap-2 border-b border-line pb-3 text-sm text-muted">
        <Building2 className="h-4 w-4" aria-hidden />
        A pharmacy updates its stock
      </div>
      <p className="mt-3 text-[15px] text-ink">
        Paracetamol 500mg: 120 in stock, low-stock level set to 20
      </p>

      <div className="mt-6 flex items-center gap-2 border-b border-line pb-3 text-sm text-muted">
        <UserRound className="h-4 w-4" aria-hidden />
        A patient searches nearby
      </div>
      <ul className="mt-3 space-y-3 text-sm">
        <li className="flex items-start gap-2 text-ink">
          <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden />
          Sees which facilities list it, the price and closing time
        </li>
        <li className="flex items-start gap-2 text-ink">
          <MapPinned className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden />
          Follows landmark directions and calls ahead
        </li>
        <li className="flex items-start gap-2 text-ink">
          <MessageCircleHeart className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden />
          Asks the health companion if it is safe with their allergies
        </li>
      </ul>
    </figure>
  );
}

const STEPS = [
  {
    icon: Building2,
    title: "Facilities list their stock",
    body: "Pharmacies, clinics and hospitals add products with price, quantity, batch and expiry, and write directions once.",
  },
  {
    icon: Pill,
    title: "Patients search before they travel",
    body: "They see which nearby facility has it, what it costs and when it closes. No more walking from pharmacy to pharmacy.",
  },
  {
    icon: MessageCircleHeart,
    title: "The health companion fills the gaps",
    body: "Ask about a symptom or a medicine, or photograph a doctor's note. Answers account for your profile and say plainly when you need a doctor.",
  },
];

function HowItWorks() {
  return (
    <section className="border-y border-line bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <h2 className="max-w-2xl title font-display text-3xl font-semibold text-ink sm:text-4xl">
          From the shelf to the patient.
        </h2>
        <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <li key={title} className="relative">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-soft text-brand">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="font-display text-sm font-semibold text-muted">
                  Step {i + 1}
                </span>
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold text-ink">{title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const FACILITY_FEATURES = [
  { icon: Layers, title: "Stock, price and batch", body: "Track quantity, price and batch for every product, per facility." },
  { icon: CalendarClock, title: "Expiry warnings", body: "See batches expiring in the next 90 days before they go to waste." },
  { icon: BellRing, title: "Low-stock warnings", body: "Set a level for each product and see what is running low." },
  { icon: MapPinned, title: "Directions patients follow", body: "Describe the way in once; it appears on every search result." },
  { icon: ShieldCheck, title: "Verified badge", body: "Facilities with a confirmed licence or registration number are marked verified." },
  { icon: Pill, title: "Found in search", body: "Your listed stock shows when someone nearby searches for it." },
];

function ForFacilities() {
  return (
    <section className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16 lg:py-24">
      <div>
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-sky-soft text-sky">
          <Building2 className="h-5 w-5" aria-hidden />
        </span>
        <h2 className="mt-5 title font-display text-3xl font-semibold text-ink sm:text-4xl">
          Inventory for pharmacies, clinics and hospitals.
        </h2>
        <p className="mt-4 max-w-lg text-lg leading-relaxed text-muted">
          Keep stock accurate in one place, and every update shows up when
          someone nearby searches for it. Free to use. Paid add-ons for verified
          listings are planned.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/signup?role=provider" size="lg">
            List your facility
            <ArrowRight className="h-5 w-5" aria-hidden />
          </ButtonLink>
          <ButtonLink href="/for-facilities" size="lg" variant="secondary">
            See the inventory tools
          </ButtonLink>
        </div>
      </div>
      <ul className="grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2">
        {FACILITY_FEATURES.map(({ icon: Icon, title, body }) => (
          <li key={title} className="bg-surface p-6">
            <Icon className="h-5 w-5 text-sky" aria-hidden />
            <h3 className="mt-4 text-base font-semibold text-ink">{title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Companion() {
  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:py-24">
      <div>
        <h2 className="title font-display text-3xl font-semibold text-ink sm:text-4xl">
          A health companion for the patient side.
        </h2>
        <p className="mt-4 max-w-md text-lg leading-relaxed text-muted">
          It gives guidance, not a diagnosis, and it does not replace a doctor.
        </p>
        <div className="mt-8">
          <ButtonLink href="/chat" size="lg" variant="secondary">
            <MessageCircleHeart className="h-5 w-5" aria-hidden />
            Try the health chat
          </ButtonLink>
        </div>
      </div>
      <ul className="divide-y divide-line border-y border-line">
        <li className="flex gap-4 py-5">
          <UserRound className="mt-1 h-5 w-5 shrink-0 text-brand" aria-hidden />
          <p className="leading-relaxed text-muted">
            <span className="font-semibold text-ink">Knows your profile. </span>
            Allergies, conditions and regular medicines are used to flag reactions. Every field is optional.
          </p>
        </li>
        <li className="flex gap-4 py-5">
          <ScanText className="mt-1 h-5 w-5 shrink-0 text-brand" aria-hidden />
          <p className="leading-relaxed text-muted">
            <span className="font-semibold text-ink">Reads doctor&apos;s notes. </span>
            Upload a photo of a note, prescription or result and get it explained in plain language.
          </p>
        </li>
        <li className="flex gap-4 py-5">
          <MapPinned className="mt-1 h-5 w-5 shrink-0 text-brand" aria-hidden />
          <p className="leading-relaxed text-muted">
            <span className="font-semibold text-ink">Sends you to real stock. </span>
            It checks what facilities have listed first, and labels web results as unverified.
          </p>
        </li>
      </ul>
    </section>
  );
}

function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:py-24">
        <h2 className="title font-display text-3xl font-semibold text-ink sm:text-4xl">
          Questions people ask
        </h2>
        <div className="divide-y divide-line border-y border-line">
          {FAQ_DATA.map((f) => (
            <details key={f.question} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left font-semibold text-ink [&::-webkit-details-marker]:hidden">
                {f.question}
                <ChevronDown
                  className="h-5 w-5 shrink-0 text-muted transition-transform group-open:rotate-180"
                  aria-hidden
                />
              </summary>
              <p className="pb-5 pr-8 leading-relaxed text-muted">{f.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Closing() {
  return (
    <section className="bg-[#0d3b35] text-white">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-8 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:py-20">
        <div className="max-w-xl">
          <h2 className="title font-display text-3xl font-semibold sm:text-4xl">
            Put your stock where patients are looking.
          </h2>
          <p className="mt-3 text-lg text-white/75">
            Listing takes a few minutes and is free.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/signup?role=provider" size="lg" className="bg-white text-[#0d3b35] hover:bg-[#dcefe6] dark:text-[#0d3b35]">
            List your facility
          </ButtonLink>
          <ButtonLink href="/inventory" size="lg" variant="ghost" className="text-white hover:bg-white/10">
            Find medicine
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
