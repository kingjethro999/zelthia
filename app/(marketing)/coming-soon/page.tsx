import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import {
  BarChart3,
  CalendarCheck,
  CreditCard,
  FileText,
  MessageCircle,
  MessagesSquare,
  Mic,
  PackageSearch,
  ScanLine,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { visitorGeo } from "@/lib/server/geo";
import { price, regionForCountry } from "@/lib/pricing";

const title = "Coming soon";
const description =
  "What Zelthia is building next: the mobile app with Darling and live chat, paid facility plans, and scan and test booking.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/coming-soon" },
  openGraph: { title: `${title} | Zelthia`, description, url: "/coming-soon" },
};

interface Item {
  icon: LucideIcon;
  title: string;
  body: React.ReactNode;
}

function Cards({ items }: { items: Item[] }) {
  return (
    <ul className="mt-5 grid gap-3 sm:grid-cols-3">
      {items.map(({ icon: Icon, title, body }) => (
        <li
          key={title}
          className="rounded-3xl border border-line bg-surface p-5"
        >
          <Icon className="h-5 w-5 text-brand" aria-hidden />
          <h3 className="mt-4 text-base font-semibold text-ink">{title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
        </li>
      ))}
    </ul>
  );
}

const FACILITIES: Item[] = [
  {
    icon: CreditCard,
    title: "Paid facility plans",
    body: (
      <>
        Verified Pro and Diagnostic & Hospital Plus open when payments go live.
        Everything you use today stays free.{" "}
        <Link
          href="/pricing"
          className="font-medium text-brand hover:underline"
        >
          See the plans
        </Link>
        .
      </>
    ),
  },
  {
    icon: CalendarCheck,
    title: "Scan and test booking",
    body: "A patient asks for a slot for an X-ray, ultrasound or lab test. You confirm it, or offer another time, from your dashboard.",
  },
  {
    icon: BarChart3,
    title: "What people near you look for",
    body: "Each month, the medicines and tests people in your area searched for and could not find in stock, so you know what to order.",
  },
];

const LIVE_NOW: Item[] = [
  {
    icon: MessageCircle,
    title: "Health chat",
    body: "Ask about symptoms or medicines. Answers take your allergies, conditions and current medicines into account.",
  },
  {
    icon: FileText,
    title: "Doctor’s note reader",
    body: "Take a photo of a prescription or referral. Zelthia explains what it says and where to get what it asks for.",
  },
  {
    icon: ScanLine,
    title: "Scan and check a pack",
    body: "Scan a barcode or snap a carton to check it against public medicine registers, starting with your own country’s.",
  },
];

export default function ComingSoonPage() {
  return (
    <article className="mx-auto w-full max-w-6xl px-4 pb-20 pt-12 sm:px-6 lg:pt-20">
      <header className="max-w-2xl">
        <p className="text-sm font-medium text-brand">Coming soon</p>
        <h1 className="display mt-2 font-display text-4xl font-semibold text-ink sm:text-5xl">
          What we’re building next
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-muted">
          The Zelthia app is next. It brings Darling and live chat, which are
          not on the website. There is no release date yet, and nothing on this
          page can be bought today.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/chat" size="lg">
            Use health chat
          </ButtonLink>
          <ButtonLink href="/pricing" size="lg" variant="secondary">
            See pricing
          </ButtonLink>
        </div>
      </header>

      <section aria-labelledby="cs-people" className="mt-16">
        <h2 id="cs-people" className="text-lg font-semibold text-ink">
          For people
        </h2>
        <Suspense fallback={<Cards items={patientItems(null)} />}>
          <PatientCards />
        </Suspense>
      </section>

      <section aria-labelledby="cs-facilities" className="mt-14">
        <h2 id="cs-facilities" className="text-lg font-semibold text-ink">
          For facilities
        </h2>
        <Cards items={FACILITIES} />
      </section>

      <section aria-labelledby="cs-live" className="mt-14">
        <h2 id="cs-live" className="text-lg font-semibold text-ink">
          Already free on the web
        </h2>
        <Cards items={LIVE_NOW} />
        <p className="mt-4 flex items-center gap-2 text-sm text-muted">
          <PackageSearch className="h-4 w-4 shrink-0" aria-hidden />
          Facilities can also keep their stock on Zelthia and check every
          delivery with Scan-to-Stock.{" "}
          <Link
            href="/for-facilities"
            className="font-medium text-brand hover:underline"
          >
            How it works
          </Link>
        </p>
      </section>
    </article>
  );
}

function patientItems(companionPrice: string | null): Item[] {
  return [
    {
      icon: Smartphone,
      title: "The Zelthia app",
      body: "For Android and iOS. Your health notes, check-ins, reminders and appointments in one place. Notes and reminders work without a connection and sync when you are back online.",
    },
    {
      icon: Mic,
      title: "Darling",
      body: "On phones that allow a wake word, say “Hey Darling” and start talking. On other phones, add the Darling widget to your home screen and tap it. Darling can set a reminder, log a check-in or find the nearest place that has what you need.",
    },
    {
      icon: MessagesSquare,
      title: "Live chat",
      body: `A real conversation inside the app, one tap from the Darling widget. It comes with the Zelthia companion plan${companionPrice ? `, ${companionPrice} a month` : ""}.`,
    },
  ];
}

/** The companion price in the visitor's own currency only. */
async function PatientCards() {
  const geo = await visitorGeo();
  return (
    <Cards
      items={patientItems(price("companion", regionForCountry(geo.country)))}
    />
  );
}
