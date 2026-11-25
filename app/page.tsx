import type { Metadata } from "next";
import {
  ArrowRight,
  BellRing,
  Building2,
  CalendarClock,
  ChevronDown,
  Layers,
  MapPinned,
  MessageCircleHeart,
  Pill,
  UserRound,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { FAQ_DATA } from "@/components/marketing/faq-data";
import { SITE_URL } from "@/lib/utils";
import { HeroDemo, Orbs, Reveal } from "@/components/marketing/Motion";

export const metadata: Metadata = {
  title: {
    absolute: "Zelthia: Health Companion & Inventory",
  },
  alternates: { canonical: "/" },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Zelthia",
    url: SITE_URL,
    logo: `${SITE_URL}/icons/icon-512.png`,
    slogan: "Your health and care companion",
    description:
      "A free health and care companion for Nigeria: AI health chat, doctor's note reader, medicine and health product search, and inventory tools for facilities.",
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
    applicationCategory: "HealthApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "NGN" },
    featureList: [
      "AI health guidance that accounts for allergies, conditions and medicines",
      "Reads doctor's notes, prescriptions and results from a photo or PDF",
      "Finds where to get a medicine, health product, test or scan, with sources",
      "Stock, prices and landmark directions listed by pharmacies, clinics and hospitals",
      "Free inventory management for health facilities",
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
      <HowItWorks />
      <ForFacilities />
      <Faq />
      <Closing />
    </>
  );
}

function Hero() {
  return (
    <div className="relative isolate overflow-hidden">
    <Orbs />
    <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-16 lg:pb-24 lg:pt-20">
      <div>
        <h1 className="animate-rise display font-display text-[2.6rem] font-semibold text-ink sm:text-6xl">
          Know what&apos;s safe to take, and where to get it.
        </h1>
        <p className="animate-rise mt-6 max-w-xl text-lg leading-relaxed text-muted" style={{ animationDelay: "90ms" }}>
          Zelthia answers health questions with your allergies, conditions and
          medicines in mind, then shows which pharmacy, clinic or hospital near
          you has it in stock.
        </p>
        <div className="animate-rise mt-8 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: "180ms" }}>
          <ButtonLink href="/chat" size="lg">
            <MessageCircleHeart className="h-5 w-5" aria-hidden />
            Start a health chat
          </ButtonLink>
          <ButtonLink href="/inventory" size="lg" variant="secondary">
            <Pill className="h-5 w-5" aria-hidden />
            Find medicine
          </ButtonLink>
        </div>
        <p className="animate-rise mt-6 text-sm text-muted" style={{ animationDelay: "260ms" }}>
          Free for patients. No account needed to try it.
        </p>
      </div>

      <HeroDemo />
    </section>
    </div>
  );
}

const STEPS = [
  {
    icon: UserRound,
    title: "Tell Zelthia about yourself",
    body: "Add your age, height, weight, allergies and regular medicines once. Skip anything you'd rather not share.",
  },
  {
    icon: MessageCircleHeart,
    title: "Ask, or upload a note",
    body: "Describe a symptom, name a medicine, or photograph a doctor's note or a product. Answers flag reactions and say plainly when you need a doctor.",
  },
  {
    icon: MapPinned,
    title: "Go where it's in stock",
    body: "See which nearby facility has it, what it costs and when they close, with directions by landmarks.",
  },
];

function HowItWorks() {
  return (
    <section className="border-y border-line bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <h2 className="max-w-2xl title font-display text-3xl font-semibold text-ink sm:text-4xl">
          From &ldquo;is this safe?&rdquo; to the pharmacy counter.
        </h2>
        <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <Reveal as="li" key={title} delay={i * 110} className="relative">
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
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

const FACILITY_FEATURES = [
  { icon: Layers, title: "Stock across branches", body: "Track quantity, price and batch for every medicine, per facility." },
  { icon: CalendarClock, title: "Expiry warnings", body: "See batches expiring in the next 90 days before they go to waste." },
  { icon: BellRing, title: "Low-stock alerts", body: "Know when an item drops below the level you set." },
  { icon: MapPinned, title: "Directions patients follow", body: "Describe the way in once; it appears on every search result." },
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
          someone nearby searches for that medicine.
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
        {FACILITY_FEATURES.map(({ icon: Icon, title, body }, i) => (
          <Reveal as="li" key={title} delay={i * 80} className="bg-surface p-6">
            <Icon className="h-5 w-5 text-sky" aria-hidden />
            <h3 className="mt-4 text-base font-semibold text-ink">{title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
          </Reveal>
        ))}
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
            Set up your health profile in about a minute.
          </h2>
          <p className="mt-3 text-lg text-white/75">
            Every answer after that takes your history into account.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/signup" size="lg" className="bg-white text-[#0d3b35] hover:bg-[#dcefe6] dark:text-[#0d3b35]">
            Create a free account
          </ButtonLink>
          <ButtonLink href="/chat" size="lg" variant="ghost" className="text-white hover:bg-white/10">
            Try the chat first
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
