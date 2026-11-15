import React from "react";
import Link from "next/link";
import {
  Bot,
  Building2,
  ArrowRight,
  ShieldCheck,
  HeartPulse,
} from "lucide-react";

export function CtaBanner() {
  return (
    <section className="py-20 bg-gradient-to-br from-zinc-900 via-emerald-950 to-zinc-950 text-white relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold uppercase tracking-wider">
            <HeartPulse className="w-3.5 h-3.5" />
            <span>Accessible Care For Every Community</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Stop Guessing. Verify Symptoms &amp; Nearby Medicine Instantly.
          </h2>

          <p className="text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            Whether you need rapid biometric health guidance or want to locate
            an in-stock pharmacy around Abuja, Nsukka, or beyond, Zelthia is
            completely free and ready for you.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/chat"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-zinc-950 font-bold text-base shadow-xl shadow-emerald-500/20 transition-all"
            >
              <Bot className="w-5 h-5 text-zinc-950" />
              <span>Launch Free AI Health Chat</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/inventory"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-base border border-white/20 backdrop-blur-sm transition-all"
            >
              <Building2 className="w-5 h-5 text-emerald-300" />
              <span>Register or Browse Facilities</span>
            </Link>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              No Credit Card or Insurance Required
            </span>
            <span>•</span>
            <span>Zero Map Reading Confusion</span>
            <span>•</span>
            <span>HIPAA-Aligned Privacy</span>
          </div>
        </div>
      </div>
    </section>
  );
}
