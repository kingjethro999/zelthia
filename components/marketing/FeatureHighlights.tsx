import React from "react";
import Link from "next/link";
import {
  Bot,
  Building2,
  Navigation,
  ScanBarcode,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export function FeatureHighlights() {
  const features = [
    {
      id: "biometric-chat",
      icon: Bot,
      title: "Biometric-Aware AI Health Chat",
      subtitle: "Personalized triage tailored to your body",
      description:
        "Unlike generic search engines or standard chatbots, Zelthia takes into account your age, biological sex, blood group, drug allergies, and active conditions to give tailored, context-aware health insights.",
      highlights: [
        "Personal profile memory (allergies & conditions)",
        "Triage levels: Low, Moderate, and Urgent escalation",
        "Clinical safety guardrails powered by Gemini & Groq",
      ],
      ctaText: "Start AI Health Chat",
      ctaHref: "/chat",
      gradient:
        "from-emerald-500/10 to-teal-500/10 dark:from-emerald-950/40 dark:to-teal-950/30",
      accentColor: "emerald",
      badge: "AI Powered",
    },
    {
      id: "realtime-inventory",
      icon: Building2,
      title: "Real-Time Pharmacy & Clinic Stock",
      subtitle: "Check live drug availability before leaving home",
      description:
        "Pharmacies, clinics, and hospitals manage their real-time medicine inventory. Patients instantly search by brand or generic name to find verified in-stock units, pricing, and operating hours.",
      highlights: [
        "Live stock status (In Stock, Low Stock, Restocked)",
        "Covers antimalarials, antibiotics, creams & emergencies",
        "Multi-tenant portal for hospitals and community chemists",
      ],
      ctaText: "Search Medicine Stock",
      ctaHref: "/inventory",
      gradient:
        "from-teal-500/10 to-cyan-500/10 dark:from-teal-950/40 dark:to-cyan-950/30",
      accentColor: "teal",
      badge: "Multi-Tenant Hub",
    },
    {
      id: "landmark-directions",
      icon: Navigation,
      title: "Plain-English Landmark Navigation",
      subtitle: "Directions written the way community locals navigate",
      description:
        "Informal street addressing and inaccurate GPS pins lead to wasted transit time. Zelthia captures recognizable physical landmarks (e.g., 'opposite First Bank gate, 50m past Total station') so anyone reaches care quickly.",
      highlights: [
        "Zero dependency on complex GPS mapping apps",
        "Step-by-step street landmarks verified by providers",
        "Eliminates wasted transport fare and neighborhood confusion",
      ],
      ctaText: "Explore Facilities Directory",
      ctaHref: "/inventory",
      gradient:
        "from-blue-500/10 to-indigo-500/10 dark:from-blue-950/40 dark:to-indigo-950/30",
      accentColor: "blue",
      badge: "Zero Map Friction",
    },
    {
      id: "drug-verification",
      icon: ScanBarcode,
      title: "Product & Drug Verification",
      subtitle: "OpenFDA and health database integration",
      description:
        "Equipped with drug, cosmetic, and food research APIs along with barcode inspection, Zelthia helps users check active ingredients, dosage warnings, potential drug interactions, and product authenticity.",
      highlights: [
        "OpenFDA drug label and recall cross-referencing",
        "Cosmetic and food ingredient safety checks",
        "Protects patients from unsafe self-medication",
      ],
      ctaText: "Verify Medication",
      ctaHref: "/inventory",
      gradient:
        "from-amber-500/10 to-emerald-500/10 dark:from-amber-950/40 dark:to-emerald-950/30",
      accentColor: "amber",
      badge: "Safety Intelligence",
    },
  ];

  return (
    <section
      id="features"
      className="py-20 lg:py-28 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Comprehensive Healthcare Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            Engineered to Solve the Last Mile of Healthcare
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
            From your very first symptom check to holding verified medication in
            your hand, Zelthia eliminates guesswork, misinformation, and
            physical transit friction.
          </p>
        </div>

        {/* 4 Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.id}
                className={`rounded-2xl p-8 border border-zinc-200 dark:border-zinc-800 bg-gradient-to-br ${feature.gradient} flex flex-col justify-between hover:shadow-lg transition-all duration-300 group`}
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                      {feature.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                      {feature.title}
                    </h3>
                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mt-1">
                      {feature.subtitle}
                    </p>
                  </div>

                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Bullet highlights */}
                  <div className="space-y-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60">
                    {feature.highlights.map((highlight, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-zinc-200/80 dark:border-zinc-800/80">
                  <Link
                    href={feature.ctaHref}
                    className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 group/link"
                  >
                    <span>{feature.ctaText}</span>
                    <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Workflow Pipeline Graphic */}
        <div className="mt-16 p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              The Seamless Care Journey with Zelthia
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              From inquiry to physical treatment in four simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            <div className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-center space-y-2">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-sm mx-auto flex items-center justify-center">
                1
              </div>
              <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                Log Biometrics
              </h4>
              <p className="text-xs text-zinc-500">
                Provide basic health context (age, allergies, chronic
                conditions) stored securely.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-center space-y-2">
              <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold text-sm mx-auto flex items-center justify-center">
                2
              </div>
              <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                Consult AI Chat
              </h4>
              <p className="text-xs text-zinc-500">
                Discuss symptoms naturally and get evidence-based triage and
                medication names.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-center space-y-2">
              <div className="w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 font-bold text-sm mx-auto flex items-center justify-center">
                3
              </div>
              <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                Verify Nearby Stock
              </h4>
              <p className="text-xs text-zinc-500">
                Check which local pharmacy or clinic has verified stock in
                seconds.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-center space-y-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-sm mx-auto flex items-center justify-center">
                4
              </div>
              <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                Follow Landmarks
              </h4>
              <p className="text-xs text-zinc-500">
                Navigate directly with step-by-step local landmarks without
                getting lost.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
