import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/shared/LegalPage";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "What Zelthia collects, why, who processes it, and how to delete it.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy" updated="16 November 2026">
      <section>
        <h2>What we collect</h2>
        <ul>
          <li>
            <strong className="text-ink">Account details:</strong> your name,
            email address and a one-way hash of your password. We never store
            the password itself.
          </li>
          <li>
            <strong className="text-ink">Health profile:</strong> anything you
            choose to add, such as age, sex, height, weight, blood group,
            allergies, conditions, medicines and notes. Every field is optional.
          </li>
          <li>
            <strong className="text-ink">Chat messages:</strong> what you type
            into the health chat. Conversations are kept in your browser tab and
            are not saved to our database.
          </li>
          <li>
            <strong className="text-ink">Sign-in cookie:</strong> a random token
            that keeps you signed in for up to 30 days. We store only a hash of
            it.
          </li>
        </ul>
        <p>
          If you use Zelthia without an account, your health profile is saved
          only in your browser&apos;s local storage on that device.
        </p>
      </section>

      <section>
        <h2>How we use it</h2>
        <p>
          We use your health profile to tailor answers: to warn about allergies
          and interactions and to sense-check doses. We use your email to sign
          you in. We don&apos;t sell your data or use it for advertising.
        </p>
      </section>

      <section>
        <h2>Who processes it</h2>
        <p>
          To answer a chat message, we send the conversation and your health
          profile (without your name or email) to an AI model provider.
          Depending on availability this is Groq, Google Gemini, NVIDIA or
          APMIX. Accounts and profiles are stored in a PostgreSQL database
          hosted by Render, and the site is served by Vercel.
        </p>
      </section>

      <section>
        <h2>Your choices</h2>
        <ul>
          <li>
            Edit or clear any part of your health profile from your account
            page.
          </li>
          <li>
            Delete your account from the{" "}
            <Link
              href="/account"
              className="font-semibold text-brand underline-offset-4 hover:underline"
            >
              account page
            </Link>
            . This permanently removes your account, profile and sign-in
            sessions.
          </li>
          <li>
            Start a new chat at any time to clear the current conversation from
            your tab.
          </li>
        </ul>
      </section>

      <section>
        <h2>Payments</h2>
        <p>
          Zelthia doesn&apos;t take payments and doesn&apos;t collect card or
          bank details. Prices shown for medicines are set by each facility, and
          you pay the facility directly.
        </p>
      </section>

      <section>
        <h2>Your rights</h2>
        <p>
          Under the Nigeria Data Protection Act 2023, and where they apply to
          you, the EU and UK GDPR and the California Consumer Privacy Act
          (CCPA), you have the right to access the personal data we hold about
          you, correct it, delete it, receive a copy of it, and object to or
          restrict how it&apos;s used. Our legal basis for processing health
          information is your explicit consent, which you give by adding it to
          your profile and can withdraw at any time by removing it or deleting
          your account. We don&apos;t sell or share personal information for
          advertising, as defined by the CCPA.
        </p>
      </section>

      <section>
        <h2>Children</h2>
        <p>
          Zelthia accounts are for people aged 16 and over. A parent or guardian
          can add a child&apos;s details to their own profile notes when asking
          on the child&apos;s behalf.
        </p>
      </section>

      <section>
        <h2>Changes</h2>
        <p>
          If we change how we handle your data, we&apos;ll update this page and
          the date at the top.
        </p>
      </section>
    </LegalPage>
  );
}
