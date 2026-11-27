import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { BadgeCheck, Camera, MapPin, ScanLine } from "lucide-react";
import QRCode from "qrcode";
import { FACILITY_KIND_LABEL } from "@/lib/inventory-types";
import { getPublicFacility } from "@/lib/server/public-facility";
import { SITE_URL } from "@/lib/utils";
import { PrintButton } from "./PrintButton";

export const metadata: Metadata = {
  title: "Facility QR sticker",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ id: string }> };

// Fixed print colours: the sticker must look the same in light or dark mode.
const GREEN = "#0d7f57";
const DEEP = "#0a3d2c";
const INK = "#0e2a2b";

export default function StickerPage(props: Props) {
  return (
    <main
      id="main"
      className="flex flex-1 flex-col items-center px-4 py-10 print:block print:p-0"
    >
      {/* One A6 card per page, no browser margins. */}
      <style>{`@page { size: 105mm 148mm; margin: 0; }`}</style>
      <Suspense
        fallback={
          <div className="aspect-[105/148] w-full max-w-[360px] animate-pulse rounded-[28px] bg-mist motion-reduce:animate-none" />
        }
      >
        <Sticker {...props} />
      </Suspense>
    </main>
  );
}

function Step({
  n,
  icon: Icon,
  text,
}: {
  n: number;
  icon: typeof Camera;
  text: string;
}) {
  return (
    <li className="flex flex-1 flex-col items-center gap-1 text-center">
      <span
        className="flex h-8 w-8 items-center justify-center rounded-full text-white"
        style={{ background: GREEN }}
      >
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <span className="text-[10px] font-semibold leading-tight">
        {n}. {text}
      </span>
    </li>
  );
}

async function Sticker({ params }: Props) {
  const { id } = await params;
  const data = await getPublicFacility(id);
  if (!data) notFound();
  const f = data.facility;
  const url = `${SITE_URL}/facility/${f.id}`;
  // High error correction so the logo in the middle never stops it scanning.
  const svg = await QRCode.toString(url, {
    type: "svg",
    errorCorrectionLevel: "H",
    margin: 0,
    color: { dark: INK, light: "#ffffff" },
  });
  const place = [f.city, f.state].filter(Boolean).join(", ");

  return (
    <>
      <p className="mb-6 max-w-sm text-center text-sm leading-relaxed text-muted print:hidden">
        Prints at A6 (105 × 148 mm), the size of a postcard. Use sticker paper
        or print on card and laminate it, then put it where customers wait.
        {!f.verified &&
          " The verified badge is added once a Zelthia reviewer approves your licence."}
      </p>

      <section
        aria-label={`QR sticker for ${f.name}`}
        className="flex aspect-[105/148] w-full max-w-[360px] flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_18px_50px_-20px_rgba(10,61,44,0.45)] [print-color-adjust:exact] [-webkit-print-color-adjust:exact] print:h-[148mm] print:w-[105mm] print:max-w-none print:rounded-none print:shadow-none"
        style={{ color: INK }}
      >
        {/* Brand band */}
        <header
          className="flex items-center justify-between px-5 py-3.5 text-white"
          style={{ background: GREEN }}
        >
          <span className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icons/icon-96.png"
              alt=""
              width={26}
              height={26}
              className="rounded-md bg-white p-0.5"
            />
            <span className="font-display text-lg font-semibold tracking-tight">
              Zelthia
            </span>
          </span>
          {f.verified ? (
            <span
              className="flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold"
              style={{ color: GREEN }}
            >
              <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
              Verified
            </span>
          ) : (
            <span className="text-[11px] font-medium opacity-90">
              Health stock, near you
            </span>
          )}
        </header>

        <div className="flex flex-1 flex-col items-center px-5 pt-4 text-center">
          <p className="font-display text-[22px] font-bold leading-[1.1] tracking-[-0.02em]">
            Scan to see what
            <br />
            we have in stock
          </p>

          {/* QR tile with the logo knocked out of the centre */}
          <div
            className="relative mt-4 rounded-2xl border-[3px] bg-white p-3"
            style={{ borderColor: GREEN }}
          >
            <div
              className="h-40 w-40 [&_svg]:h-full [&_svg]:w-full"
              role="img"
              aria-label={`QR code linking to ${url}`}
              dangerouslySetInnerHTML={{ __html: svg }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icons/icon-96.png"
              alt=""
              width={34}
              height={34}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-1"
            />
          </div>

          <ol className="mt-4 flex w-full gap-2">
            <Step n={1} icon={Camera} text="Open your camera" />
            <Step n={2} icon={ScanLine} text="Point at the code" />
            <Step n={3} icon={MapPin} text="See stock, prices, directions" />
          </ol>
        </div>

        {/* Facility strip */}
        <footer
          className="mt-3 px-5 py-3 text-white"
          style={{ background: DEEP }}
        >
          <p className="truncate text-[15px] font-semibold leading-tight">
            {f.name}
          </p>
          <p className="truncate text-[10px] opacity-80">
            {FACILITY_KIND_LABEL[f.kind]}
            {place && ` · ${place}`}
          </p>
        </footer>
      </section>

      <p className="mt-4 max-w-sm break-all text-center text-xs text-muted print:hidden">
        The code opens {url}
      </p>
      <div className="mt-5">
        <PrintButton />
      </div>
    </>
  );
}
