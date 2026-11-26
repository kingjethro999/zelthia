import { notFound } from "next/navigation";

/** Legacy path disabled so the admin console URL is never exposed or guessable. */
export default function LegacyAdminPage() {
  notFound();
}
