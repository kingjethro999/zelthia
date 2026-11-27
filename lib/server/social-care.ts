import "server-only";
import ascJson from "./datasets/adult-social-care-2025-2026.json";

export interface SocialCareQueryResult {
  source: string;
  url: string;
  updated: string;
  totalCsvRowsProcessed: number;
  dataQualityNotice: string;
  englandTotals: typeof ascJson.englandTotals;
  matchedRegions: typeof ascJson.regions;
  matchedLocalAuthorities: typeof ascJson.localAuthorities;
}

export function getSocialCareSummary() {
  return {
    source: ascJson.source,
    url: ascJson.url,
    updated: ascJson.updated,
    totalCsvRowsProcessed: ascJson.totalCsvRowsProcessed,
    regionsCount: ascJson.regionsCount,
    localAuthoritiesCount: ascJson.localAuthoritiesCount,
    dataQualityNotice: ascJson.dataQualityNotice,
    englandTotals: ascJson.englandTotals,
  };
}

/**
 * Queries DHSC England Adult Social Care Finance Report (FY 2025–2026, updated
 * November 2026) across national totals, 9 English regions, and 153 Local Authorities.
 */
export function queryAdultSocialCareFinance(
  opts: {
    query?: string;
    limit?: number;
  } = {},
): SocialCareQueryResult {
  const limit = Math.min(25, Math.max(1, opts.limit ?? 8));
  const needle = (opts.query ?? "").toLowerCase().trim();
  const tokens = needle
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(
      (t) =>
        t.length >= 3 &&
        ![
          "adult",
          "social",
          "care",
          "finance",
          "report",
          "england",
          "spending",
          "budget",
          "expenditure",
          "cost",
          "2025",
          "2026",
        ].includes(t),
    );

  const matchedRegions = tokens.length
    ? ascJson.regions.filter((r) =>
        tokens.some((t) => r.name.toLowerCase().includes(t)),
      )
    : ascJson.regions;

  const matchedLocalAuthorities = tokens.length
    ? ascJson.localAuthorities
        .filter((la) =>
          tokens.some(
            (t) =>
              la.name.toLowerCase().includes(t) ||
              la.region.toLowerCase().includes(t) ||
              la.code.toLowerCase() === t,
          ),
        )
        .slice(0, limit)
    : ascJson.localAuthorities.slice(0, limit);

  return {
    source: ascJson.source,
    url: ascJson.url,
    updated: ascJson.updated,
    totalCsvRowsProcessed: ascJson.totalCsvRowsProcessed,
    dataQualityNotice: ascJson.dataQualityNotice,
    englandTotals: ascJson.englandTotals,
    matchedRegions,
    matchedLocalAuthorities,
  };
}
