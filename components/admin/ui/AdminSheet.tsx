"use client";

import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { useDragDismiss, usePresence } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Frosted glass right-hand Inspector Sheet on desktop / swipe-down bottom sheet
 * on mobile. Shares Zelthia's 1:1 pointer tracking and momentum dismissal.
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
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const { mounted, closing } = usePresence(open);
  const drag = useDragDismiss(panelRef, "down", onClose);

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

  if (!mounted) return null;

  return (
    <div
      data-closing={closing || undefined}
      inert={closing || undefined}
      className="fixed inset-0 z-[65] flex items-end justify-end sm:items-stretch"
    >
      <button
        type="button"
        data-close
        aria-label="Close inspector"
        tabIndex={-1}
        className="scrim animate-fade absolute inset-0 cursor-default"
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
          "adm-glass-sheet animate-side-sheet relative flex max-h-[92dvh] w-full flex-col rounded-t-3xl border outline-none sm:h-full sm:max-h-none sm:max-w-xl sm:rounded-none sm:rounded-l-3xl",
          className,
        )}
      >
        <div
          {...drag}
          className="relative flex touch-none items-start justify-between gap-4 border-b border-line/70 px-5 pb-4 pt-5 sm:touch-auto sm:px-6 sm:py-4"
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
              <p id={`${id}-d`} className="mt-0.5 truncate text-xs text-muted">
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
