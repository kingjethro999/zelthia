import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/shared/LegalPage";

export const metadata: Metadata = {
  title: "Terms of use",
  description:
    "The terms for using Zelthia's health chat, medicine search and facility inventory tools.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of use" updated="26 November 2026">
      <section>
        <h2>Zelthia is not medical care</h2>
        <p>
          Zelthia gives general health information and helps you find facilities
          and verify product registrations. It does not diagnose, prescribe or
          replace a doctor, pharmacist or nurse. In keeping with automated
          decision-making safeguards under Section 14 of the UK Data Protection
          Act 2018 (UKPGA c. 12) and the Nigeria Data Protection Act 2023, AI
          guidance is strictly informational; always check with a qualified
          health worker before starting, stopping or changing a medicine. In an
          emergency, call 112 or go to the nearest emergency unit.
        </p>
      </section>

      <section>
        <h2>Public regulatory &amp; open government data disclaimers</h2>
        <p>
          Product safety checks reference public NAFDAC registries, US FDA
          Orange Book and openFDA APIs, UK MHRA Safety Public Assessment
          Reports, Health Canada DPD, China NMPA format checks, and UK DHSC
          Adult Social Care Finance reports (published under public registries
          and Open Government Licence v3.0 where applicable). Registration
          records cannot inspect the physical chemical contents of a sealed
          pack—always verify physical expiry dates, batch numbers and intact
          security seals.
        </p>
      </section>

      <section>
        <h2>Your account and encryption key</h2>
        <ul>
          <li>Give accurate information and keep your password private.</li>
          <li>You&apos;re responsible for activity on your account.</li>
          <li>
            Your saved health profile, chats and uploaded files are encrypted
            with a key locked to your password. Because Zelthia cannot read or
            decrypt your data without your password, losing your password means
            previously encrypted records cannot be recovered.
          </li>
          <li>
            We never sell, rent or exploit your personal health data. You can
            export or delete your account at any time from the account page.
          </li>
        </ul>
      </section>

      <section>
        <h2>Facilities and licence verification</h2>
        <p>
          Pharmacies, clinics, hospitals, diagnostic centres and health stores
          that list stock on Zelthia agree to keep quantities, prices, opening
          hours and directions accurate, to list only products and services they
          are legally permitted to provide, and to remove items that are expired
          or recalled.
        </p>
        <p>
          Submitting a licence or registration number queues your facility for
          manual review by a Zelthia administrator, who checks official public
          records before approving a verified badge. Zelthia may decline or
          revoke a verified badge or remove misleading listings at any time.
        </p>
      </section>

      <section>
        <h2>Stock information</h2>
        <p>
          Stock levels are provided by facilities and can change quickly. Call
          ahead for anything urgent. Zelthia isn&apos;t responsible for a
          facility&apos;s stock, prices or service.
        </p>
      </section>

      <section>
        <h2>Acceptable use</h2>
        <ul>
          <li>
            Don&apos;t misuse the service, attempt automated scraping or
            credential stuffing, submit false facility licences, or try to
            access other people&apos;s data.
          </li>
          <li>Don&apos;t use Zelthia to obtain medicines unlawfully.</li>
        </ul>
      </section>

      <section>
        <h2>Changes to these terms</h2>
        <p>
          We may update these terms. Continuing to use Zelthia after a change
          means you accept the updated terms. See also our{" "}
          <Link
            href="/privacy"
            className="font-semibold text-brand underline-offset-4 hover:underline"
          >
            privacy policy
          </Link>
          .
        </p>
      </section>
    </LegalPage>
  );
}
