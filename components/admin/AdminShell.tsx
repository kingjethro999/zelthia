"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  BadgeCheck,
  Building2,
  ChevronRight,
  Command,
  LayoutDashboard,
  Lock,
  LogOut,
  Menu,
  PackageSearch,
  PanelLeftClose,
  PanelLeftOpen,
  ScrollText,
  Search,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import type { SessionUser } from "@/lib/auth-types";
import { useDragDismiss, usePresence } from "@/lib/motion";
import { useSession } from "@/lib/store/session";
import { cn } from "@/lib/utils";
import { CommandPalette } from "./CommandPalette";
import { AdminToastProvider } from "./ui/AdminToast";

export interface AdminNavItem {
  segment: "" | "verifications" | "facilities" | "inventory" | "users" | "audit" | "system";
  label: string;
  section: "Operations" | "Governance";
  icon: LucideIcon;
  keywords: string;
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    segment: "",
    label: "Overview",
    section: "Operations",
    icon: LayoutDashboard,
    keywords: "command center kpi dashboard home pulse",
  },
  {
    segment: "verifications",
    label: "Licence review",
    section: "Operations",
    icon: BadgeCheck,
    keywords: "verifications approve decline gov.ng pcn mdcn nafdac",
  },
  {
    segment: "facilities",
    label: "Facilities",
    section: "Operations",
    icon: Building2,
    keywords: "pharmacies clinics hospitals diagnostics stores directory",
  },
  {
    segment: "inventory",
    label: "Global stock",
    section: "Operations",
    icon: PackageSearch,
    keywords: "products medicines expiry low stock rx prescription",
  },
  {
    segment: "users",
    label: "Accounts",
    section: "Governance",
    icon: Users,
    keywords: "users patients providers roles sessions encryption",
  },
  {
    segment: "audit",
    label: "Audit trail",
    section: "Governance",
    icon: ScrollText,
    keywords: "logs actions security csv json export",
  },
  {
    segment: "system",
    label: "System & privacy",
    section: "Governance",
    icon: Activity,
    keywords: "database latency health rate limits prune maintenance",
  },
];

interface AdminShellContextValue {
  basePath: string;
  user: SessionUser;
  pendingCount: number | null;
  refreshPendingCount: () => Promise<void>;
  openCommandPalette: () => void;
}

const AdminShellCtx = createContext<AdminShellContextValue | null>(null);

export function useAdminShell(): AdminShellContextValue {
  const ctx = useContext(AdminShellCtx);
  if (!ctx) {
    throw new Error("useAdminShell must be used inside AdminShell");
  }
  return ctx;
}

const RAIL_KEY = "zelthia:adm-rail-collapsed";
const railListeners = new Set<() => void>();
const subscribeRail = (fn: () => void) => {
  railListeners.add(fn);
  return () => void railListeners.delete(fn);
};
const readRailCollapsed = () => {
  try {
    return localStorage.getItem(RAIL_KEY) === "1";
  } catch {
    return false;
  }
};

