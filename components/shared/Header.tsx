"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  ChevronDown,
  CircleUserRound,
  LogOut,
  Menu,
  MessageCircleHeart,
  Pill,
  Settings2,
  X,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { useSession } from "@/lib/store/session";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/chat", label: "Health chat", icon: MessageCircleHeart },
  { href: "/inventory", label: "Find medicine", icon: Pill },
  { href: "/inventory?mode=provider", label: "For facilities", icon: Building2 },
];

/** Routes that render their own full-height chrome. */
const BARE = ["/chat"];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  if (BARE.includes(pathname)) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active = item.href === pathname;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active ? "text-ink" : "text-muted hover:text-ink",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto hidden items-center gap-2 md:flex">
          <AccountControls />
        </div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="ml-auto flex h-10 w-10 items-center justify-center rounded-lg text-ink hover:bg-mist md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
        </button>
      </div>

      {open && (
        <div id="mobile-nav" className="animate-rise border-t border-line bg-paper px-4 pb-6 pt-3 md:hidden">
          <nav aria-label="Main" className="flex flex-col">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-xl px-2 py-3 text-base font-medium text-ink hover:bg-mist"
              >
                <Icon className="h-5 w-5 text-muted" aria-hidden />
                {label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 border-t border-line pt-4">
            <AccountControls stacked />
          </div>
        </div>
      )}
    </header>
  );
}

export function AccountControls({ stacked = false }: { stacked?: boolean }) {
  const user = useSession((s) => s.user);
  const signOut = useSession((s) => s.signOut);
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
    return (
      <div className="flex flex-col">
        <p className="px-2 pb-2 text-sm text-muted">Signed in as {user.name}</p>
        {!user.onboarded && (
          <Link href="/setup" className="flex items-center gap-3 rounded-xl px-2 py-3 font-medium text-brand hover:bg-mist">
            <Settings2 className="h-5 w-5" aria-hidden />
            Finish account setup
          </Link>
        )}
        <Link href="/account" className="flex items-center gap-3 rounded-xl px-2 py-3 font-medium text-ink hover:bg-mist">
          <CircleUserRound className="h-5 w-5 text-muted" aria-hidden />
          Account and health profile
        </Link>
        <button type="button" onClick={doSignOut} className="flex items-center gap-3 rounded-xl px-2 py-3 text-left font-medium text-ink hover:bg-mist">
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
        className="flex h-10 items-center gap-2 rounded-full border border-line bg-surface pl-1 pr-2.5 hover:border-brand/50"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand-strong">
          {initials || <CircleUserRound className="h-4 w-4" aria-hidden />}
        </span>
        <span className="max-w-32 truncate text-sm font-medium text-ink">{user.name.split(" ")[0]}</span>
        <ChevronDown className="h-4 w-4 text-muted" aria-hidden />
      </button>
      {menu && (
        <div role="menu" className="animate-pop absolute right-0 mt-2 w-64 rounded-2xl border border-line bg-surface p-1.5 shadow-lg shadow-black/5">
          <div className="px-3 py-2">
            <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>
          <div className="my-1 h-px bg-line" />
          {!user.onboarded && (
            <Link role="menuitem" href="/setup" onClick={() => setMenu(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-brand hover:bg-mist">
              <Settings2 className="h-4 w-4" aria-hidden />
              Finish account setup
            </Link>
          )}
          <Link role="menuitem" href="/account" onClick={() => setMenu(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink hover:bg-mist">
            <CircleUserRound className="h-4 w-4 text-muted" aria-hidden />
            Account and health profile
          </Link>
          <button role="menuitem" type="button" onClick={doSignOut} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-ink hover:bg-mist">
            <LogOut className="h-4 w-4 text-muted" aria-hidden />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
