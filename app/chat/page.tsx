import type { Metadata } from "next";
import { ChatContainer } from "@/components/chat/ChatContainer";

export const metadata: Metadata = {
  title: "AI health chat: symptom checker that knows your allergies",
  description:
    "Ask Zelthia about symptoms or medicines. Answers check your allergies, conditions and current medicines, flag emergencies, and point you to pharmacies with stock nearby.",
  keywords: [
    "AI symptom checker",
    "health chat Nigeria",
    "drug interaction checker",
    "malaria symptoms",
    "is it safe to take",
    "allergy medicine check",
  ],
  alternates: { canonical: "/chat" },
  openGraph: {
    title: "AI health chat | Zelthia",
    description:
      "Symptom and medicine questions answered with your allergies and medicines in mind.",
    url: "/chat",
  },
};

export default function ChatPage() {
  return <ChatContainer />;
}
