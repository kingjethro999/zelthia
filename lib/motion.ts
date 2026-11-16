"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Matches --dur-exit in globals.css. */
export const EXIT_MS = 220;

/**
 * Keeps a surface mounted long enough to play its exit, so things leave the
 * way they came instead of vanishing. `closing` is true while it animates out.
 * Reopening mid-exit cancels the exit and the surface stays where it is.
 */
export function usePresence(open: boolean, ms = EXIT_MS) {
  const [mounted, setMounted] = useState(open);
  const [lastOpen, setLastOpen] = useState(open);
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) setMounted(true);
  }
  useEffect(() => {
    if (open || !mounted) return;
    const t = window.setTimeout(() => setMounted(false), prefersReducedMotion() ? 0 : ms);
    return () => window.clearTimeout(t);
  }, [open, mounted, ms]);
  return { mounted: mounted || open, closing: mounted && !open };
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Apple's scroll-deceleration projection: where a flick would come to rest. */
function project(velocity: number, rate = 0.998) {
  return ((velocity / 1000) * rate) / (1 - rate);
}

/** Progressive resistance past a boundary, so the edge feels soft, not frozen. */
function rubberband(overshoot: number, dimension: number, c = 0.55) {
  return (overshoot * dimension * c) / (dimension + c * Math.abs(overshoot));
}

type Direction = "down" | "left";
type Point = { clientX: number; clientY: number };

/** Distance travelled in the dismiss direction (down, or leftwards). */
const along = (dir: Direction, e: Point) => (dir === "down" ? e.clientY : -e.clientX);
const across = (dir: Direction, e: Point) => (dir === "down" ? e.clientX : e.clientY);
const sizeOf = (dir: Direction, el: HTMLElement) => (dir === "down" ? el.offsetHeight : el.offsetWidth);

function setOffset(dir: Direction, el: HTMLElement, px: number) {
  // The standalone `translate` property composes with the entrance/exit
  // keyframes (which own `transform`), so a drag never restarts them.
  el.style.translate = dir === "down" ? `0 ${px}px` : `${-px}px 0`;
}

/**
 * Drag-to-dismiss for sheets and drawers. Tracks the pointer 1:1, rubber-bands
 * against the closed direction, projects the release velocity and dismisses
 * only when the projected rest point is past half the surface. On release the
 * surface settles (or flies out) from where the finger left it, at a pace
 * matched to the release speed.
 *
 * `ref` is the element that moves; spread the returned handlers on the drag
 * area. Only touch and pen start a drag; mouse users get the close button
 * and Escape.
 */
export function useDragDismiss(
  ref: React.RefObject<HTMLElement | null>,
  direction: Direction,
  onDismiss: () => void,
) {
  const state = useRef<{
    id: number;
    start: number;
    startCross: number;
    engaged: boolean;
    samples: { t: number; v: number }[];
  } | null>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType === "mouse" || !ref.current) return;
      // Bottom sheets only exist below the sm breakpoint.
      if (direction === "down" && window.matchMedia("(min-width: 640px)").matches) return;
      state.current = {
        id: e.pointerId,
        start: along(direction, e),
        startCross: across(direction, e),
        engaged: false,
        samples: [],
      };
    },
    [ref, direction],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const s = state.current;
      const el = ref.current;
      if (!s || !el || e.pointerId !== s.id) return;
      const d = along(direction, e) - s.start;
      if (!s.engaged) {
        // ~10px hysteresis, then commit only if the motion is mostly along
        // our axis and heading toward dismissal.
        if (Math.abs(d) < 10) return;
        if (Math.abs(across(direction, e) - s.startCross) > Math.abs(d) || d < 0) {
          state.current = null;
          return;
        }
        s.engaged = true;
        s.start = along(direction, e);
        try {
          el.setPointerCapture(e.pointerId);
        } catch {
          // The pointer may already be gone; tracking still works without capture.
        }
        el.style.transition = "none";
      }
      const raw = along(direction, e) - s.start;
      setOffset(direction, el, raw >= 0 ? raw : rubberband(raw, sizeOf(direction, el)));
      s.samples.push({ t: e.timeStamp, v: raw });
      if (s.samples.length > 6) s.samples.shift();
    },
    [ref, direction],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      const s = state.current;
      const el = ref.current;
      state.current = null;
      if (!s || !el || !s.engaged) return;
      const first = s.samples[0];
      const last = s.samples[s.samples.length - 1];
      const dt = last && first ? last.t - first.t : 0;
      const velocity = dt > 0 ? ((last.v - first.v) / dt) * 1000 : 0; // px/s
      const current = Math.max(0, last?.v ?? 0);
      const size = sizeOf(direction, el);
      const dismiss = e.type !== "pointercancel" && current + project(velocity) > size / 2;

      const remaining = dismiss ? size - current : current;
      if (remaining < 1) {
        if (dismiss) onDismiss();
        else el.style.transition = "";
        return;
      }
      const speed = Math.max(Math.abs(velocity), 1);
      const ms = Math.round(Math.min(360, Math.max(160, (remaining / speed) * 1000 * 1.6)));
      el.style.transition = `translate ${ms}ms cubic-bezier(0.32, 0.72, 0, 1)`;
      setOffset(direction, el, dismiss ? size : 0);
      // transitionend is not guaranteed (background tabs, interrupted
      // styles), so a timer backs it up; whichever comes first wins.
      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        el.removeEventListener("transitionend", done);
        if (dismiss) {
          onDismiss();
        } else {
          el.style.transition = "";
          el.style.translate = "";
        }
      };
      const timer = window.setTimeout(done, ms + 60);
      el.addEventListener("transitionend", done);
    },
    [ref, direction, onDismiss],
  );

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp };
}

/** Last non-null value, so a closing dialog keeps its text while it animates out. */
export function useLastDefined<T>(value: T | null): T | null {
  const [last, setLast] = useState(value);
  if (value !== null && value !== last) setLast(value);
  return value ?? last;
}
