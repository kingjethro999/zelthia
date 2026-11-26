"use client";

import Image from "next/image";
import Link from "next/link";
import { useHomeHref } from "@/lib/store/session";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  href,
  size = 32,
  withWordmark = true,
}: {
  className?: string;
  href?: string;
  size?: number;
  withWordmark?: boolean;
}) {
  const homeHref = useHomeHref();
  return (
    <Link
      href={href ?? homeHref}
      className={cn("inline-flex items-center gap-2 rounded-lg", className)}
      aria-label="Zelthia home"
    >
      <Image
        src="/icons/icon-96.png"
        unoptimized
        alt=""
        width={size}
        height={size}
        priority
        className="shrink-0"
      />
      {withWordmark && (
        <span className="font-display text-xl font-semibold tracking-tight text-ink">
          Zelthia
        </span>
      )}
    </Link>
  );
}
