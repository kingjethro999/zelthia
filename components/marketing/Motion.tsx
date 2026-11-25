"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  BellRing,
  CalendarClock,
  CircleCheck,
  Globe,
  LoaderCircle,
  MapPinned,
  Minus,
  Plus,
  ScanText,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";

const reducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Fades and lifts content in as it scrolls into view. Content below the fold
 * is hidden only once the client has measured it, so the server render and
 * no-script visitors always get the full page.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section";
}) {
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState<"visible" | "hidden" | "shown">("visible");

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion()) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;
    setState("hidden");
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState("shown");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={cn("reveal", className)}
      data-state={state}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}

/** Two slow, blurred colour fields that drift behind a hero. Transform only. */
export function Orbs() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div className="orb orb-a" />
      <div className="orb orb-b" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* People: a health chat that plays itself                             */
/* ------------------------------------------------------------------ */

const SCENARIOS = [
  {
    profile: "Profile: allergic to penicillin, has asthma",
    ask: "My throat is sore and swollen. Can I take amoxicillin?",
    icon: AlertTriangle,
    tone: "alert" as const,
    head: "Avoid amoxicillin: it's a penicillin.",
    body: "Ibuprofen can also trigger asthma. For the pain, paracetamol is the safer choice. See a pharmacist if it lasts beyond three days.",
    steps: [
      {
        icon: CircleCheck,
        text: "Checked pharmacies on Zelthia near you for paracetamol",
      },
      {
        icon: Globe,
        text: "Searched the web for nearby stockists, with photos and links",
      },
      {
        icon: MapPinned,
        text: "Shows landmark directions and a call button when a pharmacy has listed it",
      },
    ],
  },
  {
    profile: "Profile: 54 years old, takes lisinopril",
    ask: "The doctor wrote 2D ECHO on my card. Where can I do it near Wuse?",
    icon: ScanText,
    tone: "brand" as const,
    head: "That is an echocardiogram, a scan of the heart.",
    body: "Three facilities near Wuse list it. The closest is open until 6pm and is behind the First Bank on Aminu Kano Crescent.",
    steps: [
      {
        icon: CircleCheck,
        text: "Read the referral card and explained each line",
      },
      { icon: CircleCheck, text: "Checked Zelthia listings in Abuja" },
      {
        icon: MapPinned,
        text: "Landmark directions ready, with a call button",
      },
    ],
  },
];

