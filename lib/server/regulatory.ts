import "server-only";
import { createHash } from "node:crypto";
import {
  classifyNafdacCode,
  extractRegulatoryCodes,
  parseScannedCode,
} from "@/lib/barcode";
import type {
  RegulatoryAlertFlag,
  RegulatoryReport,
  RegulatoryVerdict,
  RegistrySourceFinding,
} from "@/lib/inventory-types";
import { query } from "./db";
import { fetchService, politeThrottle } from "./http";
import { searchOrangeBook } from "./orange-book";
import { scrapeWebPage, searchWebGeneral } from "./web-search";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const API_TIMEOUT_MS = 8500;

export const PERMANENT_VERIFICATION_DISCLAIMER =
  "Zelthia checks public registration records and web sources, not physical chemical composition. Always inspect the physical pack, batch number, security seal, and expiry date.";

export const MANDATORY_UNLISTED_WARNING =
  "Could not find any documented regulatory listing for this product across NAFDAC, US FDA, Health Canada, UK MHRA, or international public registries. Never assume why a product is unlisted — consult a licensed pharmacy, clinic, or hospital nearby before using or stocking it.";

const MEDICAL_CATEGORIES = new Set([
  "Medicine",
  "Pain relief and muscle care",
  "Medical devices",
  "Test kits and diagnostics",
  "Mother and baby",
]);

const FOOD_WORDS_RE =
  /\b(yoghurt|yogurt|milk|juice|beverage|drink|soft drink|biscuit|noodle|noodles|water|sachet water|chocolate|butter|bread|seasoning|spice|tea|coffee|snack)\b/i;

const RECALL_WORDS_RE =
  /\b(recall|recalled|counterfeit|falsified|fake|substandard|unregistered|banned|prohibited|alert|alerted|nsq|not of standard quality|adulterated|withdraw|withdrawn)\b/i;

const EXPIRED_LICENCE_RE =
  /\b(expired|lapsed|cancelled|canceled|revoked|suspended|discontinued)\b/i;

export interface VerifyProductInput {
  name: string;
  genericName?: string;
  category?: string;
  nafdacCode?: string;
  barcode?: string;
  foreignCode?: string;
  manufacturer?: string;
  countryOfOrigin?: string;
  expiresOn?: string | null;
  forceRefresh?: boolean;
}

export interface BarcodeMetadata {
  barcode: string;
  name?: string;
  genericName?: string;
  manufacturer?: string;
  packSize?: string;
  countryOfOrigin?: string;
  category?: string;
  derivedUsNdc?: string;
  source?: string;
}

const cleanTokens = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(
      (t) =>
        t.length >= 3 &&
        ![
          "tablet",
          "tablets",
          "capsule",
          "capsules",
          "syrup",
          "cream",
          "lotion",
          "drops",
          "injection",
          "pack",
          "packs",
          "plus",
          "extra",
          "forte",
          "oral",
          "suspension",
          "solution",
          "drug",
          "ltd",
          "plc",
          "inc",
          "pharm",
          "pharma",
          "pharmaceutical",
          "pharmaceuticals",
        ].includes(t),
    );

function safeUrl(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  try {
    const u = new URL(raw);
    return u.protocol === "https:" || u.protocol === "http:"
      ? u.toString()
      : undefined;
  } catch {
    return undefined;
  }
}

function buildCacheKey(input: VerifyProductInput): string {
  const parts = [
    input.name.trim().toLowerCase(),
    (input.genericName ?? "").trim().toLowerCase(),
    (input.category ?? "").trim().toLowerCase(),
    (input.nafdacCode ?? "").trim().toUpperCase(),
    (input.barcode ?? "").trim(),
    (input.foreignCode ?? "").trim().toUpperCase(),
    (input.manufacturer ?? "").trim().toLowerCase(),
  ];
  return createHash("sha256").update(parts.join("|")).digest("hex");
}

function applyPhysicalExpiryCheck(
  report: RegulatoryReport,
  expiresOn?: string | null,
): RegulatoryReport {
  if (!expiresOn || !/^\d{4}-\d{2}-\d{2}$/.test(expiresOn)) return report;
  const today = new Date().toISOString().slice(0, 10);
  if (expiresOn >= today) return report;

  const alreadyHas = report.flags.some((f) => f.code === "EXPIRED_PACK");
  const flags = alreadyHas
    ? report.flags
    : [
        {
          code: "EXPIRED_PACK" as const,
          severity: "danger" as const,
          title: "Physical pack is past expiry date",
          detail: `Scanned pack expiry (${expiresOn}) is before today (${today}). Do not dispense or place into active stock.`,
        },
        ...report.flags,
      ];
  return {
    ...report,
    verdict: "danger",
    headline: "Red Flag: Pack is expired",
    flags,
  };
}

/* ---------- Barcode metadata enrichment ---------- */

