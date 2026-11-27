import "server-only";
import { randomUUID } from "node:crypto";
import type { WebImage, WebPlace } from "@/lib/inventory-types";
import { readServerEnv } from "./admin-route";
import { countryName } from "./geo";
import { assertSafeExternalUrl, fetchService, politeThrottle } from "./http";

const TIMEOUT_MS = 14000;

type Hit = {
  url?: string;
  title?: string;
  description?: string;
  content?: string;
  snippet?: string;
  snippets?: string[];
};

const toPlaces = (hits: Hit[], source: WebPlace["source"]): WebPlace[] =>
  hits
    .filter((w) => w.url && w.title)
    .map((w) => ({
      title: String(w.title),
      url: String(w.url),
      description: String(
        w.description ??
          w.content ??
          w.snippet ??
          (Array.isArray(w.snippets) ? w.snippets.join(" ") : ""),
      ).slice(0, 480),
      source,
    }));

async function firecrawlSearch(
  q: string,
  limit: number,
  country?: string,
): Promise<WebPlace[]> {
  const key = readServerEnv("FIRECRAWL_API_KEY");
  if (!key) throw new Error("FIRECRAWL_API_KEY not set");
  const body: Record<string, unknown> = { query: q, limit };
  if (country) body.country = country;
  const res = await fetchService(
    "Firecrawl",
    "https://api.firecrawl.dev/v2/search",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    },
  );
  if (!res.ok) throw new Error(`Firecrawl responded ${res.status}`);
  const data = await res.json().catch(() => ({}));
  return toPlaces(data?.data?.web ?? [], "firecrawl");
}