export function AdminShell({
  basePath,
  initialUser,
  children,
}: {
  basePath: string;
  initialUser: SessionUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const sessionUser = useSession((s) => s.user);
  const signOut = useSession((s) => s.signOut);
  const user = sessionUser ?? initialUser;

  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);

  const drawer = usePresence(mobileOpen);
  const drawerRef = useRef<HTMLElement>(null);
  const swipe = useDragDismiss(drawerRef, "left", () => setMobileOpen(false));

  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMobileOpen(false);
  }

  const collapsed = useSyncExternalStore(
    subscribeRail,
    readRailCollapsed,
    () => false,
  );
  const toggleRail = () => {
    try {
      localStorage.setItem(RAIL_KEY, collapsed ? "0" : "1");
    } catch {
      /* ignore storage errors */
    }
    railListeners.forEach((l) => l());
  };

  const refreshPendingCount = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/verifications?status=pending", {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json().catch(() => ({}));
      if (Array.isArray(data.items)) {
        setPendingCount(data.items.length);
      }
    } catch {
      /* ignore transient fetch errors */
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/verifications?status=pending", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data && Array.isArray(data.items)) {
          setPendingCount(data.items.length);
        }
      })
      .catch(() => {
        /* ignore transient fetch errors */
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const currentNav = useMemo(() => {
    const clean = pathname.replace(/\/+$/, "");
    return (
      ADMIN_NAV_ITEMS.find((item) => {
        const target = item.segment ? `${basePath}/${item.segment}` : basePath;
        return clean === target;
      }) ?? ADMIN_NAV_ITEMS[0]
    );
  }, [pathname, basePath]);

  const handleSignOut = async () => {
    await signOut();
    router.replace("/");
  };

  const initials = user.name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  const renderNavSection = (section: "Operations" | "Governance") => (
    <div className="space-y-1">
      <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
        {section}
      </p>
      {ADMIN_NAV_ITEMS.filter((i) => i.section === section).map((item) => {
        const href = item.segment ? `${basePath}/${item.segment}` : basePath;
        const active = currentNav.segment === item.segment;
        const Icon = item.icon;
        return (
          <Link
            key={item.segment || "overview"}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "press press-soft flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-surface text-ink shadow-[0_1px_2px_rgb(6_25_26/0.08),0_4px_12px_-4px_rgb(6_25_26/0.12)]"
                : "text-muted hover:bg-surface/55 hover:text-ink",
            )}
          >
            <Icon
              className={cn(
                "h-[18px] w-[18px] shrink-0",
                active ? "text-brand" : "text-muted",
              )}
              aria-hidden
            />
            <span className="truncate">{item.label}</span>
            {item.segment === "verifications" &&
              pendingCount !== null &&
              pendingCount > 0 && (
                <span className="tabular ml-auto rounded-full bg-caution-soft px-2 py-0.5 text-[11px] font-semibold text-caution">
                  {pendingCount}
                </span>
              )}
          </Link>
        );
      })}
    </div>
  );

  const railContent = (closeAction: React.ReactNode) => (
    <div className="adm-glass-rail flex h-full w-72 flex-col border-r">
      <div className="flex h-16 items-center justify-between px-4">
        <Link
          href={basePath}
          className="flex items-center gap-2.5 rounded-xl px-1 py-1"
          aria-label="Zelthia Console home"
        >
          <Image
            src="/icons/icon-96.png"
            alt=""
            width={28}
            height={28}
            unoptimized
          />
          <span className="font-display text-lg font-semibold text-ink">
            Zelthia
          </span>
          <span className="rounded-full border border-brand/25 bg-brand-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-strong">
            Admin
          </span>
        </Link>
        {closeAction}
      </div>

      <div className="px-3 pb-3">
        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          className="press-soft flex h-10 w-full items-center gap-2.5 rounded-2xl border border-line/80 bg-surface/65 px-3 text-left text-xs text-muted transition-colors hover:border-brand/40 hover:text-ink"
        >
          <Search className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="flex-1 truncate">Quick jump…</span>
          <kbd className="inline-flex items-center gap-0.5 rounded-md border border-line bg-paper/80 px-1.5 py-0.5 font-sans text-[10px] font-semibold text-muted">
            <Command className="h-2.5 w-2.5" aria-hidden />K
          </kbd>
        </button>
      </div>

      <nav
        aria-label="Admin navigation"
        className="flex-1 space-y-5 overflow-y-auto px-3 py-2"
      >
        {renderNavSection("Operations")}
        {renderNavSection("Governance")}
      </nav>

      <div className="space-y-2 border-t border-line/60 p-3">
        <div className="adm-inner-well flex items-center gap-2.5 rounded-2xl p-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-xs font-semibold text-brand-strong">
            {initials || "AD"}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-ink">
              {user.name}
            </p>
            <p className="truncate text-[11px] text-muted">{user.email}</p>
          </div>
          <span
            title="Zero-knowledge encrypted accounts"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-soft/70 text-brand-strong"
          >
            <Lock className="h-3.5 w-3.5" aria-hidden />
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <Link
            href="/chat"
            className="press-soft flex h-9 items-center justify-center rounded-xl border border-line/80 bg-surface/65 px-2 text-xs font-medium text-ink hover:bg-surface"
          >
            Patient app
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="press-soft flex h-9 items-center justify-center gap-1.5 rounded-xl border border-line/80 bg-surface/65 px-2 text-xs font-medium text-ink hover:border-alert/35 hover:text-alert"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );

  const ctxValue = useMemo<AdminShellContextValue>(
    () => ({
      basePath,
      user,
      pendingCount,
      refreshPendingCount,
      openCommandPalette: () => setPaletteOpen(true),
    }),
    [basePath, user, pendingCount, refreshPendingCount],
  );

  return (
    <AdminToastProvider>
      <AdminShellCtx.Provider value={ctxValue}>
        <div className="relative isolate flex h-dvh overflow-hidden bg-paper">
          {/* Ambient color fields behind the translucent workspace */}
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
          >
            <div className="adm-orb adm-orb-a" />
            <div className="adm-orb adm-orb-b" />
            <div className="adm-orb adm-orb-c" />
          </div>

          {/* Collapsible desktop frosted rail */}
          <aside
            className={cn(
              "hidden shrink-0 overflow-hidden transition-[width] duration-300 ease-[var(--ease-out)] motion-reduce:transition-none lg:block",
              collapsed ? "w-0" : "w-72",
            )}
            aria-label="Admin sidebar"
            inert={collapsed || undefined}
          >
            {railContent(
              <button
                type="button"
                onClick={toggleRail}
                className="press flex h-9 w-9 items-center justify-center rounded-xl text-muted hover:bg-surface/70 hover:text-ink"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="h-5 w-5" aria-hidden />
              </button>,
            )}
          </aside>

          {/* Mobile swipe-to-dismiss drawer */}
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
                aria-label="Admin sidebar"
              >
                {railContent(
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    className="press flex h-9 w-9 items-center justify-center rounded-xl text-muted hover:bg-surface/70 hover:text-ink"
                    aria-label="Close sidebar"
                  >
                    <X className="h-5 w-5" aria-hidden />
                  </button>,
                )}
              </aside>
            </div>
          )}

          {/* Main scrollable glass stage */}
          <div className="relative flex min-w-0 flex-1 flex-col">
            <header className="adm-glass-topbar sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-line/60 px-4 sm:px-6">
              <div className="flex min-w-0 items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setMobileOpen(true)}
                  className="press flex h-9 w-9 items-center justify-center rounded-xl text-ink hover:bg-surface/70 lg:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" aria-hidden />
                </button>
                {collapsed && (
                  <button
                    type="button"
                    onClick={toggleRail}
                    className="press hidden h-9 w-9 items-center justify-center rounded-xl text-ink hover:bg-surface/70 lg:flex"
                    aria-label="Expand sidebar"
                  >
                    <PanelLeftOpen className="h-5 w-5" aria-hidden />
                  </button>
                )}
                <nav
                  aria-label="Breadcrumb"
                  className="flex min-w-0 items-center gap-1.5 text-sm"
                >
                  <Link
                    href={basePath}
                    className="hidden font-medium text-muted transition-colors hover:text-ink sm:inline"
                  >
                    Console
                  </Link>
                  <ChevronRight
                    className="hidden h-4 w-4 text-muted/70 sm:inline"
                    aria-hidden
                  />
                  <span className="truncate font-display font-semibold text-ink">
                    {currentNav.label}
                  </span>
                </nav>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPaletteOpen(true)}
                  className="press-soft hidden h-9 items-center gap-2 rounded-full border border-line/80 bg-surface/75 px-3 text-xs font-medium text-muted hover:border-brand/40 hover:text-ink sm:inline-flex"
                >
                  <Search className="h-3.5 w-3.5" aria-hidden />
                  <span>Search</span>
                  <kbd className="rounded bg-mist px-1.5 py-0.5 text-[10px] font-semibold">
                    ⌘K
                  </kbd>
                </button>
                <Link
                  href={`${basePath}/verifications`}
                  className="press-soft inline-flex h-9 items-center gap-1.5 rounded-full border border-line/80 bg-surface/75 px-3 text-xs font-semibold text-ink hover:border-brand/40"
                >
                  <BadgeCheck className="h-3.5 w-3.5 text-brand" aria-hidden />
                  <span>Queue</span>
                  {pendingCount !== null && (
                    <span
                      className={cn(
                        "tabular rounded-full px-1.5 py-0.5 text-[10px] leading-none",
                        pendingCount > 0
                          ? "bg-caution-soft text-caution"
                          : "bg-brand-soft text-brand-strong",
                      )}
                    >
                      {pendingCount}
                    </span>
                  )}
                </Link>
              </div>
            </header>

            <main
              id="main"
              key={pathname}
              className="animate-rise flex-1 overflow-y-auto px-4 pb-12 pt-6 sm:px-6 lg:px-8"
            >
              <div className="mx-auto w-full max-w-7xl">{children}</div>
            </main>
          </div>

          <CommandPalette
            open={paletteOpen}
            onClose={() => setPaletteOpen(false)}
          />
        </div>
      </AdminShellCtx.Provider>
    </AdminToastProvider>
  );
}
