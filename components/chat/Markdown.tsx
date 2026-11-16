import { Fragment } from "react";
import { cn } from "@/lib/utils";

const INLINE = /(\*\*[^*]+\*\*|\[[^\]]+\]\((?:https?:\/\/|\/)[^)\s]+\)|https?:\/\/[^\s)<]+|`[^`]+`|\*[^*\s][^*]*\*)/g;

function Inline({ text }: { text: string }) {
  const parts = text.split(INLINE);
  return (
    <>
      {parts.map((part, i) => {
        if (!part) return null;
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-ink">
              {part.slice(2, -2)}
            </strong>
          );
        }
        const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
        if (link || /^https?:\/\//.test(part)) {
          const href = link ? link[2] : part;
          const label = link ? link[1] : part.replace(/^https?:\/\/(www\.)?/, "").slice(0, 48);
          const external = /^https?:\/\//.test(href);
          return (
            <a
              key={i}
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer nofollow" : undefined}
              className="font-medium text-brand underline decoration-brand/40 underline-offset-2 hover:decoration-brand"
            >
              {label}
            </a>
          );
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code key={i} className="rounded bg-mist px-1 py-0.5 text-[0.9em]">
              {part.slice(1, -1)}
            </code>
          );
        }
        if (/^\*[^*][\s\S]*\*$/.test(part)) return <em key={i}>{part.slice(1, -1)}</em>;
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}

const cells = (row: string) =>
  row
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((c) => c.trim());

/** Small Markdown renderer for assistant replies; no raw HTML is ever rendered. */
export function Markdown({ text }: { text: string }) {
  const lines = text.split("\n");
  const out: React.ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();

    if (!line) {
      i++;
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line)) {
      out.push(<hr key={i} className="my-5 border-line" />);
      i++;
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.*)/);
    if (heading) {
      out.push(
        <h3
          key={i}
          className={cn(
            "font-display font-semibold text-ink first:mt-0",
            heading[1].length <= 2 ? "mb-2 mt-6 text-lg" : "mb-1.5 mt-5 text-base",
          )}
        >
          <Inline text={heading[2]} />
        </h3>,
      );
      i++;
      continue;
    }

    if (line.startsWith("|") && lines[i + 1]?.trim().match(/^\|?[\s:-]+\|/)) {
      const head = cells(line);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && lines[i].trim().startsWith("|")) rows.push(cells(lines[i++]));
      out.push(
        <div key={`t${i}`} className="my-3 overflow-x-auto rounded-xl border border-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-mist">
              <tr>
                {head.map((h, j) => (
                  <th key={j} className="px-3 py-2 font-semibold text-ink">
                    <Inline text={h} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r, ri) => (
                <tr key={ri}>
                  {r.map((c, ci) => (
                    <td key={ci} className="px-3 py-2 align-top">
                      <Inline text={c.replace(/<br\s*\/?>/gi, " ")} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    if (line.startsWith(">")) {
      const quote: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quote.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      out.push(
        <blockquote key={`q${i}`} className="my-3 border-l-2 border-brand pl-3 text-muted">
          <Inline text={quote.join(" ")} />
        </blockquote>,
      );
      continue;
    }

    const listMatch = line.match(/^([-*]|\d+\.)\s+/);
    if (listMatch) {
      const ordered = /\d/.test(listMatch[1]);
      const items: string[] = [];
      while (i < lines.length) {
        const l = lines[i];
        const m = l.trim().match(/^([-*]|\d+\.)\s+(.*)/);
        if (m && /\d/.test(m[1]) === ordered && !/^\s{2,}/.test(l)) {
          items.push(m[2]);
        } else if (m || (/^\s{2,}\S/.test(l) && items.length)) {
          // Nested or continuation line: fold into the previous item.
          items[items.length - 1] += ` ${l.trim().replace(/^([-*]|\d+\.)\s+/, "")}`;
        } else break;
        i++;
      }
      const Tag = ordered ? "ol" : "ul";
      out.push(
        <Tag
          key={`l${i}`}
          className={cn("my-2 space-y-1.5 pl-5", ordered ? "list-decimal" : "list-disc marker:text-brand")}
        >
          {items.map((it, j) => (
            <li key={j} className="pl-1">
              <Inline text={it} />
            </li>
          ))}
        </Tag>,
      );
      continue;
    }

    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,4}\s|[-*]\s|\d+\.\s|>|\||-{3,}$)/.test(lines[i].trim())
    ) {
      para.push(lines[i].trim());
      i++;
    }
    out.push(
      <p key={`p${i}`} className="my-2.5">
        <Inline text={para.join(" ")} />
      </p>,
    );
  }
  return <>{out}</>;
}