async function fetchJsonSafe(service: string, url: string) {
  const res = await fetchService(service, url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(API_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`${service} ${res.status}`);
  return res.json();
}

export async function lookupBarcodeMetadata(
  rawBarcode: string,
): Promise<BarcodeMetadata | null> {
  const scanned = parseScannedCode(rawBarcode);
  const gtin = scanned.ean13 ?? scanned.upcA ?? scanned.gtin ?? rawBarcode.replace(/\D/g, "");
  if (!gtin || gtin.length < 8) return null;

  const meta: BarcodeMetadata = {
    barcode: gtin,
    derivedUsNdc: scanned.derivedUsNdc,
  };

  const tasks: Promise<void>[] = [];

  if (scanned.derivedUsNdc) {
    const ndc10 = scanned.derivedUsNdc;
    const candidates = [
      `${ndc10.slice(0, 5)}-${ndc10.slice(5, 8)}-${ndc10.slice(8)}`,
      `${ndc10.slice(0, 4)}-${ndc10.slice(4, 8)}-${ndc10.slice(8)}`,
      `${ndc10.slice(0, 5)}-${ndc10.slice(5, 9)}-${ndc10.slice(9)}`,
    ];
    tasks.push(
      (async () => {
        for (const formatted of candidates) {
          try {
            const q = encodeURIComponent(
              `packaging.package_ndc:"${formatted}" OR product_ndc:"${formatted.split("-").slice(0, 2).join("-")}"`,
            );
            const data = await fetchJsonSafe(
              "openFDA-NDC",
              `https://api.fda.gov/drug/ndc.json?search=${q}&limit=2`,
            );
            const r = data?.results?.[0];
            if (r) {
              meta.name = meta.name || String(r.brand_name ?? r.generic_name ?? "");
              meta.genericName =
                meta.genericName || String(r.generic_name ?? "");
              meta.manufacturer =
                meta.manufacturer || String(r.labeler_name ?? "");
              meta.category = meta.category || "Medicine";
              meta.countryOfOrigin = meta.countryOfOrigin || "United States";
              meta.source = "US FDA NDC Directory";
              return;
            }
          } catch {
            /* try next NDC hyphenation */
          }
        }
      })(),
    );
  }

  for (const [label, host] of [
    ["OpenBeautyFacts", "world.openbeautyfacts.org"],
    ["OpenFoodFacts", "world.openfoodfacts.org"],
  ] as const) {
    tasks.push(
      (async () => {
        try {
          const data = await fetchJsonSafe(
            label,
            `https://${host}/api/v2/product/${encodeURIComponent(gtin)}.json`,
          );
          if (data?.status === 1 && data?.product) {
            const prod = data.product;
            meta.name =
              meta.name ||
              String(prod.product_name ?? prod.generic_name ?? "").trim();
            meta.manufacturer =
              meta.manufacturer || String(prod.brands ?? "").trim();
            meta.packSize =
              meta.packSize || String(prod.quantity ?? "").trim();
            meta.countryOfOrigin =
              meta.countryOfOrigin || String(prod.countries ?? "").trim();
            meta.category =
              meta.category ||
              (label === "OpenBeautyFacts"
                ? "Skin care and cosmetics"
                : undefined);
            meta.source = meta.source || label;
          }
        } catch {
          /* ignore miss */
        }
      })(),
    );
  }

  await Promise.allSettled(tasks);

  if (!meta.name) {
    try {
      const web = await searchWebGeneral(`"${gtin}"`, { limit: 4 });
      const top = web.results[0];
      if (top) {
        meta.name = top.title.replace(/\s*[|\-–].*$/, "").slice(0, 120);
        meta.source = "Web barcode lookup";
      }
    } catch {
      /* ignore */
    }
  }

  return meta.name || meta.derivedUsNdc ? meta : null;
}

/* ---------- Individual Registry Verifiers ---------- */

async function checkNafdac(
  input: VerifyProductInput,
  parsedCodes: ReturnType<typeof extractRegulatoryCodes>,
): Promise<{
  findings: RegistrySourceFinding[];
  flags: RegulatoryAlertFlag[];
  okCalls: number;
  failedCalls: number;
}> {
  const findings: RegistrySourceFinding[] = [];
  const flags: RegulatoryAlertFlag[] = [];
  let okCalls = 0;
  let failedCalls = 0;

  const rawNafdac = input.nafdacCode || parsedCodes.nafdac;
  const cls = rawNafdac ? classifyNafdacCode(rawNafdac) : null;
  const category = input.category ?? "Medicine";

  // 1. Prefix vs Claimed Category Safeguard ("Yoghurt Number" counterfeit catch)
  if (cls) {
    if (cls.domain === "food_beverage" && MEDICAL_CATEGORIES.has(category)) {
      flags.push({
        code: "CATEGORY_MISMATCH",
        severity: "danger",
        title: "Counterfeit alert: Food/Beverage NAFDAC prefix on medical product",
        detail: `Code ${cls.normalized} uses a Food/Beverage prefix (e.g. yoghurt, drinks, packaged foods), not a registered pharmaceutical or medical device prefix. Reject this batch until verified directly with NAFDAC.`,
      });
    } else if (cls.domain === "cosmetic" && category === "Medicine") {
      flags.push({
        code: "CATEGORY_MISMATCH",
        severity: "danger",
        title: "Category mismatch: Cosmetic NAFDAC prefix on claimed medicine",
        detail: `Code ${cls.normalized} is structured for cosmetics/topicals rather than registered systemic drugs.`,
      });
    }
    if (cls.isListedL || cls.domain === "herbal_listed") {
      flags.push({
        code: "HERBAL_LISTED_ONLY",
        severity: "info",
        title: "NAFDAC Listed (L) herbal/traditional product",
        detail:
          "NAFDAC numbers ending in 'L' or prefixed with A7- indicate traditional/herbal products evaluated for safety listing rather than clinical drug efficacy trials.",
      });
    }
  }

  const queries: string[] = [];
  if (cls?.normalized) queries.push(`"${cls.normalized}"`);
  const cleanName = input.name.replace(/"/g, "").trim();
  if (cleanName.length >= 3) {
    queries.push(
      `"${cleanName}"${input.genericName ? ` ${input.genericName}` : ""}`,
    );
  }
  if (!queries.length) return { findings, flags, okCalls, failedCalls };

  await politeThrottle("nafdac.gov.ng", 1200);

  const searchRes = await Promise.allSettled(
    queries.slice(0, 2).map((q) =>
      searchWebGeneral(q, {
        limit: 6,
        country: "NG",
        includeDomains: [
          "greenbook.nafdac.gov.ng",
          "nafdac.gov.ng",
        ],
      }),
    ),
  );

  const combinedHits: Array<{ title: string; url: string; description: string }> =
    [];
  const seen = new Set<string>();
  for (const r of searchRes) {
    if (r.status === "fulfilled") {
      if (r.value.errors.length === 0 || r.value.results.length > 0) okCalls++;
      else failedCalls++;
      for (const hit of r.value.results) {
        if (!seen.has(hit.url)) {
          seen.add(hit.url);
          combinedHits.push(hit);
        }
      }
    } else {
      failedCalls++;
    }
  }

  // Enrich top Greenbook or NAFDAC public alert snippet via polite scraper when helpful
  if (combinedHits[0] && combinedHits[0].description.length < 180) {
    try {
      const scraped = await scrapeWebPage(combinedHits[0].url, {
        timeoutMs: 9000,
      });
      if (scraped?.text) {
        combinedHits[0] = {
          ...combinedHits[0],
          description: `${combinedHits[0].description} ${scraped.text.slice(0, 500)}`.trim(),
        };
      }
    } catch {
      /* keep search snippet */
    }
  }

  const claimTokens = [
    ...cleanTokens(input.name),
    ...cleanTokens(input.genericName ?? ""),
  ];

  for (const hit of combinedHits) {
    const text = `${hit.title} ${hit.description}`;
    const lower = text.toLowerCase();
    const isHerbal = hit.url.includes("herbal-products-database");
    const isGreenbook = hit.url.includes("greenbook.nafdac.gov.ng");
    const isAlert =
      hit.url.includes("public-alert") ||
      hit.url.includes("recall") ||
      hit.url.includes("press-release");

    const codeInText =
      cls?.normalized &&
      lower.replace(/[\s/]/g, "-").includes(cls.normalized.toLowerCase());
    const matchedClaimTokens = claimTokens.filter((t) => lower.includes(t));

    if (isAlert && RECALL_WORDS_RE.test(lower) && (codeInText || matchedClaimTokens.length > 0)) {
      findings.push({
        registry: "NAFDAC Public Alerts",
        status: "recalled",
        title: hit.title.slice(0, 140),
        detail: hit.description.slice(0, 280),
        code: cls?.normalized,
        url: safeUrl(hit.url),
        sourceAttribution: "Source: NAFDAC Public Safety Alerts (nafdac.gov.ng)",
      });
      flags.push({
        code: "ACTIVE_RECALL",
        severity: "danger",
        title: "NAFDAC public safety / recall alert matched",
        detail: `${hit.title}: ${hit.description.slice(0, 200)}`,
      });
      continue;
    }

    // Entity mismatch detector ("Yoghurt Number"): exact NAFDAC code matches a NAFDAC listing whose name conflicts completely
    if (
      codeInText &&
      claimTokens.length > 0 &&
      matchedClaimTokens.length === 0 &&
      (FOOD_WORDS_RE.test(lower) || MEDICAL_CATEGORIES.has(category))
    ) {
      flags.push({
        code: "ENTITY_MISMATCH",
        severity: "danger",
        title: "Counterfeit alert: NAFDAC code belongs to a different product",
        detail: `NAFDAC record for ${cls?.normalized} references "${hit.title.slice(0, 100)}", which does not match "${input.name}".`,
      });
      findings.push({
        registry: isHerbal ? "NAFDAC Herbal & Traditional" : "NAFDAC Greenbook",
        status: "warning",
        title: `Mismatch on ${cls?.normalized}: ${hit.title.slice(0, 100)}`,
        detail: hit.description.slice(0, 260),
        code: cls?.normalized,
        url: safeUrl(hit.url),
        sourceAttribution: isHerbal
          ? "Source: NAFDAC Herbal Database (Public Registry)"
          : "Source: NAFDAC Greenbook (Public Registry)",
      });
      continue;
    }

    if (matchedClaimTokens.length > 0 || codeInText) {
      const expired = EXPIRED_LICENCE_RE.test(lower);
      if (expired) {
        flags.push({
          code: "EXPIRED_LICENCE",
          severity: "caution",
          title: "NAFDAC registration may be expired or discontinued",
          detail: `Registry text indicates expired/lapsed status for ${input.name}${cls ? ` (${cls.normalized})` : ""}. Confirm current renewal status before stocking.`,
        });
      }
      findings.push({
        registry: isHerbal ? "NAFDAC Herbal & Traditional" : "NAFDAC Greenbook",
        status: expired ? "warning" : "matched",
        title: hit.title.slice(0, 140),
        detail: hit.description.slice(0, 260),
        code: cls?.normalized,
        url: safeUrl(hit.url),
        sourceAttribution: isHerbal
          ? "Source: NAFDAC Herbal Database (nafdac.gov.ng)"
          : isGreenbook
            ? "Source: NAFDAC Greenbook (Public Registry)"
            : "Source: NAFDAC Portal (nafdac.gov.ng)",
      });
    }
  }

  return { findings, flags, okCalls, failedCalls };
}

async function checkUsFda(
  input: VerifyProductInput,
  parsedCodes: ReturnType<typeof extractRegulatoryCodes>,
  barcodeMeta: BarcodeMetadata | null,
): Promise<{
  findings: RegistrySourceFinding[];
  flags: RegulatoryAlertFlag[];
  okCalls: number;
  failedCalls: number;
}> {
  const findings: RegistrySourceFinding[] = [];
  const flags: RegulatoryAlertFlag[] = [];
  let okCalls = 0;
  let failedCalls = 0;

  // 1. Local US FDA Orange Book dataset (data/EOBZIP_2026_10)
  const ob = searchOrangeBook({
    query: input.name,
    ingredient: input.genericName,
    limit: 6,
  });
  if (ob.available && ob.entries.length > 0) {
    okCalls++;
    const top = ob.entries[0];
    findings.push({
      registry: "US FDA Orange Book",
      status: ob.allDiscontinued ? "discontinued" : "matched",
      title: `${top.tradeName} (${top.ingredient})`,
      detail: ob.allDiscontinued
        ? `Listed in FDA Orange Book solely as DISCN (Discontinued) by ${top.applicantFullName || top.applicant}, approval ${top.approvalDate}.`
        : `FDA Orange Book ${top.marketingType}: ${top.strength} ${top.dosageFormRoute} by ${top.applicantFullName || top.applicant} (Appl ${top.applType}${top.applNo}, approved ${top.approvalDate}).`,
      code: `${top.applType}${top.applNo}`,
      url: "https://www.accessdata.fda.gov/scripts/cder/ob/index.cfm",
      sourceAttribution: "Source: US FDA Orange Book (Public Dataset)",
    });
    if (ob.allDiscontinued) {
      flags.push({
        code: "DISCONTINUED_DRUG",
        severity: "caution",
        title: "Discontinued US FDA Orange Book listing",
        detail: `All matching Orange Book entries for "${input.name}" carry Type DISCN. Verify active manufacturing status before dispensing.`,
      });
    }
  }

  // 2. Live openFDA Drug NDC & Enforcement / Recall checks
  const searchName = input.name.replace(/"/g, "").trim();
  const generic = (input.genericName ?? "").replace(/"/g, "").trim();
  const ndcCode = parsedCodes.ndc || barcodeMeta?.derivedUsNdc;

  const queries: Promise<void>[] = [];

  if (searchName.length >= 3 || ndcCode) {
    const ndcQuery = ndcCode
      ? `product_ndc:"${ndcCode.split("-").slice(0, 2).join("-")}" OR brand_name:"${searchName}"`
      : generic
        ? `brand_name:"${searchName}" OR generic_name:"${generic}"`
        : `brand_name:"${searchName}" OR generic_name:"${searchName}"`;
    queries.push(
      (async () => {
        try {
          const data = await fetchJsonSafe(
            "openFDA-NDC",
            `https://api.fda.gov/drug/ndc.json?search=${encodeURIComponent(ndcQuery)}&limit=3`,
          );
          okCalls++;
          const r = data?.results?.[0];
          if (r) {
            findings.push({
              registry: "US FDA openFDA",
              status: "matched",
              title: `${r.brand_name ?? searchName} (${r.generic_name ?? generic ?? "Active"})`,
              detail: `${r.dosage_form ?? "Drug"} by ${r.labeler_name ?? "registered labeler"}${r.product_ndc ? ` (NDC ${r.product_ndc})` : ""}.`,
              code: r.product_ndc ? String(r.product_ndc) : undefined,
              url: "https://open.fda.gov/apis/drug/ndc/",
              sourceAttribution: "Source: openFDA Drug NDC Directory",
            });
          }
        } catch (err) {
          // 404 on openFDA means "no matching records", not a network outage
          if ((err as Error).message.includes("404")) okCalls++;
          else failedCalls++;
        }
      })(),
    );

    const isCosmetic = input.category === "Skin care and cosmetics";
    const enfEndpoint = isCosmetic
      ? "https://api.fda.gov/cosmetic/event.json"
      : "https://api.fda.gov/drug/enforcement.json";
    const enfQuery = isCosmetic
      ? `products.product_name:"${searchName}"`
      : `status:"Ongoing" AND (product_description:"${searchName}"${generic ? ` OR product_description:"${generic}"` : ""})`;

    queries.push(
      (async () => {
        try {
          const data = await fetchJsonSafe(
            "openFDA-Safety",
            `${enfEndpoint}?search=${encodeURIComponent(enfQuery)}&limit=2`,
          );
          okCalls++;
          const hit = data?.results?.[0];
          if (!isCosmetic && hit) {
            findings.push({
              registry: "US FDA openFDA",
              status: "recalled",
              title: `Ongoing FDA Recall: ${String(hit.recall_number ?? "")}`,
              detail: String(hit.reason_for_recall ?? hit.product_description ?? "").slice(0, 260),
              code: String(hit.recall_number ?? ""),
              url: "https://open.fda.gov/apis/drug/enforcement/",
              sourceAttribution: "Source: US FDA Drug Enforcement & Recalls",
            });
            flags.push({
              code: "ACTIVE_RECALL",
              severity: "danger",
              title: "Ongoing US FDA recall alert",
              detail: `${String(hit.classification ?? "Recall")}: ${String(hit.reason_for_recall ?? "").slice(0, 200)}`,
            });
          } else if (isCosmetic && hit && Number(data?.meta?.results?.total ?? 0) > 0) {
            findings.push({
              registry: "US FDA openFDA",
              status: "warning",
              title: "US FDA Cosmetic Adverse Event reports recorded",
              detail: `${data.meta.results.total} cosmetic event record(s) found matching "${searchName}". Check ingredients for banned/restricted bleaching agents.`,
              url: "https://open.fda.gov/apis/cosmetic/event/",
              sourceAttribution: "Source: US FDA Cosmetic Event Reporting",
            });
          }
        } catch (err) {
          if ((err as Error).message.includes("404")) okCalls++;
          else failedCalls++;
        }
      })(),
    );
  }

  await Promise.allSettled(queries);
  return { findings, flags, okCalls, failedCalls };
}

async function checkHealthCanada(
  input: VerifyProductInput,
  parsedCodes: ReturnType<typeof extractRegulatoryCodes>,
): Promise<{
  findings: RegistrySourceFinding[];
  okCalls: number;
  failedCalls: number;
}> {
  const findings: RegistrySourceFinding[] = [];
  const brand = input.name.split(/\s+/)[0]?.replace(/[^A-Za-z0-9-]/g, "") ?? "";
  if (brand.length < 3 && !parsedCodes.hcDin) {
    return { findings, okCalls: 0, failedCalls: 0 };
  }

  try {
    const param = parsedCodes.hcDin
      ? `din=${encodeURIComponent(parsedCodes.hcDin.replace(/^(DIN|NPN)/i, ""))}`
      : `brandname=${encodeURIComponent(brand)}`;
    const products = (await fetchJsonSafe(
      "HealthCanada-DPD",
      `https://health-products.canada.ca/api/drug/drugproduct/?${param}`,
    )) as Array<{
      drug_code?: number;
      brand_name?: string;
      company_name?: string;
      drug_identification_number?: string;
    }>;

    if (Array.isArray(products) && products.length > 0) {
      const p = products[0];
      let statusLabel = "Listed";
      if (p.drug_code) {
        try {
          const st = (await fetchJsonSafe(
            "HealthCanada-Status",
            `https://health-products.canada.ca/api/drug/status/?id=${p.drug_code}`,
          )) as { status?: string };
          if (st?.status) statusLabel = st.status;
        } catch {
          /* ignore status lookup error */
        }
      }
      const isCancelled = /cancel|dormant/i.test(statusLabel);
      findings.push({
        registry: "Health Canada DPD",
        status: isCancelled ? "discontinued" : "matched",
        title: `${p.brand_name ?? input.name} (DIN ${p.drug_identification_number ?? ""})`,
        detail: `Status: ${statusLabel} · Company: ${p.company_name ?? "N/A"}.`,
        code: p.drug_identification_number,
        url: "https://health-products.canada.ca/dpd-bdpp/",
        sourceAttribution: "Source: Health Canada Drug Product Database (DPD)",
      });
    }
    return { findings, okCalls: 1, failedCalls: 0 };
  } catch {
    return { findings, okCalls: 0, failedCalls: 1 };
  }
}

async function checkGlobalAndChina(
  input: VerifyProductInput,
  parsedCodes: ReturnType<typeof extractRegulatoryCodes>,
): Promise<{
  findings: RegistrySourceFinding[];
  flags: RegulatoryAlertFlag[];
  okCalls: number;
  failedCalls: number;
}> {
  const findings: RegistrySourceFinding[] = [];
  const flags: RegulatoryAlertFlag[] = [];
  let okCalls = 0;
  let failedCalls = 0;

  const isChinaOrigin =
    /china|prc|shanghai|guangdong|beijing|hebei|zhejiang|jiangsu|front pharmaceutical/i.test(
      `${input.countryOfOrigin ?? ""} ${input.manufacturer ?? ""}`,
    ) ||
    Boolean(parsedCodes.guoyaoZhunzi) ||
    Boolean(parsedCodes.chineseCosmetic);

  if (parsedCodes.guoyaoZhunzi) {
    if (
      parsedCodes.guoyaoKind === "supplement_health_food" &&
      input.category === "Medicine"
    ) {
      flags.push({
        code: "CATEGORY_MISMATCH",
        severity: "danger",
        title: "China NMPA 'B' (Health Food/Supplement) vs Medicine claim",
        detail: `${parsedCodes.guoyaoZhunzi} carries the 'B' supplement prefix rather than H/Z/S/J pharmaceutical approval.`,
      });
    }
    findings.push({
      registry: "China NMPA",
      status: "matched",
      title: `NMPA Format Validated: ${parsedCodes.guoyaoZhunzi}`,
      detail: `Classification: ${parsedCodes.guoyaoKind?.replace(/_/g, " ") ?? "drug"}.${parsedCodes.cnTraceability20 ? ` Traceability code ${parsedCodes.cnTraceability20} detected.` : ""}`,
      code: parsedCodes.guoyaoZhunzi,
      url: "https://www.nmpa.gov.cn/",
      sourceAttribution: "Source: China NMPA Regulatory Format Check",
    });
  }

  if (
    isChinaOrigin &&
    input.category === "Medicine" &&
    !parsedCodes.cnTraceability20
  ) {
    flags.push({
      code: "MISSING_CN_TRACEABILITY",
      severity: "caution",
      title: "20-digit Chinese drug traceability code not detected",
      detail:
        "Pharmaceuticals produced for or in mainland China normally carry a 20-digit electronic traceability barcode/number (often starting with 8). Inspect the physical carton carefully.",
    });
  }

  // Targeted search across UK MHRA, China NMPA, EMA, India CDSCO, Australia TGA, SAHPRA
  const domains = [
    "products.mhra.gov.uk",
    "gov.uk",
    "ema.europa.eu",
    "cdsco.gov.in",
    "tga.gov.au",
    "sahpra.org.za",
    ...(isChinaOrigin ? ["nmpa.gov.cn"] : []),
  ];
  const term =
    parsedCodes.mhraPl ||
    parsedCodes.guoyaoZhunzi ||
    input.name.replace(/"/g, "").trim();
  if (term.length >= 3) {
    try {
      const res = await searchWebGeneral(`"${term}"`, {
        limit: 5,
        includeDomains: domains,
      });
      if (res.results.length > 0 || res.errors.length === 0) okCalls++;
      else failedCalls++;

      for (const hit of res.results.slice(0, 3)) {
        const lower = `${hit.title} ${hit.description}`.toLowerCase();
        const isRecalled = RECALL_WORDS_RE.test(lower);
        const host = new URL(hit.url).hostname.toLowerCase();
        const registry: RegistrySourceFinding["registry"] = host.includes(
          "nmpa.gov.cn",
        )
          ? "China NMPA"
          : host.includes("mhra") || host.includes("gov.uk")
            ? "UK MHRA"
            : "Global Pharmacovigilance";

        findings.push({
          registry,
          status: isRecalled ? "recalled" : "matched",
          title: hit.title.slice(0, 140),
          detail: hit.description.slice(0, 260),
          code: parsedCodes.mhraPl || parsedCodes.guoyaoZhunzi,
          url: safeUrl(hit.url),
          sourceAttribution: `Source: ${host.replace(/^www\./, "")} (Public Registry)`,
        });
        if (isRecalled) {
          flags.push({
            code: "ACTIVE_RECALL",
            severity: "danger",
            title: `Global pharmacovigilance alert (${registry})`,
            detail: `${hit.title}: ${hit.description.slice(0, 200)}`,
          });
        }
      }
    } catch {
      failedCalls++;
    }
  }

  return { findings, flags, okCalls, failedCalls };
}

/* ---------- Main Orchestrator with 7-Day Cache & Stale Fallback ---------- */

export async function verifyHealthProduct(
  rawInput: VerifyProductInput,
): Promise<RegulatoryReport> {
  const combinedText = [
    rawInput.name,
    rawInput.genericName,
    rawInput.nafdacCode,
    rawInput.barcode,
    rawInput.foreignCode,
    rawInput.manufacturer,
  ]
    .filter(Boolean)
    .join(" ");
  const parsedCodes = extractRegulatoryCodes(combinedText);
  const input: VerifyProductInput = {
    ...rawInput,
    nafdacCode: rawInput.nafdacCode || parsedCodes.nafdac,
    barcode: rawInput.barcode || parsedCodes.barcode,
  };
  const cacheKey = buildCacheKey(input);

  // Check PostgreSQL 7-day regulatory_cache
  let cachedRow: { payload: RegulatoryReport; checked_at: Date } | null = null;
  try {
    const rows = await query<{ payload: RegulatoryReport; checked_at: Date }>(
      "select payload, checked_at from regulatory_cache where cache_key = $1 limit 1",
      [cacheKey],
    );
    cachedRow = rows[0] ?? null;
    if (
      cachedRow &&
      !input.forceRefresh &&
      Date.now() - new Date(cachedRow.checked_at).getTime() <= SEVEN_DAYS_MS
    ) {
      return applyPhysicalExpiryCheck(
        { ...cachedRow.payload, cached: true, staleFallback: false },
        input.expiresOn,
      );
    }
  } catch {
    /* ignore cache read failure and verify live */
  }

  const barcodeMeta = input.barcode
    ? await lookupBarcodeMetadata(input.barcode).catch(() => null)
    : null;

  const enrichedInput: VerifyProductInput = {
    ...input,
    name: input.name || barcodeMeta?.name || input.barcode || "Unknown product",
    genericName: input.genericName || barcodeMeta?.genericName,
    manufacturer: input.manufacturer || barcodeMeta?.manufacturer,
    countryOfOrigin: input.countryOfOrigin || barcodeMeta?.countryOfOrigin,
    category: input.category || barcodeMeta?.category,
  };

  const [nafdacRes, fdaRes, hcRes, globalRes] = await Promise.allSettled([
    checkNafdac(enrichedInput, parsedCodes),
    checkUsFda(enrichedInput, parsedCodes, barcodeMeta),
    checkHealthCanada(enrichedInput, parsedCodes),
    checkGlobalAndChina(enrichedInput, parsedCodes),
  ]);

  const findings: RegistrySourceFinding[] = [];
  const flags: RegulatoryAlertFlag[] = [];
  let okCalls = 0;
  let failedCalls = 0;

  if (barcodeMeta?.name) {
    findings.push({
      registry: "Barcode Registry",
      status: "matched",
      title: `${barcodeMeta.name}${barcodeMeta.packSize ? ` (${barcodeMeta.packSize})` : ""}`,
      detail: `GTIN ${barcodeMeta.barcode}${barcodeMeta.manufacturer ? ` · ${barcodeMeta.manufacturer}` : ""}`,
      code: barcodeMeta.barcode,
      sourceAttribution: `Source: ${barcodeMeta.source ?? "Global Barcode Registry"}`,
    });
  }

  for (const r of [nafdacRes, fdaRes, globalRes]) {
    if (r.status === "fulfilled") {
      findings.push(...r.value.findings);
      flags.push(...r.value.flags);
      okCalls += r.value.okCalls;
      failedCalls += r.value.failedCalls;
    } else {
      failedCalls++;
    }
  }
  if (hcRes.status === "fulfilled") {
    findings.push(...hcRes.value.findings);
    okCalls += hcRes.value.okCalls;
    failedCalls += hcRes.value.failedCalls;
  } else {
    failedCalls++;
  }

  // Live outage fallback to last known cached record (> 7 days old) with explicit warning
  if (okCalls === 0 && failedCalls > 0 && cachedRow) {
    const staleDate = new Date(cachedRow.checked_at).toLocaleDateString(
      "en-NG",
      { year: "numeric", month: "short", day: "numeric" },
    );
    return applyPhysicalExpiryCheck(
      {
        ...cachedRow.payload,
        cached: true,
        staleFallback: true,
        staleFromDate: staleDate,
        flags: [
          {
            code: "STALE_CACHE_FALLBACK",
            severity: "caution",
            title: "Live verification unavailable — showing cached record",
            detail: `Live registry checks timed out or were unreachable. Showing cached public record from ${staleDate}.`,
          },
          ...cachedRow.payload.flags,
        ],
      },
      input.expiresOn,
    );
  }

  const regFindings = findings.filter(
    (f) => f.registry !== "Barcode Registry",
  );
  const confirmedFindings = regFindings.filter(
    (f) => f.status === "matched" || f.status === "discontinued",
  );
  const hasNafdacMatch = findings.some(
    (f) =>
      (f.registry === "NAFDAC Greenbook" ||
        f.registry === "NAFDAC Herbal & Traditional") &&
      f.status === "matched",
  );

  if (confirmedFindings.length > 0 && !hasNafdacMatch) {
    flags.push({
      code: "IMPORT_UNLISTED_LOCALLY",
      severity: "info",
      title: "Verified abroad — local NAFDAC Greenbook entry not confirmed",
      detail:
        "Listed on an international regulatory database (such as US FDA, Health Canada, UK MHRA, or NMPA), while no live NAFDAC Greenbook entry matched. Confirm local import authorization where applicable.",
    });
  }

  if (confirmedFindings.length === 0) {
    flags.push({
      code: "UNLISTED_PRODUCT",
      severity: "caution",
      title: "No documented regulatory listing found",
      detail: MANDATORY_UNLISTED_WARNING,
    });
  }

  const hasDanger = flags.some((f) => f.severity === "danger");
  const hasCaution = flags.some(
    (f) => f.severity === "caution" || f.code === "EXPIRED_LICENCE",
  );

  let verdict: RegulatoryVerdict;
  if (hasDanger) verdict = "danger";
  else if (confirmedFindings.length === 0) verdict = "unverified";
  else if (hasCaution) verdict = "caution";
  else verdict = "verified";

  const nafdacCls = enrichedInput.nafdacCode
    ? classifyNafdacCode(enrichedInput.nafdacCode)
    : undefined;

  const foreignCodes = [
    parsedCodes.ndc,
    parsedCodes.guoyaoZhunzi,
    parsedCodes.chineseCosmetic,
    parsedCodes.cnTraceability20,
    parsedCodes.mhraPl,
    parsedCodes.hcDin,
  ].filter((v): v is string => Boolean(v));

  let headline = "Unlisted across checked public registries";
  if (verdict === "danger") {
    headline =
      flags.find((f) => f.severity === "danger")?.title ??
      "Red Flag: Safety or authenticity warning";
  } else if (verdict === "verified") {
    headline = hasNafdacMatch
      ? "Registered on NAFDAC public registry"
      : `Listed on ${confirmedFindings[0].registry}`;
  } else if (verdict === "caution") {
    headline =
      flags.find((f) => f.severity === "caution")?.title ??
      "Review caution notices before stocking";
  }

  const summary =
    verdict === "unverified"
      ? MANDATORY_UNLISTED_WARNING
      : confirmedFindings
          .slice(0, 3)
          .map((f) => `${f.registry}: ${f.title}`)
          .join(" · ") || flags[0]?.detail || "";

  let report: RegulatoryReport = {
    query: enrichedInput.name,
    verdict,
    headline,
    summary,
    nafdacCode: nafdacCls?.normalized,
    nafdacPrefixDomain: nafdacCls?.domain,
    barcode: enrichedInput.barcode || undefined,
    foreignCodes: foreignCodes.length ? foreignCodes : undefined,
    manufacturer: enrichedInput.manufacturer || undefined,
    countryOfOrigin: enrichedInput.countryOfOrigin || undefined,
    findings,
    flags,
    checkedAt: new Date().toISOString(),
    cached: false,
    staleFallback: false,
    unlistedWarning:
      confirmedFindings.length === 0 ? MANDATORY_UNLISTED_WARNING : undefined,
    disclaimer: PERMANENT_VERIFICATION_DISCLAIMER,
  };

  try {
    // Store without batch-specific EXPIRED_PACK flag so cache stays product-level
    await query(
      `insert into regulatory_cache (cache_key, query_label, payload, checked_at)
       values ($1, $2, $3::jsonb, now())
       on conflict (cache_key)
       do update set query_label = excluded.query_label,
                     payload = excluded.payload,
                     checked_at = now()`,
      [cacheKey, enrichedInput.name.slice(0, 160), JSON.stringify(report)],
    );
  } catch {
    /* ignore cache persistence error */
  }

  report = applyPhysicalExpiryCheck(report, enrichedInput.expiresOn);
  return report;
}
