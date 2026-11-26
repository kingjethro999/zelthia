"use client";

import Link from "next/link";
import { Phone } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const COLUMNS = [
  {
    title: "Use Zelthia",
    links: [
      { href: "/chat", label: "Health chat" },
      { href: "/doctors-note-reader", label: "Doctor's note reader" },
      { href: "/inventory", label: "Find medicine" },
    ],
  },
  {
    title: "Facilities",
    links: [
      { href: "/for-facilities", label: "Inventory for facilities" },
      { href: "/signup?role=provider", label: "List your facility" },
    ],
  },
  {
    title: "About",
    links: [
      { href: "/about", label: "About Zelthia" },
      { href: "/#faq", label: "Questions" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="max-w-xs">
          <Logo size={28} />
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Health guidance that knows your history, and the nearest pharmacy
            that has your medicine.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h2 className="text-sm font-semibold text-ink">{col.title}</h2>
            <ul className="mt-3 space-y-2">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="inline-block py-1.5 text-sm text-muted transition-colors hover:text-ink"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>{"\u00a9 2026 Zelthia"}</p>
          <p className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-alert" aria-hidden />
            Zelthia doesn&apos;t replace a doctor. In an emergency, call{" "}
            <a
              href="tel:112"
              className="font-semibold text-ink underline-offset-4 hover:underline"
            >
              112
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
