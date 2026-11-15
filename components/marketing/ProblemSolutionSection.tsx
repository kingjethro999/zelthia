import React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Users,
  FileText,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

export function ProblemSolutionSection() {
  return (
    <section
      id="mission"
      className="py-20 lg:py-28 bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 text-xs font-semibold uppercase tracking-wider">
            <Users className="w-3.5 h-3.5" />
            <span>Real Evidence &amp; Community Origins</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            Why Zelthia Was Created: Solving Last-Mile Medicine Friction
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Healthcare friction isn’t just about the absence of medicine—it’s
            about the lack of real-time visibility, unguided self-treatment, and
            broken street navigation.
          </p>
        </div>

        {/* The Origin Story & Campus Survey Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-16">
          {/* Origin Story Column (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-zinc-950 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              <span>The Founder’s Experience</span>
            </div>

            <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Walking From Pharmacy to Pharmacy Looking for One Cream
            </h3>

            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              &ldquo;I developed a sudden, acute skin reaction. I walked my
              entire street and neighborhood—going from pharmacy to pharmacy,
              store to store—asking for a specific soothing cream. None of them
              had it in stock. I wasted hours and exhausted myself while dealing
              with physical discomfort.&rdquo;
            </p>

            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              &ldquo;The next day, I returned to the very first chemist only to
              find out they had just restocked that morning. Had I known what
              was in stock beforehand, I would never have roamed the streets.
              That night of exhaustion sparked Zelthia: a tool where anyone can
              verify local availability and get reliable guidance before
              stepping out the door.&rdquo;
            </p>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-4 text-xs font-medium text-zinc-500">
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                The Core Mission:
              </span>
              <span>
                Zero wasted trips • Real-time visibility • Immediate peace of
                mind
              </span>
            </div>
          </div>

          {/* Campus Survey Data (5 cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-emerald-950 via-zinc-950 to-teal-950 text-white p-8 rounded-2xl border border-emerald-800/40 shadow-xl space-y-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <FileText className="w-4 h-4" />
              <span>Campus Survey Validation</span>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">
                Lincoln University College Survey
              </h3>
              <p className="text-xs text-emerald-300 mt-1">
                Conducted across Abuja and Nsukka student &amp; local
                communities
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl">
                <div className="text-2xl font-extrabold text-emerald-400">
                  87%
                </div>
                <div className="text-xs text-zinc-300 mt-0.5">
                  Reported wasting transport money or walking across multiple
                  pharmacies to find basic medications (antimalarials,
                  antibiotics, topical creams).
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl">
                <div className="text-2xl font-extrabold text-teal-400">92%</div>
                <div className="text-xs text-zinc-300 mt-0.5">
                  Stated that digital map pins often mislead in informal
                  neighborhoods and preferred plain-English landmark directions
                  to locate clinics.
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl">
                <div className="text-2xl font-extrabold text-cyan-400">
                  100%
                </div>
                <div className="text-xs text-zinc-300 mt-0.5">
                  Wanted free, immediate symptom triage grounded in authentic
                  healthcare inventory rather than generic hallucinated answers.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison: The Old Way vs. The Zelthia Way */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* The Old Way */}
          <div className="bg-white dark:bg-zinc-950 p-8 rounded-2xl border border-red-200 dark:border-red-950/60 shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
              <ShieldAlert className="w-4 h-4" />
              <span>The Conventional Struggle</span>
            </div>
            <h4 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Blind Searching &amp; Fragmented Care
            </h4>
            <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
              <li className="flex items-start gap-2.5">
                <span className="text-red-500 font-bold shrink-0">✕</span>
                <span>
                  Walking or commuting blindly across town hoping a chemist has
                  your prescribed drug.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-500 font-bold shrink-0">✕</span>
                <span>
                  Googling symptoms only to receive frightening or non-localized
                  generic advice.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-500 font-bold shrink-0">✕</span>
                <span>
                  GPS coordinates dropping you into unmarked streets or dead
                  ends without local landmarks.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-500 font-bold shrink-0">✕</span>
                <span>
                  Unverified drugs and cosmetic formulas bought without active
                  ingredient verification.
                </span>
              </li>
            </ul>
          </div>

          {/* The Zelthia Solution */}
          <div className="bg-white dark:bg-zinc-950 p-8 rounded-2xl border border-emerald-300 dark:border-emerald-800/80 shadow-md space-y-5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>The Zelthia Solution</span>
            </div>
            <h4 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Connected, Biometric-Aware Care
            </h4>
            <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                <span>
                  Check live multi-tenant inventory counts before you ever leave
                  your home or hostel.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                <span>
                  AI clinical companion factors in your age, allergies, and
                  chronic conditions for safety.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                <span>
                  Clear landmark instructions: &ldquo;Opposite First Bank, 50m
                  past Total station.&rdquo;
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                <span>
                  Integrated OpenFDA database cross-referencing for medications,
                  recalls, and active formulas.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* CTA to Directory & Chat */}
        <div className="mt-12 text-center">
          <Link
            href="/inventory"
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:underline"
          >
            <span>Explore the community health &amp; pharmacy directory</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
