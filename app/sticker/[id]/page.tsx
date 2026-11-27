import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { BadgeCheck } from "lucide-react";
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

export default function StickerPage(props: Props) {
  return (
    <main
      id="main"
      className="flex flex-1 flex-col items-center px-4 py-10 print:p-0"
    >
      <Suspense
        fallback={
          <div className="h-[520px] w-full max-w-sm animate-pulse motion-reduce:animate-none rounded-[28px] bg-mist" />
        }
      >
        <Sticker {...props} />
      </Suspense>
    </main>
  );
}

async function Sticker({ params }: Props) {
  const { id } = await params;
  const data = await getPublicFacility(id);
  if (!data) notFound();
  const f = data.facility;
  const url = `${SITE_URL}/facility/${f.id}`;
  // Plain black on white with a wide quiet zone so cheap phone cameras read it.
  const svg = await QRCode.toString(url, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 2,
    color: { dark: "#0b1f17", light: "#ffffff" },
  });

  return (
    <>
      <div className="mb-6 max-w-sm text-center text-sm text-muted print:hidden">
        Print on a sticker sheet or plain paper and place it at your counter.
        {!f.verified &&
          " The verified badge appears once a Zelthia administrator approves your licence."}
      </div>

      <section
        aria-label={`QR sticker for ${f.name}`}
        className="w-full max-w-sm rounded-[28px] border-2 border-[#0b1f17] bg-white p-7 text-center text-[#0b1f17] [print-color-adjust:exact] print:max-w-none print:break-inside-avoid"
      >
        <div className="flex items-center justify-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/icon-96.png" alt="" width={28} height={28} />
          <span className="font-display text-xl font-semibold tracking-tight">
            Zelthia
          </span>
        </div>

        {f.verified ? (
          <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#0b1f17] px-4 py-1.5 text-sm font-semibold text-white">
            <BadgeCheck className="h-4 w-4" aria-hidden />
            Verified on Zelthia
          </p>
        ) : (
          <p className="mt-4 text-sm font-semibold">Find us on Zelthia</p>
        )}

        <div
          className="mx-auto mt-5 w-56 [&_svg]:h-auto [&_svg]:w-full"
          role="img"
          aria-label={`QR code linking to ${url}`}
          dangerouslySetInnerHTML={{ __html: svg }}
        />

        <p className="mt-4 text-lg font-semibold leading-snug">{f.name}</p>
        <p className="text-xs">
          {FACILITY_KIND_LABEL[f.kind]}
          {f.city && ` · ${f.city}`}
        </p>
        <p className="mt-4 text-sm">
          Scan to see what we have in stock, prices and directions.
        </p>
        <p className="mt-2 break-all text-[10px] opacity-70">{url}</p>
      </section>

      <div className="mt-6">
        <PrintButton />
      </div>
    </>
  );
}
