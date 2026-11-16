"use client";

import { useState } from "react";
import Image from "next/image";
import { AlertCircle, AlertTriangle, Check, CircleCheck, Copy, ExternalLink, FileText } from "lucide-react";
import { Dialog } from "@/components/ui/Dialog";
import type { AgentStep, AttachmentView, ChatMessageView } from "@/lib/chat-types";
import type { TriageLevel } from "@/lib/ai/types";
import { stripTags } from "@/lib/ai/parser";
import { cn } from "@/lib/utils";
import { Markdown } from "./Markdown";
import { StepsPanel } from "./StepsPanel";
import { DirectoryMatches, WebSources } from "./ResultCards";

const TRIAGE: Record<TriageLevel, { label: string; icon: typeof AlertCircle; className: string }> = {
  urgent: { label: "Get emergency care now: call 112", icon: AlertTriangle, className: "border-alert/30 bg-alert-soft text-alert" },
  moderate: { label: "See a health worker within 1 to 2 days", icon: AlertCircle, className: "border-caution/30 bg-caution-soft text-caution" },
  low: { label: "Usually manageable at home", icon: CircleCheck, className: "border-brand/25 bg-brand-soft text-brand-strong" },
};

const kb = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

export function AttachmentThumb({ a, size = "md" }: { a: AttachmentView; size?: "sm" | "md" }) {
  const [open, setOpen] = useState(false);
  const isImage = a.mime.startsWith("image/") && a.url;
  const box = size === "sm" ? "h-14 w-14" : "h-28 w-28 sm:h-36 sm:w-36";
  if (isImage) {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn("group relative block overflow-hidden rounded-2xl border border-line bg-mist", box)}
          aria-label={`View ${a.name}`}
        >
          <Image src={a.url!} alt={a.name} fill unoptimized className="object-cover transition-transform duration-200 group-hover:scale-[1.03]" sizes="144px" />
        </button>
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          title={a.name}
          className="sm:max-w-4xl"
          footer={
            <a href={a.url} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-ink hover:bg-mist">
              <ExternalLink className="h-4 w-4" aria-hidden />
              Open full size
            </a>
          }
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- private, auth-gated URL; Next image optimisation can't fetch it */}
          <img src={a.url} alt={a.name} className="mx-auto max-h-[70dvh] w-auto rounded-xl object-contain" />
        </Dialog>
      </>
    );
  }
  const body = (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-alert-soft text-alert">
        <FileText className="h-5 w-5" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-ink">{a.name}</span>
        <span className="block text-xs text-muted">
          {a.mime === "application/pdf" ? "PDF" : "File"}, {kb(a.size)}
        </span>
      </span>
    </>
  );
  return a.url ? (
    <a href={a.url} target="_blank" rel="noopener noreferrer" className="flex w-56 items-center gap-2.5 rounded-xl border border-line bg-surface p-2 hover:border-brand/50">
      {body}
    </a>
  ) : (
    <div className="flex w-56 items-center gap-2.5 rounded-xl border border-line bg-surface p-2">{body}</div>
  );
}

export function UserMessage({ message }: { message: ChatMessageView }) {
  return (
    <div className="animate-rise flex flex-col items-end gap-2">
      {!!message.attachments?.length && (
        <div className="flex max-w-[85%] flex-wrap justify-end gap-2">
          {message.attachments.map((a, i) => (
            <AttachmentThumb key={a.id ?? i} a={a} />
          ))}
        </div>
      )}
      {message.content && (
        <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-mist px-4 py-2.5 text-[15px] leading-relaxed text-ink sm:max-w-[75%]">
          {message.content}
        </p>
      )}
    </div>
  );
}

export function AssistantMessage({
  message,
  live,
  liveSteps,
  liveText,
}: {
  message?: ChatMessageView;
  live?: boolean;
  liveSteps?: AgentStep[];
  liveText?: string;
}) {
  const [copied, setCopied] = useState<"idle" | "done" | "failed">("idle");
  const steps = live ? (liveSteps ?? []) : (message?.meta?.steps ?? []);
  const text = live ? stripTags(liveText ?? "") : (message?.content ?? "");
  const triage = !live && message?.meta?.triage ? TRIAGE[message.meta.triage] : null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied("done");
    } catch (err) {
      console.warn("Clipboard unavailable", err);
      setCopied("failed");
    }
    setTimeout(() => setCopied("idle"), 1800);
  };

  return (
    <div className="animate-rise">
      <div className="min-w-0">
        <StepsPanel steps={steps} live={Boolean(live)} />
        {triage && (
          <p className={cn("mb-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold", triage.className)}>
            <triage.icon className="h-4 w-4" aria-hidden />
            {triage.label}
          </p>
        )}
        {text ? (
          <div className="text-[15px] leading-relaxed text-ink">
            <Markdown text={text} />
            {live && <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse rounded-sm bg-brand align-middle" aria-hidden />}
          </div>
        ) : live && !steps.length ? (
          <p className="text-sm text-muted">Starting</p>
        ) : null}
        {!live && message && (
          <>
            <DirectoryMatches matches={message.meta?.matches ?? []} />
            <WebSources places={message.meta?.places ?? []} />
            <div className="mt-2 flex items-center gap-1 text-xs text-muted">
              <button
                type="button"
                onClick={copy}
                className="inline-flex h-8 items-center gap-1 rounded-lg px-2 hover:bg-mist hover:text-ink"
                aria-label="Copy reply"
              >
                {copied === "done" ? <Check className="h-3.5 w-3.5 text-brand" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
                {copied === "done" ? "Copied" : copied === "failed" ? "Select the text to copy" : "Copy"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
