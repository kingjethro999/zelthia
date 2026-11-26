"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { X } from "lucide-react";
import {
  SPRING_DEFAULT,
  SPRING_SHEET,
  createSpring,
  project,
  rubberband,
  type SpringDriver,
} from "@/lib/spring";
import { cn } from "@/lib/utils";
import { useRegisterOverlay } from "./OverlayContext";

/**
 * Interruptible, velocity-aware Inspector Sheet.
 * - Mobile (<640px): bottom sheet, drag down 1:1 with momentum projection.
 * - Desktop (>=640px): right-hand inspector sheet, drag right 1:1 from header or left grip.
 * - Mid-flight open/close can be grabbed and reversed with zero jump.
 * - Continuously synchronizes scrim opacity and recedes the workspace behind it.
 */
export function AdminSheet({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  const id = useId();
  const [mounted, setMounted] = useState(open);
  const [lastOpen, setLastOpen] = useState(open);
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) setMounted(true);
  }

  useRegisterOverlay(open);

  const panelRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const springRef = useRef<SpringDriver | null>(null);
  const sizeRef = useRef(560);
  const axisRef = useRef<"x" | "y">("x");
  const dragRef = useRef<{
    id: number;
    startPointer: number;
    startCross: number;
    startOffset: number;
    engaged: boolean;
    samples: { t: number; v: number }[];
  } | null>(null);

  const applyOffset = useCallback((offsetPx: number) => {
    const panel = panelRef.current;
    const scrim = scrimRef.current;
    if (panel) {
      panel.style.transform =
        axisRef.current === "y"
          ? `translate3d(0, ${offsetPx}px, 0)`
          : `translate3d(${offsetPx}px, 0, 0)`;
    }
    if (scrim) {
      const size = Math.max(1, sizeRef.current);
      const progress = Math.max(0, Math.min(1, 1 - offsetPx / size));
      scrim.style.opacity = String(progress);
    }
  }, []);

  const measureGeometry = useCallback(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const isDesktop =
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 640px)").matches;
    axisRef.current = isDesktop ? "x" : "y";
    sizeRef.current = Math.max(
      280,
      isDesktop ? panel.offsetWidth : panel.offsetHeight,
    );
  }, []);

  useLayoutEffect(() => {
    if (!mounted) {
      springRef.current?.stop();
      springRef.current = null;
      return;
    }

    measureGeometry();
    const initialOffset = open ? sizeRef.current : 0;

    if (!springRef.current) {
      springRef.current = createSpring(initialOffset, applyOffset);
      applyOffset(initialOffset);
    }

    if (open) {
      springRef.current.setTarget(0, SPRING_DEFAULT);
    } else {
      springRef.current.setTarget(sizeRef.current, {
        ...SPRING_DEFAULT,
        onComplete: () => setMounted(false),
      });
    }
  }, [mounted, open, measureGeometry, applyOffset]);

  useEffect(() => {
    if (!open) return;
    returnFocus.current = document.activeElement as HTMLElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const first = panelRef.current?.querySelector<HTMLElement>(
      "input, textarea, button:not([data-close]), [tabindex='0']",
    );
    (first ?? panelRef.current)?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled]), input, textarea, [tabindex]:not([tabindex='-1'])",
      );
      if (!focusables.length) return;
      const firstEl = focusables[0];
      const lastEl = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      returnFocus.current?.focus?.();
    };
  }, [open, onClose]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    if ((e.target as HTMLElement).closest("button, a, input, textarea")) return;
    const panel = panelRef.current;
    if (!panel || !springRef.current) return;

    measureGeometry();
    const axis = axisRef.current;
    const pointerPos = axis === "y" ? e.clientY : e.clientX;
    const crossPos = axis === "y" ? e.clientX : e.clientY;
    const liveOffset = springRef.current.getState().value;

    dragRef.current = {
      id: e.pointerId,
      startPointer: pointerPos,
      startCross: crossPos,
      startOffset: liveOffset,
      engaged: false,
      samples: [],
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    const panel = panelRef.current;
    const spring = springRef.current;
    if (!d || !panel || !spring || e.pointerId !== d.id) return;

    const axis = axisRef.current;
    const pointerPos = axis === "y" ? e.clientY : e.clientX;
    const crossPos = axis === "y" ? e.clientX : e.clientY;
    const delta = pointerPos - d.startPointer;

    if (!d.engaged) {
      if (Math.abs(delta) < 8) return;
      if (Math.abs(crossPos - d.startCross) > Math.abs(delta)) {
        dragRef.current = null;
        return;
      }
      d.engaged = true;
      d.startPointer = pointerPos;
      d.startOffset = spring.getState().value;
      spring.stop();
      try {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }

    const raw = d.startOffset + (pointerPos - d.startPointer);
    const bounded = raw >= 0 ? raw : rubberband(raw, sizeRef.current);
    spring.jump(bounded);
    d.samples.push({ t: e.timeStamp, v: bounded });
    if (d.samples.length > 6) d.samples.shift();
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const d = dragRef.current;
    dragRef.current = null;
    const spring = springRef.current;
    if (!d || !d.engaged || !spring) return;

    const first = d.samples[0];
    const last = d.samples[d.samples.length - 1];
    const dt = last && first ? last.t - first.t : 0;
    const velocity = dt > 0 ? ((last.v - first.v) / dt) * 1000 : 0;
    const current = spring.getState().value;
    const size = sizeRef.current;
    const projected = current + project(velocity, 0.998);
    const shouldDismiss = e.type !== "pointercancel" && projected > size * 0.42;

    if (shouldDismiss) {
      spring.setTarget(size, {
        ...SPRING_SHEET,
        velocity,
        onComplete: () => {
          setMounted(false);
          onClose();
        },
      });
    } else {
      spring.setTarget(0, {
        ...SPRING_SHEET,
        velocity,
      });
    }
  };

  if (!mounted) return null;

  return (
    <div
      inert={!open || undefined}
      className="fixed inset-0 z-[65] flex items-end justify-end sm:items-stretch"
    >
      <button
        ref={scrimRef}
        type="button"
        data-close
        aria-label="Close inspector"
        tabIndex={-1}
        style={{ opacity: 0 }}
        className="scrim absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-t`}
        aria-describedby={subtitle ? `${id}-d` : undefined}
        tabIndex={-1}
        className={cn(
          "adm-glass-sheet relative flex max-h-[92dvh] w-full flex-col rounded-t-3xl border outline-none will-change-transform sm:h-full sm:max-h-none sm:max-w-xl sm:rounded-none sm:rounded-l-3xl",
          className,
        )}
      >
        {/* Subtle left-edge drag rail on desktop */}
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          aria-hidden
          className="hidden sm:block sm:absolute sm:inset-y-0 sm:left-0 sm:w-4 sm:cursor-grab sm:active:cursor-grabbing"
        />

        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="relative flex touch-none select-none items-start justify-between gap-4 border-b border-line/70 px-5 pb-4 pt-5 sm:cursor-grab sm:px-6 sm:py-4 sm:active:cursor-grabbing"
        >
          <span
            aria-hidden
            className="absolute left-1/2 top-2 h-1 w-9 -translate-x-1/2 rounded-full bg-line sm:hidden"
          />
          <div className="min-w-0">
            <h2
              id={`${id}-t`}
              className="truncate font-display text-lg font-semibold text-ink"
            >
              {title}
            </h2>
            {subtitle && (
              <p
                id={`${id}-d`}
                className="adm-caption mt-0.5 truncate text-xs text-muted"
              >
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="press -mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted hover:bg-mist hover:text-ink"
            aria-label="Close inspector"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <div
          data-scroll
          className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6"
        >
          {children}
        </div>
        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line/70 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
