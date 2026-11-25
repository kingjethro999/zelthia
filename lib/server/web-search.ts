import "server-only";
import type { WebImage, WebPlace } from "@/lib/inventory-types";
import { fetchService } from "./http";

const TIMEOUT_MS = 15000;

type Hit = {
  url?: string;
  title?: string;
  description?: string;
  content?: string;
};

const toPlaces = (hits: Hit[], source: WebPlace["source"]): WebPlace[] =>
  hits
    .filter((w) => w.url && w.title)
    .map((w) => ({
      title: String(w.title),
      url: String(w.url),
      description: String(w.description ?? w.content ?? "").slice(0, 400),
      source,
    }));

async function firecrawl(q: string, limit: number): Promise<WebPlace[]> {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) throw new Error("FIRECRAWL_API_KEY not set");
  const res = await fetchService(
    "Firecrawl",
    "https://api.firecrawl.dev/v2/search",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: q, limit, country: "NG" }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    },
  );
  if (!res.ok) throw new Error(`Firecrawl responded ${res.status}`);
  const data = await res.json().catch(() => ({}));
  return toPlaces(data?.data?.web ?? [], "firecrawl");
}

async function tavily(q: string, limit: number, images = false) {
  const key = process.env.TAVILY_API_KEY;
  if (!key) throw new Error("TAVILY_API_KEY not set");
  const res = await fetchService("Tavily", "https://api.tavily.com/search", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: q,
      max_results: limit,
      country: "nigeria",
      include_images: images,
      include_image_descriptions: images,
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Tavily responded ${res.status}`);
  const data = await res.json().catch(() => ({}));
  return {
    places: toPlaces(data?.results ?? [], "tavily"),
    images: (data?.images ?? []) as {
      url?: string;
      title?: string;
      description?: string;
    }[],
  };
}

async function jina(q: string, limit: number): Promise<WebPlace[]> {
  const key = process.env.JINA_API_KEY;
  if (!key) throw new Error("JINA_API_KEY not set");
  const res = await fetchService(
    "Jina",
    `https://s.jina.ai/?q=${encodeURIComponent(q)}`,
    {
      headers: {
        Authorization: `Bearer ${key}`,
        Accept: "application/json",
        "X-Respond-With": "no-content",
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    },
  );
  if (!res.ok) throw new Error(`Jina responded ${res.status}`);
  const data = await res.json().catch(() => ({}));
  return toPlaces((data?.data ?? []).slice(0, limit), "jina");
}

/** Social posts and research papers rarely tell someone where to go today. */
const LOW_VALUE =
  /(pubmed|ncbi\.nlm|researchgate|sciencedirect|academia\.edu|semanticscholar|springer|wiley\.com|jstor|orthopaper|wikipedia|youtube\.com|tiktok\.com|tavily\.com)/i;

/**
 * Real web search for places offering a health product or service.
 * Firecrawl, then Tavily, then Jina. Returns [] when all fail.
 */
export async function searchPlaces(
  what: string,
  where: string | null,
  limit = 6,
) {
  const q =
    `${what} ${where ? `in ${where}` : ""} Nigeria hospital OR pharmacy OR clinic OR centre`
      .replace(/\s+/g, " ")
      .trim();
  const errors: string[] = [];
  const engines: (() => Promise<WebPlace[]>)[] = [
    () => firecrawl(q, limit + 4),
    async () =>
      (
        await tavily(
          `where to get ${what}${where ? ` in ${where}` : ""} Nigeria`,
          limit + 4,
        )
      ).places,
    () => jina(q, limit + 4),
  ];
  for (const engine of engines) {
    try {
      const found = (await engine()).filter((p) => !LOW_VALUE.test(p.url));
      if (found.length)
        return { places: found.slice(0, limit), query: q, errors };
    } catch (err) {
      errors.push((err as Error).message);
      console.warn("Web search engine failed", (err as Error).message);
    }
  }
  return { places: [] as WebPlace[], query: q, errors };
}

const origin = (u: string) => {
  try {
    return new URL(u).origin;
  } catch {
    return "";
  }
};

/**
 * Photos from the web for a product, test or place, each linked to its
 * source page. Firecrawl images first (they include the page URL), Tavily
 * images as a fallback (linked to the image's own site).
 */
export async function searchImages(
  what: string,
  where: string | null,
  limit = 8,
): Promise<WebImage[]> {
  const q = `${what}${where ? ` ${where}` : ""} Nigeria`;
  const key = process.env.FIRECRAWL_API_KEY;
  if (key) {
    try {
      const res = await fetchService(
        "Firecrawl",
        "https://api.firecrawl.dev/v2/search",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: q,
            limit: limit + 4,
            sources: ["images"],
            country: "NG",
          }),
          signal: AbortSignal.timeout(TIMEOUT_MS),
        },
      );
      if (!res.ok) throw new Error(`Firecrawl responded ${res.status}`);
      const data = await res.json().catch(() => ({}));
      const imgs: {
        imageUrl?: string;
        title?: string;
        url?: string;
        imageWidth?: number;
        imageHeight?: number;
      }[] = data?.data?.images ?? [];
      const out = imgs
        .filter(
          (i) =>
            i.imageUrl?.startsWith("http") && i.url && !LOW_VALUE.test(i.url),
        )
        .map((i) => ({
          imageUrl: i.imageUrl!.replace(/^http:\/\//, "https://"),
          title: String(i.title ?? ""),
          sourceUrl: String(i.url),
          width: i.imageWidth,
          height: i.imageHeight,
        }));
      if (out.length) return out.slice(0, limit);
    } catch (err) {
      console.warn("Firecrawl image search failed", (err as Error).message);
    }
  }
  try {
    const { images } = await tavily(q, 3, true);
    return images
      .filter((i) => i.url?.startsWith("http"))
      .map((i) => ({
        imageUrl: i.url!,
        title: String(i.title ?? i.description ?? ""),
        sourceUrl: origin(i.url!),
      }))
      .slice(0, limit);
  } catch (err) {
    console.warn("Tavily image search failed", (err as Error).message);
    return [];
  }
}
