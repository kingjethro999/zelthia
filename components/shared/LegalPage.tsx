export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  const contact = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  return (
    <article className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 lg:py-16">
      <h1 className="font-display text-4xl font-semibold text-ink">{title}</h1>
      <p className="mt-2 text-sm text-muted">Last updated {updated}</p>
      <div className="mt-10 space-y-8 leading-relaxed text-ink [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_li]:mt-1.5 [&_p]:mt-3 [&_p]:text-muted [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:text-muted">
        {children}
        {contact && (
          <section>
            <h2>Contact</h2>
            <p>
              Questions about this page:{" "}
              <a
                href={`mailto:${contact}`}
                className="font-semibold text-brand underline-offset-4 hover:underline"
              >
                {contact}
              </a>
            </p>
          </section>
        )}
      </div>
    </article>
  );
}
