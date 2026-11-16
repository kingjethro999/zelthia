export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_DATA: FaqItem[] = [
  {
    question: "What is Zelthia?",
    answer:
      "Zelthia is a health companion and medicine finder. You can describe symptoms or ask about a medicine, and Zelthia answers with your allergies, long-term conditions and current medicines in mind. It can then show which pharmacy, clinic or hospital near you has that medicine in stock, with directions based on landmarks.",
  },
  {
    question: "Is Zelthia free?",
    answer:
      "Yes. Asking questions, searching for medicine and keeping a health profile are free for patients.",
  },
  {
    question: "Does Zelthia replace a doctor?",
    answer:
      "No. Zelthia gives general guidance and helps you find care. It does not diagnose or prescribe. If you have chest pain, trouble breathing, heavy bleeding, sudden weakness or confusion, call 112 or go to the nearest emergency unit straight away.",
  },
  {
    question: "Why does Zelthia ask for my height, weight and allergies?",
    answer:
      "Safe advice depends on who is asking. Allergies and current medicines let Zelthia warn you about reactions and interactions, and age, height and weight help it sense-check doses. Every field is optional and you can change or delete it from your account at any time.",
  },
  {
    question: "How does the medicine search know what is in stock?",
    answer:
      "Pharmacies, clinics and hospitals keep their stock up to date in Zelthia's inventory tools. When you search, you see their current quantity, price, opening hours and how to get there.",
  },
  {
    question: "Why landmark directions instead of a map pin?",
    answer:
      "Street numbers are often missing and map pins can land on the wrong side of a road or inside a campus. Facilities describe the way in using places people already know, such as a bank, a filling station or a school gate.",
  },
  {
    question: "Can my pharmacy, clinic or hospital use Zelthia?",
    answer:
      "Yes. Create an account as a facility to record stock, get warned about expiring batches and low stock, and appear in local searches when patients look for a medicine you have.",
  },
  {
    question: "What happens to my health information?",
    answer:
      "Your profile is stored with your account and used to tailor answers. We don't sell it. You can delete your account from the account page, which permanently removes your profile. Read the privacy policy for the details.",
  },
];
