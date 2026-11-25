import type { Metadata } from "next";
import {
  BadgeCheck,
  Boxes,
  CalendarClock,
  Mic,
  PackagePlus,
  Search,
  Stethoscope,
  TriangleAlert,
} from "lucide-react";
import { InfoPage } from "@/components/marketing/InfoPage";
import { FacilityDemo } from "@/components/marketing/Motion";

const title = "Inventory for pharmacies and clinics";
const description =
  "Free inventory management for Nigerian pharmacies, clinics, hospitals, scan centres and health stores. Track stock, expiry dates and low stock, list services, and get found by patients searching for what you have.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "pharmacy inventory software Nigeria",
    "pharmacy stock management",
    "clinic inventory system",
    "hospital inventory management",
    "drug stock tracker",
    "expiry date tracker pharmacy",
    "list my pharmacy online",
    "health store inventory app",
  ],
  alternates: { canonical: "/for-facilities" },
  openGraph: {
    title: `${title} | Zelthia`,
    description,
    url: "/for-facilities",
  },
};

export default function ForFacilitiesPage() {
  return (
    <InfoPage
      path="/for-facilities"
      visual={<FacilityDemo />}
      title={title}
      lead="Keep your stock accurate in one place. Every update shows up when someone nearby searches Zelthia for a medicine, product or test you have."
      primary={{ href: "/signup?role=provider", label: "List your facility" }}
      secondary={{ href: "/provider", label: "Open your dashboard" }}
      summary={[
        "Zelthia gives pharmacies, clinics, hospitals, diagnostic centres and health stores a free inventory dashboard. You record what you stock, and patients who search Zelthia or ask its health chat are shown your real quantities, prices, opening hours and directions.",
        "It covers everything health: medicines, skin care and cosmetics, pain relief and muscle rubs, vitamins, medical devices, test kits, first aid, and mother and baby products. You can also list services such as X-ray, ultrasound, ECG or 2D echocardiogram.",
      ]}
      sectionsTitle="What you can do"
      sections={[
        {
          icon: PackagePlus,
          title: "Add products in seconds",
          body: "Name, category, form, strength, pack size, price, quantity, batch and expiry. Mark items that need a prescription.",
        },
        {
          icon: Boxes,
          title: "Change stock with one tap",
          body: "Plus and minus buttons on every product, so the count stays right as you sell and restock.",
        },
        {
          icon: TriangleAlert,
          title: "Low-stock warnings",
          body: "Set the level for each product and see at a glance what is running out or out of stock.",
        },
        {
          icon: CalendarClock,
          title: "Expiry tracking",
          body: "See every batch that expires within 90 days before it goes to waste.",
        },
        {
          icon: Stethoscope,
          title: "List services and tests",
          body: "Scans, lab tests and procedures you offer appear when patients search for them.",
        },
        {
          icon: Mic,
          title: "Directions people can follow",
          body: "Type directions using landmarks or record them by voice. Patients can read and listen to them.",
        },
        {
          icon: BadgeCheck,
          title: "Verified badge",
          body: "Add your licence or registration number. It is checked when you save, and reviewed by a person within 7 days if it can't be confirmed online.",
        },
        {
          icon: Search,
          title: "Found by patients nearby",
          body: "Your listings appear in Zelthia search and in health chat answers, with a call button.",
        },
      ]}
      steps={{
        title: "How to list your pharmacy, clinic or hospital",
        items: [
          {
            name: "Create a facility account",
            text: 'Sign up and choose "A facility". It\'s free.',
          },
          {
            name: "Add your facility details",
            text: "Name, phone, address, opening hours, landmark directions and, if you have one, your licence number.",
          },
          {
            name: "Add your stock and services",
            text: "List products with quantity and price, and any tests or scans you offer. They are searchable as soon as you save.",
          },
        ],
      }}
      faqs={[
        {
          question: "Is Zelthia free for pharmacies and clinics?",
          answer:
            "Yes. Creating a facility account, managing inventory and appearing in patient searches are free.",
        },
        {
          question: "What kinds of facilities can use it?",
          answer:
            "Pharmacies, clinics, hospitals, diagnostic and scan centres, and health or beauty stores.",
        },
        {
          question: "Can I list cosmetics and skin care, not just medicines?",
          answer:
            "Yes. Zelthia accepts any health product, including skin care and cosmetics, muscle and pain relief creams, supplements, devices and test kits.",
        },
        {
          question: "How does the verified badge work?",
          answer:
            "Enter your licence or registration number (for example PCN, MDCN or HEFAMAA). Zelthia checks it when you save. If it can't be confirmed online, a person reviews it within 7 days. Your listing is live in the meantime without the badge.",
        },
        {
          question: "Can I manage more than one branch?",
          answer:
            "Yes. Add each branch as its own facility and switch between them in the dashboard.",
        },
        {
          question: "How do patients find my stock?",
          answer:
            "They search Zelthia for a product or service, or ask the health chat. If you have listed it, they see your stock, price, directions and a call button.",
        },
      ]}
      related={[
        { href: "/inventory", label: "Find medicine" },
        { href: "/doctors-note-reader", label: "Doctor's note reader" },
        { href: "/about", label: "About Zelthia" },
      ]}
    />
  );
}