async function tavilySearch(
  q: string,
  limit: number,
  opts: { images?: boolean; country?: string; includeDomains?: string[] } = {},
) {
  const key = readServerEnv("TAVILY_API_KEY");
  if (!key) throw new Error("TAVILY_API_KEY not set");
  const payload: Record<string, unknown> = {
    query: q,
    max_results: limit,
    include_images: Boolean(opts.images),
    include_image_descriptions: Boolean(opts.images),
  };
  if (opts.country) payload.country = opts.country;
  if (opts.includeDomains?.length) {
    payload.include_domains = opts.includeDomains;
  }
  const res = await fetchService("Tavily", "https://api.tavily.com/search", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
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

async function youSearch(
  q: string,
  limit: number,
  country?: string,
  includeDomains?: string[],
): Promise<WebPlace[]> {
  const key = readServerEnv("YOU_API_KEY");
  if (!key) throw new Error("YOU_API_KEY not set");
  const body: Record<string, unknown> = {
    query: q,
    count: Math.min(20, Math.max(1, limit)),
  };
  if (country) body.country = country.toUpperCase();
  if (includeDomains?.length) body.include_domains = includeDomains;
  const res = await fetchService("You.com", "https://ydc-index.io/v1/search", {
    method: "POST",
    headers: {
      "X-API-Key": key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`You.com responded ${res.status}`);
  const data = await res.json().catch(() => ({}));
  const hits: Hit[] = data?.results?.web ?? data?.hits ?? [];
  return toPlaces(hits, "you");
}

async function jinaSearch(q: string, limit: number): Promise<WebPlace[]> {
  const key = readServerEnv("JINA_API_KEY");
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

/** Social posts and research papers rarely tell someone where to buy medicine today. */
const LOW_VALUE_PLACES =
  /(pubmed|ncbi\.nlm|researchgate|sciencedirect|academia\.edu|semanticscholar|springer|wiley\.com|jstor|orthopaper|wikipedia|youtube\.com|tiktok\.com|tavily\.com)/i;

/**
 * Wider multi-provider web search for regulatory registries, barcodes, drug
 * authenticity, and product details. Queries up to two providers in parallel
 * and deduplicates normalized URLs so coverage is resilient.
 */
export async function searchWebGeneral(
  query: string,
  opts: {
    limit?: number;
    country?: string;
    includeDomains?: string[];
    filterLowValue?: boolean;
  } = {},
): Promise<{ results: WebPlace[]; errors: string[] }> {
  const limit = Math.min(20, Math.max(1, opts.limit ?? 8));
  const cleanQuery = query.replace(/\s+/g, " ").trim();
  if (!cleanQuery) return { results: [], errors: [] };

  const domainPrefix = opts.includeDomains?.length
    ? `(${opts.includeDomains.map((d) => `site:${d}`).join(" OR ")}) `
    : "";
  const fullQuery = `${domainPrefix}${cleanQuery}`.trim();
  const errors: string[] = [];

  const providers: Array<{ name: string; run: () => Promise<WebPlace[]> }> = [];
  if (readServerEnv("FIRECRAWL_API_KEY")) {
    providers.push({
      name: "Firecrawl",
      run: () => firecrawlSearch(fullQuery, limit, opts.country),
    });
  }
  if (readServerEnv("TAVILY_API_KEY")) {
    providers.push({
      name: "Tavily",
      run: async () =>
        (
          await tavilySearch(cleanQuery, limit, {
            country: opts.country
              ? countryName(opts.country).toLowerCase()
              : undefined,
            includeDomains: opts.includeDomains,
          })
        ).places,
    });
  }
  if (readServerEnv("YOU_API_KEY")) {
    providers.push({
      name: "You.com",
      run: () =>
        youSearch(cleanQuery, limit, opts.country, opts.includeDomains),
    });
  }
  if (readServerEnv("JINA_API_KEY")) {
    providers.push({
      name: "Jina",
      run: () => jinaSearch(fullQuery, limit),
    });
  }

  const primary = providers.slice(0, 2);
  const settled = await Promise.allSettled(primary.map((p) => p.run()));
  const merged: WebPlace[] = [];
  const seenUrls = new Set<string>();

  const pushHits = (hits: WebPlace[]) => {
    for (const h of hits) {
      try {
        const parsed = assertSafeExternalUrl(h.url);
        const norm = `${parsed.origin}${parsed.pathname}`.toLowerCase();
        if (seenUrls.has(norm)) continue;
        if (opts.filterLowValue && LOW_VALUE_PLACES.test(h.url)) continue;
        seenUrls.add(norm);
        merged.push(h);
      } catch {
        /* skip unsafe or malformed URL */
      }
    }
  };

  settled.forEach((res, idx) => {
    if (res.status === "fulfilled") {
      pushHits(res.value);
    } else {
      errors.push(`${primary[idx].name}: ${(res.reason as Error).message}`);
    }
  });

  if (merged.length < 3 && providers.length > 2) {
    for (const extra of providers.slice(2)) {
      try {
        pushHits(await extra.run());
        if (merged.length >= limit) break;
      } catch (err) {
        errors.push(`${extra.name}: ${(err as Error).message}`);
      }
    }
  }

  return { results: merged.slice(0, limit), errors };
}

function stripHtmlText(html: string): { title?: string; text: string } {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim();
  const body = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
  return { title, text: body };
}

/**
 * Reads an external public web page with SSRF validation, polite throttling
 * on government domains, and a multi-provider scrape fallback cascade
 * (Direct fetch -> Firecrawl Scrape -> Jina Reader -> ZenRows -> optional TinyFish).
 */
export async function scrapeWebPage(
  url: string,
  opts: {
    timeoutMs?: number;
    allowBrowserAgent?: boolean;
    goal?: string;
  } = {},
): Promise<{ text: string; title?: string; via: string } | null> {
  const parsed = assertSafeExternalUrl(url);
  const timeout = opts.timeoutMs ?? 12000;
  if (/\.(gov\.ng|gov\.cn|gc\.ca|gov\.uk)$/i.test(parsed.hostname)) {
    await politeThrottle(parsed.hostname, 1500);
  }

  // 1. Direct lightweight fetch first
  try {
    const res = await fetchService("DirectFetch", parsed.toString(), {
      headers: {
        Accept: "text/html,application/json,text/plain;q=0.9",
      },
      signal: AbortSignal.timeout(Math.min(timeout, 9000)),
    });
    if (res.ok) {
      const ct = (res.headers.get("content-type") ?? "").toLowerCase();
      const raw = await res.text();
      if (ct.includes("application/json") || ct.includes("text/plain")) {
        if (raw.trim().length > 40) {
          return { text: raw.slice(0, 12000), via: "direct" };
        }
      } else {
        const { title, text } = stripHtmlText(raw);
        if (
          text.length >= 220 &&
          !/just a moment|enable javascript|cloudflare|checking your browser/i.test(
            text.slice(0, 400),
          )
        ) {
          return { title, text: text.slice(0, 12000), via: "direct" };
        }
      }
    }
  } catch {
    /* fall through to managed scrapers */
  }

  // 2. Firecrawl v2 Scrape
  const firecrawlKey = readServerEnv("FIRECRAWL_API_KEY");
  if (firecrawlKey) {
    try {
      const res = await fetchService(
        "FirecrawlScrape",
        "https://api.firecrawl.dev/v2/scrape",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${firecrawlKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: parsed.toString(),
            formats: ["markdown"],
            onlyMainContent: true,
          }),
          signal: AbortSignal.timeout(timeout),
        },
      );
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        const md = String(data?.data?.markdown ?? "").trim();
        if (md.length >= 120) {
          return {
            title: data?.data?.metadata?.title,
            text: md.slice(0, 12000),
            via: "firecrawl",
          };
        }
      }
    } catch {
      /* try next scraper */
    }
  }

  // 3. Jina Reader
  const jinaKey = readServerEnv("JINA_API_KEY");
  if (jinaKey) {
    try {
      const res = await fetchService(
        "JinaReader",
        `https://r.jina.ai/${parsed.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${jinaKey}`,
            Accept: "application/json",
          },
          signal: AbortSignal.timeout(timeout),
        },
      );
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        const content = String(data?.data?.content ?? "").trim();
        if (content.length >= 120) {
          return {
            title: data?.data?.title,
            text: content.slice(0, 12000),
            via: "jina",
          };
        }
      }
    } catch {
      /* try next scraper */
    }
  }

  // 4. ZenRows Protected Fetch
  const zenrowsKey = readServerEnv("ZENROWS_API_KEY");
  if (zenrowsKey) {
    try {
      const res = await fetchService(
        "ZenRows",
        `https://api.zenrows.com/v1/?url=${encodeURIComponent(parsed.toString())}&apikey=${encodeURIComponent(zenrowsKey)}&mode=auto`,
        { signal: AbortSignal.timeout(Math.max(timeout, 15000)) },
      );
      if (res.ok) {
        const raw = await res.text();
        const { title, text } = stripHtmlText(raw);
        if (text.length >= 160) {
          return { title, text: text.slice(0, 12000), via: "zenrows" };
        }
      }
    } catch {
      /* try optional browser agent */
    }
  }

  // 5. Optional TinyFish live browser automation (single attempt, never retried)
  const tinyKey =
    readServerEnv("TINYFISH_API_KEY") || readServerEnv("TINY_FISH");
  if (opts.allowBrowserAgent && tinyKey) {
    try {
      const res = await fetchService(
        "TinyFish",
        "https://agent.tinyfish.ai/v1/automation/run",
        {
          method: "POST",
          headers: {
            "X-API-Key": tinyKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: parsed.toString(),
            session_id: randomUUID(),
            browser_profile: "lite",
            goal:
              opts.goal ??
              "Read the visible product registration record on this page and return exact text fields only. Do not click unrelated links or submit forms.",
          }),
          signal: AbortSignal.timeout(18000),
        },
      );
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        const resultText =
          typeof data?.result === "string"
            ? data.result
            : JSON.stringify(data?.result ?? data ?? {});
        if (resultText && resultText !== "{}") {
          return { text: resultText.slice(0, 12000), via: "tinyfish" };
        }
      }
    } catch {
      /* never retry browser automation calls */
    }
  }

  return null;
}

