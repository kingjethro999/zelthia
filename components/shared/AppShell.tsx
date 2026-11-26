"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Boxes,
  Building2,
  CircleUserRound,
  History,
  Menu,
  MessageCircleHeart,
  PanelLeftClose,
  PanelLeftOpen,
  Pill,
  PlusCircle,
  ShieldCheck,
  Stethoscope,
  Store,
  X,
  type LucideIcon,
} from "lucide-react";
import { AccountFooter } from "@/components/chat/Sidebar";
import { ButtonLink } from "@/components/ui/Button";
import { useHomeHref, useSession } from "@/lib/store/session";
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

interface NavEntry {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  highlight?: boolean;
}

/**
 * The persistent frame for non-chat workspace routes (/provider, /inventory, /account).
 * Renders a role-oriented navigation rail so Facility Operators see stock, services,
 * and licence tools first, Admins see a prominent Console return path, and Personal users
 * transition smoothly between directory lookup, chat, and account settings.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const homeHref = useHomeHref();
  const user = useSession((s) => s.user);
  const adminPath = useSession((s) => s.adminPath);
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
    if (user && listStatus === "idle") {
      void useChat.getState().loadConversations();
    }
  }, [user, listStatus]);

  const isAdmin = Boolean(user?.isAdmin && adminPath);
  const isProvider = user?.role === "provider";
  const activeTab = searchParams.get("tab") ?? "stock";
  const facilityId = searchParams.get("facility");
  const providerQuery = (tab?: string) => {
    const p = new URLSearchParams();
    if (facilityId) p.set("facility", facilityId);
    if (tab && tab !== "stock") p.set("tab", tab);
    const qs = p.toString();
    return qs ? `/provider?${qs}` : "/provider";
  };

  const primaryItems: NavEntry[] = isProvider
    ? facilityCount === 0
      ? [
          {
            href: "/provider/new?welcome=1",
            label: "Register your facility",
            icon: PlusCircle,
            active: pathname === "/provider/new",
            highlight: true,
          },
          {
            href: "/inventory",
            label: "Public directory",
            icon: Pill,
            active: pathname.startsWith("/inventory"),
          },
        ]
      : [
          {
            href: providerQuery("stock"),
            label: "Stock & pricing",
            icon: Boxes,
            active:
              pathname === "/provider" &&
              activeTab !== "services" &&
              activeTab !== "details",
          },
          {
            href: providerQuery("services"),
            label: "Services & scans",
            icon: Stethoscope,
            active: pathname === "/provider" && activeTab === "services",
          },
          {
            href: providerQuery("details"),
            label: "Details & licence",
            icon: Building2,
            active: pathname === "/provider" && activeTab === "details",
          },
          {
            href: "/provider/new",
            label: "Add a facility",
            icon: PlusCircle,
            active: pathname === "/provider/new",
          },
          {
            href: "/inventory",
            label: "Public directory",
            icon: Pill,
            active: pathname.startsWith("/inventory"),
          },
        ]
    : [
        {
          href: "/chat",
          label: "Health chat",
          icon: MessageCircleHeart,
          active: pathname.startsWith("/chat"),
        },
        {
          href: "/inventory",
          label: "Find medicine",
          icon: Pill,
          active: pathname.startsWith("/inventory"),
        },
        {
          href: "/account",
          label: "Account & profile",
          icon: CircleUserRound,
          active: pathname.startsWith("/account"),
        },
      ];

  const secondaryItems: NavEntry[] = isProvider
    ? [
        {
          href: "/chat",
          label: "Health chat & note reader",
          icon: MessageCircleHeart,
          active: pathname.startsWith("/chat"),
        },
        {
          href: "/account",
          label: "Account & security",
          icon: CircleUserRound,
          active: pathname.startsWith("/account"),
        },
      ]
    : [];

  const surfaceTitle = pathname.startsWith("/provider/new")
    ? "Register facility"
    : pathname.startsWith("/provider")
      ? "Facility workspace"
      : pathname.startsWith("/inventory")
        ? "Public directory"
        : pathname.startsWith("/account")
          ? isProvider || isAdmin
            ? "Account & security"
            : "Account & health profile"
          : "Workspace";

  const renderNavLink = (item: NavEntry) => {
    const Icon = item.icon;
    return (
      <Link
        key={item.label}
        href={item.href}
        aria-current={item.active ? "page" : undefined}
        className={cn(
          "press press-soft flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
          item.highlight
            ? "bg-brand-soft font-medium text-brand-strong hover:bg-brand-soft/70"
            : item.active
              ? "bg-mist font-medium text-ink"
              : "text-ink hover:bg-mist",
        )}
      >
        <Icon
          className={cn(
            "h-[18px] w-[18px] shrink-0",
            item.active || item.highlight ? "text-brand" : "text-muted",
          )}
          aria-hidden
        />
        <span className="truncate">{item.label}</span>
        {item.highlight && (
          <span className="ml-auto h-2 w-2 rounded-full bg-brand" aria-hidden />
        )}
      </Link>
    );
  };

  const panel = (closeButton: React.ReactNode) => (
    <div className="flex h-full w-72 flex-col bg-surface">
      <div className="flex h-14 items-center justify-between px-3">
        <Link
          href={homeHref}
          className="flex items-center gap-2 rounded-lg px-1.5 py-1"
          aria-label="Zelthia workspace home"
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
          {isAdmin ? (
            <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-strong">
              Admin
            </span>
          ) : isProvider ? (
            <span className="rounded-full bg-sky-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-sky">
              Facility
            </span>
          ) : null}
        </Link>
        {closeButton}
      </div>

      {isAdmin && adminPath && (
        <div className="px-3 pb-3">
          <Link
            href={adminPath}
            className="press press-soft flex items-center gap-2.5 rounded-2xl border border-brand/30 bg-brand-soft/75 px-3 py-2.5 text-sm font-semibold text-brand-strong hover:bg-brand-soft"
          >
            <ShieldCheck className="h-[18px] w-[18px] shrink-0" aria-hidden />
            <span className="flex-1 truncate">Back to Admin Console</span>
            <ArrowLeft className="h-4 w-4 shrink-0 rotate-180" aria-hidden />
          </Link>
        </div>
      )}

      <nav className="space-y-4 px-2" aria-label="Workspace">
        <div>
          {isProvider && (
            <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
              Facility workspace
            </p>
          )}
          <div className="space-y-0.5">{primaryItems.map(renderNavLink)}</div>
        </div>

        {secondaryItems.length > 0 && (
          <div>
            <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
              Companion &amp; account
            </p>
            <div className="space-y-0.5">{secondaryItems.map(renderNavLink)}</div>
          </div>
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
        ) : isProvider ? (
          <div className="space-y-4 px-1">
            <div className="rounded-2xl border border-line bg-paper p-3.5">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-ink">
                <BadgeCheck className="h-4 w-4 text-brand" aria-hidden />
                Directory visibility
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                Stock quantities, landmark or audio directions, and your
                admin-verified badge appear live in patient medicine searches.
              </p>
            </div>
            {conversations.length > 0 && (
              <div>
                <h2 className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
                  Recent companion chats
                </h2>
                <ul>
                  {conversations.slice(0, 6).map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/chat/${c.id}`}
                        className="press-soft block truncate rounded-xl px-2 py-1.5 text-sm text-ink hover:bg-mist"
                      >
                        {c.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
            {!isAdmin && (
              <Link
                href="/signup?role=provider&switch=1"
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
        <div className="flex h-14 shrink-0 items-center justify-between gap-2 px-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2">
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
            <span className="truncate text-sm font-medium text-muted">
              {surfaceTitle}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && adminPath ? (
              <Link
                href={adminPath}
                className="press press-soft inline-flex h-8 items-center gap-1.5 rounded-full border border-brand/30 bg-brand-soft px-3 text-xs font-semibold text-brand-strong hover:bg-brand-soft/80"
              >
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                Admin Console
              </Link>
            ) : isProvider && !pathname.startsWith("/provider") ? (
              <Link
                href={facilityCount === 0 ? "/provider/new?welcome=1" : "/provider"}
                className="press press-soft inline-flex h-8 items-center gap-1.5 rounded-full border border-line bg-surface px-3 text-xs font-semibold text-ink hover:border-brand/40"
              >
                <Boxes className="h-3.5 w-3.5 text-brand" aria-hidden />
                {facilityCount === 0 ? "Register facility" : "Manage stock"}
              </Link>
            ) : null}
          </div>
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
