import type { Metadata } from "next";
import { Boxes, HeartPulse, MapPinned, MessageCircleHeart, ScanText, ShieldCheck } from "lucide-react";
import { InfoPage } from "@/components/marketing/InfoPage";

const title = "About Zelthia";
const description =
  "Zelthia is inventory for pharmacies, clinics and hospitals in Nigeria. Facilities keep live stock and landmark directions; patients check what is available before they travel, with a health companion for guidance.";

export const metadata: Metadata = {
  title,
  description,
  keywords: ["Zelthia", "what is Zelthia", "pharmacy inventory software Nigeria", "clinic inventory management", "health companion app"],
  alternates: { canonical: "/about" },
  openGraph: { title: `${title} | Zelthia`, description, url: "/about" },
};

export default function AboutPage() {
  return (
    <InfoPage
      path="/about"
      title="Zelthia is inventory for pharmacies, clinics and hospitals"
      lead="Facilities keep their stock live. Patients see what is available and how to reach it before they travel. A health companion helps with the rest."
      primary={{ href: "/signup?role=provider", label: "List your facility" }}
      secondary={{ href: "/inventory", label: "Find medicine" }}
      summary={[
        "Zelthia is a web app, built for Nigeria, that starts with inventory. Pharmacies, clinics, hospitals and health stores record their stock, prices, batches and expiry dates, and write directions to their door using landmarks. Patients search what is listed and see what is available nearby before they set out. On the patient side, a health companion answers questions with allergies, conditions and current medicines in mind and explains doctor's notes from a photo.",
        "Zelthia started from a simple problem: walking from pharmacy to pharmacy for one medicine, with no way to know who had it. It only shows stock that facilities have listed themselves, and when it searches the web it links to its sources and labels the results unverified.",
        "Zelthia is free to use. Paid add-ons, such as verified facility listings, are planned for specific features. The health companion gives guidance, not a diagnosis, and does not replace a doctor or pharmacist. In an emergency, call 112.",
      ]}
      sectionsTitle="What Zelthia does"
      sections={[
        { icon: Boxes, title: "Inventory for facilities", body: "Track stock, price, batch and expiry, and be found by patients nearby." },
        { icon: ShieldCheck, title: "Verified facilities", body: "Facilities with a confirmed licence or registration number carry a verified badge." },
        { icon: MapPinned, title: "Search for patients", body: "Patients search what facilities have listed, with price, stock and landmark directions." },
        { icon: MessageCircleHeart, title: "Health companion", body: "Ask about symptoms or medicines. Answers flag allergies, interactions and when to see a health worker." },
        { icon: ScanText, title: "Doctor's note reader", body: "Upload a photo of a note, prescription or result and get it explained in plain language." },
        { icon: HeartPulse, title: "Your health profile", body: "Optional age, height, weight, allergies, conditions and medicines, used to tailor answers. You can delete it at any time." },
      ]}
      faqs={[
        { question: "What is Zelthia?", answer: "Zelthia is inventory for pharmacies, clinics and hospitals in Nigeria, with a public search so patients can see what is in stock nearby, and a health companion for guidance." },
        { question: "Who is Zelthia for?", answer: "Facilities that want to keep stock and services visible to nearby patients, and patients who need to find a medicine, product, test or scan, or want clear health guidance." },
        { question: "Is Zelthia free?", answer: "Yes. Patients and facilities can use Zelthia for free. Paid add-ons for specific features, such as verified facility listings, are planned, and we will announce them before they launch." },
        { question: "Does Zelthia make up pharmacies or stock?", answer: "No. Listings come from facilities themselves. Web results are labelled as unverified and link to their source. When nothing is found, Zelthia says so." },
        { question: "Does the health companion diagnose illness?", answer: "No. It gives general guidance and helps you find care. It does not diagnose or prescribe." },
        { question: "How is my data handled?", answer: "Your account and health profile are stored in our database and are never sold. Uploaded files are private to you. You can delete your account and everything in it from the account page." },
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
