import "server-only";
import type { Facility, VerificationEvidence } from "@/lib/inventory-types";
import { fetchService } from "./http";

const PENDING_NOTE =
  "Submitted for admin review. A Zelthia administrator will check your licence before enabling the verified badge.";

/**
 * Official licensing registers per country. Evidence is only collected from
 * these domains (and the country's government suffix), never the open web.
 */
const OFFICIAL: Record<string, { domains: string[]; govSuffix?: string }> = {
  NG: {
    domains: [
      "pcn.gov.ng",
      "mdcn.gov.ng",
      "hefamaa.lagosstate.gov.ng",
      "nafdac.gov.ng",
      "nhia.gov.ng",
      "health.gov.ng",
      "nmcn.gov.ng",
      "mlscn.gov.ng",
    ],
    govSuffix: ".gov.ng",
  },
  GB: {
    domains: ["pharmacyregulation.org", "cqc.org.uk", "gmc-uk.org", "nhs.uk"],
    govSuffix: ".gov.uk",
  },
  US: {
    domains: ["npiregistry.cms.hhs.gov", "nabp.pharmacy", "cms.gov"],
    govSuffix: ".gov",
  },
  CA: {
    domains: ["ocpinfo.com", "napra.ca", "collegeofpharmacists.bc.ca"],
    govSuffix: ".gc.ca",
  },
  GH: { domains: ["pcghana.org", "hefra.gov.gh"], govSuffix: ".gov.gh" },
  KE: {
    domains: ["pharmacyboardkenya.org", "kmpdc.go.ke"],
    govSuffix: ".go.ke",
  },
  ZA: { domains: ["sapc.za.org", "hpcsa.co.za"], govSuffix: ".gov.za" },
};

const officialFor = (country: string) =>
  OFFICIAL[country] ?? { domains: [] as string[], govSuffix: undefined };

interface Hit {
  url: string;
  title: string;
  description: string;
}

function isAuthoritativeUrl(rawUrl: string, country: string): string | null {
  const { domains, govSuffix } = officialFor(country);
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:")
      return null;
    const host = parsed.hostname.toLowerCase();
    const match =
      domains.some((d) => host === d || host.endsWith(`.${d}`)) ||
      Boolean(govSuffix && host.endsWith(govSuffix));
    return match ? host : null;
  } catch {
    return null;
  }
}

async function searchOfficial(q: string, country: string): Promise<Hit[]> {
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
      body: JSON.stringify({ query: q, limit: 8, country }),
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
 * Gathers preliminary findings from the facility's own country's official registers for
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

  const country = f.country || "NG";
  const { domains, govSuffix } = officialFor(country);
  const sites = [
    ...domains.slice(0, 5).map((d) => `site:${d}`),
    ...(govSuffix ? [`site:${govSuffix.slice(1)}`] : []),
  ];
  // No known register for this country: leave it to the admin reviewer.
  if (!sites.length) {
    return { status: "pending", note: PENDING_NOTE, url: "", evidence: [] };
  }
  const siteExpr = `(${sites.join(" OR ")})`;

  try {
    const results = await Promise.allSettled([
      searchOfficial(`${siteExpr} "${cleanLicence}"`, country),
      searchOfficial(`${siteExpr} "${cleanName}" ${f.city}`, country),
    ]);

    const seen = new Set<string>();
    const licenceSquashed = squash(f.licenseNumber);
    const evidence: VerificationEvidence[] = [];

    for (const res of results) {
      if (res.status !== "fulfilled") continue;
      for (const hit of res.value) {
        if (seen.has(hit.url)) continue;
        const domain = isAuthoritativeUrl(hit.url, country);
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
