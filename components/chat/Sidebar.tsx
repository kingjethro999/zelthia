"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Boxes,
  ChevronUp,
  CircleUserRound,
  Ellipsis,
  History,
  LogOut,
  PanelLeftClose,
  Pencil,
  Pill,
  SquarePen,
  Trash2,
  X,
} from "lucide-react";
import { useChat } from "@/lib/store/chat";
import { useSession } from "@/lib/store/session";
import type { ConversationSummary } from "@/lib/chat-types";
import { Dialog } from "@/components/ui/Dialog";
import { Button, ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useDragDismiss, useLastDefined, usePresence } from "@/lib/motion";

function group(list: ConversationSummary[]) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const day = 864e5;
  const buckets: [string, ConversationSummary[]][] = [
    ["Today", []],
    ["Yesterday", []],
    ["Previous 7 days", []],
    ["Previous 30 days", []],
    ["Older", []],
  ];
  for (const c of list) {
    const t = new Date(c.updatedAt).getTime();
    const idx =
      t >= startOfDay.getTime()
        ? 0
        : t >= startOfDay.getTime() - day
          ? 1
          : t >= startOfDay.getTime() - 7 * day
            ? 2
            : t >= startOfDay.getTime() - 30 * day
              ? 3
              : 4;
    buckets[idx][1].push(c);
  }
  return buckets.filter(([, items]) => items.length);
}

