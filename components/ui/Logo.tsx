import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  size = 32,
  withWordmark = true,
}: {
  className?: string;
  size?: number;
  withWordmark?: boolean;
}) {
  return (
    <Link
      href="/"
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
