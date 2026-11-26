import { NextResponse, connection } from "next/server";
import { handle } from "@/lib/server/api";
import {
  getComplianceFrameworkSummary,
  searchDataProtectionProvisions,
} from "@/lib/server/compliance";
import {
  getMhraAgencyOverview,
  searchMhraSafetyPars,
} from "@/lib/server/mhra";
import { getOrangeBookStats, searchOrangeBook } from "@/lib/server/orange-book";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";
import {
  getSocialCareSummary,
  queryAdultSocialCareFinance,
} from "@/lib/server/social-care";

const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
} as const;

const OPENFDA_ENDPOINTS = [
  "drug/ndc",
  "drug/drugsfda",
  "drug/label",
  "drug/event",
  "drug/enforcement",
  "food/enforcement",
  "cosmetic/event",
] as const;

/**
 * Public, read-only explorer over Zelthia's indexed regulatory, statutory, and
 * health-economics datasets (FDA Orange Book & openFDA, UK MHRA, UKPGA DPA 2018,
 * and DHSC England Adult Social Care Finance 2025-2026).
 */
export async function GET(req: Request) {
  await connection();
  try {
    const rl = await rateLimit(`datasets:${clientIp(req)}`, 60, 10 * 60_000);
    if (!rl.ok) {
      return NextResponse.json(
        {
          error: `Too many requests. Try again in ${rl.retryAfter} seconds.`,
        },
        {
          status: 429,
          headers: { "Retry-After": String(rl.retryAfter) },
        },
      );
    }

    const url = new URL(req.url);
    const source = (url.searchParams.get("source") ?? "overview")
      .trim()
      .toLowerCase();
    const q = (url.searchParams.get("q") ?? "").trim().slice(0, 160);
    const rawLimit = Number.parseInt(url.searchParams.get("limit") ?? "10", 10);
    const limit = Number.isFinite(rawLimit)
      ? Math.min(25, Math.max(1, rawLimit))
      : 10;

    switch (source) {
      case "overview":
        return NextResponse.json(
          {
            generatedAt: new Date().toISOString(),
            orangeBook: getOrangeBookStats(),
            openFdaEndpoints: OPENFDA_ENDPOINTS,
            mhra: getMhraAgencyOverview(),
            compliance: getComplianceFrameworkSummary(),
            socialCare: getSocialCareSummary(),
          },
          { status: 200, headers: CACHE_HEADERS },
        );

      case "mhra":
        return NextResponse.json(
          {
            query: q,
            matches: q ? searchMhraSafetyPars(q) : [],
            overview: getMhraAgencyOverview(),
          },
          { status: 200, headers: CACHE_HEADERS },
        );

      case "dpa":
        return NextResponse.json(
          {
            query: q,
            provisions: searchDataProtectionProvisions(
              q || "health data special category",
            ),
            summary: getComplianceFrameworkSummary(),
          },
          { status: 200, headers: CACHE_HEADERS },
        );

      case "social-care":
        return NextResponse.json(
          queryAdultSocialCareFinance({ query: q || undefined, limit }),
          { status: 200, headers: CACHE_HEADERS },
        );

      case "orange-book":
        return NextResponse.json(
          {
            query: q,
            stats: getOrangeBookStats(),
            result: q ? searchOrangeBook({ query: q, limit }) : null,
          },
          { status: 200, headers: CACHE_HEADERS },
        );

      default:
        return NextResponse.json(
          {
            error:
              "Unsupported dataset source. Use one of: overview, mhra, dpa, social-care, orange-book.",
          },
          { status: 400 },
        );
    }
  } catch (err) {
    return handle("GET /api/research/datasets", err);
  }
}
