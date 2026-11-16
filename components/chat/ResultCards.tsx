import { Clock, ExternalLink, Globe, MapPinned, PackageCheck, Phone, Stethoscope } from "lucide-react";
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
    <section className="mt-4">
      <h4 className="mb-2 text-sm font-semibold text-ink">Listed on Zelthia</h4>
      <ul className="grid gap-2 sm:grid-cols-2">
        {matches.slice(0, 6).map((m, i) => {
          const status = m.product ? stockStatus(m.product) : null;
          return (
            <li key={`${m.facility.id}-${m.product?.id ?? m.service}-${i}`} className="rounded-2xl border border-line bg-surface p-3.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">{m.product?.name ?? m.service}</p>
                  <p className="truncate text-sm text-muted">
                    {m.facility.name}, {FACILITY_KIND_LABEL[m.facility.kind]}
                  </p>
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
              {m.product && <p className="mt-1.5 text-sm text-ink">{formatNaira(m.product.priceNgn)}</p>}
              <div className="mt-2 space-y-1 text-sm text-muted">
                <p className="flex items-start gap-1.5">
                  <MapPinned className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                  {m.facility.directions || `${m.facility.address}, ${m.facility.city}`}
                </p>
                {m.facility.openingHours && (
                  <p className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    {m.facility.openingHours}
                  </p>
                )}
                <a href={`tel:${m.facility.phone.replace(/\s/g, "")}`} className="flex items-center gap-1.5 font-medium text-brand hover:underline">
                  <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  {m.facility.phone}
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