/**
 * Real web search for places offering a health product or service.
 * Firecrawl, then Tavily, then You.com, then Jina. Returns [] when all fail.
 */
export async function searchPlaces(
  what: string,
  where: string | null,
  limit = 6,
  /** ISO country code of the person searching; results stay in that country. */
  country = "NG",
) {
  const name = countryName(country);
  const q =
    `${what} ${where ? `in ${where}` : ""} ${name} hospital OR pharmacy OR clinic OR centre`
      .replace(/\s+/g, " ")
      .trim();
  const errors: string[] = [];
  const engines: (() => Promise<WebPlace[]>)[] = [
    () => firecrawlSearch(q, limit + 4, country),
    async () =>
      (
        await tavilySearch(
          `where to get ${what}${where ? ` in ${where}` : ""} ${name}`,
          limit + 4,
          { country: name.toLowerCase() },
        )
      ).places,
    () => youSearch(q, limit + 4, country),
    () => jinaSearch(q, limit + 4),
  ];
  for (const engine of engines) {
    try {
      const found = (await engine()).filter(
        (p) => !LOW_VALUE_PLACES.test(p.url),
      );
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
  country = "NG",
): Promise<WebImage[]> {
  const q = `${what}${where ? ` ${where}` : ""} ${countryName(country)}`;
  const key = readServerEnv("FIRECRAWL_API_KEY");
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
            country,
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
            i.imageUrl?.startsWith("http") &&
            i.url &&
            !LOW_VALUE_PLACES.test(i.url),
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
    const { images } = await tavilySearch(q, 3, {
      images: true,
      country: countryName(country).toLowerCase(),
    });
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
