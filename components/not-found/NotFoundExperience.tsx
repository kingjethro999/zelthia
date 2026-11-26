"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Compass,
  Home,
  MessageCircleHeart,
  Phone,
  Pill,
  Search,
} from "lucide-react";
import { Button, buttonClass } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import {
  createSpring,
  rubberband,
  triggerHaptic,
  type SpringDriver,
} from "@/lib/spring";
import { VitalConstellation } from "./VitalConstellation";

const TELEMETRY_HINTS = [
  "Drag or tap the pulse orb",
  "Signal checked — route unmapped",
  "Everything else on Zelthia is live",
  "Drag further for elastic rebound",
] as const;

function buildEcgPath(bendX = 0, bendY = 0): string {
  const cx = 320 + bendX * 0.42;
  const cy = 44 + bendY * 0.42;
  return [
    "M 0 44",
    "L 168 44",
    "Q 184 44 192 38",
    "Q 200 32 208 44",
    "L 234 44",
    `L ${Math.round(cx - 52)} ${Math.round(44 + bendY * 0.14)}`,
    `L ${Math.round(cx - 28)} ${Math.round(cy - 34)}`,
    `L ${Math.round(cx - 4)} ${Math.round(cy + 30)}`,
    `L ${Math.round(cx + 22)} ${Math.round(cy - 18)}`,
    `L ${Math.round(cx + 46)} ${Math.round(44 + bendY * 0.12)}`,
    "L 426 44",
    "Q 438 34 450 44",
    "L 640 44",
  ].join(" ");
}

function CurrentPathChip() {
  const pathname = usePathname();
  if (!pathname || pathname === "/") return null;
  const display =
    pathname.length > 42
      ? `${pathname.slice(0, 24)}…${pathname.slice(-14)}`
      : pathname;
  return (
    <span
      title={pathname}
      className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-line bg-mist/80 px-3 py-1 font-mono text-xs text-muted"
    >
      <Compass className="h-3.5 w-3.5 shrink-0 text-brand" aria-hidden />
      <span className="truncate">{display}</span>
    </span>
  );
}

const DESTINATIONS = [
  {
    href: "/chat",
    title: "Health chat",
    body: "Ask with your allergies & history in mind",
    icon: MessageCircleHeart,
    tint: "bg-brand-soft text-brand-strong",
  },
  {
    href: "/inventory",
    title: "Find medicine",
    body: "Check live pharmacy & clinic stock",
    icon: Pill,
    tint: "bg-sky-soft text-sky",
  },
  {
    href: "/",
    title: "Zelthia home",
    body: "Return to the main overview",
    icon: Home,
    tint: "bg-mist text-ink",
  },
] as const;

