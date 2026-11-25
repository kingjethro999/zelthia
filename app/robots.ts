import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/utils";

const PRIVATE = ["/account", "/setup", "/provider", "/api/"];
/** The read-only directory search is public and safe for agents to call. */
const OPEN = [
  "/",
  "/api/directory",
  "/llms.txt",
  "/llms-full.txt",
  "/openapi.json",
];

/** Search and AI crawlers named explicitly so their access is unambiguous. */
const AI_AGENTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Amazonbot",
  "meta-externalagent",
  "CCBot",
  "Bingbot",
  "Googlebot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: OPEN, disallow: PRIVATE },
      { userAgent: AI_AGENTS, allow: OPEN, disallow: PRIVATE },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
