"use client";

import { useEffect, useState } from "react";
import { ChevronDown, CircleCheck, CircleX, LoaderCircle } from "lucide-react";
import type { AgentStep } from "@/lib/chat-types";
import { cn } from "@/lib/utils";

function seconds(ms: number) {
  const s = Math.max(0, Math.round(ms / 1000));
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
}

/** Collapsible record of what the assistant did, updating live while it works. */
export function StepsPanel({
  steps,
  live,
}: {
  steps: AgentStep[];
  live: boolean;
}) {
  const [open, setOpen] = useState(live);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!live) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [live]);

  if (!steps.length) return null;

  const running = [...steps].reverse().find((s) => s.status === "running");
  const first = steps[0].startedAt;
  const last = Math.max(
    ...steps.map((s) => s.endedAt ?? (live ? now : s.startedAt)),
  );
  const headline = live
    ? (running?.label ?? steps[steps.length - 1].label)
    : `Worked through ${steps.length} step${steps.length === 1 ? "" : "s"}`;

  return (
    <div className="mb-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="group inline-flex max-w-full items-center gap-2 rounded-lg py-1 text-left text-sm text-muted hover:text-ink"
      >
        {live ? (
          <LoaderCircle
            className="h-4 w-4 shrink-0 animate-spin text-brand"
            aria-hidden
          />
        ) : null}
        <span className={cn("truncate", live && "text-ink")}>{headline}</span>
        <span className="shrink-0 tabular-nums text-muted">
          {seconds(last - first)}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {open && (
        <ol className="animate-rise mt-1.5 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
          {steps.map((s) => (
            <li
              key={s.id}
              className="flex items-start gap-2.5 px-3.5 py-2.5 text-sm"
            >
              {s.status === "running" ? (
                <LoaderCircle
                  className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-brand"
                  aria-label="In progress"
                />
              ) : s.status === "done" ? (
                <CircleCheck
                  className="mt-0.5 h-4 w-4 shrink-0 text-brand"
                  aria-label="Done"
                />
              ) : (
                <CircleX
                  className="mt-0.5 h-4 w-4 shrink-0 text-caution"
                  aria-label="Didn't work"
                />
              )}
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "block",
                    s.status === "running" ? "text-ink" : "text-muted",
                  )}
                >
                  {s.label}
                </span>
                {s.detail && (
                  <span className="mt-0.5 block text-ink">{s.detail}</span>
                )}
              </span>
              <span className="shrink-0 tabular-nums text-xs text-muted">
                {seconds((s.endedAt ?? now) - s.startedAt)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
