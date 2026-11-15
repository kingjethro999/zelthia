"use client";

import React, { useState } from "react";
import {
  Copy,
  Check,
  User,
  Sparkles,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Shield,
} from "lucide-react";
import { ChatMessage, TriageLevel } from "@/lib/ai/types";
import { CareReferralCard } from "./CareReferralCard";

interface ChatMessageItemProps {
  message: ChatMessage;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
}) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const renderTriageBadge = (level?: TriageLevel) => {
    if (!level) return null;
    switch (level) {
      case "urgent":
        return (
          <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full border border-red-300 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 dark:border-red-800 dark:bg-red-950/60 dark:text-red-300">
            <AlertTriangle className="h-3.5 w-3.5 text-red-600 animate-bounce" />
            <span>
              Urgent Medical Triage: Immediate Emergency Care Recommended
            </span>
          </div>
        );
      case "moderate":
        return (
          <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
            <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
            <span>
              Moderate Triage: Clinical Evaluation Advised (within 24–48h)
            </span>
          </div>
        );
      case "low":
      default:
        return (
          <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Routine / Supportive Care Triage</span>
          </div>
        );
    }
  };

  // Simple, clean markdown-to-HTML parser for health assistant responses
  const formatMarkdown = (text: string) => {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // Heading 3
      if (trimmed.startsWith("### ")) {
        elements.push(
          <h3
            key={index}
            className="mt-3 mb-1.5 text-sm font-bold text-slate-900 dark:text-white"
          >
            {renderInlineMarkdown(trimmed.replace("### ", ""))}
          </h3>,
        );
        return;
      }

      // Heading 4
      if (trimmed.startsWith("#### ")) {
        elements.push(
          <h4
            key={index}
            className="mt-2.5 mb-1 text-xs font-bold text-teal-800 dark:text-teal-300"
          >
            {renderInlineMarkdown(trimmed.replace("#### ", ""))}
          </h4>,
        );
        return;
      }

      // Blockquote
      if (trimmed.startsWith("> ")) {
        elements.push(
          <blockquote
            key={index}
            className="my-2 border-l-3 border-teal-500 bg-teal-50/50 p-2 text-xs italic text-slate-700 dark:bg-slate-800/50 dark:text-slate-300"
          >
            {renderInlineMarkdown(trimmed.replace("> ", ""))}
          </blockquote>,
        );
        return;
      }

      // Bullet points
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        elements.push(
          <div
            key={index}
            className="ml-2 flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-300 my-0.5"
          >
            <span className="text-teal-500 font-bold mt-0.5">•</span>
            <span>{renderInlineMarkdown(trimmed.slice(2))}</span>
          </div>,
        );
        return;
      }

      // Numbered items (e.g. "1. ")
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        elements.push(
          <div
            key={index}
            className="ml-2 flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-300 my-1"
          >
            <span className="font-semibold text-teal-600 dark:text-teal-400 shrink-0">
              {numMatch[1]}.
            </span>
            <span>{renderInlineMarkdown(numMatch[2])}</span>
          </div>,
        );
        return;
      }

      // Empty line
      if (trimmed === "") {
        elements.push(<div key={index} className="h-1.5" />);
        return;
      }

      // Standard paragraph
      elements.push(
        <p
          key={index}
          className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 my-1"
        >
          {renderInlineMarkdown(trimmed)}
        </p>,
      );
    });

    return elements;
  };

  // Helper for **bold**, *italic*, and `code` inline formatting
  const renderInlineMarkdown = (content: string) => {
    const parts = content.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong
            key={i}
            className="font-semibold text-slate-900 dark:text-white"
          >
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return (
          <em key={i} className="italic text-slate-700 dark:text-slate-300">
            {part.slice(1, -1)}
          </em>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={i}
            className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[11px] text-teal-700 dark:bg-slate-800 dark:text-teal-300"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  if (isUser) {
    return (
      <div className="flex justify-end gap-2.5 my-3 px-4">
        <div className="flex flex-col items-end max-w-[85%] sm:max-w-[75%]">
          <div className="rounded-2xl rounded-tr-xs bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-3 text-xs sm:text-sm text-white shadow-xs">
            <p className="whitespace-pre-wrap leading-relaxed">
              {message.content}
            </p>
          </div>
          <span className="mt-1 text-[10px] text-slate-400">
            {message.timestamp}
          </span>
        </div>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700 shadow-2xs dark:bg-teal-950 dark:text-teal-300">
          <User className="h-4 w-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start gap-2.5 my-3 px-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white shadow-xs">
        <Sparkles className="h-4 w-4" />
      </div>

      <div className="flex flex-col items-start max-w-[92%] sm:max-w-[85%]">
        <div className="w-full rounded-2xl rounded-tl-xs border border-slate-200/90 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          {/* Triage Badge */}
          {renderTriageBadge(message.triageLevel)}

          {/* Formatted Content */}
          <div className="text-slate-800 dark:text-slate-200">
            {formatMarkdown(message.content)}
          </div>

          {/* Referral Card (if recommended) */}
          {message.referral && <CareReferralCard referral={message.referral} />}

          {/* Message Footer: Copy button & Disclaimer Badge */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
              <Shield className="h-3 w-3 text-teal-600" />
              <span>
                Informational triage • In emergency call{" "}
                <strong>112 / 911</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400">
                {message.timestamp}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                aria-label="Copy AI response"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-600" />
                    <span className="text-emerald-600">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
