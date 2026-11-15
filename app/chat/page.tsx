import type { Metadata } from "next";
import { ChatContainer } from "@/components/chat/ChatContainer";

export const metadata: Metadata = {
  title: "AI Health Companion Chat | Zelthia",
  description:
    "Consult Zelthia AI Health Companion with real-time biometric awareness, clinical triage safety guardrails, drug interaction alerts, and verified local pharmacy stock navigation in Nigeria.",
  keywords: [
    "AI health companion",
    "medical symptom checker",
    "biometric health chat",
    "drug interaction checker",
    "pharmacy stock Nigeria",
    "clinic locator",
    "malaria triage",
    "healthcare navigator",
    "Zelthia",
  ],
  openGraph: {
    title: "AI Health Companion Chat | Zelthia",
    description:
      "Consult Zelthia AI Health Companion with real-time biometric awareness, clinical triage, and verified local pharmacy stock navigation.",
    url: "/chat",
    siteName: "Zelthia",
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Health Companion Chat | Zelthia",
    description:
      "Biometric-aware clinical triage, safety guardrails, and real-time pharmacy stock finder in Nigeria.",
  },
};

export default function ChatPage() {
  return <ChatContainer />;
}
