import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://zelthia.health";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#059669" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default:
      "Zelthia | Biometric-Aware AI Health Companion & Community Care Navigator",
    template: "%s | Zelthia",
  },
  description:
    "Zelthia provides biometric-aware AI health guidance, verified local pharmacy inventory, and plain-English landmark directions to bridge last-mile healthcare access.",
  keywords: [
    "Zelthia",
    "AI health companion",
    "pharmacy inventory system",
    "hospital stock tracker",
    "clinic medicine finder",
    "landmark health directions",
    "biometric medical chat",
    "healthcare Nigeria",
    "last-mile medicine search",
    "drug availability checker",
    "community health directory",
    "Lincoln University College health survey",
  ],
  authors: [{ name: "Zelthia Health Technologies", url: siteUrl }],
  creator: "Zelthia",
  publisher: "Zelthia Health",
  applicationName: "Zelthia Health Companion",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title:
      "Zelthia | Biometric-Aware AI Health Companion & Community Care Navigator",
    description:
      "Never walk from pharmacy to pharmacy searching for out-of-stock medicine again. Zelthia pairs biometric-aware AI health triage with real-time clinic inventories and plain-English landmark directions.",
    siteName: "Zelthia",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Zelthia - Biometric-Aware AI Health Companion & Community Care Navigator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zelthia | Biometric-Aware AI Health Companion & Care Navigator",
    description:
      "Context-aware AI symptom triage, verified local pharmacy inventory, and plain-English landmark directions.",
    images: ["/og-image.png"],
    creator: "@zelthiahealth",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col font-sans bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 selection:bg-emerald-500 selection:text-white">
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
