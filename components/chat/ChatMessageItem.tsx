"use client";

import { useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Check,
  CircleCheck,
  Copy,
} from "lucide-react";
import Image from "next/image";
import type { ChatMessage, TriageLevel } from "@/lib/ai/types";
import { cn } from "@/lib/utils";
import { CareReferralCard } from "./CareReferralCard";

const TRIAGE: Record<TriageLevel, { label: string; icon: typeof AlertCircle; className: string }> = {
  urgent: {
    label: "Get emergency care now",
    icon: AlertTriangle,
    className: "border-alert/30 bg-alert-soft text-alert",
  },
  moderate: {
    label: "See a health worker within 1 to 2 days",
    icon: AlertCircle,
    className: "border-caution/30 bg-caution-soft text-caution",
  },
  low: {
    label: "Usually manageable at home",
    icon: CircleCheck,
    className: "border-brand/25 bg-brand-soft text-brand-strong",
  },
};

function inline(content: string) {
  return content.split(/(\*\*.*?\*\*|`.*?`|\*[^*\s][^*]*\*)/g).map((part, i) => {
    if (/^\*[^*][\s\S]*\*$/.test(part)) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-ink">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="rounded bg-mist px-1 py-0.5 text-[0.9em]">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

/** Minimal markdown renderer for assistant replies (headings, lists, quotes). */
function Markdown({ text }: { text: string }) {
  const blocks: React.ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flush = () => {
    if (!list) return;
    const Tag = list.ordered ? "ol" : "ul";
    blocks.push(
      <Tag
        key={`l${blocks.length}`}
        className={cn("my-2 space-y-1 pl-5", list.ordered ? "list-decimal" : "list-disc marker:text-brand")}
      >
        {list.items.map((it, i) => (
          <li key={i}>{inline(it)}</li>
        ))}
      </Tag>,
    );
    list = null;
  };

  text.split("\n").forEach((raw, idx) => {
    const line = raw.trim();
    const bullet = line.match(/^[-*]\s+(.*)/);
    const num = line.match(/^\d+\.\s+(.*)/);
    if (bullet || num) {
      const ordered = Boolean(num);
      if (!list || list.ordered !== ordered) {
        flush();
        list = { ordered, items: [] };
      }
      list.items.push((bullet ?? num)![1]);
      return;
    }
    flush();
    if (!line) return;
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line)) {
      blocks.push(<hr key={idx} className="my-4 border-line" />);
      return;
    }
    if (line.startsWith("#")) {
      blocks.push(
        <h3 key={idx} className="mb-1 mt-3 font-display text-base font-semibold text-ink first:mt-0">
          {inline(line.replace(/^#+\s*/, ""))}
        </h3>,
      );
    } else if (line.startsWith("> ")) {
      blocks.push(
        <blockquote key={idx} className="my-2 border-l-2 border-brand pl-3 text-muted">
          {inline(line.slice(2))}
        </blockquote>,
      );
    } else {
      blocks.push(
        <p key={idx} className="my-1.5">
          {inline(line)}
        </p>,
      );
    }
  });
  flush();
  return <>{blocks}</>;
}

export function ChatMessageItem({ message }: { message: ChatMessage }) {
  const [copied, setCopied] = useState<"idle" | "done" | "failed">("idle");

  if (message.role === "user") {
    return (
      <div className="animate-rise flex justify-end">
        <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-brand px-4 py-3 text-[15px] leading-relaxed text-white dark:text-[#06231a] sm:max-w-[75%]">
          {message.content}
        </p>
      </div>
    );
  }

  const triage = message.triageLevel && message.id !== "welcome" ? TRIAGE[message.triageLevel] : null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied("done");
    } catch (err) {
      console.warn("Clipboard unavailable", err);
      setCopied("failed");
    }
    setTimeout(() => setCopied("idle"), 1800);
  };

  return (
    <div className="animate-rise flex items-start gap-3">
      <Image src="/icons/icon-96.png" alt="" width={32} height={32} unoptimized className="mt-1 shrink-0" />
      <div className="min-w-0 max-w-[92%] flex-1 sm:max-w-[85%]">
        {triage && (
          <p className={cn("mb-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold", triage.className)}>
            <triage.icon className="h-4 w-4" aria-hidden />
            {triage.label}
          </p>
        )}
        <div className="text-[15px] leading-relaxed text-ink">
          <Markdown text={message.content} />
        </div>
        {message.referral && <CareReferralCard referral={message.referral} />}
        {message.id !== "welcome" && (
          <div className="mt-2 flex items-center gap-1 text-xs text-muted">
            <span>{message.timestamp}</span>
            <button
              type="button"
              onClick={copy}
              className="ml-1 inline-flex h-7 items-center gap-1 rounded-md px-2 hover:bg-mist hover:text-ink"
              aria-label="Copy reply"
            >
              {copied === "done" ? (
                <Check className="h-3.5 w-3.5 text-brand" aria-hidden />
              ) : (
                <Copy className="h-3.5 w-3.5" aria-hidden />
              )}
              {copied === "done" ? "Copied" : copied === "failed" ? "Couldn't copy, select the text instead" : "Copy"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
