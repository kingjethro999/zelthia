import type { Metadata } from "next";
import { NotFoundExperience } from "@/components/not-found/NotFoundExperience";

export const metadata: Metadata = {
  title: "Page not found",
  description:
    "This route isn't on Zelthia. Search live pharmacy stock, start a health chat, or return home.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="relative isolate flex min-h-dvh flex-1 flex-col overflow-hidden bg-paper">
      <div className="nf-mesh" aria-hidden="true" />
      <div className="nf-grain" aria-hidden="true" />
      <div className="nf-vignette" aria-hidden="true" />
      <NotFoundExperience />
    </div>
  );
}
