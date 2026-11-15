"use client";

import React from "react";
import {
  Thermometer,
  Sparkles,
  Store,
  ShieldCheck,
  Activity,
  HeartPulse,
} from "lucide-react";

interface QuickStartersProps {
  onSelectPrompt: (promptText: string) => void;
  disabled?: boolean;
}

const STARTER_PROMPTS = [
  {
    text: "Check symptoms for fever/malaria",
    icon: Thermometer,
    badge: "Common Triage",
    color: "hover:border-amber-400 hover:text-amber-700",
  },
  {
    text: "Skin rash & cream advice",
    icon: Sparkles,
    badge: "Dermatology",
    color: "hover:border-teal-400 hover:text-teal-700",
  },
  {
    text: "Check pharmacy stock for antibiotics",
    icon: Store,
    badge: "Inventory / Care",
    color: "hover:border-blue-400 hover:text-blue-700",
  },
  {
    text: "Drug interaction check",
    icon: ShieldCheck,
    badge: "Safety",
    color: "hover:border-emerald-400 hover:text-emerald-700",
  },
  {
    text: "Headache & high blood pressure check",
    icon: Activity,
    badge: "Cardio",
    color: "hover:border-indigo-400 hover:text-indigo-700",
  },
  {
    text: "Stomach pain & hydration advice",
    icon: HeartPulse,
    badge: "Gastro",
    color: "hover:border-rose-400 hover:text-rose-700",
  },
];

export const QuickStarters: React.FC<QuickStartersProps> = ({
  onSelectPrompt,
  disabled = false,
}) => {
  return (
    <div className="w-full py-2">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-medium text-slate-400 shrink-0 mr-1 hidden sm:inline">
          Quick Starters:
        </span>
        {STARTER_PROMPTS.map((starter, idx) => {
          const Icon = starter.icon;
          return (
            <button
              key={idx}
              type="button"
              disabled={disabled}
              onClick={() => onSelectPrompt(starter.text)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200/90 bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs backdrop-blur-xs transition-all hover:scale-[1.02] active:scale-95 disabled:pointer-events-none disabled:opacity-50 dark:border-slate-700/80 dark:bg-slate-800/80 dark:text-slate-200 ${starter.color}`}
            >
              <Icon className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
              <span>{starter.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
