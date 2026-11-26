import type { Metadata } from "next";
import {
  Boxes,
  HeartPulse,
  MapPinned,
  MessageCircleHeart,
  ScanText,
  ShieldCheck,
} from "lucide-react";
import { InfoPage } from "@/components/marketing/InfoPage";

const title = "About Zelthia";
const description =
  "Zelthia is a free health and care companion for Nigeria: an AI health chat that knows your allergies, a reader for doctor's notes, a search for medicines and health products in stock near you, and inventory tools for facilities.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "Zelthia",
    "what is Zelthia",
    "Zelthia health app",
    "AI health assistant Nigeria",
    "health companion app",
  ],
  alternates: { canonical: "/about" },
  openGraph: { title: `${title} | Zelthia`, description, url: "/about" },
};

export default function AboutPage() {
  return (
    <InfoPage
      path="/about"
      title="Zelthia is your health and care companion"
      lead="Ask a health question, get a doctor's note explained, and find where to get the medicine, product or test you need."
      primary={{ href: "/chat", label: "Start a health chat" }}
      secondary={{ href: "/inventory", label: "Find medicine" }}
      summary={[
        "Zelthia is a free web app, built for people in Nigeria, that combines four things: an AI health chat that takes your allergies, conditions and current medicines into account; a reader that explains doctor's notes, prescriptions and results from a photo; a search for medicines, health products and tests that facilities have listed; and a free inventory dashboard for pharmacies, clinics, hospitals and health stores.",
        "Zelthia started from a simple problem: being sent to find a scan or a medicine with a note you can't read, and no way to know who has it. It only shows stock that facilities have listed themselves, and when it searches the web it links to its sources.",
        "Zelthia gives guidance, not a diagnosis. It does not replace a doctor or pharmacist. In an emergency, call 112.",
      ]}
      sectionsTitle="What Zelthia does"
      sections={[
        {
          icon: MessageCircleHeart,
          title: "Health chat",
          body: "Ask about symptoms or medicines. Answers flag allergies, interactions and when to see a health worker.",
        },
        {
          icon: ScanText,
          title: "Doctor's note reader",
          body: "Upload a photo of a note, prescription or result and get it explained in plain language.",
        },
        {
          icon: MapPinned,
          title: "Find medicine and tests",
          body: "Search what pharmacies, clinics and hospitals have listed, with price, stock and directions.",
        },
        {
          icon: Boxes,
          title: "Inventory for facilities",
          body: "A free dashboard to track stock, expiry and services, and be found by patients.",
        },
        {
          icon: ShieldCheck,
          title: "Verified facilities",
          body: "Facilities with a confirmed licence or registration number carry a verified badge.",
        },
        {
          icon: HeartPulse,
          title: "Your health profile",
          body: "Optional age, height, weight, allergies, conditions and medicines, used to tailor answers. You can delete it at any time.",
        },
      ]}
      faqs={[
        {
          question: "What is Zelthia?",
          answer:
            "Zelthia is a free health and care companion: an AI health chat, a doctor's note reader, a search for medicines and health products in stock, and inventory tools for health facilities in Nigeria.",
        },
        {
          question: "Who is Zelthia for?",
          answer:
            "Anyone who wants clear health guidance or needs to find a medicine, product, test or scan, and facilities that want to list their stock and services.",
        },
        {
          question: "Is Zelthia free?",
          answer: "Yes. It is free for patients and free for facilities.",
        },
        {
          question: "Does Zelthia make up pharmacies or stock?",
          answer:
            "No. Listings come from facilities themselves. Web results are labelled as unverified and link to their source. When nothing is found, Zelthia says so.",
        },
        {
          question: "Does Zelthia diagnose illness?",
          answer:
            "No. It gives general guidance and helps you find care. It does not diagnose or prescribe.",
        },
        {
          question: "How is my data handled?",
          answer:
            "Your account and health profile are stored in our database and are never sold. Uploaded files are private to you. You can delete your account and everything in it from the account page.",
        },
      ]}
      related={[
        { href: "/for-facilities", label: "For facilities" },
        { href: "/doctors-note-reader", label: "Doctor's note reader" },
        { href: "/privacy", label: "Privacy" },
        { href: "/terms", label: "Terms" },
      ]}
    />
  );
}
