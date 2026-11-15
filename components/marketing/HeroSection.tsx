import React from "react";
import Link from "next/link";
import {
  Sparkles,
  Bot,
  Building2,
  ArrowRight,
  CheckCircle2,
  Pill,
  HeartPulse,
  Navigation,
} from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/60 via-white to-white dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 pt-10 pb-20 lg:pt-16 lg:pb-32 border-b border-zinc-200/80 dark:border-zinc-800/80">
      {/* Background Glow Decorations */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-emerald-200/30 via-teal-200/20 to-transparent dark:from-emerald-950/20 dark:via-teal-950/10 dark:to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Pilot Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/80 border border-emerald-300/80 dark:border-emerald-700/80 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-medium shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold">Healthcare Access Redefined:</span>
            <span>Lincoln University College Survey &amp; Community Pilot</span>
          </div>
        </div>

        {/* Hero Title & Subheadline */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-[1.15]">
            Your Biometric-Aware{" "}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              AI Health Companion
            </span>{" "}
            &amp; Community Care Navigator
          </h1>

          <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-3xl mx-auto font-normal">
            Never walk from pharmacy to pharmacy searching for out-of-stock
            medicine again. Zelthia pairs personalized, biometric-informed AI
            health guidance with real-time clinic inventories and plain-English
            landmark directions.
          </p>

          {/* Primary Call-to-Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/chat"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-7 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-base shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/35 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              <Bot className="w-5 h-5 text-emerald-200" />
              <span>Start AI Consultation</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/inventory"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-100 font-semibold text-base border border-zinc-300 dark:border-zinc-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-zinc-400"
            >
              <Building2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <span>Check Pharmacy Stock &amp; Facilities</span>
            </Link>
          </div>

          {/* Trust Highlights Strip */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>100% Free For Patients</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Zero-Wasted Pharmacy Trips</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Plain-English Landmark Navigation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Encrypted Biometric Privacy</span>
            </div>
          </div>
        </div>

        {/* Dual Interactive Mockup Card Preview */}
        <div className="mt-14 max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Card 1: Biometric AI Companion Preview (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-zinc-900/90 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                    <HeartPulse className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <span>Zelthia Clinical AI</span>
                      <span className="text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                        Biometric Mode
                      </span>
                    </div>
                    <div className="text-xs text-zinc-500">
                      Active Profile: Sarah (24y, Female)
                    </div>
                  </div>
                </div>
                <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Online</span>
                </div>
              </div>

              {/* Active Biometrics Tags */}
              <div className="flex flex-wrap gap-1.5 text-[11px] bg-zinc-50 dark:bg-zinc-950/70 p-2.5 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60">
                <span className="text-zinc-500 font-medium">
                  Biometrics in context:
                </span>
                <span className="bg-emerald-100/70 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded font-medium">
                  Allergy: Penicillin
                </span>
                <span className="bg-teal-100/70 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300 px-2 py-0.5 rounded font-medium">
                  Condition: Asthma
                </span>
                <span className="bg-blue-100/70 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded font-medium">
                  Blood Group: O+
                </span>
              </div>

              {/* Chat Simulation */}
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="bg-zinc-100 dark:bg-zinc-800/80 p-3 rounded-2xl rounded-tr-none text-zinc-800 dark:text-zinc-200 self-end ml-6">
                  <p className="font-medium text-zinc-900 dark:text-zinc-100 mb-0.5 text-xs text-right text-zinc-500">
                    Patient
                  </p>
                  I have an itchy red skin rash spreading on my forearm since
                  yesterday. Any cream I can use?
                </div>

                <div className="bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 p-3.5 rounded-2xl rounded-tl-none text-zinc-800 dark:text-zinc-200 mr-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Zelthia AI Assessment</span>
                  </div>
                  <p className="leading-relaxed text-xs">
                    Given your profile with no corticosteroid allergies, an OTC{" "}
                    <strong>Hydrocortisone 1% cream</strong> applied sparingly
                    2x daily may relieve the irritation. Avoid scratch abrasion.
                  </p>
                  <div className="pt-1 border-t border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-between text-xs">
                    <span className="text-emerald-900 dark:text-emerald-200 font-medium">
                      ✓ Verified in stock at 2 local pharmacies
                    </span>
                    <Link
                      href="/inventory"
                      className="text-emerald-700 dark:text-emerald-300 font-bold hover:underline"
                    >
                      View Stock &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
              <span>Powered by Gemini &amp; Groq Healthcare Models</span>
              <Link
                href="/chat"
                className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
              >
                Open AI Health Chat &rarr;
              </Link>
            </div>
          </div>

          {/* Card 2: Landmark-Based Navigation & Live Stock Card (5 cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-teal-900 via-zinc-900 to-zinc-950 text-white rounded-2xl border border-teal-800/50 p-6 shadow-xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-teal-800/40 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Live Facility Match
                    </h3>
                    <p className="text-[11px] text-teal-300">
                      Verified Provider Directory
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  IN STOCK
                </span>
              </div>

              <div>
                <h4 className="font-bold text-base text-zinc-100">
                  Apex Wellness Community Pharmacy
                </h4>
                <div className="text-xs text-teal-200/90 flex items-center gap-1.5 mt-0.5">
                  <Pill className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Hydrocortisone 1% Topical (15g tube) • 18 units</span>
                </div>
              </div>

              {/* Landmark directions box */}
              <div className="bg-zinc-900/80 border border-teal-700/50 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-300">
                  <Navigation className="w-3.5 h-3.5 text-teal-400" />
                  <span>Plain-English Landmark Directions:</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed italic">
                  &ldquo;Located directly opposite First Bank main gate, exactly
                  50 meters past the Total filling station junction along
                  University Road.&rdquo;
                </p>
                <div className="text-[11px] text-zinc-400 flex items-center gap-2 pt-1 border-t border-zinc-800">
                  <span>Open: 8:00 AM – 9:30 PM</span>
                  <span>•</span>
                  <span>Call: +234 802 555 0192</span>
                </div>
              </div>

              <div className="text-xs text-zinc-400 leading-snug">
                Eliminates map confusion, broken GPS pins, and informal street
                addressing in campus &amp; community neighborhoods.
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-teal-800/40 flex items-center justify-between">
              <span className="text-xs text-teal-300/80">
                Multi-Tenant Portal
              </span>
              <Link
                href="/inventory"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-200 bg-teal-800/40 hover:bg-teal-700/50 px-3 py-1.5 rounded-lg border border-teal-600/40 transition-colors"
              >
                <span>Search Local Stock</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
