import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CircleCheck, LoaderCircle, ScanText } from "lucide-react";

/** Static illustration of Zelthia reading a referral card; no client JS. */
function ReadingDemo() {
  return (
    <figure aria-label="Zelthia reading a doctor's referral card" className="relative w-full max-w-md">
      <div className="-rotate-2 rounded-2xl bg-[#fbf7ea] p-5 text-[#1a2a6c] shadow-2xl">
        <p className="font-[cursive] text-lg italic leading-relaxed">
          c/o low back pain x 3/12
          <br />
          X-ray LS spine: ? L4/L5
          <br />
          Plan: MRI, <span className="rounded bg-[#ffe9a8] px-1">2D ECHO</span>
        </p>
      </div>
      <div className="relative -mt-3 ml-8 rounded-2xl border border-white/10 bg-[#0b2a26] p-4 text-sm shadow-2xl">
        <p className="flex items-center gap-2 text-white/90">
          <CircleCheck className="h-4 w-4 text-[#7fe0b6]" aria-hidden />
          Read referral card: echo scan of the heart requested
        </p>
        <p className="mt-2 flex items-center gap-2 text-white/90">
          <CircleCheck className="h-4 w-4 text-[#7fe0b6]" aria-hidden />
          Checked Zelthia listings in Abuja
        </p>
        <p className="mt-2 flex items-center gap-2 text-white">
          <LoaderCircle className="h-4 w-4 animate-spin text-[#7fe0b6]" aria-hidden />
          Finding scan centres nearby
        </p>
      </div>
    </figure>
  );
}

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
    <div className="grid h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <aside className="relative hidden overflow-hidden bg-[#0d3b35] p-10 text-white lg:flex lg:flex-col xl:p-14">
        <Link href="/" className="flex items-center gap-2" aria-label="Zelthia home">
          <Image src="/icons/icon-96.png" alt="" width={30} height={30} unoptimized />
          <span className="font-display text-xl font-semibold">Zelthia</span>
        </Link>
        <div className="flex flex-1 flex-col justify-center gap-10">
          <div className="max-w-md">
            <ScanText className="h-7 w-7 text-[#7fe0b6]" aria-hidden />
            <h2 className="mt-4 font-display text-3xl font-semibold leading-tight xl:text-4xl">
              Can&apos;t read what the doctor wrote? Zelthia can.
            </h2>
            <p className="mt-3 text-white/75">
              Photograph a note, prescription or result. Zelthia explains it, checks it against
              your allergies, and finds where to get the test or medicine.
            </p>
          </div>
          <ReadingDemo />
        </div>
        <p className="text-sm text-white/55">Guidance, not a diagnosis. In an emergency, call 112.</p>
      </aside>

      <section className="flex min-h-0 flex-col overflow-y-auto">
        <div className="flex items-center justify-between px-4 pt-3 sm:px-8 sm:pt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-muted hover:bg-mist hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Home
          </Link>
          <Link href="/" className="flex items-center gap-2 lg:hidden" aria-label="Zelthia home">
            <Image src="/icons/icon-96.png" alt="" width={26} height={26} unoptimized />
            <span className="font-display text-lg font-semibold text-ink">Zelthia</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-4 py-3 sm:px-8 sm:py-6">
          <div className="w-full max-w-sm">
            <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">{title}</h1>
            <p className="mb-4 mt-1 text-sm text-muted sm:mb-6 sm:text-base">{subtitle}</p>
            {children}
          </div>
        </div>
      </section>
    </div>
  );
}
