import Link from "next/link";
import { ChevronDown, type LucideIcon } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { SITE_URL, cn } from "@/lib/utils";

export interface InfoSection {
  icon: LucideIcon;
  title: string;
  body: string;
}

export interface InfoFaq {
  question: string;
  answer: string;
}

interface InfoPageProps {
  path: string;
  title: string;
  lead: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
  /** Short factual paragraphs answer engines can quote directly. */
  summary: string[];
  sectionsTitle: string;
  sections: InfoSection[];
  /** Ordered steps, rendered as a numbered list and HowTo structured data. */
  steps?: { title: string; items: { name: string; text: string }[] };
  faqs: InfoFaq[];
  related: { href: string; label: string }[];
}

/** Shared layout for keyword landing pages, with FAQ, HowTo and breadcrumb data. */
export function InfoPage(p: InfoPageProps) {
  const url = `${SITE_URL}${p.path}`;
  const jsonLd: object[] = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: p.title,
      description: p.lead,
      url,
      isPartOf: { "@type": "WebSite", name: "Zelthia", url: SITE_URL },
      about: { "@type": "Organization", name: "Zelthia", url: SITE_URL },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Zelthia", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: p.title, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: p.faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    },
  ];
  if (p.steps) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: p.steps.title,
      step: p.steps.items.map((s, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: s.name,
        text: s.text,
      })),
    });
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article>
        <header className="mx-auto max-w-6xl px-4 pb-12 pt-12 sm:px-6 lg:pb-16 lg:pt-20">
          <h1 className="max-w-3xl font-display text-4xl font-semibold leading-[1.08] text-ink sm:text-5xl">
            {p.title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">{p.lead}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={p.primary.href} size="lg">
              {p.primary.label}
            </ButtonLink>
            {p.secondary && (
              <ButtonLink href={p.secondary.href} size="lg" variant="secondary">
                {p.secondary.label}
              </ButtonLink>
            )}
          </div>
        </header>

        <section className="border-y border-line bg-surface">
          <div className="mx-auto max-w-6xl space-y-4 px-4 py-12 sm:px-6 lg:py-16">
            {p.summary.map((para) => (
              <p key={para.slice(0, 32)} className="max-w-3xl text-lg leading-relaxed text-ink">
                {para}
              </p>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
          <h2 className="max-w-2xl font-display text-3xl font-semibold text-ink sm:text-4xl">{p.sectionsTitle}</h2>
          <ul
            className={cn(
              "mt-10 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2",
              // Pick columns that divide evenly so no empty cell shows.
              p.sections.length % 4 === 0 ? "lg:grid-cols-4" : "lg:grid-cols-3",
            )}
          >
            {p.sections.map(({ icon: Icon, title, body }) => (
              <li key={title} className="bg-surface p-6">
                <Icon className="h-5 w-5 text-brand" aria-hidden />
                <h3 className="mt-4 text-base font-semibold text-ink">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
              </li>
            ))}
          </ul>
        </section>

        {p.steps && (
          <section className="border-t border-line bg-surface">
            <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
              <h2 className="max-w-2xl font-display text-3xl font-semibold text-ink sm:text-4xl">{p.steps.title}</h2>
              <ol className="mt-10 grid gap-8 md:grid-cols-3">
                {p.steps.items.map((s, i) => (
                  <li key={s.name}>
                    <span className="font-display text-sm font-semibold text-brand">Step {i + 1}</span>
                    <h3 className="mt-2 font-display text-xl font-semibold text-ink">{s.name}</h3>
                    <p className="mt-2 leading-relaxed text-muted">{s.text}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}

        <section className="border-t border-line">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:py-20">
            <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">Common questions</h2>
            <div className="divide-y divide-line border-y border-line">
              {p.faqs.map((f) => (
                <details key={f.question} className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left font-semibold text-ink [&::-webkit-details-marker]:hidden">
                    {f.question}
                    <ChevronDown className="h-5 w-5 shrink-0 text-muted transition-transform group-open:rotate-180" aria-hidden />
                  </summary>
                  <p className="pb-5 pr-8 leading-relaxed text-muted">{f.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <nav aria-label="Related pages" className="border-t border-line bg-surface">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-8 text-sm sm:px-6">
            <span className="text-muted">More about Zelthia</span>
            {p.related.map((r) => (
              <Link key={r.href} href={r.href} className="font-medium text-brand underline-offset-4 hover:underline">
                {r.label}
              </Link>
            ))}
          </div>
        </nav>
      </article>
    </>
  );
}
