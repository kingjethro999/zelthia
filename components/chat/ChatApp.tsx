"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  MessageCircleDashed,
  PanelLeftOpen,
  Phone,
  Pill,
  ScanText,
  ShieldCheck,
  SquarePen,
  Thermometer,
  UserRound,
  Menu,
  AlertCircle,
  ArrowRight,
  Store,
} from "lucide-react";
import { useChat } from "@/lib/store/chat";
import { useSession } from "@/lib/store/session";
import { hasActiveBiometrics } from "@/lib/ai/types";
import { cn } from "@/lib/utils";
import { Sidebar } from "./Sidebar";
import { Composer, type ComposerHandle } from "./Composer";
import { AssistantMessage, UserMessage } from "./MessageView";
import { ProfileSheet } from "./ProfileSheet";

const STARTERS = [
  { icon: ScanText, text: "Read my doctor's note", upload: true },
  {
    icon: Thermometer,
    text: "I've had a fever and chills since yesterday. Could it be malaria?",
  },
  {
    icon: Pill,
    text: "Is it safe to take ibuprofen with my current medicines?",
  },
  { icon: FileText, text: "Where can I get a 2D echo scan near me?" },
];

export function ChatApp() {
  const pathname = usePathname();
  const user = useSession((s) => s.user);
  const sessionStatus = useSession((s) => s.status);
  const profile = useSession((s) => s.profile);
  const facilityCount = useSession((s) => s.facilityCount);
  const chat = useChat();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [dragging, setDragging] = useState(false);
  const composer = useRef<ComposerHandle>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const stick = useRef(true);
  const hasProfile = hasActiveBiometrics(profile);

  // Load history once we know who is signed in.
  useEffect(() => {
    if (sessionStatus !== "ready") return;
    if (user) void useChat.getState().loadConversations();
    else useChat.getState().reset();
  }, [sessionStatus, user]);

  // "Ask the health chat" links arrive with ?q=; send it once the session is known.
  useEffect(() => {
    if (sessionStatus !== "ready") return;
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) {
      window.history.replaceState(null, "", "/chat");
      void useChat
        .getState()
        .send({
          text: q.slice(0, 500),
          files: [],
          profile: useSession.getState().profile,
          signedIn: Boolean(useSession.getState().user),
        });
    }
  }, [sessionStatus]);

  // Keep the open conversation in sync with the URL.
  useEffect(() => {
    const id = pathname.match(/^\/chat\/([0-9a-f-]{36})$/i)?.[1];
    const s = useChat.getState();
    if (id && id !== s.activeId && sessionStatus === "ready")
      void s.openConversation(id);
    if (!id && s.activeId && !s.pending) s.newChat({ temporary: s.temporary });
  }, [pathname, sessionStatus]);

  // Follow the answer as it streams unless the reader scrolled up.
  useEffect(() => {
    const el = scroller.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, [chat.messages.length, chat.liveText, chat.liveSteps]);

  const send = (
    text: string,
    files: Parameters<typeof chat.send>[0]["files"],
  ) => {
    stick.current = true;
    void chat.send({ text, files, profile, signedIn: Boolean(user) });
  };

  const empty =
    chat.messages.length === 0 &&
    !chat.pending &&
    !chat.loadingThread &&
    !chat.activeId;
  const title = chat.conversations.find((c) => c.id === chat.activeId)?.title;
  const notSaved = !user || chat.temporary;

  const composerBlock = (
    <>
      <Composer
        ref={composer}
        pending={chat.pending}
        onSend={send}
        onStop={chat.stop}
        placeholder={
          empty ? "Ask a health question or attach a photo" : "Reply to Zelthia"
        }
      />
      {empty && (
        <div className="mt-3 flex flex-wrap gap-2">
          {STARTERS.map(({ icon: Icon, text, upload }) => (
            <button
              key={text}
              type="button"
              onClick={() =>
                upload ? composer.current?.openPicker() : send(text, [])
              }
              className="inline-flex max-w-full items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-2 text-left text-sm text-ink transition-colors hover:border-brand/50"
            >
              <Icon className="h-4 w-4 shrink-0 text-brand" aria-hidden />
              <span className="truncate">{text}</span>
            </button>
          ))}
        </div>
      )}
      <p className="mt-2 flex flex-wrap items-center justify-center gap-x-1.5 text-center text-xs text-muted">
        {notSaved && (
          <span className="font-medium text-ink">
            {user ? "Temporary chat, not saved." : "Guest chat, not saved."}
          </span>
        )}
        <span>
          Zelthia can make mistakes and doesn&apos;t replace a doctor.
        </span>
        <a
          href="tel:112"
          className="inline-flex items-center gap-1 font-semibold text-ink hover:underline"
        >
          <Phone className="h-3 w-3 text-alert" aria-hidden />
          Emergency 112
        </a>
      </p>
    </>
  );

  return (
    <div
      className="flex h-dvh overflow-hidden bg-paper"
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes("Files")) {
          e.preventDefault();
          setDragging(true);
        }
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files.length)
          composer.current?.addFiles(e.dataTransfer.files);
      }}
    >
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileNav}
        onCollapse={() => setCollapsed(true)}
        onCloseMobile={() => setMobileNav(false)}
      />

      <div className="relative flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-1.5 px-2 sm:px-4">
          <button
            type="button"
            onClick={() => setMobileNav(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-mist hover:text-ink lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" aria-hidden />
          </button>
          {collapsed && (
            <>
              <button
                type="button"
                onClick={() => setCollapsed(false)}
                className="hidden h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-mist hover:text-ink lg:flex"
                aria-label="Open sidebar"
              >
                <PanelLeftOpen className="h-5 w-5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => chat.newChat()}
                className="hidden h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-mist hover:text-ink lg:flex"
                aria-label="New chat"
              >
                <SquarePen className="h-[18px] w-[18px]" aria-hidden />
              </button>
            </>
          )}
          <h1 className="min-w-0 flex-1 truncate px-1 text-sm font-medium text-ink">
            {chat.temporary ? "Temporary chat" : (title ?? "")}
          </h1>
          <button
            type="button"
            onClick={() => setSheet(true)}
            className={cn(
              "press press-soft inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-sm font-medium",
              hasProfile
                ? "border-brand/30 bg-brand-soft text-brand-strong"
                : "border-line text-ink hover:bg-mist",
            )}
          >
            {hasProfile ? (
              <ShieldCheck className="h-4 w-4" aria-hidden />
            ) : (
              <UserRound className="h-4 w-4" aria-hidden />
            )}
            <span className="hidden sm:inline">
              {hasProfile ? "Health profile on" : "Add health profile"}
            </span>
            <span className="sm:hidden">Profile</span>
          </button>
          {user && (
            <button
              type="button"
              onClick={() => chat.setTemporary(!chat.temporary)}
              aria-pressed={chat.temporary}
              title={
                chat.temporary
                  ? "Turn off temporary chat"
                  : "Temporary chat: not saved to your history"
              }
              className={cn(
                "press flex h-9 w-9 items-center justify-center rounded-full",
                chat.temporary
                  ? "bg-ink text-paper"
                  : "text-muted hover:bg-mist hover:text-ink",
              )}
              aria-label={
                chat.temporary
                  ? "Turn off temporary chat"
                  : "Start a temporary chat"
              }
            >
              <MessageCircleDashed className="h-[18px] w-[18px]" aria-hidden />
            </button>
          )}
        </header>

        <div
          ref={scroller}
          onScroll={(e) => {
            const el = e.currentTarget;
            stick.current =
              el.scrollHeight - el.scrollTop - el.clientHeight < 80;
          }}
          className="min-h-0 flex-1 overflow-y-auto"
        >
          <div
            className={cn(
              "mx-auto flex w-full max-w-3xl flex-col px-4 sm:px-6",
              empty ? "pb-16 pt-[12vh] sm:pt-[18vh]" : "pb-10 pt-4",
            )}
          >
            {empty ? (
              <div className="animate-rise py-8">
                {chat.temporary ? (
                  <>
                    <MessageCircleDashed
                      className="h-9 w-9 text-ink"
                      aria-hidden
                    />
                    <h2 className="mt-4 title font-display text-3xl font-semibold text-ink sm:text-4xl">
                      Temporary chat
                    </h2>
                    <p className="mt-2 max-w-lg text-muted">
                      This chat won&apos;t appear in your history and isn&apos;t
                      used to remember anything about you. Handy when
                      you&apos;re asking for someone else.
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="title font-display text-3xl font-semibold text-ink sm:text-4xl">
                      {user
                        ? `How can I help, ${user.name.split(" ")[0]}?`
                        : "How can I help?"}
                    </h2>
                    <p className="mt-2 max-w-lg text-muted">
                      Ask about symptoms or medicines, or upload a doctor&apos;s
                      note, prescription or result and I&apos;ll explain it and
                      find where to go next.
                    </p>
                  </>
                )}
                {user?.role === "provider" &&
                  facilityCount === 0 &&
                  !chat.temporary && (
                    <Link
                      href="/provider/new?welcome=1"
                      className="mt-6 flex items-center gap-3 rounded-2xl border border-brand/30 bg-brand-soft/60 p-4 transition-colors hover:border-brand"
                    >
                      <Store
                        className="h-6 w-6 shrink-0 text-brand"
                        aria-hidden
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold text-ink">
                          Finish setting up your facility
                        </span>
                        <span className="block text-sm text-muted">
                          Patients can&apos;t find your stock until you add your
                          address, directions and products.
                        </span>
                      </span>
                      <ArrowRight
                        className="h-5 w-5 shrink-0 text-brand"
                        aria-hidden
                      />
                    </Link>
                  )}
                <div className="mt-8">{composerBlock}</div>
              </div>
            ) : chat.loadingThread ? (
              <div className="space-y-3 py-6" aria-label="Loading chat">
                {[60, 85, 40].map((w) => (
                  <div
                    key={w}
                    className="h-4 animate-pulse rounded bg-mist"
                    style={{ width: `${w}%` }}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-8">
                {chat.messages.map((m) =>
                  m.role === "user" ? (
                    <UserMessage key={m.id} message={m} />
                  ) : (
                    <AssistantMessage key={m.id} message={m} />
                  ),
                )}
                {chat.pending && (
                  <AssistantMessage
                    live
                    liveSteps={chat.liveSteps}
                    liveText={chat.liveText}
                  />
                )}
              </div>
            )}
            {chat.threadError && (
              <p
                role="alert"
                className="mt-6 flex items-center gap-2 rounded-xl border border-alert/25 bg-alert-soft p-3 text-sm text-alert"
              >
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
                {chat.threadError}
              </p>
            )}
            {chat.sendError && (
              <p
                role="alert"
                className="mt-6 flex items-center gap-2 rounded-xl border border-alert/25 bg-alert-soft p-3 text-sm text-alert"
              >
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
                {chat.sendError}
              </p>
            )}
          </div>
        </div>

        {!empty && (
          <div className="shrink-0 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">
            <div className="mx-auto max-w-3xl">{composerBlock}</div>
          </div>
        )}

        {dragging && (
          <div className="pointer-events-none absolute inset-3 z-30 flex items-center justify-center rounded-3xl border-2 border-dashed border-brand bg-paper/90">
            <p className="flex items-center gap-2 text-lg font-semibold text-ink">
              <FileText className="h-6 w-6 text-brand" aria-hidden />
              Drop photos or PDFs to attach
            </p>
          </div>
        )}
      </div>

      <ProfileSheet open={sheet} onClose={() => setSheet(false)} />
    </div>
  );
}
