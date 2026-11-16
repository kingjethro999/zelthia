import { BadgeCheck, Clock, ExternalLink, Globe, MapPinned, PackageCheck, Phone, Stethoscope } from "lucide-react";
import { AudioPlayer } from "@/components/ui/AudioPlayer";
import {
  FACILITY_KIND_LABEL,
  formatNaira,
  stockStatus,
  type DirectoryMatch,
  type WebPlace,
} from "@/lib/inventory-types";
import { cn } from "@/lib/utils";

/** Real listings from the Zelthia directory. Renders nothing when empty. */
export function DirectoryMatches({ matches }: { matches: DirectoryMatch[] }) {
  if (!matches.length) return null;
  return (
    <section className="mt-5">
      <h4 className="mb-2 text-sm font-semibold text-ink">Listed on Zelthia</h4>
      <ul className="grid gap-3 md:grid-cols-2">
        {matches.slice(0, 6).map((m, i) => {
          const status = m.product ? stockStatus(m.product) : null;
          const verified = m.facility.verification?.status === "verified";
          return (
            <li
              key={`${m.facility.id}-${m.product?.id ?? m.service}-${i}`}
              className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface"
            >
              <div className="flex items-start justify-between gap-3 p-4 pb-3">
                <div className="min-w-0">
                  <p className="font-semibold leading-snug text-ink">{m.product?.name ?? m.service}</p>
                  {m.product && (
                    <p className="mt-0.5 text-sm text-muted">
                      {[m.product.strength, m.product.packSize, formatNaira(m.product.priceNgn)].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>
                {m.product ? (
                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                      status === "out" ? "bg-alert-soft text-alert" : status === "low" ? "bg-caution-soft text-caution" : "bg-brand-soft text-brand-strong",
                    )}
                  >
                    <PackageCheck className="h-3.5 w-3.5" aria-hidden />
                    {status === "out" ? "Out of stock" : `${m.product.quantity} in stock`}
                  </span>
                ) : (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-sky-soft px-2 py-0.5 text-xs font-semibold text-sky">
                    <Stethoscope className="h-3.5 w-3.5" aria-hidden />
                    Service
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-2.5 border-t border-line p-4 pt-3 text-sm">
                <p className="flex items-center gap-1.5 font-medium text-ink">
                  <span className="truncate">{m.facility.name}</span>
                  {verified ? (
                    <BadgeCheck className="h-4 w-4 shrink-0 text-brand" aria-label="Verified facility" />
                  ) : null}
                  <span className="shrink-0 rounded-full bg-mist px-2 py-0.5 text-xs font-normal text-muted">
                    {FACILITY_KIND_LABEL[m.facility.kind]}
                  </span>
                </p>
                {verified && <p className="-mt-1.5 text-xs font-medium text-brand">Licence verified</p>}
                <p className="flex items-start gap-1.5 text-muted">
                  <MapPinned className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  <span>
                    {m.facility.address}, {m.facility.city}
                    {m.facility.directions && <span className="mt-0.5 block text-ink">{m.facility.directions}</span>}
                  </span>
                </p>
                {m.facility.directionsAudioUrl && (
                  <AudioPlayer src={m.facility.directionsAudioUrl} label="Listen to directions" />
                )}
                {m.facility.openingHours && (
                  <p className="flex items-center gap-1.5 text-muted">
                    <Clock className="h-4 w-4 shrink-0" aria-hidden />
                    {m.facility.openingHours}
                  </p>
                )}
                <a
                  href={`tel:${m.facility.phone.replace(/\s/g, "")}`}
                  className="mt-auto inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand px-4 font-semibold text-white hover:bg-brand-strong dark:text-[#06231a]"
                >
                  <Phone className="h-4 w-4" aria-hidden />
                  Call {m.facility.phone}
                </a>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

const host = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

/** Pages from the live web search, labelled as unverified. */
export function WebSources({ places }: { places: WebPlace[] }) {
  if (!places.length) return null;
  return (
    <section className="mt-4">
      <h4 className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-ink">
        <Globe className="h-4 w-4 text-muted" aria-hidden />
        From the web
      </h4>
      <p className="mb-2 text-xs text-muted">Found by search, not checked by Zelthia. Call before you go.</p>
      <ul className="flex flex-wrap gap-1.5">
        {places.map((p) => (
          <li key={p.url}>
            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              title={p.title}
              className="inline-flex max-w-72 items-center gap-1.5 rounded-full border border-line bg-surface py-1 pl-2.5 pr-2 text-xs text-ink transition-colors hover:border-brand/50"
            >
              <span className="truncate">
                {p.title.replace(/\s*[|\-–].*$/, "").slice(0, 40)}
                <span className="text-muted"> {host(p.url)}</span>
              </span>
              <ExternalLink className="h-3 w-3 shrink-0 text-muted" aria-hidden />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
