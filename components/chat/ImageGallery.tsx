"use client";

import { useState } from "react";
import { ExternalLink, Images } from "lucide-react";
import type { WebImage } from "@/lib/inventory-types";

const host = (u: string) => {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
};

/**
 * Photos found on the web, shown as tiles. Each opens the page it came
 * from; Zelthia doesn't host or vouch for them.
 */
export function ImageGallery({ images }: { images: WebImage[] }) {
  const [broken, setBroken] = useState<Set<string>>(new Set());
  const shown = images.filter((i) => !broken.has(i.imageUrl)).slice(0, 8);
  if (!shown.length) return null;

  return (
    <section className="mt-5">
      <h4 className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-ink">
        <Images className="h-4 w-4 text-muted" aria-hidden />
        Photos from the web
      </h4>
      <p className="mb-2 text-xs text-muted">Tap a photo to open the page it came from.</p>
      <ul className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-2 sm:grid sm:grid-cols-4 sm:overflow-visible">
        {shown.map((img) => (
          <li key={img.imageUrl} className="w-40 shrink-0 snap-start sm:w-auto">
            <a
              href={img.sourceUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              title={img.title || host(img.sourceUrl)}
              className="group block overflow-hidden rounded-2xl border border-line bg-surface transition-colors hover:border-brand/50"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-mist">
                {/* eslint-disable-next-line @next/next/no-img-element -- third-party images from arbitrary hosts */}
                <img
                  src={img.imageUrl}
                  alt={img.title || "Photo from the web"}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={() => setBroken((b) => new Set(b).add(img.imageUrl))}
                  className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.04]"
                />
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-2">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-medium text-ink">{img.title || host(img.sourceUrl)}</span>
                  <span className="block truncate text-[11px] text-muted">{host(img.sourceUrl)}</span>
                </span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted group-hover:text-brand" aria-hidden />
              </div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
