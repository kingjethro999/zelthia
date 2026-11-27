import "server-only";
import { createHash, randomUUID } from "node:crypto";
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
import { countryName } from "./geo";
import {
  greenbookByName,
  greenbookByNrn,
  type GreenbookRecord,
} from "./greenbook";
import { fetchService, politeThrottle } from "./http";
import { searchMhraSafetyPars } from "./mhra";
import { queryOpenFdaComprehensive } from "./openfda";
import { searchWebGeneral } from "./web-search";

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

const GLOBAL_RECALL_RE =
  /\b(recall|recalled|counterfeit|falsified|withdrawn|banned|suspended)\b/i;

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
  /**
   * ISO country of the person checking. Their own regulator's register decides
   * the verdict (NAFDAC for NG, FDA for US, MHRA for GB, Health Canada for CA);
   * every other register is still searched for wider evidence.
   */
  userCountry?: string;
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
    // Bump when verdict rules change so older cached verdicts are not reused.
    "v3",
    (input.userCountry ?? "NG").toUpperCase(),
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

export function applyPhysicalExpiryCheck(
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
  const gtin =
    scanned.ean13 ??
    scanned.upcA ??
    scanned.gtin ??
    rawBarcode.replace(/\D/g, "");
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
              meta.name =
                meta.name || String(r.brand_name ?? r.generic_name ?? "");
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
            meta.packSize = meta.packSize || String(prod.quantity ?? "").trim();
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

/** Tokens of the claimed product that appear in `text`. */
function overlapTokens(claim: string[], text: string): string[] {
  const lower = text.toLowerCase();
  return claim.filter((t) => lower.includes(t));
}

const GREENBOOK_ATTRIBUTION = "Source: NAFDAC Greenbook (Public Registry)";

function describeRecord(rec: GreenbookRecord): string {
  return [
    rec.ingredient && `Active ingredient: ${rec.ingredient}`,
    rec.strength && `Strength: ${rec.strength}`,
    rec.applicant && `Holder: ${rec.applicant}`,
    rec.status && `Status: ${rec.status}`,
    rec.expiryDate && `Registration valid to ${rec.expiryDate}`,
  ]
    .filter(Boolean)
    .join(" · ");
}

async function checkNafdac(
  input: VerifyProductInput,
  parsedCodes: ReturnType<typeof extractRegulatoryCodes>,
): Promise<{
  findings: RegistrySourceFinding[];
  flags: RegulatoryAlertFlag[];
  okCalls: number;
  failedCalls: number;
  /** True when the NAFDAC side answered at least once. */
  reached: boolean;
}> {
  const findings: RegistrySourceFinding[] = [];
  const flags: RegulatoryAlertFlag[] = [];
  let okCalls = 0;
  let failedCalls = 0;

  const rawNafdac = input.nafdacCode || parsedCodes.nafdac;
  const cls = rawNafdac ? classifyNafdacCode(rawNafdac) : null;
  const category = input.category ?? "Medicine";
  const today = new Date().toISOString().slice(0, 10);
  const cleanName = input.name.replace(/"/g, "").trim();
  const claimTokens = [
    ...new Set([
      ...cleanTokens(input.name),
      ...cleanTokens(input.genericName ?? ""),
    ]),
  ];

  // 1. Prefix vs claimed category ("yoghurt number" on a medicine pack)
  if (cls) {
    if (cls.domain === "food_beverage" && MEDICAL_CATEGORIES.has(category)) {
      flags.push({
        code: "CATEGORY_MISMATCH",
        severity: "danger",
        title:
          "Counterfeit alert: Food/Beverage NAFDAC prefix on medical product",
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
    if (cls.isListedL) {
      flags.push({
        code: "HERBAL_LISTED_ONLY",
        severity: "info",
        title: "NAFDAC Listed (L) product",
        detail:
          "NAFDAC numbers ending in 'L' are listed products (often herbal, traditional or nutraceutical) evaluated for safety listing rather than full clinical efficacy review.",
      });
    }
  }

  // The Greenbook covers drugs, biologics, devices, veterinary, herbals,
  // nutraceuticals and disinfectants. Cosmetics and food are not on it.
  const greenbookCovers =
    !cls || (cls.domain !== "cosmetic" && cls.domain !== "food_beverage");

  let reached = false;
  let codeFound = false;
  let codeChecked = false;

  // 2. Exact registration number lookup on the Greenbook
  if (cls && greenbookCovers) {
    try {
      const recs = await greenbookByNrn(cls.normalized);
      okCalls++;
      reached = true;
      codeChecked = true;
      for (const rec of recs.slice(0, 2)) {
        codeFound = true;
        const overlap = overlapTokens(
          claimTokens,
          `${rec.productName} ${rec.ingredient}`,
        );
        if (claimTokens.length > 0 && overlap.length === 0) {
          flags.push({
            code: "ENTITY_MISMATCH",
            severity: "danger",
            title:
              "Counterfeit alert: NAFDAC number belongs to a different product",
            detail: `On the NAFDAC Greenbook, ${cls.normalized} is registered to "${rec.productName}"${rec.applicant ? ` (${rec.applicant})` : ""}, not "${input.name}". Do not accept or use this pack until NAFDAC or a licensed pharmacist confirms it.`,
          });
          findings.push({
            registry: "NAFDAC Greenbook",
            status: "warning",
            evidence: "code",
            title: `${cls.normalized} is registered to ${rec.productName}`,
            detail: describeRecord(rec),
            code: rec.nrn,
            url: rec.url,
            sourceAttribution: GREENBOOK_ATTRIBUTION,
          });
          continue;
        }
        const lapsed = Boolean(rec.expiryDate && rec.expiryDate < today);
        if (lapsed) {
          flags.push({
            code: "EXPIRED_LICENCE",
            severity: "caution",
            title: "NAFDAC registration validity date has passed",
            detail: `The Greenbook shows ${rec.nrn} valid to ${rec.expiryDate}${rec.status ? ` with status "${rec.status}"` : ""}. Confirm the renewal with NAFDAC before stocking.`,
          });
        }
        findings.push({
          registry: "NAFDAC Greenbook",
          status: lapsed ? "warning" : "matched",
          evidence: "code",
          title: `${rec.productName} (${rec.nrn})`,
          detail: describeRecord(rec),
          code: rec.nrn,
          url: rec.url,
          sourceAttribution: GREENBOOK_ATTRIBUTION,
        });
      }
    } catch (err) {
      failedCalls++;
      console.warn("Greenbook NRN lookup failed", (err as Error).message);
    }
  } else if (cls && !greenbookCovers) {
    flags.push({
      code: "NAFDAC_NOT_COVERED",
      severity: "info",
      title: "Cosmetic and food numbers are not on the NAFDAC Greenbook",
      detail: `NAFDAC does not publish ${cls.domain === "cosmetic" ? "cosmetic" : "food"} registrations on the Greenbook, so ${cls.normalized} could not be checked against it directly. Zelthia searched NAFDAC's public pages instead.`,
    });
  }

  // 3. Name lookup on the Greenbook when the number did not settle it
  let nameRecords: GreenbookRecord[] = [];
  if (!codeFound && cleanName.length >= 3 && greenbookCovers) {
    try {
      const recs = await greenbookByName(cleanName);
      okCalls++;
      reached = true;
      const brandTokens = cleanTokens(input.name);
      const needed = Math.min(2, brandTokens.length);
      nameRecords = recs
        .filter(
          (rec) =>
            needed > 0 &&
            overlapTokens(brandTokens, rec.productName).length >= needed,
        )
        .slice(0, 3);
      for (const rec of nameRecords) {
        findings.push({
          registry: "NAFDAC Greenbook",
          status: "matched",
          evidence: "name",
          title: `${rec.productName} (${rec.nrn})`,
          detail: describeRecord(rec),
          code: rec.nrn,
          url: rec.url,
          sourceAttribution: GREENBOOK_ATTRIBUTION,
        });
      }
    } catch (err) {
      failedCalls++;
      console.warn("Greenbook name lookup failed", (err as Error).message);
    }
  }

  if (cls && codeChecked && !codeFound) {
    const listedUnder = [...new Set(nameRecords.map((r) => r.nrn))];
    flags.push({
      code: "NAFDAC_CODE_NOT_FOUND",
      severity: "caution",
      title: `NAFDAC number ${cls.normalized} was not found on the Greenbook`,
      detail: `No active or renewing Greenbook registration carries ${cls.normalized}.${listedUnder.length ? ` The Greenbook lists "${nameRecords[0].productName}" under ${listedUnder.join(", ")}, not the number printed on this pack.` : ""} Zelthia cannot tell why it is missing. Do not rely on this number: consult a licensed pharmacy, clinic or hospital nearby, or confirm with NAFDAC, before using or stocking the product.`,
    });
    findings.push({
      registry: "NAFDAC Greenbook",
      status: "not_found",
      evidence: "code",
      title: `${cls.normalized}: no Greenbook record`,
      detail:
        "Searched the NAFDAC Greenbook registration-number column directly.",
      code: cls.normalized,
      url: "https://greenbook.nafdac.gov.ng/",
      sourceAttribution: GREENBOOK_ATTRIBUTION,
    });
  }

  // 4. NAFDAC public pages: recall and alert notices for every product, plus
  // registration hints for cosmetics/food (or when the Greenbook was down).
  const needsWebRegistration = !greenbookCovers || !reached;
  const queries: string[] = [];
  if (cls?.normalized && needsWebRegistration)
    queries.push(`"${cls.normalized}"`);
  if (cleanName.length >= 3) {
    queries.push(
      `"${cleanName}"${input.genericName ? ` ${input.genericName}` : ""}`,
    );
  }
  if (!queries.length) {
    return { findings, flags, okCalls, failedCalls, reached };
  }

  await politeThrottle("nafdac.gov.ng", 1200);

  const searchRes = await Promise.allSettled(
    queries.slice(0, 2).map((q) =>
      searchWebGeneral(q, {
        limit: 6,
        country: "NG",
        includeDomains: ["nafdac.gov.ng"],
      }),
    ),
  );

  const combinedHits: Array<{
    title: string;
    url: string;
    description: string;
  }> = [];
  const seen = new Set<string>();
  for (const r of searchRes) {
    if (r.status === "fulfilled") {
      if (r.value.errors.length === 0 || r.value.results.length > 0) {
        okCalls++;
        if (needsWebRegistration) reached = true;
      } else failedCalls++;
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

  for (const hit of combinedHits) {
    const text = `${hit.title} ${hit.description}`;
    const lower = text.toLowerCase();
    const isAlert =
      /public-alert|recall|press-release|safety-alert/.test(hit.url) ||
      /\b(public alert|recall)\b/i.test(hit.title);
    const codeInText =
      Boolean(cls?.normalized) &&
      new RegExp(
        `(^|[^a-z0-9])${cls!.normalized.toLowerCase().replace(/-/g, "[\\s/-]?")}($|[^a-z0-9])`,
      ).test(lower);
    const matched = overlapTokens(claimTokens, lower);
    const strongName =
      claimTokens.length > 0 &&
      matched.length >= Math.min(2, claimTokens.length);

    if (isAlert && RECALL_WORDS_RE.test(lower) && (codeInText || strongName)) {
      findings.push({
        registry: "NAFDAC Public Alerts",
        status: "recalled",
        evidence: codeInText ? "code" : "name",
        title: hit.title.slice(0, 140),
        detail: hit.description.slice(0, 280),
        code: cls?.normalized,
        url: safeUrl(hit.url),
        sourceAttribution:
          "Source: NAFDAC Public Safety Alerts (nafdac.gov.ng)",
      });
      flags.push({
        code: "ACTIVE_RECALL",
        severity: "danger",
        title: "NAFDAC public safety / recall alert matched",
        detail: `${hit.title}: ${hit.description.slice(0, 200)}`,
      });
      continue;
    }

    if (!needsWebRegistration || isAlert) continue;

    if (codeInText && claimTokens.length > 0 && matched.length === 0) {
      flags.push({
        code: "ENTITY_MISMATCH",
        severity: "danger",
        title: "Counterfeit alert: NAFDAC code belongs to a different product",
        detail: `A NAFDAC page for ${cls?.normalized} references "${hit.title.slice(0, 100)}", which does not match "${input.name}".`,
      });
      findings.push({
        registry: "NAFDAC Greenbook",
        status: "warning",
        evidence: "code",
        title: `Mismatch on ${cls?.normalized}: ${hit.title.slice(0, 100)}`,
        detail: hit.description.slice(0, 260),
        code: cls?.normalized,
        url: safeUrl(hit.url),
        sourceAttribution: "Source: NAFDAC Portal (nafdac.gov.ng)",
      });
      continue;
    }

    if (strongName || (codeInText && matched.length > 0)) {
      const expired = EXPIRED_LICENCE_RE.test(lower);
      if (expired) {
        flags.push({
          code: "EXPIRED_LICENCE",
          severity: "caution",
          title: "NAFDAC registration may be expired or discontinued",
          detail: `NAFDAC page text indicates expired/lapsed status for ${input.name}${cls ? ` (${cls.normalized})` : ""}. Confirm current renewal status before stocking.`,
        });
      }
      findings.push({
        registry: "NAFDAC Greenbook",
        status: expired ? "warning" : "matched",
        evidence: codeInText ? "code" : "name",
        title: hit.title.slice(0, 140),
        detail: hit.description.slice(0, 260),
        code: cls?.normalized,
        url: safeUrl(hit.url),
        sourceAttribution: "Source: NAFDAC Portal (nafdac.gov.ng)",
      });
    }
  }

  return { findings, flags, okCalls, failedCalls, reached };
}

async function checkUsFda(
  input: VerifyProductInput,
  parsedCodes: ReturnType<typeof extractRegulatoryCodes>,
  barcodeMeta: BarcodeMetadata | null,
) {
  return queryOpenFdaComprehensive({
    name: input.name,
    genericName: input.genericName,
    category: input.category,
    ndcCode: parsedCodes.ndc || barcodeMeta?.derivedUsNdc,
  });
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
        evidence: parsedCodes.hcDin ? "code" : "name",
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
      evidence: "signal",
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

  // Cross-check indexed UK MHRA Safety Public Assessment Reports (2006–2026)
  const mhraPars = searchMhraSafetyPars(input.name, input.genericName);
  if (mhraPars.length > 0) {
    okCalls++;
    for (const par of mhraPars.slice(0, 2)) {
      findings.push({
        registry: "UK MHRA Safety PAR",
        status: "warning",
        evidence: "signal",
        title: `${par.title} (${par.year})`,
        detail:
          par.matchedReason ??
          "UK MHRA Safety Public Assessment Report assessing prescribing restrictions or safety risks.",
        url: safeUrl(par.url),
        sourceAttribution:
          "Source: UK MHRA Safety Public Assessment Reports (GOV.UK)",
      });
    }
    // Safety PARs are class-level advice (e.g. all paracetamol), not a
    // finding about this pack, so they inform rather than downgrade a verdict.
    flags.push({
      code: "MHRA_SAFETY_ASSESSMENT",
      severity: "info",
      title: `UK MHRA Safety Public Assessment Report (${mhraPars[0].year})`,
      detail: `${mhraPars[0].title}: ${mhraPars[0].matchedReason ?? "Review official MHRA safety restrictions and monitoring advice."}`,
    });
  }

  // Targeted search across UK MHRA, China NMPA, EMA, India CDSCO, Australia TGA, SAHPRA
  const domains = [
    "products.mhra.gov.uk",
    "gov.uk",
    "fda.gov",
    "canada.ca",
    "who.int",
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

      const brandTokens = cleanTokens(input.name);
      const relevant = res.results.filter(
        (hit) =>
          brandTokens.length > 0 &&
          overlapTokens(brandTokens, `${hit.title} ${hit.description}`)
            .length >= Math.min(2, brandTokens.length),
      );
      for (const hit of relevant.slice(0, 3)) {
        const lower = `${hit.title} ${hit.description}`.toLowerCase();
        // Regulator sites mention "alert" on almost every page; only a recall
        // or counterfeit notice that names this product counts as a recall.
        const nameTokens = cleanTokens(input.name);
        const isRecalled =
          GLOBAL_RECALL_RE.test(hit.title) &&
          nameTokens.length > 0 &&
          overlapTokens(nameTokens, lower).length >=
            Math.min(2, nameTokens.length);
        const host = new URL(hit.url).hostname.toLowerCase();
        const registry: RegistrySourceFinding["registry"] = host.includes(
          "nmpa.gov.cn",
        )
          ? "China NMPA"
          : host.includes("mhra") || host.endsWith("gov.uk")
            ? "UK MHRA"
            : "Global Pharmacovigilance";

        // A search hit on a regulator's site is context, not a registry
        // record, unless it is the MHRA product register itself.
        findings.push({
          registry,
          status: isRecalled ? "recalled" : "matched",
          evidence: host === "products.mhra.gov.uk" ? "name" : "signal",
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

const capitalise = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
const countryLabel = (code: string) => countryName(code);

/* ---------- Home register by country ---------- */

interface HomeRegister {
  /** Name shown to the person, e.g. "NAFDAC". */
  label: string;
  registries: RegistrySourceFinding["registry"][];
}

const HOME_REGISTERS: Record<string, HomeRegister> = {
  NG: {
    label: "NAFDAC",
    registries: ["NAFDAC Greenbook", "NAFDAC Herbal & Traditional"],
  },
  US: {
    label: "the US FDA",
    registries: ["US FDA Orange Book", "US FDA openFDA", "US FDA Drugs@FDA"],
  },
  GB: { label: "the UK MHRA", registries: ["UK MHRA"] },
  CA: { label: "Health Canada", registries: ["Health Canada DPD"] },
};

/** The register that decides the verdict for a country, or null if Zelthia doesn't check it yet. */
export function homeRegisterFor(country?: string): HomeRegister | null {
  return HOME_REGISTERS[(country ?? "NG").toUpperCase()] ?? null;
}

/* ---------- Report persistence ---------- */

/** Registries whose hits are context (safety signals, labels, news), never a listing. */
const SIGNAL_REGISTRIES = new Set<RegistrySourceFinding["registry"]>([
  "US FDA FAERS",
  "US FDA Labeling (SPL)",
  "UK MHRA Safety PAR",
  "Global Pharmacovigilance",
  "Barcode Registry",
]);

function evidenceOf(f: RegistrySourceFinding): "code" | "name" | "signal" {
  if (f.evidence) return f.evidence;
  return SIGNAL_REGISTRIES.has(f.registry) ? "signal" : "name";
}

/**
 * Stores an issued report so a later product save can prove the verdict came
 * from Zelthia and not from the browser. Returns the report with its id.
 */
async function issueReport(
  report: RegulatoryReport,
): Promise<RegulatoryReport> {
  const reportId = randomUUID();
  const issued = { ...report, reportId };
  try {
    await query(
      "insert into regulatory_reports (id, payload) values ($1, $2::jsonb)",
      [reportId, JSON.stringify(issued)],
    );
    if (Math.random() < 0.02) {
      void query(
        "delete from regulatory_reports where created_at < now() - interval '30 days'",
      ).catch(() => {});
    }
    return issued;
  } catch (err) {
    console.warn("Could not store regulatory report", (err as Error).message);
    return report;
  }
}

/** Loads a report Zelthia issued in the last 30 days, or null. */
export async function getIssuedReport(
  reportId: string,
): Promise<RegulatoryReport | null> {
  if (!/^[0-9a-f-]{36}$/i.test(reportId)) return null;
  const rows = await query<{ payload: RegulatoryReport }>(
    `select payload from regulatory_reports
      where id = $1 and created_at > now() - interval '30 days' limit 1`,
    [reportId],
  );
  return rows[0]?.payload ?? null;
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
  // Only a NAFDAC-shaped number goes to the Greenbook. Anything else typed in
  // the code box (a UK PL, a DIN, an NDC) is treated as a foreign code.
  const typedCode = rawInput.nafdacCode?.trim() ?? "";
  const typedIsNafdac = Boolean(
    typedCode && extractRegulatoryCodes(`NAFDAC ${typedCode}`).nafdac,
  );
  const input: VerifyProductInput = {
    ...rawInput,
    nafdacCode: (typedIsNafdac ? typedCode : "") || parsedCodes.nafdac,
    foreignCode:
      [rawInput.foreignCode, typedIsNafdac ? "" : typedCode]
        .filter(Boolean)
        .join(" ") || undefined,
    barcode: rawInput.barcode || parsedCodes.barcode,
  };
  const country = (input.userCountry ?? "NG").toUpperCase();
  const home = homeRegisterFor(country);
  const cacheKey = buildCacheKey(input);

  // Cached public-record result, refreshed live once it is older than 7 days
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
      return issueReport(
        applyPhysicalExpiryCheck(
          { ...cachedRow.payload, cached: true, staleFallback: false },
          input.expiresOn,
        ),
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
      evidence: "signal",
      title: `${barcodeMeta.name}${barcodeMeta.packSize ? ` (${barcodeMeta.packSize})` : ""}`,
      detail: `GTIN ${barcodeMeta.barcode}${barcodeMeta.manufacturer ? ` · ${barcodeMeta.manufacturer}` : ""}`,
      code: barcodeMeta.barcode,
      sourceAttribution: `Source: ${barcodeMeta.source ?? "Global Barcode Registry"}`,
    });
  }

  const nafdacOk = nafdacRes.status === "fulfilled" && nafdacRes.value.reached;
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

  for (const f of findings) f.evidence = evidenceOf(f);

  // "Reached" means the register that decides the verdict answered.
  const homeIds = new Set(home?.registries ?? []);
  const nafdacReached =
    country === "NG"
      ? nafdacOk
      : country === "US"
        ? fdaRes.status === "fulfilled" && fdaRes.value.okCalls > 0
        : country === "CA"
          ? hcRes.status === "fulfilled" && hcRes.value.okCalls > 0
          : okCalls > 0;
  const homeLabel = home?.label ?? "the registers we check";

  // Live outage: fall back to the last known record with an explicit warning
  if (!nafdacReached && cachedRow) {
    const staleDate = new Date(cachedRow.checked_at).toLocaleDateString(
      "en-NG",
      { year: "numeric", month: "short", day: "numeric" },
    );
    return issueReport(
      applyPhysicalExpiryCheck(
        {
          ...cachedRow.payload,
          cached: true,
          staleFallback: true,
          staleFromDate: staleDate,
          flags: [
            {
              code: "STALE_CACHE_FALLBACK",
              severity: "caution",
              title: "Live verification failed — showing cached record",
              detail: `${homeLabel} could not be reached just now. Showing the cached public record from ${staleDate}. Check again before relying on it.`,
            },
            ...cachedRow.payload.flags.filter(
              (f) => f.code !== "STALE_CACHE_FALLBACK",
            ),
          ],
        },
        input.expiresOn,
      ),
    );
  }

  const isListing = (f: RegistrySourceFinding) =>
    (f.status === "matched" || f.status === "discontinued") &&
    f.evidence !== "signal";
  const listings = findings.filter(isListing);
  const homeListings = home
    ? listings.filter((f) => homeIds.has(f.registry))
    : listings;
  const nafdacCodeMatch = listings.some(
    (f) => f.registry === "NAFDAC Greenbook" && f.evidence === "code",
  );
  const codeNotFound = flags.some((f) => f.code === "NAFDAC_CODE_NOT_FOUND");

  if (!nafdacReached) {
    flags.push({
      code: "VERIFICATION_UNAVAILABLE",
      severity: "caution",
      title: `${capitalise(homeLabel)} could not be checked right now`,
      detail: `${capitalise(homeLabel)} did not answer, so this result is incomplete. It does not mean the product is unlisted. Try again shortly, and consult a licensed pharmacy, clinic or hospital nearby before relying on it.`,
    });
  }

  if (
    home &&
    listings.length > 0 &&
    homeListings.length === 0 &&
    nafdacReached
  ) {
    flags.push({
      code: "IMPORT_UNLISTED_LOCALLY",
      severity: "caution",
      title: `Listed abroad, not confirmed with ${home.label}`,
      detail: `A product with this name appears on another country's register, but no ${home.label} record matched. A foreign listing says nothing about the pack in your hand. Ask a licensed pharmacist whether it is authorised where you are before using or stocking it.`,
    });
  }

  if (!home && listings.length > 0) {
    flags.push({
      code: "HOME_REGISTRY_NOT_COVERED",
      severity: "info",
      title: `Zelthia doesn't check ${countryLabel(country)}'s own register yet`,
      detail: `This product appears on ${listings[0].registry}. Your national regulator may list it under a different name or number, so confirm with a local pharmacist.`,
    });
  }

  if (listings.length === 0 && nafdacReached) {
    flags.push({
      code: "UNLISTED_PRODUCT",
      severity: "caution",
      title: "No documented regulatory listing found",
      detail: MANDATORY_UNLISTED_WARNING,
    });
  }

  const hasDanger = flags.some((f) => f.severity === "danger");
  const hasCaution = flags.some((f) => f.severity === "caution");

  let verdict: RegulatoryVerdict;
  if (hasDanger) verdict = "danger";
  else if (listings.length === 0) verdict = "unverified";
  else if (hasCaution || codeNotFound || homeListings.length === 0)
    verdict = "caution";
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

  let headline: string;
  if (verdict === "danger") {
    headline =
      flags.find((f) => f.severity === "danger")?.title ??
      "Red Flag: Safety or authenticity warning";
  } else if (verdict === "verified") {
    headline =
      country === "NG"
        ? nafdacCodeMatch
          ? "NAFDAC number matches the Greenbook record"
          : "Product name registered with NAFDAC — check the number on the pack"
        : `Listed on ${homeListings[0]?.registry ?? listings[0].registry}`;
  } else if (verdict === "caution") {
    headline =
      flags.find((f) => f.severity === "caution")?.title ??
      "Review caution notices before stocking";
  } else {
    headline = nafdacReached
      ? "Unlisted across checked public registries"
      : `Verification incomplete — ${homeLabel} unreachable`;
  }

  const summary =
    verdict === "unverified" && nafdacReached
      ? MANDATORY_UNLISTED_WARNING
      : listings
          .slice(0, 3)
          .map((f) => `${f.registry}: ${f.title}`)
          .join(" · ") ||
        flags[0]?.detail ||
        "";

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
      listings.length === 0 && nafdacReached
        ? MANDATORY_UNLISTED_WARNING
        : undefined,
    disclaimer: PERMANENT_VERIFICATION_DISCLAIMER,
    coverage: { ok: okCalls, failed: failedCalls },
  };

  // Only cache a result that reached the deciding register; an outage is not a record.
  if (nafdacReached) {
    try {
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
  }

  // Batch-specific pack expiry is applied after caching so the cache stays product-level
  report = applyPhysicalExpiryCheck(report, enrichedInput.expiresOn);
  return issueReport(report);
}
