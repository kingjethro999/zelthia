"use client";

import { useEffect, useRef } from "react";

interface NodeSeed {
  bx: number;
  by: number;
  ax: number;
  ay: number;
  fx: number;
  fy: number;
  px: number;
  py: number;
  r: number;
  tone: "brand" | "sky";
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildNodes(count: number): NodeSeed[] {
  const rand = mulberry32(4042026);
  return Array.from({ length: count }, (_, i) => ({
    bx: 0.06 + rand() * 0.88,
    by: 0.08 + rand() * 0.84,
    ax: 0.016 + rand() * 0.032,
    ay: 0.016 + rand() * 0.032,
    fx: rand() > 0.55 ? 2 : 1,
    fy: rand() > 0.55 ? 2 : 1,
    px: rand() * Math.PI * 2,
    py: rand() * Math.PI * 2,
    r: 1.4 + rand() * 1.4,
    tone: i % 3 === 0 ? "sky" : "brand",
  }));
}

const PERIOD_SEC = 20;
const PULSE_MS = 950;

/**
 * Ambient Canvas 2D constellation behind the 404 stage.
 * Uses a seamless periodic phase loop, caps DPR at 2, pauses offscreen or on
 * hidden tabs, and renders a single static frame for reduced-motion users.
 */
export function VitalConstellation({ pulseCount }: { pulseCount: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pulseAtRef = useRef<number>(-1);

  useEffect(() => {
    if (pulseCount > 0) {
      pulseAtRef.current = performance.now();
    }
  }, [pulseCount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const finePointerQuery = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    );

    let width = 0;
    let height = 0;
    let dpr = 1;
    let nodes: NodeSeed[] = [];
    let isDark = darkQuery.matches;
    let reduced = motionQuery.matches;
    let visible = true;
    let rafId: number | null = null;
    let elapsedMs = 0;
    let lastFrameMs = 0;

    let targetParallaxX = 0;
    let targetParallaxY = 0;
    let parallaxX = 0;
    let parallaxY = 0;

    const setupSize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = width >= 768 ? 38 : 20;
      if (nodes.length !== count) {
        nodes = buildNodes(count);
      }
    };

    const draw = (nowMs: number, tSec: number) => {
      ctx.clearRect(0, 0, width, height);
      const phase = ((tSec % PERIOD_SEC) / PERIOD_SEC) * Math.PI * 2;
      const linkDist = width >= 768 ? 148 : 112;

      parallaxX += (targetParallaxX - parallaxX) * 0.06;
      parallaxY += (targetParallaxY - parallaxY) * 0.06;

      const pulseElapsed =
        pulseAtRef.current > 0 ? nowMs - pulseAtRef.current : -1;
      const pulseProgress =
        pulseElapsed >= 0 && pulseElapsed < PULSE_MS
          ? pulseElapsed / PULSE_MS
          : -1;
      const maxRadius = Math.hypot(width, height) * 0.55;
      const waveRadius = pulseProgress >= 0 ? pulseProgress * maxRadius : -1;
      const cx = width * 0.5;
      const cy = height * 0.44;

      const pts = nodes.map((n) => {
        const x =
          (n.bx + Math.sin(phase * n.fx + n.px) * n.ax) * width +
          parallaxX * (n.r * 0.6);
        const y =
          (n.by + Math.cos(phase * n.fy + n.py) * n.ay) * height +
          parallaxY * (n.r * 0.6);
        let boost = 0;
        if (waveRadius >= 0) {
          const dCenter = Math.hypot(x - cx, y - cy);
          const band = Math.max(0, 1 - Math.abs(dCenter - waveRadius) / 96);
          boost = band * (1 - pulseProgress);
        }
        return { x, y, r: n.r, tone: n.tone, boost };
      });

      const lineRgb = isDark ? "60, 199, 146" : "13, 127, 87";
      const skyRgb = isDark ? "122, 165, 242" : "29, 92, 196";

      ctx.lineWidth = 1;
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < linkDist) {
            const strength = 1 - d / linkDist;
            const boost = Math.max(a.boost, b.boost) * 0.22;
            const alpha = strength * (isDark ? 0.14 : 0.11) + boost * strength;
            ctx.strokeStyle = `rgba(${lineRgb}, ${alpha.toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (const p of pts) {
        const rgb = p.tone === "sky" ? skyRgb : lineRgb;
        const alpha = (isDark ? 0.34 : 0.28) + p.boost * 0.45;
        ctx.fillStyle = `rgba(${rgb}, ${Math.min(0.85, alpha).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + p.boost * 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const stopLoop = () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
      lastFrameMs = 0;
    };

    const tick = (now: number) => {
      if (reduced || document.hidden || !visible) {
        rafId = null;
        return;
      }
      if (lastFrameMs > 0) {
        elapsedMs += Math.min(now - lastFrameMs, 64);
      }
      lastFrameMs = now;
      draw(now, elapsedMs / 1000);
      rafId = window.requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (reduced) {
        stopLoop();
        draw(performance.now(), 0);
        return;
      }
      if (!document.hidden && visible && rafId === null) {
        lastFrameMs = 0;
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const onVisibility = () => {
      if (document.hidden) stopLoop();
      else startLoop();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (reduced || !finePointerQuery.matches) return;
      const nx = e.clientX / Math.max(1, window.innerWidth) - 0.5;
      const ny = e.clientY / Math.max(1, window.innerHeight) - 0.5;
      targetParallaxX = nx * 16;
      targetParallaxY = ny * 16;
    };

    const onMotionChange = () => {
      reduced = motionQuery.matches;
      startLoop();
    };

    const onDarkChange = () => {
      isDark = darkQuery.matches;
      if (reduced) draw(performance.now(), 0);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      if (visible) startLoop();
      else stopLoop();
    });

    setupSize();
    observer.observe(canvas);
    startLoop();

    window.addEventListener("resize", setupSize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    motionQuery.addEventListener("change", onMotionChange);
    darkQuery.addEventListener("change", onDarkChange);

    return () => {
      stopLoop();
      observer.disconnect();
      window.removeEventListener("resize", setupSize);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibility);
      motionQuery.removeEventListener("change", onMotionChange);
      darkQuery.removeEventListener("change", onDarkChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[2] h-full w-full"
    />
  );
}
