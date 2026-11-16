import "server-only";
import type { WebPlace } from "@/lib/inventory-types";

const TIMEOUT_MS = 15000;

async function firecrawl(q: string, limit: number): Promise<WebPlace[]> {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) throw new Error("FIRECRAWL_API_KEY not set");
  const res = await fetch("https://api.firecrawl.dev/v2/search", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: q, limit, country: "NG" }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Firecrawl responded ${res.status}`);
  const data = await res.json();
  const web: { url?: string; title?: string; description?: string }[] = data?.data?.web ?? [];
  return web
    .filter((w) => w.url && w.title)
    .map((w) => ({
      title: String(w.title),
      url: String(w.url),
      description: String(w.description ?? ""),
      source: "firecrawl" as const,
    }));
}

async function jina(q: string, limit: number): Promise<WebPlace[]> {
  const key = process.env.JINA_API_KEY;
  if (!key) throw new Error("JINA_API_KEY not set");
  const res = await fetch(`https://s.jina.ai/?q=${encodeURIComponent(q)}`, {
    headers: {
      Authorization: `Bearer ${key}`,
      Accept: "application/json",
      "X-Respond-With": "no-content",
    },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Jina responded ${res.status}`);
  const data = await res.json();
  const items: { url?: string; title?: string; description?: string }[] = data?.data ?? [];
  return items
    .filter((w) => w.url && w.title)
    .slice(0, limit)
    .map((w) => ({
      title: String(w.title),
      url: String(w.url),
      description: String(w.description ?? ""),
      source: "jina" as const,
    }));
}

/** Social posts and research papers rarely tell someone where to go today. */
const LOW_VALUE =
  /(pubmed|ncbi\.nlm|researchgate|sciencedirect|academia\.edu|semanticscholar|springer|wiley\.com|jstor|orthopaper|wikipedia|youtube\.com|tiktok\.com)/i;

/**
 * Real web search for places offering a health product or service.
 * Firecrawl first, Jina as fallback. Returns [] when both fail.
 */
export async function searchPlaces(what: string, where: string | null, limit = 6) {
  const q = `${what} ${where ? `in ${where}` : ""} Nigeria hospital OR pharmacy OR clinic OR centre`
    .replace(/\s+/g, " ")
    .trim();
  const errors: string[] = [];
  for (const engine of [firecrawl, jina]) {
    try {
      const found = (await engine(q, limit + 4)).filter((p) => !LOW_VALUE.test(p.url));
      if (found.length) return { places: found.slice(0, limit), query: q, errors };
    } catch (err) {
      errors.push((err as Error).message);
      console.warn("Web search engine failed", (err as Error).message);
    }
  }
  return { places: [] as WebPlace[], query: q, errors };
}
