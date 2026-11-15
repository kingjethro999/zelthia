export interface FaqItem {
  question: string;
  answer: string;
  category: "General" | "Biometrics & AI" | "Inventory & Navigation" | "Safety & Privacy";
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
    question: "How does the Biometric-Aware AI Chat personalize health guidance?",
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
    question: "What are Plain-English Landmark Directions and why use them instead of GPS?",
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
    question: "How do pharmacies, clinics, and hospitals register their inventory?",
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
