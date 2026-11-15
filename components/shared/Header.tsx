"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  HeartPulse,
  Bot,
  Building2,
  AlertCircle,
  Menu,
  X,
  ArrowRight,
  Sparkles,
  Pill,
} from "lucide-react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Global Emergency Disclaimer Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs px-4 py-2 font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              <strong>Medical Disclaimer:</strong> Zelthia provides AI health
              guidance &amp; directory assistance. If you are experiencing a
              life-threatening emergency, call your local emergency service
              immediately.
            </span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 bg-amber-500/20 px-2 py-0.5 rounded-full text-amber-800 dark:text-amber-300 font-semibold">
              Emergency Hotlines: 112 / 911
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/90 dark:bg-zinc-950/90 border-b border-zinc-200 dark:border-zinc-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link
            href="/"
            className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-lg p-1"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <HeartPulse className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl tracking-tight text-zinc-900 dark:text-zinc-100 font-sans">
                  Zelthia
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded">
                  Health AI
                </span>
              </div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:inline">
                Biometric Companion &amp; Care Navigator
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7">
            <Link
              href="/#features"
              className="text-sm font-medium text-zinc-600 hover:text-emerald-600 dark:text-zinc-300 dark:hover:text-emerald-400 transition-colors"
            >
              Platform Features
            </Link>

            <Link
              href="/#mission"
              className="text-sm font-medium text-zinc-600 hover:text-emerald-600 dark:text-zinc-300 dark:hover:text-emerald-400 transition-colors"
            >
              Community Impact
            </Link>

            <Link
              href="/#faq"
              className="text-sm font-medium text-zinc-600 hover:text-emerald-600 dark:text-zinc-300 dark:hover:text-emerald-400 transition-colors"
            >
              FAQ
            </Link>

            <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-800" />

            <Link
              href="/chat"
              className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800 transition-all shadow-sm"
            >
              <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>AI Health Chat</span>
              <span className="text-[10px] font-bold uppercase bg-emerald-600 text-white px-1.5 py-0.2 rounded-full">
                Active
              </span>
            </Link>

            <Link
              href="/inventory"
              className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:text-emerald-600 dark:hover:text-emerald-400 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all"
            >
              <Building2 className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              <span>Pharmacy &amp; Clinic Portal</span>
            </Link>
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/inventory"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 px-3.5 py-2 rounded-lg transition-colors border border-zinc-200 dark:border-zinc-700"
            >
              <Pill className="w-3.5 h-3.5 text-emerald-600" />
              <span>Check Drug Stock</span>
            </Link>

            <Link
              href="/chat"
              className="inline-flex items-center gap-2 text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 px-4 py-2 rounded-lg shadow-sm hover:shadow-emerald-600/25 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
              <span>Consult AI Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-lg px-4 pt-4 pb-6 space-y-4">
            <div className="flex flex-col space-y-3">
              <Link
                href="/chat"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-100 font-semibold"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-600 text-white rounded-lg">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm">AI Health Chat</div>
                    <div className="text-xs text-emerald-700 dark:text-emerald-300 font-normal">
                      Biometric-aware triage &amp; symptom check
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-600" />
              </Link>

              <Link
                href="/inventory"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-600 text-white rounded-lg">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm">Pharmacy &amp; Clinic Portal</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 font-normal">
                      Find medicine stock &amp; landmark directions
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-400" />
              </Link>
            </div>

            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex flex-col space-y-2 text-sm font-medium">
              <Link
                href="/#features"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                Core Features
              </Link>
              <Link
                href="/#mission"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                Community Impact &amp; Research
              </Link>
              <Link
                href="/#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                Frequently Asked Questions
              </Link>
            </div>

            <div className="pt-2">
              <Link
                href="/chat"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-md text-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>Start Free Consultation</span>
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