export function Sidebar({
  collapsed,
  mobileOpen,
  onCollapse,
  onCloseMobile,
}: {
  collapsed: boolean;
  mobileOpen: boolean;
  onCollapse: () => void;
  onCloseMobile: () => void;
}) {
  const user = useSession((s) => s.user);
  const facilityCount = useSession((s) => s.facilityCount);
  const {
    conversations,
    listStatus,
    activeId,
    newChat,
    rename,
    remove,
    openConversation,
  } = useChat();
  const groups = useMemo(() => group(conversations), [conversations]);
  const [editing, setEditing] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConversationSummary | null>(null);
  const shownConfirm = useLastDefined(confirm);
  const [deleting, setDeleting] = useState(false);
  const drawer = usePresence(mobileOpen);
  const drawerRef = useRef<HTMLElement>(null);
  const swipe = useDragDismiss(drawerRef, "left", onCloseMobile);

  const panel = (
    <div className="flex h-full w-72 flex-col bg-surface">
      <div className="flex h-14 items-center justify-between px-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-1.5 py-1"
          aria-label="Zelthia home"
        >
          <Image
            src="/icons/icon-96.png"
            alt=""
            width={26}
            height={26}
            unoptimized
          />
          <span className="font-display text-lg font-semibold text-ink">
            Zelthia
          </span>
        </Link>
        <button
          type="button"
          onClick={mobileOpen ? onCloseMobile : onCollapse}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-mist hover:text-ink"
          aria-label={mobileOpen ? "Close sidebar" : "Collapse sidebar"}
        >
          {mobileOpen ? (
            <X className="h-5 w-5" aria-hidden />
          ) : (
            <PanelLeftClose className="h-5 w-5" aria-hidden />
          )}
        </button>
      </div>

      <nav className="space-y-0.5 px-2" aria-label="Chat">
        <button
          type="button"
          onClick={() => {
            newChat();
            onCloseMobile();
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-ink hover:bg-mist"
        >
          <SquarePen className="h-[18px] w-[18px] text-brand" aria-hidden />
          New chat
        </button>
        <Link
          href="/inventory"
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-ink hover:bg-mist"
        >
          <Pill className="h-[18px] w-[18px] text-muted" aria-hidden />
          Find medicine
        </Link>
        {user?.role === "provider" &&
          (facilityCount === 0 ? (
            <Link
              href="/provider/new?welcome=1"
              className="flex items-center gap-3 rounded-xl bg-brand-soft px-3 py-2 text-sm font-medium text-brand-strong hover:bg-brand-soft/70"
            >
              <Boxes className="h-[18px] w-[18px]" aria-hidden />
              Set up your facility
              <span
                className="ml-auto h-2 w-2 rounded-full bg-brand"
                aria-hidden
              />
            </Link>
          ) : (
            <Link
              href="/provider"
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-ink hover:bg-mist"
            >
              <Boxes className="h-[18px] w-[18px] text-muted" aria-hidden />
              Manage stock
            </Link>
          ))}
      </nav>

      <div className="mt-4 min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        {!user ? (
          <div className="mx-1 rounded-2xl border border-line bg-paper p-4">
            <History className="h-5 w-5 text-muted" aria-hidden />
            <p className="mt-2 text-sm font-semibold text-ink">
              Keep your chats
            </p>
            <p className="mt-1 text-sm text-muted">
              You&apos;re chatting as a guest, so nothing is saved. Sign in to
              keep your history and files.
            </p>
            <div className="mt-3 flex flex-col gap-2">
              <ButtonLink href="/signup?next=/chat" size="sm">
                Create account
              </ButtonLink>
              <ButtonLink
                href="/signin?next=/chat"
                size="sm"
                variant="secondary"
              >
                Sign in
              </ButtonLink>
            </div>
          </div>
        ) : (listStatus === "loading" || listStatus === "idle") &&
          !conversations.length ? (
          <div className="space-y-2 px-3" aria-label="Loading chats">
            {[70, 50, 85, 60].map((w) => (
              <div
                key={w}
                className="h-4 animate-pulse rounded bg-mist"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
        ) : listStatus === "error" ? (
          <p className="px-3 text-sm text-alert">
            Couldn&apos;t load your chats. Refresh to try again.
          </p>
        ) : !conversations.length ? (
          <p className="px-3 text-sm text-muted">
            Your chats will show up here.
          </p>
        ) : (
          groups.map(([label, items]) => (
            <section key={label} className="mb-3">
              <h2 className="px-3 pb-1 text-xs font-medium text-muted">
                {label}
              </h2>
              <ul>
                {items.map((c) => (
                  <ConversationRow
                    key={c.id}
                    c={c}
                    active={c.id === activeId}
                    editing={editing === c.id}
                    onNavigate={onCloseMobile}
                    onOpen={() => void openConversation(c.id)}
                    onEdit={() => setEditing(c.id)}
                    onRename={async (t) => {
                      setEditing(null);
                      if (t && t !== c.title) await rename(c.id, t);
                    }}
                    onDelete={() => setConfirm(c)}
                  />
                ))}
              </ul>
            </section>
          ))
        )}
      </div>

      <AccountFooter />

      <Dialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        title="Delete this chat?"
        description={`"${shownConfirm?.title}" and any files in it will be deleted. This can't be undone.`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirm(null)}>
              Keep chat
            </Button>
            <Button
              variant="danger"
              loading={deleting}
              onClick={async () => {
                if (!confirm) return;
                setDeleting(true);
                await remove(confirm.id);
                setDeleting(false);
                setConfirm(null);
              }}
            >
              <Trash2 className="h-4 w-4" aria-hidden />
              Delete chat
            </Button>
          </>
        }
      />
    </div>
  );

  return (
    <>
      <aside
        className={cn(
          "hidden shrink-0 overflow-hidden border-r border-line transition-[width] duration-200 lg:block",
          collapsed ? "w-0 border-r-0" : "w-72",
        )}
        aria-label="Chat history"
      >
        {panel}
      </aside>
      {drawer.mounted && (
        <div
          data-closing={drawer.closing || undefined}
          inert={drawer.closing || undefined}
          className="fixed inset-0 z-50 lg:hidden"
        >
          <button
            type="button"
            className="scrim animate-fade absolute inset-0"
            aria-label="Close sidebar"
            onClick={onCloseMobile}
          />
          <aside
            ref={drawerRef}
            {...swipe}
            className="animate-sheet-left absolute inset-y-0 left-0 touch-pan-y shadow-2xl"
            aria-label="Chat history"
          >
            {panel}
          </aside>
        </div>
      )}
    </>
  );
}

function ConversationRow({
  c,
  active,
  editing,
  onNavigate,
  onOpen,
  onEdit,
  onRename,
  onDelete,
}: {
  c: ConversationSummary;
  active: boolean;
  editing: boolean;
  onNavigate: () => void;
  onOpen: () => void;
  onEdit: () => void;
  onRename: (title: string) => void;
  onDelete: () => void;
}) {
  const [menu, setMenu] = useState(false);
  const ref = useRef<HTMLLIElement>(null);
  const [draft, setDraft] = useState(c.title);

  useEffect(() => {
    if (!menu) return;
    const close = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [menu]);

  if (editing) {
    return (
      <li className="px-1 py-0.5">
        <input
          autoFocus
          aria-label="Chat title"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => onRename(draft.trim())}
          onKeyDown={(e) => {
            if (e.key === "Enter") onRename(draft.trim());
            if (e.key === "Escape") onRename(c.title);
          }}
          className="h-9 w-full rounded-lg border border-brand bg-paper px-2.5 text-sm text-ink focus:outline-none"
        />
      </li>
    );
  }

  return (
    <li ref={ref} className="group relative">
      <Link
        href={`/chat/${c.id}`}
        onClick={(e) => {
          // Open in place: the chat shell is already loaded, so no page navigation is needed.
          if (!e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) {
            e.preventDefault();
            onOpen();
          }
          onNavigate();
        }}
        aria-current={active ? "page" : undefined}
        className={cn(
          "block truncate rounded-xl py-2 pl-3 pr-9 text-sm transition-colors",
          active ? "bg-mist font-medium text-ink" : "text-ink/85 hover:bg-mist",
        )}
      >
        {c.title}
      </Link>
      <button
        type="button"
        onClick={() => setMenu((m) => !m)}
        aria-haspopup="menu"
        aria-expanded={menu}
        aria-label={`Options for ${c.title}`}
        className={cn(
          "absolute right-1 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-muted hover:bg-line hover:text-ink",
          menu || active
            ? "opacity-100"
            : "opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:focus:opacity-100",
        )}
      >
        <Ellipsis className="h-4 w-4" aria-hidden />
      </button>
      {menu && (
        <div
          role="menu"
          className="animate-pop material-popover absolute right-0 top-9 z-20 w-40 origin-top-right rounded-xl border border-line p-1"
        >
          <button
            role="menuitem"
            type="button"
            onClick={() => {
              setMenu(false);
              onEdit();
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-ink hover:bg-mist"
          >
            <Pencil className="h-4 w-4 text-muted" aria-hidden />
            Rename
          </button>
          <button
            role="menuitem"
            type="button"
            onClick={() => {
              setMenu(false);
              onDelete();
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-alert hover:bg-alert-soft"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            Delete
          </button>
        </div>
      )}
    </li>
  );
}

export function AccountFooter() {
  const user = useSession((s) => s.user);
  const signOut = useSession((s) => s.signOut);
  const resetChat = useChat((s) => s.reset);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  if (!user) return null;
  const initials = user.name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return (
    <div ref={ref} className="relative border-t border-line p-2">
      {open && (
        <div
          role="menu"
          className="animate-pop material-popover absolute bottom-full left-2 right-2 mb-1 origin-bottom rounded-2xl border border-line p-1.5"
        >
          <p className="truncate px-3 py-2 text-xs text-muted">{user.email}</p>
          <Link
            role="menuitem"
            href="/account"
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink hover:bg-mist"
          >
            <CircleUserRound className="h-4 w-4 text-muted" aria-hidden />
            Account and health profile
          </Link>
          <button
            role="menuitem"
            type="button"
            onClick={async () => {
              setOpen(false);
              await signOut();
              resetChat();
              router.replace("/chat");
            }}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-ink hover:bg-mist"
          >
            <LogOut className="h-4 w-4 text-muted" aria-hidden />
            Sign out
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex w-full items-center gap-2.5 rounded-xl p-2 text-left hover:bg-mist"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand-strong">
          {initials}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-ink">
            {user.name}
          </span>
          <span className="block text-xs text-muted">
            {user.role === "provider" ? "Facility account" : "Personal account"}
          </span>
        </span>
        <ChevronUp
          className={cn(
            "h-4 w-4 text-muted transition-transform",
            !open && "rotate-180",
          )}
          aria-hidden
        />
      </button>
    </div>
  );
}
