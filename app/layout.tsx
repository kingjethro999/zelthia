import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { SITE_URL } from "@/lib/utils";

const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const body = Figtree({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f9f7" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1617" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const description =
  "Zelthia is a free AI health companion that checks advice against your allergies and medicines, then shows which pharmacy, clinic or hospital near you has the medicine in stock, with landmark directions.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Zelthia: AI health companion and medicine stock finder",
    template: "%s | Zelthia",
  },
  description,
  applicationName: "Zelthia",
  authors: [{ name: "Zelthia", url: SITE_URL }],
  creator: "Zelthia",
  publisher: "Zelthia",
  category: "health",
  keywords: [
    "Zelthia",
    "AI health assistant",
    "symptom checker Nigeria",
    "find medicine near me",
    "pharmacy stock checker",
    "drug availability Nigeria",
    "pharmacy inventory software",
    "clinic inventory management",
    "hospital stock management",
    "drug interaction checker",
    "allergy-aware health advice",
    "pharmacy near me Abuja",
  ],
  alternates: { canonical: "/" },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Zelthia",
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: SITE_URL,
    siteName: "Zelthia",
    title: "Zelthia: AI health companion and medicine stock finder",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Zelthia: AI health companion and medicine stock finder",
    description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-paper text-ink selection:bg-brand selection:text-white">
        <a
          href="#main"
          className="sr-only z-50 rounded-lg bg-surface px-4 py-2 text-sm font-semibold text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <SessionProvider />
        <Header />
        <main id="main" className="flex flex-1 flex-col">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
