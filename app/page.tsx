import type { Metadata } from "next";
import { HeroSection } from "@/components/marketing/HeroSection";
import { FeatureHighlights } from "@/components/marketing/FeatureHighlights";
import { ProblemSolutionSection } from "@/components/marketing/ProblemSolutionSection";
import { FaqSection, FAQ_DATA } from "@/components/marketing/FaqSection";
import { CtaBanner } from "@/components/marketing/CtaBanner";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://zelthia.health";

export const metadata: Metadata = {
  title:
    "Zelthia | Your Biometric-Aware AI Health Companion & Community Care Navigator",
  description:
    "Instant, context-aware AI health guidance paired with real-time local pharmacy inventory, drug verification, and plain-English landmark directions.",
  keywords: [
    "Zelthia",
    "AI health companion",
    "pharmacy inventory system",
    "hospital stock tracker",
    "clinic medicine finder",
    "landmark health directions",
    "biometric medical chat",
    "healthcare Nigeria",
    "last-mile medicine search",
    "Lincoln University College health survey",
    "community health directory",
    "drug availability checker",
  ],
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title:
      "Zelthia | Your Biometric-Aware AI Health Companion & Care Navigator",
    description:
      "Triage symptoms with personal biometric context, search verified nearby pharmacy inventory, and follow clear landmark directions without map confusion.",
    url: siteUrl,
    siteName: "Zelthia",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Zelthia Healthcare Platform Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zelthia | AI Health Companion & Community Care Navigator",
    description:
      "Personalized biometric AI triage, live pharmacy stock directory, and landmark-guided directions.",
    images: ["/og-image.png"],
    creator: "@zelthiahealth",
  },
};

export default function HomePage() {
  // Structured Data (JSON-LD)
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Zelthia Health Technologies",
    alternateName: "Zelthia",
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description:
      "Zelthia bridges healthcare access by combining biometric-aware AI health guidance with a verified multi-tenant directory of local pharmacies and plain-English landmark navigation.",
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Nigeria & Global Underserved Communities",
    },
    knowsAbout: [
      "Artificial Intelligence in Healthcare",
      "Biometric Health Triage",
      "Pharmaceutical Inventory Management",
      "Community Care Directory",
      "Landmark Navigation",
    ],
  };

  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Zelthia Health",
    applicationCategory: "HealthApplication",
    operatingSystem: "Web, iOS, Android",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    description:
      "Biometric-aware health companion that provides tailored triage, verified clinic/pharmacy stock searches, and landmark-based directions.",
    featureList: [
      "Biometric-Aware AI Consultation",
      "Multi-Tenant Live Medicine Stock Directory",
      "Plain-English Step-by-Step Landmark Navigation",
      "OpenFDA Product & Drug Verification",
    ],
  };

  const medicalWebPageSchema = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: "Zelthia: Biometric-Aware AI Health Companion & Care Navigator",
    url: siteUrl,
    description:
      "Evidence-backed digital healthcare platform connecting patients with AI symptom triage, verified local medication stock, and landmark navigation.",
    medicalAudience: {
      "@type": "MedicalAudience",
      medicalAudienceType: "Patient",
    },
    about: [
      {
        "@type": "MedicalCondition",
        name: "General Health Symptoms, Dermatological Reactions, and Primary Care Triage",
      },
      {
        "@type": "MedicalBusiness",
        name: "Community Pharmacies, Primary Care Clinics, and Hospitals",
      },
    ],
  };

  const faqPageSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_DATA.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(medicalWebPageSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema) }}
      />

      {/* Landing Page Content Sections */}
      <div className="flex flex-col">
        <HeroSection />
        <FeatureHighlights />
        <ProblemSolutionSection />
        <FaqSection />
        <CtaBanner />
      </div>
    </>
  );
}
