"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Compass,
  MessageCircleHeart,
  Pill,
  Search,
} from "lucide-react";
import { usePresence } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { ADMIN_NAV_ITEMS, useAdminShell } from "./AdminShell";

interface PaletteItem {
  id: string;
  label: string;
  subtitle: string;
  href: string;
  group: "Console" | "Public app";
  icon: typeof Search;
  keywords: string;
}

export function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { basePath } = useAdminShell();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { mounted, closing } = usePresence(open);

  const allItems = useMemo<PaletteItem[]>(() => {
    const adminItems: PaletteItem[] = ADMIN_NAV_ITEMS.map((n) => ({
      id: `adm-${n.segment || "overview"}`,
      label: n.label,
      subtitle: n.section,
      href: n.segment ? `${basePath}/${n.segment}` : basePath,
      group: "Console",
      icon: n.icon,
      keywords: n.keywords,
    }));
    return [
      ...adminItems,
      {
        id: "pub-chat",
        label: "Open Health Chat",
        subtitle: "Switch to patient chat experience",
        href: "/chat",
        group: "Public app",
        icon: MessageCircleHeart,
        keywords: "chat patient health assistant",
      },
      {
        id: "pub-inventory",
        label: "Open Public Directory",
        subtitle: "Browse live patient medicine search",
        href: "/inventory",
        group: "Public app",
        icon: Pill,
        keywords: "directory search medicine public",
      },
      {
        id: "pub-home",
        label: "Open Zelthia Home",
        subtitle: "Landing page",
        href: "/",
        group: "Public app",
        icon: Compass,
        keywords: "landing home",
      },
    ];
  }, [basePath]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allItems;
    return allItems.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.keywords.toLowerCase().includes(q),
    );
  }, [allItems, query]);

  const safeIdx = filtered.length ? Math.min(activeIdx, filtered.length - 1) : 0;

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 20);
    return () => window.clearTimeout(t);
  }, [open]);

  const go = (href: string) => {
    setQuery("");
    onClose();
    router.push(href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setQuery("");
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => (filtered.length ? (i + 1) % filtered.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) =>
        filtered.length ? (i - 1 + filtered.length) % filtered.length : 0,
      );
    } else if (e.key === "Enter" && filtered[safeIdx]) {
      e.preventDefault();
      go(filtered[safeIdx].href);
    }
  };

  if (!mounted) return null;

  return (
    <div
      data-closing={closing || undefined}
      inert={closing || undefined}
      className="fixed inset-0 z-[75] flex items-start justify-center p-4 pt-[12vh]"
    >
      <button
        type="button"
        aria-label="Close command palette"
        tabIndex={-1}
        className="scrim animate-fade fixed inset-0 cursor-default"
        onClick={() => {
          setQuery("");
          onClose();
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Quick navigation"
        onKeyDown={onKeyDown}
        className="adm-glass-sheet animate-dialog-in relative w-full max-w-lg overflow-hidden rounded-3xl border"
      >
        <div className="flex items-center gap-3 border-b border-line/70 px-4 py-3.5">
          <Search className="h-4 w-4 shrink-0 text-muted" aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIdx(0);
            }}
            placeholder="Jump to section or action…"
            aria-label="Search admin sections"
            className="w-full bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
          />
          <kbd className="rounded-md border border-line bg-mist px-1.5 py-0.5 text-[10px] font-semibold text-muted">
            ESC
          </kbd>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted">
              No matching console views.
            </p>
          ) : (
            <ul role="listbox">
              {filtered.map((item, idx) => {
                const Icon = item.icon;
                const active = idx === safeIdx;
                return (
                  <li key={item.id} role="option" aria-selected={active}>
                    <button
                      type="button"
                      onPointerEnter={() => setActiveIdx(idx)}
                      onClick={() => go(item.href)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors",
                        active ? "bg-surface shadow-sm" : "hover:bg-surface/60",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                          active
                            ? "bg-brand-soft text-brand-strong"
                            : "bg-mist text-muted",
                        )}
                      >
                        <Icon className="h-4 w-4" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-ink">
                          {item.label}
                        </span>
                        <span className="block truncate text-xs text-muted">
                          {item.group} · {item.subtitle}
                        </span>
                      </span>
                      <ArrowRight
                        className={cn(
                          "h-4 w-4 shrink-0 transition-opacity",
                          active ? "opacity-100 text-brand" : "opacity-0",
                        )}
                        aria-hidden
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
