import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/shared/LegalPage";

export const metadata: Metadata = {
  title: "Terms of use",
  description: "The terms for using Zelthia's health chat, medicine search and facility inventory tools.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of use" updated="16 November 2026">
      <section>
        <h2>Zelthia is not medical care</h2>
        <p>
          Zelthia gives general health information and helps you find facilities and medicines. It
          does not diagnose, prescribe or replace a doctor, pharmacist or nurse. Always check with a
          qualified health worker before starting, stopping or changing a medicine. In an emergency,
          call 112 or go to the nearest emergency unit.
        </p>
      </section>

      <section>
        <h2>Your account</h2>
        <ul>
          <li>Give accurate information and keep your password private.</li>
          <li>You&apos;re responsible for activity on your account.</li>
          <li>You can delete your account at any time from the account page.</li>
        </ul>
      </section>

      <section>
        <h2>Facilities</h2>
        <p>
          Pharmacies, clinics and hospitals that list stock on Zelthia agree to keep quantities,
          prices, opening hours and directions accurate, to list only medicines they are licensed to
          supply, and to remove items that are expired or recalled.
        </p>
      </section>

      <section>
        <h2>Stock information</h2>
        <p>
          Stock levels are provided by facilities and can change quickly. Call ahead for anything
          urgent. Zelthia isn&apos;t responsible for a facility&apos;s stock, prices or service.
        </p>
      </section>

      <section>
        <h2>Acceptable use</h2>
        <ul>
          <li>Don&apos;t misuse the service, try to break it, or access other people&apos;s data.</li>
          <li>Don&apos;t use Zelthia to obtain medicines unlawfully.</li>
        </ul>
      </section>

      <section>
        <h2>Changes to these terms</h2>
        <p>
          We may update these terms. Continuing to use Zelthia after a change means you accept the
          updated terms. See also our{" "}
          <Link href="/privacy" className="font-semibold text-brand underline-offset-4 hover:underline">
            privacy policy
          </Link>
          .
        </p>
      </section>
    </LegalPage>
  );
}
