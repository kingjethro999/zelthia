import React from "react";
import Link from "next/link";
import {
  HeartPulse,
  ShieldCheck,
  Building2,
  Bot,
  MapPin,
  Lock,
  ExternalLink,
  Pill,
} from "lucide-react";

export function Footer() {
  const currentYear = 2026;

  return (
    <footer className="bg-zinc-950 text-zinc-300 border-t border-zinc-800">
      {/* Top Clinical & Emergency Advisory Callout */}
      <div className="bg-zinc-900/80 border-b border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-xl bg-zinc-950/60 border border-zinc-800">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-zinc-400 leading-relaxed">
                <span className="font-semibold text-zinc-200">
                  Clinical Disclaimer:
                </span>{" "}
                Zelthia provides informational guidance and connects you to
                licensed care providers. It does not replace professional
                medical advice, clinical diagnosis, or emergency treatment. In
                emergencies, call your local medical emergency service
                immediately (e.g. 112 / 911).
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-950/70 text-emerald-400 border border-emerald-800/60 font-medium">
                Encrypted &amp; HIPAA-Aligned
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Info & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                <HeartPulse className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="font-bold text-xl text-white tracking-tight">
                Zelthia
              </span>
            </Link>

            <p className="text-sm text-zinc-400 leading-relaxed max-w-sm">
              Your biometric-aware AI health companion and community care
              navigator. Bridging the gap between symptoms and verified local
              pharmacy stock with plain-English landmark directions.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero-Sale of Biometric Data</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>100% Free For Patients</span>
              </span>
            </div>
          </div>

          {/* Column 1: Patient Care & AI */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
              Patient Care
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/chat"
                  className="text-zinc-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <Bot className="w-3.5 h-3.5 text-emerald-500" />
                  <span>AI Health Chat</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/chat"
                  className="text-zinc-400 hover:text-emerald-400 transition-colors"
                >
                  Biometric Symptom Triage
                </Link>
              </li>
              <li>
                <Link
                  href="/inventory"
                  className="text-zinc-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <Pill className="w-3.5 h-3.5 text-teal-500" />
                  <span>Check Drug Stock</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/#features"
                  className="text-zinc-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Landmark Navigation</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Healthcare Providers */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
              Healthcare Providers
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/inventory"
                  className="text-zinc-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <Building2 className="w-3.5 h-3.5 text-teal-400" />
                  <span>Provider Portal</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/inventory"
                  className="text-zinc-400 hover:text-emerald-400 transition-colors"
                >
                  Register Pharmacy / Clinic
                </Link>
              </li>
              <li>
                <Link
                  href="/inventory"
                  className="text-zinc-400 hover:text-emerald-400 transition-colors"
                >
                  Multi-Tenant Inventory Hub
                </Link>
              </li>
              <li>
                <Link
                  href="/inventory"
                  className="text-zinc-400 hover:text-emerald-400 transition-colors"
                >
                  Publish Landmark Directions
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Trust, Research & Legal */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
              Research &amp; Safety
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/#mission"
                  className="text-zinc-400 hover:text-emerald-400 transition-colors"
                >
                  Lincoln University Survey
                </Link>
              </li>
              <li>
                <Link
                  href="/#mission"
                  className="text-zinc-400 hover:text-emerald-400 transition-colors"
                >
                  Solving Medicine Friction
                </Link>
              </li>
              <li>
                <Link
                  href="/#faq"
                  className="text-zinc-400 hover:text-emerald-400 transition-colors"
                >
                  Platform Safety &amp; AI Limits
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/FDA/openfda"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-1"
                >
                  <span>OpenFDA Drug Verification</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Emergency Contacts */}
        <div className="mt-12 pt-8 border-t border-zinc-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>
            © {currentYear} Zelthia Health Technologies. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <span>Built for Universal Healthcare Accessibility</span>
            <span className="hidden sm:inline">•</span>
            <span>Abuja &amp; Nsukka Community Pilot</span>
            <span className="hidden sm:inline">•</span>
            <span className="text-emerald-400 font-medium">
              Privacy-First Architecture
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
