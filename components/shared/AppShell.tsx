"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Boxes,
  History,
  Menu,
  MessageCircleHeart,
  PanelLeftClose,
  PanelLeftOpen,
  Pill,
  PlusCircle,
  Store,
  X,
} from "lucide-react";
import { AccountFooter } from "@/components/chat/Sidebar";
import { ButtonLink } from "@/components/ui/Button";
import { useSession } from "@/lib/store/session";
import { useChat } from "@/lib/store/chat";
import { useDragDismiss, usePresence } from "@/lib/motion";
import { cn } from "@/lib/utils";

const KEY = "zelthia:sidebar-collapsed";
const listeners = new Set<() => void>();
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => void listeners.delete(fn);
};
const readCollapsed = () => {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
};

/**
 * The persistent frame for every signed-in surface. It lives in a route-group
 * layout, so moving between search, stock and account swaps only the page:
 * the sidebar stays mounted and the content area animates around it.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const user = useSession((s) => s.user);
  const facilityCount = useSession((s) => s.facilityCount);
  const sessionStatus = useSession((s) => s.status);
  const conversations = useChat((s) => s.conversations);
  const listStatus = useChat((s) => s.listStatus);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  const drawer = usePresence(mobileOpen);
  const drawerRef = useRef<HTMLElement>(null);
  const swipe = useDragDismiss(drawerRef, "left", () => setMobileOpen(false));

  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMobileOpen(false);
  }

  const collapsed = useSyncExternalStore(subscribe, readCollapsed, () => false);
  const toggle = () => {
    try {
      localStorage.setItem(KEY, collapsed ? "0" : "1");
    } catch {}
    listeners.forEach((l) => l());
  };

  useEffect(() => {
    if (user && listStatus === "idle")
      void useChat.getState().loadConversations();
  }, [user, listStatus]);

  const isProvider = user?.role === "provider";
  const items = [
    { href: "/chat", label: "Health chat", icon: MessageCircleHeart },
    { href: "/inventory", label: "Find medicine", icon: Pill },
    ...(isProvider
      ? !facilityCount
        ? [
            {
              href: "/provider/new?welcome=1",
              label: "Set up your facility",
              icon: PlusCircle,
              highlight: true,
            },
          ]
        : [{ href: "/provider", label: "Manage stock", icon: Boxes }]
      : []),
  ];

  const panel = (closeButton: React.ReactNode) => (
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
        {closeButton}
      </div>

      <nav className="space-y-0.5 px-2" aria-label="Zelthia">
        {items.map(({ href, label, icon: Icon, ...rest }) => {
          const path = href.split("?")[0];
          const active =
            path === "/provider"
              ? pathname.startsWith("/provider")
              : pathname === path || pathname.startsWith(`${path}/`);
          const highlight = "highlight" in rest && rest.highlight;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "press press-soft flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                highlight
                  ? "bg-brand-soft font-medium text-brand-strong hover:bg-brand-soft/70"
                  : active
                    ? "bg-mist font-medium text-ink"
                    : "text-ink hover:bg-mist",
              )}
            >
              <Icon
                className={cn(
                  "h-[18px] w-[18px]",
                  active || highlight ? "text-brand" : "text-muted",
                )}
                aria-hidden
              />
              {label}
              {highlight && (
                <span
                  className="ml-auto h-2 w-2 rounded-full bg-brand"
                  aria-hidden
                />
              )}
            </Link>
          );
        })}
        {isProvider && (facilityCount ?? 0) > 0 && (
          <Link
            href="/provider/new"
            aria-current={pathname === "/provider/new" ? "page" : undefined}
            className="press press-soft flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted hover:bg-mist hover:text-ink"
          >
            <PlusCircle className="h-[18px] w-[18px]" aria-hidden />
            Add a facility
          </Link>
        )}
      </nav>

      <div className="mt-4 min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        {sessionStatus !== "ready" ? (
          <div className="space-y-2 px-3" aria-label="Loading">
            {[70, 50, 85].map((w) => (
              <div
                key={w}
                className="h-4 animate-pulse rounded bg-mist"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
        ) : !user ? (
          <div className="mx-1 rounded-2xl border border-line bg-paper p-4">
            <History className="h-5 w-5 text-muted" aria-hidden />
            <p className="mt-2 text-sm font-semibold text-ink">Make it yours</p>
            <p className="mt-1 text-sm text-muted">
              Create an account to keep your chats and health profile, or to
              list your pharmacy or clinic.
            </p>
            <div className="mt-3 flex flex-col gap-2">
              <ButtonLink
                href={`/signup?next=${encodeURIComponent(pathname)}`}
                size="sm"
              >
                Create account
              </ButtonLink>
              <ButtonLink
                href={`/signin?next=${encodeURIComponent(pathname)}`}
                size="sm"
                variant="secondary"
              >
                Sign in
              </ButtonLink>
            </div>
          </div>
        ) : (
          <>
            <h2 className="px-3 pb-1 text-xs font-medium text-muted">
              Recent chats
            </h2>
            {listStatus === "loading" || listStatus === "idle" ? (
              <div className="space-y-2 px-3 pt-1" aria-label="Loading chats">
                {[70, 50, 85].map((w) => (
                  <div
                    key={w}
                    className="h-4 animate-pulse rounded bg-mist"
                    style={{ width: `${w}%` }}
                  />
                ))}
              </div>
            ) : conversations.length ? (
              <ul>
                {conversations.slice(0, 12).map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/chat/${c.id}`}
                      className="press-soft block truncate rounded-xl px-3 py-2 text-sm text-ink hover:bg-mist"
                    >
                      {c.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-3 text-sm text-muted">
                Your chats will show up here.
              </p>
            )}
            {!isProvider && (
              <Link
                href="/signup?role=provider"
                className="press-soft mx-1 mt-5 flex items-start gap-3 rounded-2xl border border-line bg-paper p-3 text-sm hover:border-brand/50"
              >
                <Store
                  className="mt-0.5 h-[18px] w-[18px] shrink-0 text-brand"
                  aria-hidden
                />
                <span>
                  <span className="block font-medium text-ink">
                    Run a pharmacy or clinic?
                  </span>
                  <span className="block text-muted">
                    Create a facility account to list your stock.
                  </span>
                </span>
              </Link>
            )}
          </>
        )}
      </div>

      <AccountFooter />
    </div>
  );

  return (
    <div className="flex h-dvh overflow-hidden bg-paper">
      <aside
        className={cn(
          "hidden shrink-0 overflow-hidden border-r border-line transition-[width] duration-300 ease-[var(--ease-out)] motion-reduce:transition-none lg:block",
          collapsed ? "w-0 border-r-0" : "w-72",
        )}
        aria-label="Sidebar"
        inert={collapsed || undefined}
      >
        {panel(
          <button
            type="button"
            onClick={toggle}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-mist hover:text-ink"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="h-5 w-5" aria-hidden />
          </button>,
        )}
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
            onClick={() => setMobileOpen(false)}
          />
          <aside
            ref={drawerRef}
            {...swipe}
            className="animate-sheet-left absolute inset-y-0 left-0 touch-pan-y shadow-2xl"
            aria-label="Sidebar"
          >
            {panel(
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-mist hover:text-ink"
                aria-label="Close sidebar"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>,
            )}
          </aside>
        </div>
      )}

      <div className="relative flex min-w-0 flex-1 flex-col">
        <div className="flex h-14 shrink-0 items-center gap-2 px-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="press flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-mist lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" aria-hidden />
          </button>
          {collapsed && (
            <button
              type="button"
              onClick={toggle}
              className="press hidden h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-mist lg:flex"
              aria-label="Open sidebar"
            >
              <PanelLeftOpen className="h-5 w-5" aria-hidden />
            </button>
          )}
        </div>
        <main
          id="main"
          className="flex min-h-0 flex-1 flex-col overflow-y-auto"
          key={pathname.split("/")[1]}
        >
          <div className="animate-rise flex flex-1 flex-col">{children}</div>
        </main>
      </div>
    </div>
  );
}
