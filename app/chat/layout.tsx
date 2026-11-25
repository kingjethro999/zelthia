import type { Metadata } from "next";
import { Suspense } from "react";
import { ChatApp } from "@/components/chat/ChatApp";

export const metadata: Metadata = {
  title: "Health chat: read doctor's notes and find care",
  description:
    "Ask Zelthia about symptoms or medicines, or upload a doctor's note, prescription or result. It explains it in plain language, checks your allergies, and finds where to get the test or medicine.",
  keywords: [
    "read doctor's handwriting",
    "explain my prescription",
    "AI symptom checker Nigeria",
    "where to do echo scan",
    "drug interaction checker",
    "health chat",
  ],
  alternates: { canonical: "/chat" },
  openGraph: { title: "Health chat | Zelthia", url: "/chat" },
};

/** The chat shell lives in the layout so switching chats doesn't remount it. */
export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={<div className="h-dvh bg-paper" />}>
        <ChatApp />
      </Suspense>
      {children}
    </>
  );
}
