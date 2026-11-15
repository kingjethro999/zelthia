"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

export interface FaqItem {
  question: string;
  answer: string;
  category:
    | "General"
    | "Biometrics & AI"
    | "Inventory & Navigation"
    | "Safety & Privacy";
}

export const FAQ_DATA: FaqItem[] = [
  {
    category: "General",
    question: "What is Zelthia and what problems does it solve?",
    answer:
      "Zelthia is a biometric-aware AI health companion and multi-tenant healthcare navigation platform. It solves two critical healthcare access challenges: the uncertainty of generic online health advice, and the physical exhaustion of walking from pharmacy to pharmacy searching for out-of-stock medications. Zelthia pairs personalized symptom triage with real-time pharmacy inventory and landmark-guided clinic directions.",
  },
  {
    category: "Biometrics & AI",
    question:
      "How does the Biometric-Aware AI Chat personalize health guidance?",
    answer:
      "When using Zelthia AI Health Chat, you can input key biometric profile attributes such as your age, biological sex, blood group, allergies (e.g., penicillin), and chronic conditions (e.g., asthma, hypertension). Our AI models (powered by Gemini and Groq) incorporate these parameters into every health assessment to ensure guidance avoids contraindications and provides safe, realistic next steps.",
  },
  {
    category: "Inventory & Navigation",
    question: "How does Zelthia verify pharmacy and clinic inventory?",
    answer:
      "Zelthia operates a multi-tenant provider portal where registered community pharmacies, clinics, and hospitals maintain live stock records for essential medications, antimalarials, antibiotics, dermatology creams, and emergency items. When you search for a medication, Zelthia displays real-time stock levels, pack sizes, unit prices, and operational hours.",
  },
  {
    category: "Inventory & Navigation",
    question:
      "What are Plain-English Landmark Directions and why use them instead of GPS?",
    answer:
      "In many peri-urban areas, informal settlements, and university campuses, street numbering is inconsistent and GPS pins often lead to closed alleys or inaccurate locations. Zelthia’s registered providers supply plain-English, step-by-step directions using recognizable physical landmarks—such as 'directly opposite First Bank gate, 50m past the Total filling station'—making navigation foolproof regardless of map literacy.",
  },
  {
    category: "General",
    question: "Is Zelthia free to use for patients and everyday users?",
    answer:
      "Yes. Zelthia is 100% free for patients and everyday community members. There are no subscription fees, consultation costs, or search charges. All you need is an internet-connected smartphone or browser.",
  },
  {
    category: "Safety & Privacy",
    question: "Does Zelthia replace a doctor or medical emergency care?",
    answer:
      "No. Zelthia provides informational guidance and connects you to licensed care providers. It is not a substitute for formal diagnosis, professional medical treatment, or emergency intervention. If you experience severe symptoms—such as acute chest pain, severe bleeding, or difficulty breathing—you must immediately contact local emergency services (112 / 911) or visit the nearest emergency room.",
  },
  {
    category: "Inventory & Navigation",
    question:
      "How do pharmacies, clinics, and hospitals register their inventory?",
    answer:
      "Healthcare facilities can access the Provider Portal at '/inventory' to register their facility name, license credentials, operating hours, landmark navigation instructions, and upload their pharmaceutical stock. The platform allows instant stock count updates and alert triggers when medications restock.",
  },
  {
    category: "Safety & Privacy",
    question: "How is my personal health and biometric data protected?",
    answer:
      "Zelthia follows strict privacy-by-design principles. User biometrics are encrypted in transit and at rest. We never sell or monetize personal medical data. Personal identifiers are stripped during AI model queries, and users have complete control to edit or permanently delete their profile and chat history at any moment.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      className="py-20 lg:py-28 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            Frequently Asked Questions
          </h2>
          <p className="text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Everything you need to know about Zelthia’s biometric AI triage,
            live pharmacy stock tracker, and community landmark navigation.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {FAQ_DATA.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 overflow-hidden transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 shrink-0">
                      {faq.category}
                    </span>
                    <span className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                      {faq.question}
                    </span>
                  </div>
                  <div className="text-zinc-500 dark:text-zinc-400 shrink-0">
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed border-t border-zinc-200/60 dark:border-zinc-800/60">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Additional help footer */}
        <div className="mt-12 text-center text-xs sm:text-sm text-zinc-500 p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <span>Have a specific medical inquiry or looking for medicine? </span>
          <a
            href="/chat"
            className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
          >
            Chat with the AI Companion now
          </a>
          <span> or </span>
          <a
            href="/inventory"
            className="text-teal-600 dark:text-teal-400 font-bold hover:underline"
          >
            Search nearby pharmacies
          </a>
          .
        </div>
      </div>
    </section>
  );
}