export function NotFoundExperience() {
  const router = useRouter();
  const [queryText, setQueryText] = useState("");
  const [pulseCount, setPulseCount] = useState(0);
  const [rings, setRings] = useState<number[]>([]);
  const [hintIdx, setHintIdx] = useState(0);

  const orbRef = useRef<HTMLButtonElement>(null);
  const ecgBaseRef = useRef<SVGPathElement>(null);
  const ecgPulseRef = useRef<SVGPathElement>(null);
  const springXRef = useRef<SpringDriver | null>(null);
  const springYRef = useRef<SpringDriver | null>(null);
  const posRef = useRef({ x: 0, y: 0 });
  const dragRef = useRef<{
    pointerId: number;
    grabX: number;
    grabY: number;
    startX: number;
    startY: number;
    moved: boolean;
    samples: { t: number; x: number; y: number }[];
  } | null>(null);
  const suppressClickRef = useRef(false);
  const ringSeqRef = useRef(0);

  const applyVisuals = (x: number, y: number) => {
    posRef.current = { x, y };
    const orb = orbRef.current;
    if (orb) {
      orb.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      const dist = Math.hypot(x, y);
      orb.dataset.stretch = dist > 36 ? "high" : "rest";
    }
    const d = buildEcgPath(x, y);
    ecgBaseRef.current?.setAttribute("d", d);
    ecgPulseRef.current?.setAttribute("d", d);
  };

  useEffect(() => {
    const sx = createSpring(0, (nx) => {
      applyVisuals(nx, posRef.current.y);
    });
    const sy = createSpring(0, (ny) => {
      applyVisuals(posRef.current.x, ny);
    });
    springXRef.current = sx;
    springYRef.current = sy;
    return () => {
      sx.stop();
      sy.stop();
      springXRef.current = null;
      springYRef.current = null;
    };
  }, []);

  const emitPulse = () => {
    const id = ++ringSeqRef.current;
    setPulseCount((c) => c + 1);
    setHintIdx((i) => (i + 1) % TELEMETRY_HINTS.length);
    setRings((prev) => [...prev.slice(-2), id]);
    window.setTimeout(() => {
      setRings((prev) => prev.filter((r) => r !== id));
    }, 950);
  };

  const clampOffset = (raw: number) => {
    const free = 42;
    if (Math.abs(raw) <= free) return raw;
    return Math.sign(raw) * (free + rubberband(Math.abs(raw) - free, 68, 0.55));
  };

  const onOrbPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    const sx = springXRef.current;
    const sy = springYRef.current;
    const curX = sx ? sx.getState().value : posRef.current.x;
    const curY = sy ? sy.getState().value : posRef.current.y;
    sx?.stop();
    sy?.stop();

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* capture optional on synthetic events */
    }
    e.currentTarget.dataset.dragging = "true";

    dragRef.current = {
      pointerId: e.pointerId,
      grabX: e.clientX - curX,
      grabY: e.clientY - curY,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
      samples: [{ t: e.timeStamp, x: curX, y: curY }],
    };
    triggerHaptic("tick");
  };

  const onOrbPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || e.pointerId !== drag.pointerId) return;
    if (Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > 5) {
      drag.moved = true;
    }
    const x = clampOffset(e.clientX - drag.grabX);
    const y = clampOffset(e.clientY - drag.grabY);
    applyVisuals(x, y);
    drag.samples.push({ t: e.timeStamp, x, y });
    if (drag.samples.length > 6) drag.samples.shift();
  };

  const onOrbPointerRelease = (e: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || e.pointerId !== drag.pointerId) return;
    dragRef.current = null;
    e.currentTarget.dataset.dragging = "false";
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      /* ignore */
    }

    const first = drag.samples[0];
    const last = drag.samples[drag.samples.length - 1];
    const dt = last && first ? Math.max(8, last.t - first.t) : 16;
    const vx = last && first ? ((last.x - first.x) / dt) * 1000 : 0;
    const vy = last && first ? ((last.y - first.y) / dt) * 1000 : 0;

    springXRef.current?.setTarget(0, {
      dampingRatio: 0.72,
      response: 0.42,
      velocity: vx,
    });
    springYRef.current?.setTarget(0, {
      dampingRatio: 0.72,
      response: 0.42,
      velocity: vy,
    });

    if (drag.moved) {
      suppressClickRef.current = true;
      triggerHaptic("commit");
      emitPulse();
    }
  };

  const onOrbClick = () => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    triggerHaptic("commit");
    emitPulse();
    springYRef.current?.setTarget(0, {
      dampingRatio: 0.68,
      response: 0.36,
      velocity: -190,
    });
  };

  const trimmed = queryText.trim();

  const handleInventorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(
      trimmed
        ? `/inventory?search=${encodeURIComponent(trimmed)}`
        : "/inventory",
    );
  };

  const handleAskChat = () => {
    router.push(trimmed ? `/chat?q=${encodeURIComponent(trimmed)}` : "/chat");
  };

  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <>
      <VitalConstellation pulseCount={pulseCount} />

      <header className="material-bar relative z-20 border-b border-line/60">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Logo />
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 px-3 py-1.5 text-xs font-medium text-muted">
            <span
              className="h-2 w-2 rounded-full bg-brand"
              aria-hidden="true"
            />
            <span className="tabular">404 · Off the chart</span>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-10 sm:px-6 sm:py-14">
        <section
          aria-labelledby="not-found-heading"
          className="nf-glass-panel nf-enter w-full rounded-[28px] p-6 sm:p-10"
        >
          {/* Interactive 4 [Vital Orb] 4 centerpiece */}
          <div className="relative mx-auto flex max-w-lg flex-col items-center">
            <svg
              viewBox="0 0 640 88"
              fill="none"
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 opacity-80"
            >
              <path
                ref={ecgBaseRef}
                d={buildEcgPath(0, 0)}
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-brand/25"
              />
              <path
                ref={ecgPulseRef}
                d={buildEcgPath(0, 0)}
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="nf-ecg-pulse text-brand"
              />
            </svg>

            <div className="relative z-10 flex items-center justify-center gap-3 sm:gap-5">
              <span className="nf-digit" aria-hidden="true">
                4
              </span>

              <div className="relative flex items-center justify-center">
                {rings.map((id) => (
                  <span key={id} className="nf-sonar" aria-hidden="true" />
                ))}
                <button
                  ref={orbRef}
                  type="button"
                  data-stretch="rest"
                  data-dragging="false"
                  onPointerDown={onOrbPointerDown}
                  onPointerMove={onOrbPointerMove}
                  onPointerUp={onOrbPointerRelease}
                  onPointerCancel={onOrbPointerRelease}
                  onClick={onOrbClick}
                  aria-label="Send a diagnostic pulse — drag or activate the 0 orb"
                  className="nf-orb relative flex items-center justify-center focus-visible:outline-offset-4"
                >
                  <Activity
                    className="h-7 w-7 text-white/95 drop-shadow-[0_1px_4px_rgb(0_0_0/0.25)] sm:h-9 sm:w-9"
                    strokeWidth={2.2}
                    aria-hidden="true"
                  />
                </button>
              </div>

              <span className="nf-digit" aria-hidden="true">
                4
              </span>
            </div>

            <p
              aria-live="polite"
              className="mt-3 text-xs font-medium tracking-wide text-muted"
            >
              {TELEMETRY_HINTS[hintIdx]}
            </p>
          </div>

          {/* Copy & sanitized requested path */}
          <div
            className="nf-enter mt-6 text-center"
            style={{ ["--nf-delay" as string]: "50ms" }}
          >
            <h1
              id="not-found-heading"
              className="title font-display text-2xl font-semibold text-ink sm:text-4xl"
            >
              We couldn&apos;t find this page on the chart.
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
              The link may have moved or been typed wrong. Search live pharmacy
              stock, ask Zelthia&apos;s health companion, or jump straight back
              to a verified route.
            </p>
            <div className="mt-4 flex min-h-7 items-center justify-center">
              <Suspense fallback={null}>
                <CurrentPathChip />
              </Suspense>
            </div>
          </div>

          {/* Inline quick search well */}
          <form
            onSubmit={handleInventorySubmit}
            className="nf-enter nf-well mt-6 rounded-2xl p-2 sm:p-2.5"
            style={{ ["--nf-delay" as string]: "100ms" }}
          >
            <label htmlFor="nf-search" className="sr-only">
              Search a medicine, scan, or health question
            </label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex flex-1 items-center gap-2.5 px-2.5">
                <Search className="h-4 w-4 shrink-0 text-muted" aria-hidden />
                <input
                  id="nf-search"
                  type="search"
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  placeholder="Search a medicine, scan, or ask a question..."
                  className="h-10 w-full bg-transparent text-sm text-ink placeholder:text-muted/80"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" className="flex-1 sm:flex-none">
                  Find stock
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAskChat}
                  className="flex-1 sm:flex-none"
                >
                  Ask chat
                </Button>
              </div>
            </div>
          </form>

          {/* Wayfinding destination cards */}
          <div
            className="nf-enter mt-5 grid gap-3 sm:grid-cols-3"
            style={{ ["--nf-delay" as string]: "150ms" }}
          >
            {DESTINATIONS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="nf-card group flex flex-col justify-between rounded-2xl p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${item.tint}`}
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <ArrowRight
                      className="h-4 w-4 text-muted transition-transform duration-200 ease-[var(--ease-out)] group-hover:translate-x-0.5 group-hover:text-ink"
                      aria-hidden
                    />
                  </div>
                  <div className="mt-3">
                    <p className="font-display text-sm font-semibold text-ink">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted">
                      {item.body}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Bottom strip */}
          <div
            className="nf-enter mt-6 flex flex-col items-center justify-between gap-3 border-t border-line/70 pt-5 text-xs text-muted sm:flex-row"
            style={{ ["--nf-delay" as string]: "200ms" }}
          >
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleGoBack}
                className={buttonClass("ghost", "sm", "h-8 px-2.5 text-xs")}
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                Go back
              </button>
              <Link
                href="/doctors-note-reader"
                className="rounded-lg px-2 py-1 text-xs font-medium text-muted transition-colors hover:text-ink"
              >
                Note reader
              </Link>
            </div>
            <p className="flex items-center gap-1.5 text-center sm:text-right">
              <Phone className="h-3.5 w-3.5 shrink-0 text-alert" aria-hidden />
              <span>
                Zelthia doesn&apos;t replace a doctor. In an emergency, call{" "}
                <a
                  href="tel:112"
                  className="font-semibold text-ink underline-offset-4 hover:underline"
                >
                  112
                </a>
                .
              </span>
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
