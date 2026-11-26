"use client";

export interface SpringConfig {
  /** 1.0 = critically damped (zero overshoot). < 1.0 = bouncy momentum settle. */
  dampingRatio: number;
  /** Approximate time in seconds to reach target (Apple WWDC "response"). */
  response: number;
}

export const SPRING_DEFAULT: SpringConfig = {
  dampingRatio: 1.0,
  response: 0.36,
};

export const SPRING_SNAPPY: SpringConfig = {
  dampingRatio: 1.0,
  response: 0.28,
};

export const SPRING_SHEET: SpringConfig = {
  dampingRatio: 0.86,
  response: 0.32,
};

export interface SpringTargetOptions extends Partial<SpringConfig> {
  /** Optional explicit release velocity in units/sec (e.g. pointer px/s). */
  velocity?: number;
  onComplete?: () => void;
}

export interface SpringDriver {
  setTarget: (target: number, opts?: SpringTargetOptions) => void;
  jump: (value: number) => void;
  stop: () => void;
  getState: () => { value: number; velocity: number; running: boolean };
}

function reducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Interruptible, velocity-aware spring driver parameterized by Apple's
 * (dampingRatio, response) design model. Fixed-timestep sub-stepping keeps
 * motion identical across 60Hz and 120Hz displays.
 */
export function createSpring(
  initialValue: number,
  onUpdate: (value: number) => void,
): SpringDriver {
  let value = initialValue;
  let target = initialValue;
  let velocity = 0;
  let config: SpringConfig = SPRING_DEFAULT;
  let rafId: number | null = null;
  let lastTime = 0;
  let onCompleteCb: (() => void) | undefined;

  const cancelRaf = () => {
    if (rafId !== null && typeof window !== "undefined") {
      window.cancelAnimationFrame(rafId);
      rafId = null;
    }
  };

  const stepPhysics = (dtSec: number) => {
    const omega = (2 * Math.PI) / Math.max(0.08, config.response);
    const stiffness = omega * omega;
    const damping = 2 * config.dampingRatio * omega;

    // Sub-step at 240Hz so stiff snappy springs remain unconditionally stable.
    const subStep = 1 / 240;
    let remaining = Math.min(dtSec, 0.032);
    while (remaining > 0) {
      const h = Math.min(remaining, subStep);
      const disp = value - target;
      const accel = -stiffness * disp - damping * velocity;
      velocity += accel * h;
      value += velocity * h;
      remaining -= h;
    }
  };

  const tick = (now: number) => {
    const dt = lastTime ? (now - lastTime) / 1000 : 1 / 60;
    lastTime = now;
    stepPhysics(dt);

    const dist = Math.abs(target - value);
    const speed = Math.abs(velocity);
    if (dist < 0.35 && speed < 4) {
      value = target;
      velocity = 0;
      rafId = null;
      onUpdate(value);
      const cb = onCompleteCb;
      onCompleteCb = undefined;
      cb?.();
      return;
    }

    onUpdate(value);
    rafId = window.requestAnimationFrame(tick);
  };

  return {
    setTarget(nextTarget, opts = {}) {
      target = nextTarget;
      config = {
        dampingRatio: opts.dampingRatio ?? SPRING_DEFAULT.dampingRatio,
        response: opts.response ?? SPRING_DEFAULT.response,
      };
      if (opts.velocity !== undefined) {
        velocity = opts.velocity;
      }
      onCompleteCb = opts.onComplete;

      if (reducedMotion() || typeof window === "undefined") {
        cancelRaf();
        value = target;
        velocity = 0;
        onUpdate(value);
        const cb = onCompleteCb;
        onCompleteCb = undefined;
        cb?.();
        return;
      }

      if (Math.abs(target - value) < 0.2 && Math.abs(velocity) < 4) {
        cancelRaf();
        value = target;
        velocity = 0;
        onUpdate(value);
        const cb = onCompleteCb;
        onCompleteCb = undefined;
        cb?.();
        return;
      }

      if (rafId === null) {
        lastTime = 0;
        rafId = window.requestAnimationFrame(tick);
      }
    },

    jump(nextValue) {
      cancelRaf();
      onCompleteCb = undefined;
      value = nextValue;
      target = nextValue;
      velocity = 0;
      onUpdate(value);
    },

    stop() {
      cancelRaf();
      onCompleteCb = undefined;
    },

    getState() {
      return { value, velocity, running: rafId !== null };
    },
  };
}

/** Apple's exponential-decay momentum projection (WWDC 2018). */
export function project(
  velocityPxPerSec: number,
  decelerationRate = 0.998,
): number {
  return (
    ((velocityPxPerSec / 1000) * decelerationRate) / (1 - decelerationRate)
  );
}

/** Progressive boundary resistance so edges feel responsive rather than frozen. */
export function rubberband(
  overshoot: number,
  dimension: number,
  constant = 0.55,
): number {
  const safeDim = Math.max(1, dimension);
  return (
    (overshoot * safeDim * constant) /
    (safeDim + constant * Math.abs(overshoot))
  );
}

/** Causal micro-haptics synchronized to discrete snaps and commits. */
export function triggerHaptic(
  kind: "tick" | "commit" | "warning" | "error",
): void {
  if (
    typeof navigator === "undefined" ||
    typeof navigator.vibrate !== "function" ||
    reducedMotion()
  ) {
    return;
  }
  try {
    if (kind === "tick") navigator.vibrate(8);
    else if (kind === "commit") navigator.vibrate([10, 24, 14]);
    else if (kind === "warning") navigator.vibrate([16, 30, 16]);
    else navigator.vibrate([22, 28, 22, 28, 26]);
  } catch {
    /* ignore unsupported environments */
  }
}
