import type { Metadata } from "next";
import {
  BarChart3,
  CalendarCheck,
  CreditCard,
  MessagesSquare,
  Mic,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";

const title = "Coming soon";
const description =
  "What Zelthia is building next: the mobile app with Darling and live chat, paid facility plans, and scan and test booking.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/coming-soon" },
  openGraph: { title: `${title} | Zelthia`, description, url: "/coming-soon" },
};

interface Upcoming {
  icon: LucideIcon;
  title: string;
  body: string;
}

const PATIENTS: Upcoming[] = [
  {
    icon: Smartphone,
    title: "The Zelthia app",
    body: "Android and iOS, with your health notes, check-ins, reminders and appointments in one place, and the parts that matter most working offline.",
  },
  {
    icon: Mic,
    title: "Darling",
    body: "A voice companion you can call with “Hey Darling” on phones that support it, or from a home-screen widget on phones that don’t. Built for the moments when typing is too much.",
  },
  {
    icon: MessagesSquare,
    title: "Live chat",
    body: "A real conversation inside the app, one tap from the Darling widget. Part of the Zelthia companion plan, ₦3,000 a month in Nigeria or $5 elsewhere.",
  },
];

const FACILITIES: Upcoming[] = [
  {
    icon: CreditCard,
    title: "Paid facility plans",
    body: "Verified Pro and Diagnostic & Hospital Plus open once payments are live. Until then, everything a facility uses today stays free.",
  },
  {
    icon: CalendarCheck,
    title: "Scan and test booking",
    body: "Patients request a slot for an X-ray, ultrasound or lab test, and the facility confirms it from the dashboard.",
  },
  {
    icon: BarChart3,
    title: "What patients nearby are looking for",
    body: "A monthly view of what people in your area searched for and could not find, so you know what to stock.",
  },
];

function List({ items }: { items: Upcoming[] }) {
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

export default function ComingSoonPage() {
  return (
    <article className="mx-auto w-full max-w-6xl px-4 pb-20 pt-12 sm:px-6 lg:pt-20">
      <header className="max-w-2xl">
        <p className="text-sm font-medium text-brand">Coming soon</p>
        <h1 className="display mt-2 font-display text-4xl font-semibold text-ink sm:text-5xl">
          What we’re building next
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-muted">
          No dates yet, and nothing here is on sale. Everything you can use on
          the web today is free.
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
        <List items={PATIENTS} />
      </section>

      <section aria-labelledby="cs-facilities" className="mt-14">
        <h2 id="cs-facilities" className="text-lg font-semibold text-ink">
          For facilities
        </h2>
        <List items={FACILITIES} />
      </section>
    </article>
  );
}
