import "server-only";
import type { Facility, VerificationEvidence } from "@/lib/inventory-types";
import { fetchService } from "./http";

const PENDING_NOTE =
  "Submitted for admin review. A Zelthia administrator will check your licence before enabling the verified badge.";

/** Official Nigerian healthcare and government registry domains only. */
const AUTHORITATIVE_DOMAINS = [
  "pcn.gov.ng",
  "mdcn.gov.ng",
  "hefamaa.lagosstate.gov.ng",
  "nafdac.gov.ng",
  "nhia.gov.ng",
  "health.gov.ng",
  "nmcn.gov.ng",
  "mlscn.gov.ng",
];

interface Hit {
  url: string;
  title: string;
  description: string;
}

function isAuthoritativeUrl(rawUrl: string): string | null {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:")
      return null;
    const host = parsed.hostname.toLowerCase();
    const match =
      AUTHORITATIVE_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`)) ||
      host.endsWith(".gov.ng");
    return match ? host : null;
  } catch {
    return null;
  }
}

async function searchOfficial(q: string): Promise<Hit[]> {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) return [];
  const res = await fetchService(
    "Firecrawl",
    "https://api.firecrawl.dev/v2/search",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: q, limit: 8, country: "NG" }),
      signal: AbortSignal.timeout(15000),
    },
  );
  if (!res.ok) throw new Error(`Firecrawl responded ${res.status}`);
  const data = await res.json().catch(() => ({}));
  return ((data?.data?.web ?? []) as Hit[]).filter((h) => Boolean(h.url));
}

const squash = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

function nameTokensMatch(facilityName: string, haystack: string): boolean {
  const tokens = facilityName
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(
      (t) =>
        t.length >= 3 &&
        ![
          "pharmacy",
          "clinic",
          "hospital",
          "centre",
          "center",
          "store",
          "ltd",
          "limited",
        ].includes(t),
    );
  if (!tokens.length) return false;
  const lower = haystack.toLowerCase();
  return tokens.some((t) => lower.includes(t));
}

/**
 * Gathers preliminary findings from official Nigerian `.gov.ng` registries for
 * human administrator review. Never auto-approves (`verified`) — only an admin
 * can grant or reject the verified badge.
 */
export async function gatherVerificationEvidence(f: Facility): Promise<{
  status: "none" | "pending";
  note: string;
  url: string;
  evidence: VerificationEvidence[];
}> {
  if (!f.licenseNumber.trim()) {
    return { status: "none", note: "", url: "", evidence: [] };
  }

  const checkedAt = new Date().toISOString();
  const cleanLicence = f.licenseNumber.replace(/"/g, "").trim();
  const cleanName = f.name.replace(/"/g, "").trim();

  try {
    const results = await Promise.allSettled([
      searchOfficial(`site:gov.ng "${cleanLicence}"`),
      searchOfficial(`site:gov.ng "${cleanName}" ${f.city}`),
      searchOfficial(
        `(site:pcn.gov.ng OR site:mdcn.gov.ng OR site:hefamaa.lagosstate.gov.ng OR site:nafdac.gov.ng) "${cleanName}"`,
      ),
    ]);

    const seen = new Set<string>();
    const licenceSquashed = squash(f.licenseNumber);
    const evidence: VerificationEvidence[] = [];

    for (const res of results) {
      if (res.status !== "fulfilled") continue;
      for (const hit of res.value) {
        if (seen.has(hit.url)) continue;
        const domain = isAuthoritativeUrl(hit.url);
        if (!domain) continue;
        seen.add(hit.url);

        const combined = `${hit.title ?? ""} ${hit.description ?? ""}`;
        evidence.push({
          url: hit.url,
          domain,
          title: String(hit.title ?? domain).slice(0, 180),
          snippet: String(hit.description ?? "").slice(0, 320),
          licenceMatch:
            licenceSquashed.length >= 5 &&
            squash(combined).includes(licenceSquashed),
          nameMatch: nameTokensMatch(f.name, combined),
          checkedAt,
        });
      }
    }

    evidence.sort((a, b) => {
      const score = (e: VerificationEvidence) =>
        (e.licenceMatch ? 2 : 0) + (e.nameMatch ? 1 : 0);
      return score(b) - score(a);
    });

    return {
      status: "pending",
      note: PENDING_NOTE,
      url: "",
      evidence: evidence.slice(0, 10),
    };
  } catch (err) {
    console.error("Preliminary registry lookup failed", err);
    return { status: "pending", note: PENDING_NOTE, url: "", evidence: [] };
  }
}
