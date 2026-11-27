"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
  icon?: LucideIcon;
}

interface SelectProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  label: string;
  /** Visually hide the label (still announced to screen readers). */
  hideLabel?: boolean;
  placeholder?: string;
  icon?: LucideIcon;
  size?: "sm" | "md";
  className?: string;
  align?: "left" | "right";
  /** Adds a filter box at the top of the list, for long lists like countries. */
  searchable?: boolean;
}

export function Select<T extends string>({
  value,
  onChange,
  options,
  label,
  hideLabel,
  placeholder = "Choose an option",
  icon: LeadIcon,
  size = "md",
  className,
  align = "left",
  searchable = false,
}: SelectProps<T>) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const typeahead = useRef({ text: "", at: 0 });
  const [filter, setFilter] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);
  const needle = filter.trim().toLowerCase();
  const shown =
    searchable && needle
      ? options.filter((o) => o.label.toLowerCase().includes(needle))
      : options;
  const selectedIndex = shown.findIndex((o) => o.value === value);
  const SelectedIcon = selected?.icon ?? LeadIcon;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const openList = () => {
    setFilter("");
    const i = options.findIndex((o) => o.value === value);
    setActive(i >= 0 ? i : 0);
    setOpen(true);
    if (searchable) requestAnimationFrame(() => searchRef.current?.focus());
  };

  const commit = (index: number) => {
    const opt = shown[index];
    if (!opt) return;
    onChange(opt.value);
    setOpen(false);
    buttonRef.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive((i) => Math.min(shown.length - 1, i + 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((i) => Math.max(0, i - 1));
        break;
      case "Home":
        e.preventDefault();
        setActive(0);
        break;
      case "End":
        e.preventDefault();
        setActive(shown.length - 1);
        break;
      case "Enter":
        e.preventDefault();
        commit(active);
        break;
      case " ":
        if (searchable) break;
        e.preventDefault();
        commit(active);
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
      case "Tab":
        setOpen(false);
        break;
      default:
        if (!searchable && e.key.length === 1 && /\S/.test(e.key)) {
          const now = Date.now();
          const t = typeahead.current;
          t.text =
            now - t.at < 600
              ? t.text + e.key.toLowerCase()
              : e.key.toLowerCase();
          t.at = now;
          const match = options.findIndex((o) =>
            o.label.toLowerCase().startsWith(t.text),
          );
          if (match >= 0) setActive(match);
        }
    }
  };

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <span
        id={`${id}-label`}
        className={cn(
          "mb-1.5 block text-sm font-medium text-ink",
          hideLabel && "sr-only",
        )}
      >
        {label}
      </span>
      <button
        ref={buttonRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-labelledby={`${id}-label ${id}-value`}
        aria-activedescendant={open ? `${id}-opt-${active}` : undefined}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        className={cn(
          "flex w-full items-center gap-2 rounded-xl border border-line bg-surface text-left text-ink transition-colors hover:border-brand/50",
          open && "border-brand ring-2 ring-brand/20",
          size === "sm" ? "h-9 px-3 text-sm" : "h-11 px-3.5 text-sm",
        )}
      >
        {SelectedIcon && (
          <SelectedIcon className="h-4 w-4 shrink-0 text-muted" aria-hidden />
        )}
        <span
          id={`${id}-value`}
          className={cn("flex-1 truncate", !selected && "text-muted")}
        >
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {open && searchable && (
        <div className="material-popover absolute left-0 right-0 z-50 mt-1.5 rounded-t-xl border border-b-0 border-line p-1.5">
          <input
            ref={searchRef}
            type="search"
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Type to search"
            aria-label={`Search ${label}`}
            aria-controls={`${id}-list`}
            className="h-9 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink outline-none focus:border-brand"
          />
        </div>
      )}
      {open && (
        <ul
          ref={listRef}
          id={`${id}-list`}
          role="listbox"
          aria-labelledby={`${id}-label`}
          className={cn(
            "animate-pop material-popover absolute z-50 max-h-72 min-w-full origin-top overflow-auto overscroll-contain border border-line p-1",
            searchable ? "mt-[3.25rem] rounded-b-xl" : "mt-1.5 rounded-xl",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {shown.length === 0 && (
            <li className="px-2.5 py-2 text-sm text-muted">No matches</li>
          )}
          {shown.map((opt, i) => {
            const isSelected = opt.value === value;
            const OptIcon = opt.icon;
            return (
              <li
                key={opt.value}
                id={`${id}-opt-${i}`}
                data-index={i}
                role="option"
                aria-selected={isSelected}
                onPointerEnter={() => setActive(i)}
                onClick={() => commit(i)}
                className={cn(
                  "flex cursor-pointer items-start gap-2.5 rounded-lg px-2.5 py-2 text-sm",
                  i === active ? "bg-mist" : "",
                  isSelected ? "font-semibold text-ink" : "text-ink",
                )}
              >
                {OptIcon && (
                  <OptIcon
                    className="mt-0.5 h-4 w-4 shrink-0 text-muted"
                    aria-hidden
                  />
                )}
                <span className="flex-1 whitespace-nowrap">
                  {opt.label}
                  {opt.description && (
                    <span className="block whitespace-normal text-xs font-normal text-muted">
                      {opt.description}
                    </span>
                  )}
                </span>
                {isSelected && (
                  <Check
                    className="mt-0.5 h-4 w-4 shrink-0 text-brand"
                    aria-hidden
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
