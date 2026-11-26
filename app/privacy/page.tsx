import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/shared/LegalPage";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "What Zelthia collects, why, how zero-knowledge password-locked encryption protects it, who processes it, and how to export or delete it.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy" updated="25 November 2026">
      <section>
        <h2>What we collect</h2>
        <ul>
          <li>
            <strong className="text-ink">Account details:</strong> your name,
            email address, a one-way salted scrypt hash of your password, and a
            record of when you accepted our Terms of use and Privacy policy. We
            never store your password itself.
          </li>
          <li>
            <strong className="text-ink">Health profile:</strong> anything you
            choose to add, such as age, sex, location, height, weight, blood
            group, allergies, conditions, medicines and notes. Every field is
            optional.
          </li>
          <li>
            <strong className="text-ink">
              Chat messages and uploaded files:
            </strong>{" "}
            if you are signed in and not using a temporary chat, your
            conversation titles, messages, extracted note text and uploaded
            files (photos or PDFs) are encrypted and saved to your account so
            you can return to them. If you use Zelthia as a guest or switch on a
            temporary chat, messages are kept only in your browser tab and are
            never saved to our database.
          </li>
          <li>
            <strong className="text-ink">Facility listings (public):</strong> if
            you create a facility account and list a pharmacy, clinic, hospital,
            scan centre or store, its name, address, phone number, services,
            stock, prices, landmark directions and recorded audio directions are
            publicly searchable so patients can find you.
          </li>
          <li>
            <strong className="text-ink">Sign-in cookie:</strong> a random
            session token paired with your unlocked encryption key in an
            HTTP-only cookie for up to 30 days. Our database stores only a
            one-way SHA-256 hash of the session token, never the encryption key.
          </li>
        </ul>
        <p>
          If you use Zelthia without an account, your health profile is saved
          only in your browser&apos;s local storage on that device. For
          signed-in accounts, your health profile is not persisted to browser
          local storage.
        </p>
      </section>

      <section>
        <h2>How we protect your data (Zero-knowledge encryption)</h2>
        <p>
          We do not sell, rent, mine or use your personal health data for
          advertising. For signed-in accounts, your health profile, saved chat
          titles, messages and uploaded files are encrypted using AES-256-GCM
          with a unique 256-bit key locked to your password before storage.
        </p>
        <ul>
          <li>
            Your health profile, saved conversations and attachment transcripts
            are never stored as plain text in our database and are not readable
            by Zelthia staff or administrators.
          </li>
          <li>
            Uploaded chat documents and photos are encrypted as opaque binary
            blobs before being stored, so storage providers cannot view them.
          </li>
          <li>
            When you send a message, your active session transiently unlocks
            your de-identified profile and conversation context in server memory
            only long enough to generate your answer, without sending your name
            or email to AI providers.
          </li>
          <li>
            Because your encryption key is locked to your password, keeping your
            password safe is essential: if you lose your password, previously
            encrypted health history cannot be recovered.
          </li>
        </ul>
      </section>

      <section>
        <h2>How we use it</h2>
        <p>
          We use your health profile to tailor answers: to warn about allergies
          and drug interactions, sense-check doses and find facilities near your
          chosen location. We use your email to sign you in and, for facility
          accounts, to let Zelthia administrators review submitted licences.
        </p>
      </section>

      <section>
        <h2>Who processes it</h2>
        <p>
          We share only the minimum data needed to run each feature you invoke:
        </p>
        <ul>
          <li>
            <strong className="text-ink">AI inference (transient):</strong>{" "}
            de-identified chat prompts, uploaded document images/text and health
            profile context (never your name or email) are processed transiently
            by Groq, Google Gemini, NVIDIA, APMIX or OpenAI to generate
            responses and transcribe voice directions.
          </li>
          <li>
            <strong className="text-ink">Web &amp; photo lookup:</strong> when
            no Zelthia facility lists an item you need, only the product/test
            search keywords and your general city/area (never your name, email
            or health history) are sent to Firecrawl, Tavily or Jina.
          </li>
          <li>
            <strong className="text-ink">
              Hosting &amp; encrypted storage:
            </strong>{" "}
            the application is served by Vercel; accounts and encrypted user
            records are stored in PostgreSQL on Render over strictly verified
            TLS connections; encrypted chat uploads and public facility audio
            recordings are stored via Cloudinary.
          </li>
        </ul>
      </section>

      <section>
        <h2>Your choices</h2>
        <ul>
          <li>
            Edit or clear any part of your health profile from your{" "}
            <Link
              href="/account"
              className="font-semibold text-brand underline-offset-4 hover:underline"
            >
              account page
            </Link>
            .
          </li>
          <li>
            Download a decrypted copy of your profile and chat history at any
            time using &ldquo;Download my data&rdquo; on the account page.
          </li>
          <li>
            Revoke other active browsers and devices using &ldquo;Sign out other
            devices&rdquo; on the account page.
          </li>
          <li>
            Delete individual chats from the sidebar, use Temporary chat for
            unsaved questions, or permanently delete your account from the{" "}
            <Link
              href="/account"
              className="font-semibold text-brand underline-offset-4 hover:underline"
            >
              account page
            </Link>{" "}
            (which erases your account, profile, chats, sessions and stored
            files).
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
          you, correct it, delete it, receive a portable copy of it, and object
          to or restrict how it&apos;s used. Our legal basis for processing
          health information is your explicit consent, which you give when
          creating an account and adding details to your profile, and can
          withdraw at any time by clearing your profile or deleting your
          account. We don&apos;t sell or share personal information for
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
