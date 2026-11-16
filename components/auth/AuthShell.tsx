import Image from "next/image";
import { MapPinned, Pill, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const POINTS = [
  { icon: ShieldCheck, text: "Answers checked against your allergies and medicines" },
  { icon: Pill, text: "See which nearby pharmacy has your medicine in stock" },
  { icon: MapPinned, text: "Directions by landmarks people actually use" },
];

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid flex-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="relative hidden overflow-hidden bg-[#0d3b35] text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Image
          src="/icons/icon-512.png"
          alt=""
          width={520}
          height={520}
          className="pointer-events-none absolute -bottom-24 -right-24 opacity-15"
        />
        <div className="relative max-w-sm">
          <h2 className="font-display text-3xl font-semibold leading-tight">
            Care that knows your history and your neighbourhood.
          </h2>
          <ul className="mt-8 space-y-4">
            {POINTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-[15px] text-white/85">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#7fe0b6]" aria-hidden />
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-white/60">
          Zelthia gives guidance, not a diagnosis. In an emergency, call 112.
        </p>
      </aside>

      <section className="flex flex-col items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <Logo className="mb-8 lg:hidden" />
          <h1 className="font-display text-3xl font-semibold text-ink">{title}</h1>
          <p className="mb-8 mt-2 text-muted">{subtitle}</p>
          {children}
        </div>
      </section>
    </div>
  );
}
