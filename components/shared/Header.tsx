"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Boxes,
  Building2,
  ChevronDown,
  CircleUserRound,
  LogOut,
  MessageCircleHeart,
  Settings2,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { useHomeHref, useSession } from "@/lib/store/session";
import { cn } from "@/lib/utils";

const AUDIENCES = [
  { href: "/?landing=1", label: "For people", icon: UserRound },
  { href: "/for-facilities", label: "For facilities", icon: Building2 },
] as const;

/**
 * Switch between the two audiences, like a ride-hailing site's rider/driver
 * toggle. The thumb slides between the two halves instead of jumping.
 */
export function AudienceSwitch({ className }: { className?: string }) {
  const pathname = usePathname();
  const facilities = pathname === "/for-facilities";
  return (
    <nav
      aria-label="Audience"
      className={cn(
        "relative grid grid-cols-2 rounded-full bg-mist p-1 text-sm font-medium",
        className,
      )}
    >
      <span
        aria-hidden
        className="absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-surface shadow-[0_1px_2px_rgb(6_25_26/0.12),0_4px_12px_-4px_rgb(6_25_26/0.16)] transition-transform duration-[340ms] ease-[var(--ease-out)] motion-reduce:transition-none"
        style={{ transform: facilities ? "translateX(100%)" : "translateX(0)" }}
      />
      {AUDIENCES.map(({ href, label, icon: Icon }) => {
        const active = (href === "/for-facilities") === facilities;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "press press-soft relative z-10 flex items-center justify-center gap-2 rounded-full px-4 py-2 transition-colors",
              active ? "text-ink" : "text-muted hover:text-ink",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Header() {
  return (
    <header className="material-bar sticky top-0 z-40 border-b border-line/60">
      <div className="mx-auto grid h-16 max-w-6xl grid-cols-[1fr_auto] items-center gap-4 px-4 sm:px-6 md:grid-cols-[1fr_auto_1fr]">
        <Logo />
        <AudienceSwitch className="hidden w-80 md:grid" />
        <div className="flex items-center justify-end gap-2">
          <AccountControls />
        </div>
      </div>
      <div className="border-t border-line/60 px-4 py-2 md:hidden">
        <AudienceSwitch className="mx-auto w-full max-w-sm" />
      </div>
    </header>
  );
}

export function AccountControls({ stacked = false }: { stacked?: boolean }) {
  const user = useSession((s) => s.user);
  const adminPath = useSession((s) => s.adminPath);
  const homeHref = useHomeHref();
  const signOut = useSession((s) => s.signOut);
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const workspaceItem = user?.isAdmin && adminPath
    ? { href: adminPath, label: "Admin Console", icon: ShieldCheck }
    : user?.role === "provider"
      ? { href: homeHref, label: "Facility workspace", icon: Boxes }
      : { href: "/chat", label: "Open health chat", icon: MessageCircleHeart };

  useEffect(() => {
    if (!menu) return;
    const close = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setMenu(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [menu]);

  const doSignOut = async () => {
    setMenu(false);
    await signOut();
    router.push("/");
  };

  if (!user) {
    return (
      <div className={cn("flex gap-2", stacked && "flex-col")}>
        <ButtonLink href="/signin" variant="ghost" size={stacked ? "lg" : "sm"}>
          Sign in
        </ButtonLink>
        <ButtonLink href="/signup" size={stacked ? "lg" : "sm"}>
          Create account
        </ButtonLink>
      </div>
    );
  }

  const initials = user.name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  if (stacked) {
    const WorkspaceIcon = workspaceItem.icon;
    return (
      <div className="flex flex-col">
        <p className="px-2 pb-2 text-sm text-muted">Signed in as {user.name}</p>
        <Link
          href={workspaceItem.href}
          className="flex items-center gap-3 rounded-xl px-2 py-3 font-medium text-brand hover:bg-mist"
        >
          <WorkspaceIcon className="h-5 w-5" aria-hidden />
          {workspaceItem.label}
        </Link>
        {!user.onboarded && user.role !== "provider" && !user.isAdmin && (
          <Link
            href="/setup"
            className="flex items-center gap-3 rounded-xl px-2 py-3 font-medium text-brand hover:bg-mist"
          >
            <Settings2 className="h-5 w-5" aria-hidden />
            Finish account setup
          </Link>
        )}
        <Link
          href="/account"
          className="flex items-center gap-3 rounded-xl px-2 py-3 font-medium text-ink hover:bg-mist"
        >
          <CircleUserRound className="h-5 w-5 text-muted" aria-hidden />
          Account and health profile
        </Link>
        <button
          type="button"
          onClick={doSignOut}
          className="flex items-center gap-3 rounded-xl px-2 py-3 text-left font-medium text-ink hover:bg-mist"
        >
          <LogOut className="h-5 w-5 text-muted" aria-hidden />
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setMenu((m) => !m)}
        aria-haspopup="menu"
        aria-expanded={menu}
        className="press press-soft flex h-10 items-center gap-2 rounded-full border border-line bg-surface pl-1 pr-2.5 hover:border-brand/50"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand-strong">
          {initials || <CircleUserRound className="h-4 w-4" aria-hidden />}
        </span>
        <span className="max-w-32 truncate text-sm font-medium text-ink">
          {user.name.split(" ")[0]}
        </span>
        <ChevronDown className="h-4 w-4 text-muted" aria-hidden />
      </button>
      {menu && (
        <div
          role="menu"
          className="animate-pop material-popover absolute right-0 mt-2 w-64 origin-top-right rounded-2xl border border-line p-1.5"
        >
          <div className="px-3 py-2">
            <p className="truncate text-sm font-semibold text-ink">
              {user.name}
            </p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>
          <div className="my-1 h-px bg-line" />
          <Link
            role="menuitem"
            href={workspaceItem.href}
            onClick={() => setMenu(false)}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-brand hover:bg-mist"
          >
            <workspaceItem.icon className="h-4 w-4" aria-hidden />
            {workspaceItem.label}
          </Link>
          {!user.onboarded && user.role !== "provider" && !user.isAdmin && (
            <Link
              role="menuitem"
              href="/setup"
              onClick={() => setMenu(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-brand hover:bg-mist"
            >
              <Settings2 className="h-4 w-4" aria-hidden />
              Finish account setup
            </Link>
          )}
          <Link
            role="menuitem"
            href="/account"
            onClick={() => setMenu(false)}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink hover:bg-mist"
          >
            <CircleUserRound className="h-4 w-4 text-muted" aria-hidden />
            Account and health profile
          </Link>
          <button
            role="menuitem"
            type="button"
            onClick={doSignOut}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-ink hover:bg-mist"
          >
            <LogOut className="h-4 w-4 text-muted" aria-hidden />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
