"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowUp,
  HeartPulse,
  Loader2,
  Phone,
  Pill,
  ShieldCheck,
  SquarePen,
  Store,
  Thermometer,
  UserRound,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { AccountControls } from "@/components/shared/Header";
import { hasActiveBiometrics } from "@/lib/ai/types";
import { useSession } from "@/lib/store/session";
import { useChat } from "@/lib/store/chat";
import { cn } from "@/lib/utils";
import { ChatMessageItem } from "./ChatMessageItem";
import { ProfileSheet } from "./ProfileSheet";

const STARTERS = [
  { icon: Thermometer, text: "I've had a fever and chills since yesterday. Could it be malaria?" },
  { icon: Pill, text: "Is it safe to take ibuprofen with my current medicines?" },
  { icon: Store, text: "Where can I get amoxicillin near me?" },
  { icon: Activity, text: "I have a headache and my blood pressure is high. What should I do?" },
];

export function ChatContainer() {
  const profile = useSession((s) => s.profile);
  const user = useSession((s) => s.user);
  const { messages, pending, send, reset } = useChat();
  const [text, setText] = useState("");
  const [sheet, setSheet] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const hasProfile = hasActiveBiometrics(profile);

  useEffect(() => {
    void useChat.persist.rehydrate();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, pending]);

  // Auto-grow the composer up to ~6 lines.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 168)}px`;
  }, [text]);

  const submit = (value = text) => {
    if (!value.trim() || pending) return;
    void send(value, profile);
    setText("");
  };

  const allergies = profile.allergies ?? [];

  return (
    <div className="flex h-dvh flex-col bg-paper">
      <header className="border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-2 px-3 sm:px-5">
          <Logo size={28} />
          <span className="hidden h-5 w-px bg-line sm:block" aria-hidden />
          <h1 className="hidden text-sm font-medium text-muted sm:block">Health chat</h1>
          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSheet(true)}
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-full border px-3 text-sm font-medium transition-colors",
                hasProfile ? "border-brand/30 bg-brand-soft text-brand-strong" : "border-line text-ink hover:bg-mist",
              )}
            >
              {hasProfile ? <ShieldCheck className="h-4 w-4" aria-hidden /> : <UserRound className="h-4 w-4" aria-hidden />}
              <span className="hidden sm:inline">{hasProfile ? "Profile on" : "Add health profile"}</span>
              <span className="sm:hidden">Profile</span>
            </button>
            <button
              type="button"
              onClick={() => {
                reset();
                inputRef.current?.focus();
              }}
              disabled={!messages.length}
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-mist hover:text-ink disabled:opacity-40"
              aria-label="Start a new chat"
              title="New chat"
            >
              <SquarePen className="h-[18px] w-[18px]" aria-hidden />
            </button>
            <div className="hidden md:block">
              <AccountControls />
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full max-w-3xl flex-col px-4 py-6 sm:px-6">
          {messages.length === 0 ? (
            <div className="my-auto py-6">
              <HeartPulse className="h-9 w-9 text-brand" aria-hidden />
              <h2 className="mt-4 font-display text-3xl font-semibold text-ink sm:text-4xl">
                {user ? `How are you feeling, ${user.name.split(" ")[0]}?` : "How are you feeling?"}
              </h2>
              <p className="mt-2 max-w-lg text-muted">
                Describe a symptom or ask about a medicine.{" "}
                {hasProfile
                  ? allergies.length
                    ? `Answers will account for your allergy to ${allergies.slice(0, 2).join(" and ")}${allergies.length > 2 ? " and more" : ""}.`
                    : "Answers will account for your health profile."
                  : "Add your health profile so answers account for your allergies and medicines."}
              </p>
              <div className="mt-8 grid gap-2.5 sm:grid-cols-2">
                {STARTERS.map(({ icon: Icon, text: t }) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => submit(t)}
                    className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-4 text-left text-[15px] text-ink transition-colors hover:border-brand/50"
                  >
                    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden />
                    {t}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6" aria-live="polite">
              {messages.map((m) => (
                <ChatMessageItem key={m.id} message={m} />
              ))}
              {pending && (
                <p className="flex items-center gap-2 pl-11 text-sm text-muted">
                  <Loader2 className="h-4 w-4 animate-spin text-brand" aria-hidden />
                  Checking against your profile
                </p>
              )}
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      <footer className="border-t border-line bg-surface/90 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
        <form
          className="mx-auto max-w-3xl px-3 sm:px-6"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div className="flex items-end gap-2 rounded-2xl border border-line bg-paper p-1.5 pl-4 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
            <label htmlFor="chat-input" className="sr-only">
              Message Zelthia
            </label>
            <textarea
              id="chat-input"
              ref={inputRef}
              rows={1}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder="Describe symptoms or ask about a medicine"
              className="max-h-42 flex-1 resize-none bg-transparent py-2.5 text-[15px] text-ink placeholder:text-muted/70 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!text.trim() || pending}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-white transition-colors hover:bg-brand-strong disabled:opacity-40 dark:text-[#06231a]"
              aria-label="Send message"
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <ArrowUp className="h-5 w-5" aria-hidden />}
            </button>
          </div>
          <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-xs text-muted">
            <Phone className="h-3.5 w-3.5 text-alert" aria-hidden />
            Guidance, not a diagnosis. Emergency?
            <a href="tel:112" className="font-semibold text-ink underline-offset-2 hover:underline">
              Call 112
            </a>
            <Link href="/privacy" className="ml-2 hidden underline-offset-2 hover:underline sm:inline">
              Privacy
            </Link>
          </p>
        </form>
      </footer>

      <ProfileSheet open={sheet} onClose={() => setSheet(false)} />
    </div>
  );
}