type Stage = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export function HeroDemo() {
  const [idx, setIdx] = useState(0);
  const [stage, setStage] = useState<Stage>(6);
  const [typed, setTyped] = useState(SCENARIOS[0].ask.length);
  const [leaving, setLeaving] = useState(false);
  const sc = SCENARIOS[idx];

  useEffect(() => {
    if (reducedMotion()) return;
    let dead = false;
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) =>
      timers.push(window.setTimeout(() => !dead && fn(), ms));

    const play = (n: number) => {
      const s = SCENARIOS[n];
      setIdx(n);
      setLeaving(false);
      setStage(0);
      setTyped(0);
      at(500, () => setStage(1));
      // Type the question in.
      const step = 28;
      for (let c = 1; c <= s.ask.length; c++)
        at(900 + c * step, () => setTyped(c));
      const t0 = 900 + s.ask.length * step;
      at(t0 + 250, () => setStage(2)); // thinking
      at(t0 + 1500, () => setStage(3)); // answer
      at(t0 + 2500, () => setStage(4)); // steps 1
      at(t0 + 3200, () => setStage(5)); // steps 2
      at(t0 + 3900, () => setStage(6)); // steps 3
      at(t0 + 8200, () => setLeaving(true));
      at(t0 + 8700, () => play((n + 1) % SCENARIOS.length));
    };
    play(0);
    return () => {
      dead = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  const Icon = sc.icon;
  return (
    <figure
      aria-label="Example conversation with Zelthia"
      className="glass-card rounded-[28px] p-4 sm:p-6"
    >
      <figcaption className="mb-3 text-xs font-medium text-muted">
        Example
      </figcaption>
      <div
        key={idx}
        className={cn(
          "transition-opacity duration-500",
          leaving && "opacity-0",
        )}
      >
        <div
          className={cn(
            "flex items-center gap-2 border-b border-line pb-3 text-sm text-muted",
            stage >= 0 && "animate-rise",
          )}
        >
          <UserRound className="h-4 w-4" aria-hidden />
          {sc.profile}
        </div>

        <div className="mt-4 min-h-[19rem] space-y-3">
          {stage >= 1 && (
            <p className="animate-rise ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-brand px-4 py-3 text-[15px] text-white dark:text-[#06231a]">
              {sc.ask.slice(0, typed)}
              {typed < sc.ask.length && <span className="caret" aria-hidden />}
            </p>
          )}

          {stage === 2 && (
            <p
              className="animate-rise flex w-fit items-center gap-1.5 rounded-2xl rounded-bl-md border border-line bg-paper px-4 py-3"
              aria-label="Zelthia is thinking"
            >
              <span className="dot" />
              <span className="dot" style={{ animationDelay: "120ms" }} />
              <span className="dot" style={{ animationDelay: "240ms" }} />
            </p>
          )}

          {stage >= 3 && (
            <div className="animate-rise max-w-[92%] rounded-2xl rounded-bl-md border border-line bg-paper px-4 py-3 text-[15px] text-ink">
              <p
                className={cn(
                  "flex items-start gap-2 font-semibold",
                  sc.tone === "alert" ? "text-alert" : "text-brand",
                )}
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                {sc.head}
              </p>
              <p className="mt-1.5 text-muted">{sc.body}</p>
            </div>
          )}

          {stage >= 4 && (
            <ol className="max-w-[92%] space-y-2 rounded-2xl border border-line bg-paper p-4 text-sm">
              {sc.steps.map((st, i) => {
                const SIcon = st.icon;
                const shown = stage >= 4 + i;
                const done = stage >= 5 + i || stage === 6;
                if (!shown) return null;
                return (
                  <li
                    key={st.text}
                    className="animate-rise flex items-start gap-2 text-ink"
                  >
                    {done ? (
                      <SIcon
                        className="tick-pop mt-0.5 h-4 w-4 shrink-0 text-brand"
                        aria-hidden
                      />
                    ) : (
                      <LoaderCircle
                        className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-brand"
                        aria-hidden
                      />
                    )}
                    {st.text}
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* Facilities: a stock dashboard that updates as people buy and search  */
/* ------------------------------------------------------------------ */

interface Row {
  name: string;
  pack: string;
  qty: number;
  low: number;
  price: string;
  expires?: string;
}

const START: Row[] = [
  {
    name: "Paracetamol 500mg",
    pack: "Pack of 20",
    qty: 120,
    low: 30,
    price: "₦800",
  },
  {
    name: "Amoxicillin 500mg",
    pack: "Pack of 21",
    qty: 36,
    low: 25,
    price: "₦1,500",
    expires: "in 48 days",
  },
  {
    name: "Artemether/Lumefantrine",
    pack: "Pack of 24",
    qty: 64,
    low: 20,
    price: "₦2,200",
  },
];

const SEARCHES = ["Amoxicillin 500mg", "Paracetamol", "Malaria test"];

export function FacilityDemo({ solid = false }: { solid?: boolean }) {
  const [rows, setRows] = useState(START);
  const [hot, setHot] = useState<number | null>(null);
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);

  useEffect(() => {
    if (reducedMotion()) return;
    let n = 0;
    const id = window.setInterval(() => {
      n++;
      const i = n % START.length;
      setRows((rs) =>
        rs.map((r, k) =>
          k === i
            ? { ...r, qty: r.qty > 6 ? r.qty - 1 - (n % 3) : START[i].qty }
            : r,
        ),
      );
      setHot(i);
      if (n % 3 === 0)
        setToast({
          id: n,
          text: `Someone near you searched "${SEARCHES[((n / 3) % SEARCHES.length) | 0]}"`,
        });
      window.setTimeout(() => setHot((h) => (h === i ? null : h)), 700);
    }, 1400);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const low = rows.filter((r) => r.qty <= r.low).length;

  return (
    <figure
      aria-label="Example of a facility's stock dashboard"
      className="glass-card rounded-[28px] p-4 sm:p-6"
      data-solid={solid || undefined}
    >
      <figcaption className="mb-3 text-xs font-medium text-muted">
        Example
      </figcaption>
      <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
        <div className="min-w-0">
          <p className="truncate font-display text-lg font-semibold text-ink">
            Greenfield Pharmacy
          </p>
          <p className="text-sm text-muted">Pharmacy, Wuse 2</p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand-strong">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
          Verified
        </span>
      </div>

      <ul className="divide-y divide-line">
        {rows.map((r, i) => {
          const isLow = r.qty <= r.low;
          return (
            <li key={r.name} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-medium text-ink">
                  {r.name}
                </p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted">
                  {r.pack} &middot; {r.price}
                  {r.expires && (
                    <span className="inline-flex items-center gap-1 text-caution">
                      <CalendarClock className="h-3 w-3" aria-hidden />
                      Expires {r.expires}
                    </span>
                  )}
                </p>
              </div>
              {isLow && (
                <span className="pulse-ring inline-flex items-center gap-1 rounded-full bg-caution-soft px-2 py-0.5 text-xs font-semibold text-caution">
                  <BellRing className="h-3 w-3" aria-hidden />
                  Low
                </span>
              )}
              <div className="flex items-center gap-1.5">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-mist text-muted"
                  aria-hidden
                >
                  <Minus className="h-3.5 w-3.5" />
                </span>
                <span
                  key={`${r.name}-${r.qty}`}
                  className={cn(
                    "w-10 text-center font-display text-lg font-semibold tabular text-ink",
                    hot === i && "tick-pop",
                  )}
                >
                  {r.qty}
                </span>
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-mist text-muted"
                  aria-hidden
                >
                  <Plus className="h-3.5 w-3.5" />
                </span>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-2 flex items-center justify-between rounded-2xl bg-paper px-4 py-3 text-sm">
        <span className="text-muted">
          {low
            ? `${low} item${low === 1 ? "" : "s"} running low`
            : "Everything is stocked"}
        </span>
        <span className="text-muted">{rows.length} products listed</span>
      </div>

      <div className="mt-3 h-12" aria-live="polite">
        {toast && (
          <p
            key={toast.id}
            className="animate-rise flex items-center gap-2.5 rounded-2xl border border-line bg-paper px-4 py-3 text-sm text-ink"
          >
            <Search className="h-4 w-4 shrink-0 text-brand" aria-hidden />
            {toast.text}
          </p>
        )}
      </div>
    </figure>
  );
}
