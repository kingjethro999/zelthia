import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import {
  FACILITY_KIND_LABEL,
  formatNaira,
  stockStatus,
  type FacilityKind,
} from "@/lib/inventory-types";
import { getPublicFacility } from "@/lib/server/public-facility";
import { SITE_URL, cn } from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };

const SCHEMA_TYPE: Record<FacilityKind, string> = {
  pharmacy: "Pharmacy",
  clinic: "MedicalClinic",
  hospital: "Hospital",
  diagnostic: "DiagnosticLab",
  store: "HealthAndBeautyBusiness",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await getPublicFacility(id);
  if (!data) return { title: "Facility not found", robots: { index: false } };
  const f = data.facility;
  const place = [f.city, f.state].filter(Boolean).join(", ");
  const title = `${f.name}, ${FACILITY_KIND_LABEL[f.kind]} in ${place}`;
  const inStock = data.products.filter((p) => p.quantity > 0).length;
  const description = `${f.name} on Zelthia: ${inStock} product${inStock === 1 ? "" : "s"} in stock${f.services.length ? `, services including ${f.services.slice(0, 3).join(", ")}` : ""}. ${f.address}, ${place}.`;
  return {
    title,
    description,
    alternates: { canonical: `/facility/${f.id}` },
    // Only facilities an administrator verified are offered to search engines.
    robots: f.verified ? undefined : { index: false, follow: true },
    openGraph: {
      title: `${title} | Zelthia`,
      description,
      url: `/facility/${f.id}`,
    },
  };
}

export default function FacilityPage(props: Props) {
  return (
    <Suspense fallback={<FacilitySkeleton />}>
      <FacilityProfile {...props} />
    </Suspense>
  );
}

function FacilitySkeleton() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6" aria-busy>
      <div className="h-9 w-2/3 animate-pulse motion-reduce:animate-none rounded-xl bg-mist" />
      <div className="mt-4 h-5 w-1/2 animate-pulse motion-reduce:animate-none rounded-lg bg-mist" />
      <div className="mt-10 h-64 animate-pulse motion-reduce:animate-none rounded-3xl bg-mist" />
    </div>
  );
}

async function FacilityProfile({ params }: Props) {
  const { id } = await params;
  const data = await getPublicFacility(id);
  if (!data) notFound();
  const { facility: f, products } = data;
  const url = `${SITE_URL}/facility/${f.id}`;
  const inStock = products.filter((p) => p.quantity > 0);
  const outOfStock = products.filter((p) => p.quantity <= 0);
  const tel = f.phone.replace(/[^\d+]/g, "");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": SCHEMA_TYPE[f.kind],
    name: f.name,
    url,
    telephone: f.phone || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: f.address,
      addressLocality: f.city,
      addressRegion: f.state,
      addressCountry: "NG",
    },
    openingHours: f.openingHours || undefined,
    availableService: f.services.map((s) => ({
      "@type": "MedicalProcedure",
      name: s,
    })),
    makesOffer: inStock.slice(0, 50).map((p) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Product", name: p.name },
      ...(p.priceNgn != null
        ? { price: p.priceNgn, priceCurrency: "NGN" }
        : {}),
      availability: "https://schema.org/InStock",
    })),
  };

  return (
    <article className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <header>
        <p className="text-sm font-medium text-muted">
          {FACILITY_KIND_LABEL[f.kind]}
        </p>
        <h1 className="title mt-1 font-display text-3xl font-semibold text-ink sm:text-4xl">
          {f.name}
        </h1>
        {f.verified ? (
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-sm font-semibold text-brand-strong">
            <BadgeCheck className="h-4 w-4" aria-hidden />
            Verified on Zelthia
          </p>
        ) : (
          <p className="mt-3 text-sm text-muted">
            Licence not yet verified by Zelthia.
          </p>
        )}

        <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
          <div className="flex gap-2.5">
            <MapPin
              className="mt-0.5 h-4 w-4 shrink-0 text-muted"
              aria-hidden
            />
            <div>
              <dt className="sr-only">Address</dt>
              <dd className="text-ink">
                {f.address}
                {f.city && `, ${f.city}`}
                {f.state && `, ${f.state}`}
              </dd>
              {f.directions && (
                <dd className="mt-1 text-muted">{f.directions}</dd>
              )}
            </div>
          </div>
          {f.openingHours && (
            <div className="flex gap-2.5">
              <Clock
                className="mt-0.5 h-4 w-4 shrink-0 text-muted"
                aria-hidden
              />
              <div>
                <dt className="sr-only">Opening hours</dt>
                <dd className="text-ink">{f.openingHours}</dd>
              </div>
            </div>
          )}
        </dl>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          {tel && (
            <ButtonLink href={`tel:${tel}`}>
              <Phone className="h-4 w-4" aria-hidden />
              Call {f.phone}
            </ButtonLink>
          )}
          <ButtonLink href="/inventory" variant="secondary">
            Search other facilities
          </ButtonLink>
        </div>
      </header>

      {f.services.length > 0 && (
        <section className="mt-12" aria-labelledby="services-h">
          <h2
            id="services-h"
            className="flex items-center gap-2 text-lg font-semibold text-ink"
          >
            <Stethoscope className="h-5 w-5 text-brand" aria-hidden />
            Services
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {f.services.map((s) => (
              <li
                key={s}
                className="rounded-full border border-line bg-surface px-3 py-1 text-sm text-ink"
              >
                {s}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-12" aria-labelledby="stock-h">
        <h2 id="stock-h" className="text-lg font-semibold text-ink">
          In stock ({inStock.length})
        </h2>
        <p className="mt-1 text-sm text-muted">
          Quantities and prices are set by the facility. Call before you travel.
        </p>
        {inStock.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-line bg-surface p-5 text-sm text-muted">
            Nothing is listed in stock right now.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
            {inStock.map((p) => {
              const status = stockStatus(p);
              return (
                <li
                  key={p.id}
                  className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-ink">
                      {p.name}
                      {p.strength && (
                        <span className="ml-1.5 font-normal text-muted">
                          {p.strength}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted">
                      {[p.genericName, p.form, p.packSize]
                        .filter(Boolean)
                        .join(" · ")}
                      {p.prescriptionOnly && " · Prescription needed"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    {p.regulatoryStatus === "verified" && (
                      <span
                        className="inline-flex items-center gap-1 text-xs font-medium text-brand-strong"
                        title="Matched a public registry record when the facility last checked it"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                        Registry match
                      </span>
                    )}
                    <span
                      className={cn(
                        "text-xs font-medium",
                        status === "low" ? "text-caution" : "text-muted",
                      )}
                    >
                      {status === "low" ? "Low stock" : "In stock"}
                    </span>
                    {p.priceNgn != null && (
                      <span className="font-semibold tabular-nums text-ink">
                        {formatNaira(p.priceNgn)}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {outOfStock.length > 0 && (
          <p className="mt-3 text-xs text-muted">
            Also listed, currently out of stock:{" "}
            {outOfStock
              .slice(0, 12)
              .map((p) => p.name)
              .join(", ")}
            {outOfStock.length > 12 && ` and ${outOfStock.length - 12} more`}.
          </p>
        )}
      </section>

      <p className="mt-12 border-t border-line pt-6 text-xs leading-relaxed text-muted">
        Zelthia lists what facilities record. It does not sell or dispense
        medicine, and a listing is not medical advice.
      </p>
    </article>
  );
}
