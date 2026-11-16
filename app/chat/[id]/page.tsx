import type { Metadata } from "next";

export const metadata: Metadata = { robots: { index: false, follow: false } };

/** Rendered by the chat layout, which reads the id from the URL. */
export default function ConversationPage() {
  return null;
}
