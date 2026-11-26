import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/shared/LegalPage";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "How Zelthia protects and processes personal health data under the Nigeria Data Protection Act 2023 and the UK Data Protection Act 2018 (UKPGA c. 12).",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy" updated="26 November 2026">
      <section>
        <h2>1. Who we are &amp; statutory frameworks</h2>
        <p>
          Zelthia operates a health navigation, medicine verification and
          facility inventory platform. Our privacy architecture enforces the
          Nigeria Data Protection Act 2023 (NDPA), the UK Data Protection Act
          2018 (UK Public General Acts 2018 c. 12), and UK/EU General Data
          Protection Regulation (GDPR) standards for special-category health
          data (DPA 2018 s. 10, s. 11 &amp; Schedule 1; UK GDPR Art. 9).
        </p>
      </section>

      <section>
        <h2>2. What data we collect</h2>
        <ul>
          <li>
            <strong className="text-ink">Account details:</strong> your name,
            email address, a one-way salted scrypt hash of your password, an
            audit trail of explicit consent versions and timestamps, and your
            processing-restriction preference (DPA 2018 s. 47). We never store
            your plaintext password.
          </li>
          <li>
            <strong className="text-ink">Health profile (special category):</strong>{" "}
            optional age, biological sex, blood group, location, height, weight,
            allergies, chronic conditions, current medicines and notes.
          </li>
          <li>
            <strong className="text-ink">
              Chat messages and uploaded files:
            </strong>{" "}
            if you are signed in and have neither turned on Temporary Chat nor
            activated Restrict Processing, conversation titles, messages,
            extracted note text and uploaded photos or PDFs are encrypted and
            saved so you can return to them. For guests, Temporary Chats, or
            accounts under a processing restriction, messages remain transient
            and are never persisted to our database.
          </li>
          <li>
            <strong className="text-ink">Facility listings (public):</strong>{" "}
            for pharmacies, clinics, hospitals, scan centres and stores,
            facility name, address, phone, services, stock levels, product
            barcodes/NAFDAC registration numbers, prices and recorded landmark
            directions are public directory records searchable by patients.
          </li>
          <li>
            <strong className="text-ink">Sign-in cookie:</strong> an HTTP-only
            split-key cookie pairing a random session token with your unlocked
            encryption key for up to 30 days. Our database stores only a
            one-way SHA-256 hash of the session token.
          </li>
        </ul>
      </section>

      <section>
        <h2>3. Zero-knowledge encryption &amp; security (DPA 2018 s. 2)</h2>
        <p>
          We do not sell, rent, mine or use personal health data for
          advertising. Personal health records are sealed with per-user 256-bit
          AES-256-GCM authenticated encryption whose Data Encryption Key is
          locked to your password via scrypt (preventing unauthorized staff or
          backup access under DPA 2018 s. 170).
        </p>
        <ul>
          <li>
            Your health profile, saved conversations and attachment transcripts
            are never stored as plain text in PostgreSQL and cannot be read by
            Zelthia staff or administrators.
          </li>
          <li>
            Uploaded chat files are wrapped in encrypted binary containers (
            <code>ZENC\x01</code>) prior to storage.
          </li>
          <li>
            When generating an answer, your active cookie session unlocks
            de-identified context transiently in memory without disclosing your
            name or email to AI providers.
          </li>
        </ul>
      </section>

      <section>
        <h2>4. Lawful basis &amp; public datasets used</h2>
        <ul>
          <li>
            <strong className="text-ink">
              Personal health profile &amp; chats:
            </strong>{" "}
            Explicit consent (NDPA 2023 s. 25 &amp; s. 30; UK GDPR Art. 6(1)(a)
            &amp; Art. 9(2)(a); DPA 2018 s. 10 &amp; s. 11 &amp; Schedule 1),
            collected explicitly during account signup and logged in your
            account consent audit log.
          </li>
          <li>
            <strong className="text-ink">
              Facility directory &amp; manual licence verification:
            </strong>{" "}
            Contractual service delivery &amp; legitimate public safety interest
            (Art. 6(1)(b)/(f); DPA 2018 s. 8).
          </li>
          <li>
            <strong className="text-ink">
              Non-personal public health &amp; regulatory datasets:
            </strong>{" "}
            Product and safety verification queries solely check non-personal
            public registries—Nigeria NAFDAC Greenbook &amp; Herbal Database, US
            FDA Orange Book (<code>EOBZIP_2026_10</code>) &amp; openFDA APIs, UK
            MHRA Safety Public Assessment Reports &amp; Annual Reports, Health
            Canada DPD, China NMPA formats, and UK DHSC England Adult Social
            Care Finance Statistics (2025–2026).
          </li>
        </ul>
      </section>

      <section>
        <h2>5. Automated decision-making safeguards (DPA 2018 s. 14)</h2>
        <p>
          Under Section 14 of the UK Data Protection Act 2018 and Article 22 of
          GDPR, AI clinical triage does not make legally binding decisions or
          diagnoses—every response clearly displays its sources and escalation
          guidance to consult a human clinician. Facility licence badges are
          never auto-approved by AI; a human administrator reviews public
          registry findings before granting verification.
        </p>
      </section>

      <section>
        <h2>6. Who processes transient requests</h2>
        <ul>
          <li>
            <strong className="text-ink">AI inference (de-identified):</strong>{" "}
            Groq, Google Gemini, NVIDIA, APMIX or OpenAI process transient
            de-identified prompts and uploaded scans without your name or email.
          </li>
          <li>
            <strong className="text-ink">
              Public registry &amp; web search:
            </strong>{" "}
            Product names, barcodes, NAFDAC codes and general city keywords
            (never user identities or health history) are queried against NAFDAC,
            openFDA, Health Canada DPD, and search/scrape providers (Firecrawl,
            Tavily, You.com, Jina, ZenRows, TinyFish).
          </li>
          <li>
            <strong className="text-ink">Infrastructure &amp; retention:</strong>{" "}
            Application compute runs on Vercel; PostgreSQL records reside on
            Render over verified TLS (with 24-hour rate-limit pruning and 7-day
            regulatory cache refresh); encrypted uploads reside on Cloudinary.
          </li>
        </ul>
      </section>

      <section>
        <h2>7. Your rights (Subject Access, Restriction, Portability &amp; Erasure)</h2>
        <ul>
          <li>
            <strong className="text-ink">
              Subject Access Request &amp; Portability (DPA 2018 s. 45 / Art. 15
              &amp; 20):
            </strong>{" "}
            Download a complete JSON package including your consent audit log,
            decrypted profile and conversations on your{" "}
            <Link
              href="/account"
              className="font-semibold text-brand underline-offset-4 hover:underline"
            >
              account page
            </Link>
            .
          </li>
          <li>
            <strong className="text-ink">
              Restrict Processing (DPA 2018 s. 47 / Art. 18):
            </strong>{" "}
            Toggle processing restriction directly on your account page to lock
            profile edits and force all chats into transient mode without
            server persistence.
          </li>
          <li>
            <strong className="text-ink">
              Rectification, Session Revocation &amp; Erasure (s. 46–47):
            </strong>{" "}
            Edit your profile, sign out other devices, delete individual chats,
            or permanently erase your account and encrypted files from your
            account page.
          </li>
          <li>
            <strong className="text-ink">
              National Security &amp; Supervisory Complaints:
            </strong>{" "}
            Disclosures outside your control never occur absent lawful statutory
            requirements (subject to proportionality and tribunal safeguards
            referenced in UK Data Protection Act 2018 National Security
            Certificates Guidance, s. 27/79/110). You may raise concerns with
            the Nigeria Data Protection Commission (NDPC) or the UK Information
            Commissioner&apos;s Office (ICO).
          </li>
        </ul>
      </section>
    </LegalPage>
  );
}
