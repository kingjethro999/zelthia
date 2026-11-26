"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import {
  SPRING_SHEET,
  createSpring,
  project,
  rubberband,
  triggerHaptic,
  type SpringDriver,
} from "@/lib/spring";
import { cn } from "@/lib/utils";

type ToastKind = "success" | "info" | "warning" | "error";

export interface ToastAction {
  label: string;
  onClick: () => void | Promise<void>;
}

interface ToastItem {
  id: number;
  kind: ToastKind;
  title: string;
  description?: string;
  action?: ToastAction;
}

interface ToastContextValue {
  push: (t: Omit<ToastItem, "id">) => void;
  success: (title: string, description?: string, action?: ToastAction) => void;
  error: (title: string, description?: string, action?: ToastAction) => void;
  info: (title: string, description?: string, action?: ToastAction) => void;
  warning: (title: string, description?: string, action?: ToastAction) => void;
}

const ToastCtx = createContext<ToastContextValue | null>(null);

export function useAdminToast(): ToastContextValue {
  const ctx = useContext(ToastCtx);
  if (!ctx) {
    throw new Error("useAdminToast must be used within AdminToastProvider");
  }
  return ctx;
}

const ICONS = {
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
};

const ICON_CLS: Record<ToastKind, string> = {
  success: "text-brand",
  info: "text-sky",
  warning: "text-caution",
  error: "text-alert",
};

function SwipeableToast({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: (id: number) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const springRef = useRef<SpringDriver | null>(null);
  const dragRef = useRef<{
    id: number;
    startX: number;
    engaged: boolean;
    samples: { t: number; x: number }[];
  } | null>(null);

  useEffect(() => {
    springRef.current = createSpring(0, (x) => {
      const el = cardRef.current;
      if (!el) return;
      el.style.transform = `translate3d(${x}px, 0, 0)`;
      el.style.opacity = String(Math.max(0, 1 - Math.max(0, x) / 260));
    });
    return () => springRef.current?.stop();
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    if ((e.target as HTMLElement).closest("button")) return;
    springRef.current?.stop();
    dragRef.current = {
      id: e.pointerId,
      startX: e.clientX,
      engaged: false,
      samples: [],
    };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    const spring = springRef.current;
    if (!d || !spring || e.pointerId !== d.id) return;
    const dx = e.clientX - d.startX;

    if (!d.engaged) {
      if (Math.abs(dx) < 6) return;
      d.engaged = true;
      d.startX = e.clientX;
      try {
        cardRef.current?.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }

    const raw = e.clientX - d.startX;
    const pos = raw >= 0 ? raw : rubberband(raw, 180);
    spring.jump(pos);
    d.samples.push({ t: e.timeStamp, x: pos });
    if (d.samples.length > 6) d.samples.shift();
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    dragRef.current = null;
    const spring = springRef.current;
    if (!d || !d.engaged || !spring) return;

    const first = d.samples[0];
    const last = d.samples[d.samples.length - 1];
    const dt = last && first ? last.t - first.t : 0;
    const velocity = dt > 0 ? ((last.x - first.x) / dt) * 1000 : 0;
    const current = spring.getState().value;
    const projected = current + project(velocity, 0.996);

    if (e.type !== "pointercancel" && projected > 110) {
      spring.setTarget(360, {
        ...SPRING_SHEET,
        velocity,
        onComplete: () => onDismiss(item.id),
      });
    } else {
      spring.setTarget(0, { ...SPRING_SHEET, velocity });
    }
  };

  const Icon = ICONS[item.kind];

  return (
    <div
      ref={cardRef}
      role="status"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className="adm-glass-sheet adm-materialize pointer-events-auto flex touch-pan-y select-none items-start gap-3 rounded-2xl border p-3.5 will-change-transform"
    >
      <Icon
        className={cn("mt-0.5 h-5 w-5 shrink-0", ICON_CLS[item.kind])}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">{item.title}</p>
        {item.description && (
          <p className="adm-caption mt-0.5 text-xs text-muted">
            {item.description}
          </p>
        )}
        {item.action && (
          <button
            type="button"
            onClick={() => {
              const fn = item.action?.onClick;
              onDismiss(item.id);
              void fn?.();
            }}
            className="press mt-2 inline-flex items-center rounded-lg bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand-strong hover:bg-brand-soft/80"
          >
            {item.action.label}
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        className="press flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-mist hover:text-ink"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

export function AdminToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const push = useCallback((t: Omit<ToastItem, "id">) => {
    if (t.kind === "success") triggerHaptic("commit");
    else if (t.kind === "warning") triggerHaptic("warning");
    else if (t.kind === "error") triggerHaptic("error");

    const id = Date.now() + Math.floor(Math.random() * 10000);
    setItems((prev) => [...prev.slice(-3), { ...t, id }]);
    window.setTimeout(
      () => {
        setItems((prev) => prev.filter((x) => x.id !== id));
      },
      t.action ? 7000 : 4500,
    );
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      push,
      success: (title, description, action) =>
        push({ kind: "success", title, description, action }),
      error: (title, description, action) =>
        push({ kind: "error", title, description, action }),
      info: (title, description, action) =>
        push({ kind: "info", title, description, action }),
      warning: (title, description, action) =>
        push({ kind: "warning", title, description, action }),
    }),
    [push],
  );

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-[80] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2"
      >
        {items.map((t) => (
          <SwipeableToast key={t.id} item={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
