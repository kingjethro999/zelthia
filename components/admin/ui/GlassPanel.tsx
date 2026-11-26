"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const PADDING = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export function GlassCard({
  children,
  interactive = false,
  padding = "md",
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  interactive?: boolean;
  padding?: keyof typeof PADDING;
  className?: string;
  as?: "div" | "section" | "article";
}) {
  return (
    <Tag
      className={cn(
        "adm-glass-card rounded-3xl",
        interactive && "adm-glass-card-hover",
        PADDING[padding],
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/**
 * Single liquid-glass executive surface. Uses a gentle SVG displacement filter
 * on its decorative backdrop sheen layer only so foreground text stays sharp.
 */
export function GlassHero({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn("adm-glass-hero rounded-[28px] p-6 sm:p-7", className)}
    >
      <svg
        width="0"
        height="0"
        aria-hidden
        className="pointer-events-none absolute h-0 w-0"
      >
        <defs>
          <filter id="adm-liquid-glass">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.008 0.012"
              numOctaves="2"
              seed="5"
              result="noise"
            >
              <animate
                attributeName="baseFrequency"
                dur="18s"
                values="0.008 0.012;0.012 0.008;0.008 0.012"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="10"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
      <div className="adm-liquid-layer" aria-hidden />
      <div className="adm-sweep" aria-hidden />
      <div className="relative z-10">{children}</div>
    </section>
  );
}

export function GlassInset({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("adm-inner-well rounded-2xl p-4", className)}>
      {children}
    </div>
  );
}

type BadgeTone = "brand" | "caution" | "alert" | "sky" | "neutral";

const TONE_CLS: Record<BadgeTone, string> = {
  brand: "bg-brand-soft text-brand-strong border-brand/20",
  caution: "bg-caution-soft text-caution border-caution/20",
  alert: "bg-alert-soft text-alert border-alert/20",
  sky: "bg-sky-soft text-sky border-sky/20",
  neutral: "bg-mist text-muted border-line",
};

const DOT_CLS: Record<BadgeTone, string> = {
  brand: "bg-brand",
  caution: "bg-caution",
  alert: "bg-alert",
  sky: "bg-sky",
  neutral: "bg-muted",
};

export function GlassBadge({
  children,
  tone = "neutral",
  dot = false,
  icon: Icon,
  className,
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  dot?: boolean;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        TONE_CLS[tone],
        className,
      )}
    >
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full", DOT_CLS[tone])}
          aria-hidden
        />
      )}
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />}
      {children}
    </span>
  );
}
