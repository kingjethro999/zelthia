import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
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
  "Zelthia is a free health and care companion for Nigeria. Ask an AI health chat that knows your allergies, get a doctor's note or prescription explained from a photo, and find which pharmacy, clinic or hospital has your medicine or test.";

const title = "Zelthia: AI health chat, doctor's note reader and medicine finder";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: title, template: "%s | Zelthia" },
  description,
  applicationName: "Zelthia",
  authors: [{ name: "Zelthia", url: SITE_URL }],
  creator: "Zelthia",
  publisher: "Zelthia",
  category: "health",
  keywords: [
    "Zelthia",
    "AI health assistant Nigeria",
    "symptom checker Nigeria",
    "read doctor's handwriting",
    "explain my prescription",
    "find medicine near me",
    "pharmacy near me with stock",
    "where to do a scan in Nigeria",
    "drug interaction checker",
    "pharmacy inventory software Nigeria",
    "clinic and hospital inventory management",
    "health products and skin care stock",
  ],
  alternates: {
    canonical: "/",
    // Plain-text description for AI agents and answer engines.
    types: { "text/plain": "/llms.txt" },
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Zelthia", statusBarStyle: "default" },
  formatDetection: { telephone: false },
  // Google Search Console ownership (the HTML file in public/ verifies it too).
  verification: { google: "lPK13chagDv8i5bMS5lDIzUcGerNFMeaPLkS1DXWn7U" },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: SITE_URL,
    siteName: "Zelthia",
    title,
    description,
  },
  twitter: { card: "summary_large_image", title, description },
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
        <Suspense>
          <Header />
        </Suspense>
        <main id="main" className="flex flex-1 flex-col">
          {children}
        </main>
        <Suspense>
          <Footer />
        </Suspense>
      </body>
    </html>
  );
}
