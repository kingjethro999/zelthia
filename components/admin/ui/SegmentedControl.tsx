"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import type { LucideIcon } from "lucide-react";
import {
  SPRING_SHEET,
  SPRING_SNAPPY,
  createSpring,
  project,
  rubberband,
  triggerHaptic,
  type SpringDriver,
} from "@/lib/spring";
import { cn } from "@/lib/utils";

export interface SegmentOption<T extends string = string> {
  value: T;
  label: string;
  count?: number;
  icon?: LucideIcon;
}

/**
 * Apple-style segmented control driven by interruptible left/width springs
 * plus 1:1 horizontal pointer scrubbing with rubber-banding and momentum snap.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  size = "md",
  className,
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (next: T) => void;
  ariaLabel: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLSpanElement>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const leftSpringRef = useRef<SpringDriver | null>(null);
  const widthSpringRef = useRef<SpringDriver | null>(null);
  const initializedRef = useRef(false);
  const draggingRef = useRef<{
    id: number;
    startX: number;
    startLeft: number;
    engaged: boolean;
    minLeft: number;
    maxLeft: number;
    width: number;
    samples: { t: number; x: number }[];
  } | null>(null);
  const suppressClickRef = useRef(false);

  const getGeometry = useCallback(() => {
    return options.map((_, i) => {
      const btn = btnRefs.current[i];
      return btn ? { left: btn.offsetLeft, width: btn.offsetWidth } : null;
    });
  }, [options]);

  const syncToValue = useCallback(
    (instant = false, releaseVelocity?: number) => {
      const idx = options.findIndex((o) => o.value === value);
      const btn = idx >= 0 ? btnRefs.current[idx] : null;
      const thumb = thumbRef.current;
      if (!btn || !thumb) return;

      const targetLeft = btn.offsetLeft;
      const targetWidth = btn.offsetWidth;

      if (!leftSpringRef.current || !widthSpringRef.current) {
        leftSpringRef.current = createSpring(targetLeft, (x) => {
          if (thumbRef.current) {
            thumbRef.current.style.transform = `translate3d(${x}px, 0, 0)`;
          }
        });
        widthSpringRef.current = createSpring(targetWidth, (w) => {
          if (thumbRef.current) {
            thumbRef.current.style.width = `${w}px`;
          }
        });
      }

      if (instant || !initializedRef.current) {
        initializedRef.current = true;
        thumb.style.opacity = "1";
        leftSpringRef.current.jump(targetLeft);
        widthSpringRef.current.jump(targetWidth);
      } else {
        thumb.style.opacity = "1";
        const cfg =
          releaseVelocity !== undefined ? SPRING_SHEET : SPRING_SNAPPY;
        leftSpringRef.current.setTarget(targetLeft, {
          ...cfg,
          velocity: releaseVelocity,
        });
        widthSpringRef.current.setTarget(targetWidth, SPRING_SNAPPY);
      }
    },
    [options, value],
  );

  useLayoutEffect(() => {
    syncToValue(false);
  }, [syncToValue]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      if (!draggingRef.current?.engaged) syncToValue(true);
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      leftSpringRef.current?.stop();
      widthSpringRef.current?.stop();
    };
  }, [syncToValue]);

  const selectOption = (nextVal: T) => {
    if (nextVal !== value) {
      triggerHaptic("tick");
      onChange(nextVal);
    }
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    const geom = getGeometry().filter(
      (g): g is { left: number; width: number } => g !== null,
    );
    if (geom.length < 2 || !leftSpringRef.current) return;

    const currentLeft = leftSpringRef.current.getState().value;
    const idx = Math.max(
      0,
      options.findIndex((o) => o.value === value),
    );
    draggingRef.current = {
      id: e.pointerId,
      startX: e.clientX,
      startLeft: currentLeft,
      engaged: false,
      minLeft: geom[0].left,
      maxLeft: geom[geom.length - 1].left,
      width: geom[idx]?.width ?? geom[0].width,
      samples: [{ t: e.timeStamp, x: e.clientX }],
    };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = draggingRef.current;
    if (!d || e.pointerId !== d.id) return;
    const dx = e.clientX - d.startX;

    if (!d.engaged) {
      if (Math.abs(dx) < 6) return;
      d.engaged = true;
      suppressClickRef.current = true;
      leftSpringRef.current?.stop();
      try {
        containerRef.current?.setPointerCapture(e.pointerId);
      } catch {
        /* ignore if pointer gone */
      }
    }

    const rawLeft = d.startLeft + dx;
    let clampedLeft = rawLeft;
    if (rawLeft < d.minLeft) {
      clampedLeft =
        d.minLeft +
        rubberband(rawLeft - d.minLeft, Math.max(48, d.maxLeft - d.minLeft));
    } else if (rawLeft > d.maxLeft) {
      clampedLeft =
        d.maxLeft +
        rubberband(rawLeft - d.maxLeft, Math.max(48, d.maxLeft - d.minLeft));
    }

    leftSpringRef.current?.jump(clampedLeft);
    d.samples.push({ t: e.timeStamp, x: clampedLeft });
    if (d.samples.length > 6) d.samples.shift();
  };

  const onPointerUp = () => {
    const d = draggingRef.current;
    draggingRef.current = null;
    if (!d || !d.engaged) return;

    const first = d.samples[0];
    const last = d.samples[d.samples.length - 1];
    const dt = last && first ? last.t - first.t : 0;
    const velocity = dt > 0 ? ((last.x - first.x) / dt) * 1000 : 0;
    const current = leftSpringRef.current?.getState().value ?? d.startLeft;
    const projectedLeft = current + project(velocity, 0.992);
    const projectedCenter = projectedLeft + d.width / 2;

    const geom = getGeometry();
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < geom.length; i++) {
      const g = geom[i];
      if (!g) continue;
      const center = g.left + g.width / 2;
      const dist = Math.abs(center - projectedCenter);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    }

    const targetOpt = options[bestIdx];
    const targetGeom = geom[bestIdx];
    if (targetOpt && targetGeom) {
      if (targetOpt.value !== value) {
        triggerHaptic("tick");
        onChange(targetOpt.value);
      } else {
        leftSpringRef.current?.setTarget(targetGeom.left, {
          ...SPRING_SHEET,
          velocity,
        });
        widthSpringRef.current?.setTarget(targetGeom.width, SPRING_SNAPPY);
      }
    }

    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 40);
  };

  const onKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = (idx + 1) % options.length;
      selectOption(options[next].value);
      btnRefs.current[next]?.focus();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prev = (idx - 1 + options.length) % options.length;
      selectOption(options[prev].value);
      btnRefs.current[prev]?.focus();
    }
  };

  return (
    <div
      ref={containerRef}
      role="radiogroup"
      aria-label={ariaLabel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className={cn(
        "relative inline-flex max-w-full touch-pan-y select-none flex-wrap items-center gap-0.5 rounded-2xl border border-line/80 bg-mist/75 p-1 backdrop-blur-md",
        className,
      )}
    >
      <span
        ref={thumbRef}
        aria-hidden
        style={{ opacity: 0 }}
        className="pointer-events-none absolute top-1 bottom-1 left-0 rounded-xl bg-surface shadow-[0_1px_2px_rgb(6_25_26/0.12),0_4px_12px_-4px_rgb(6_25_26/0.16)]"
      />
      {options.map((opt, i) => {
        const active = opt.value === value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            ref={(el) => {
              btnRefs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => {
              if (!suppressClickRef.current) selectOption(opt.value);
            }}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              "press-soft relative z-10 inline-flex items-center gap-1.5 rounded-xl font-medium transition-colors",
              size === "sm" ? "h-8 px-2.5 text-xs" : "h-9 px-3.5 text-sm",
              active ? "text-ink" : "text-muted hover:text-ink",
            )}
          >
            {Icon && (
              <Icon
                className={cn(
                  "h-3.5 w-3.5 shrink-0",
                  active ? "text-brand" : "text-muted",
                )}
                aria-hidden
              />
            )}
            <span>{opt.label}</span>
            {opt.count !== undefined && (
              <span
                className={cn(
                  "tabular rounded-full px-1.5 py-0.5 text-[11px] font-semibold leading-none",
                  active
                    ? "bg-brand-soft text-brand-strong"
                    : "bg-surface/70 text-muted",
                )}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
