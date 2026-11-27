import "server-only";
import type {
  RegulatoryAlertFlag,
  RegistrySourceFinding,
} from "@/lib/inventory-types";
import { fetchService } from "./http";
import { searchOrangeBook } from "./orange-book";

const API_TIMEOUT_MS = 8500;

async function fetchOpenFda(service: string, url: string) {
  const res = await fetchService(service, url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(API_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`${service} ${res.status}`);
  return res.json();
}

const is404 = (err: unknown) =>
  err instanceof Error && err.message.includes("404");

const firstText = (v: unknown, max = 260): string => {
  if (Array.isArray(v) && typeof v[0] === "string") {
    return v[0].replace(/\s+/g, " ").trim().slice(0, max);
  }
  if (typeof v === "string") {
    return v.replace(/\s+/g, " ").trim().slice(0, max);
  }
  return "";
};

export interface OpenFdaComprehensiveResult {
  findings: RegistrySourceFinding[];
  flags: RegulatoryAlertFlag[];
  boxedWarningSummary?: string;
  topFaersReactions: string[];
  okCalls: number;
  failedCalls: number;
}

/**
 * Queries US FDA Orange Book (EOBZIP_2026_10) alongside all 7 openFDA REST endpoints
 * documented in /data/fields*.yaml & /data/openFDA*.html:
 * 1. drug/ndc.json        (NDC product directory)
 * 2. drug/drugsfda.json   (NDA/ANDA/BLA approvals & marketing status)
 * 3. drug/label.json      (SPL labeling, boxed warnings, contraindications)
 * 4. drug/event.json      (FAERS post-market adverse event MedDRA signals)
 * 5. drug/enforcement.json (Ongoing drug recalls)
 * 6. food/enforcement.json (Ongoing food/supplement/herbal recalls)
 * 7. cosmetic/event.json  (CAERS cosmetic adverse events)
 */
export async function queryOpenFdaComprehensive(opts: {
  name: string;
  genericName?: string;
  category?: string;
  ndcCode?: string;
}): Promise<OpenFdaComprehensiveResult> {
  const findings: RegistrySourceFinding[] = [];
  const flags: RegulatoryAlertFlag[] = [];
  const topFaersReactions: string[] = [];
  let boxedWarningSummary: string | undefined;
  let okCalls = 0;
  let failedCalls = 0;

  // 1. Local US FDA Orange Book (products.txt, patent.txt, exclusivity.txt)
  const ob = searchOrangeBook({
    query: opts.name,
    ingredient: opts.genericName,
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
        ? `Listed in FDA Orange Book solely as DISCN (Discontinued) by ${top.applicantFullName || top.applicant}, approved ${top.approvalDate}.`
        : `FDA Orange Book ${top.marketingType}: ${top.strength} ${top.dosageFormRoute} by ${top.applicantFullName || top.applicant} (${top.applType}${top.applNo}, approved ${top.approvalDate}${top.patentCount ? `, ${top.patentCount} patent(s)` : ""}).`,
      code: `${top.applType}${top.applNo}`,
      url: "https://www.accessdata.fda.gov/scripts/cder/ob/index.cfm",
      sourceAttribution: "Source: US FDA Orange Book (EOBZIP_2026_10)",
    });
    if (ob.allDiscontinued) {
      flags.push({
        code: "DISCONTINUED_DRUG",
        severity: "caution",
        title: "Discontinued US FDA Orange Book listing",
        detail: `All matching Orange Book entries for "${opts.name}" carry Type DISCN. Confirm active batch provenance before dispensing.`,
      });
    }
  }

  const cleanName = opts.name.replace(/"/g, "").trim();
  const generic = (opts.genericName ?? "").replace(/"/g, "").trim();
  if (cleanName.length < 3 && !opts.ndcCode) {
    return {
      findings,
      flags,
      topFaersReactions,
      okCalls,
      failedCalls,
    };
  }

  const isCosmetic = opts.category === "Skin care and cosmetics";
  const isSupplementOrFood = opts.category === "Vitamins and supplements";
  const nameExpr = generic
    ? `(openfda.brand_name:"${cleanName}" OR openfda.generic_name:"${generic}")`
    : `(openfda.brand_name:"${cleanName}" OR openfda.generic_name:"${cleanName}")`;

  const tasks: Promise<void>[] = [];

  // 2. openFDA Drug NDC Directory (drug/ndc.json)
  if (!isCosmetic) {
    const ndcQ = opts.ndcCode
      ? `product_ndc:"${opts.ndcCode.split("-").slice(0, 2).join("-")}" OR brand_name:"${cleanName}"`
      : generic
        ? `brand_name:"${cleanName}" OR generic_name:"${generic}"`
        : `brand_name:"${cleanName}" OR generic_name:"${cleanName}"`;
    tasks.push(
      fetchOpenFda(
        "openFDA-NDC",
        `https://api.fda.gov/drug/ndc.json?search=${encodeURIComponent(ndcQ)}&limit=2`,
      )
        .then((data) => {
          okCalls++;
          const r = data?.results?.[0];
          if (!r) return;
          findings.push({
            registry: "US FDA openFDA",
            status: "matched",
            title: `${r.brand_name ?? cleanName} (${r.generic_name ?? generic ?? "Active"})`,
            detail: `${r.dosage_form ?? "Drug"} (${r.marketing_category ?? "Listed"}) by ${r.labeler_name ?? "registered labeler"}${r.product_ndc ? ` · NDC ${r.product_ndc}` : ""}.`,
            code: r.product_ndc ? String(r.product_ndc) : undefined,
            url: "https://open.fda.gov/apis/drug/ndc/",
            sourceAttribution: "Source: openFDA Drug NDC Directory",
          });
        })
        .catch((err) => {
          if (is404(err)) okCalls++;
          else failedCalls++;
        }),
    );

    // 3. openFDA Drugs@FDA Approvals (drug/drugsfda.json)
    const dfaQ = generic
      ? `openfda.brand_name:"${cleanName}" OR openfda.generic_name:"${generic}"`
      : `openfda.brand_name:"${cleanName}" OR openfda.generic_name:"${cleanName}"`;
    tasks.push(
      fetchOpenFda(
        "openFDA-DrugsFDA",
        `https://api.fda.gov/drug/drugsfda.json?search=${encodeURIComponent(dfaQ)}&limit=2`,
      )
        .then((data) => {
          okCalls++;
          const r = data?.results?.[0];
          if (!r) return;
          const prod = Array.isArray(r.products) ? r.products[0] : null;
          const mkt = prod?.marketing_status ?? "Approved";
          const isDisc = /discontinued/i.test(String(mkt));
          findings.push({
            registry: "US FDA Drugs@FDA",
            status: isDisc ? "discontinued" : "matched",
            title: `${r.application_number ?? "FDA Appl."} · ${r.sponsor_name ?? cleanName}`,
            detail: `${prod?.brand_name ?? cleanName} (${prod?.dosage_form ?? "Drug"}): FDA marketing status is ${mkt}.`,
            code: r.application_number
              ? String(r.application_number)
              : undefined,
            url: "https://open.fda.gov/apis/drug/drugsfda/",
            sourceAttribution: "Source: openFDA Drugs@FDA Approvals",
          });
        })
        .catch((err) => {
          if (is404(err)) okCalls++;
          else failedCalls++;
        }),
    );

    // 4. openFDA Structured Product Labeling (drug/label.json): Boxed Warnings & Contraindications
    tasks.push(
      fetchOpenFda(
        "openFDA-Label",
        `https://api.fda.gov/drug/label.json?search=${encodeURIComponent(nameExpr)}&limit=1`,
      )
        .then((data) => {
          okCalls++;
          const r = data?.results?.[0];
          if (!r) return;
          const boxed = firstText(r.boxed_warning, 240);
          const contra = firstText(r.contraindications, 180);
          const ind = firstText(r.indications_and_usage, 180);
          if (boxed) {
            boxedWarningSummary = boxed;
            flags.push({
              code: "FDA_BOXED_WARNING",
              severity: "caution",
              title: "FDA Boxed Safety Warning on label",
              detail: boxed,
            });
          }
          findings.push({
            registry: "US FDA Labeling (SPL)",
            status: boxed ? "warning" : "matched",
            title: `${firstText(r.openfda?.brand_name, 80) || cleanName} · Official FDA label`,
            detail: boxed
              ? `Boxed Warning: ${boxed}`
              : contra
                ? `Contraindications: ${contra}`
                : ind || "Structured Product Labeling active on openFDA.",
            url: "https://open.fda.gov/apis/drug/label/",
            sourceAttribution: "Source: openFDA Drug Labeling (SPL)",
          });
        })
        .catch((err) => {
          if (is404(err)) okCalls++;
          else failedCalls++;
        }),
    );

    // 5. openFDA FAERS Post-Market Adverse Events (drug/event.json)
    const faersTarget = generic || cleanName;
    tasks.push(
      fetchOpenFda(
        "openFDA-FAERS",
        `https://api.fda.gov/drug/event.json?search=${encodeURIComponent(`patient.drug.openfda.generic_name:"${faersTarget}" OR patient.drug.medicinalproduct:"${cleanName}"`)}&count=patient.reaction.reactionmeddrapt.exact&limit=5`,
      )
        .then((data) => {
          okCalls++;
          const buckets = Array.isArray(data?.results) ? data.results : [];
          if (!buckets.length) return;
          const top = buckets
            .slice(0, 5)
            .map(
              (b: { term?: string; count?: number }) =>
                `${b.term ?? "Unknown"} (${b.count ?? 0})`,
            );
          topFaersReactions.push(...top);
          findings.push({
            registry: "US FDA FAERS",
            status: "matched",
            title: `Post-market safety signals for ${faersTarget}`,
            detail: `Most frequently reported FAERS MedDRA terms (not proof of causation): ${top.join(", ")}.`,
            url: "https://open.fda.gov/apis/drug/event/",
            sourceAttribution:
              "Source: openFDA Adverse Event Reporting System (FAERS)",
          });
        })
        .catch((err) => {
          if (is404(err)) okCalls++;
          else failedCalls++;
        }),
    );

    // 6a. openFDA Drug Enforcement / Recalls (drug/enforcement.json)
    tasks.push(
      fetchOpenFda(
        "openFDA-DrugRecall",
        `https://api.fda.gov/drug/enforcement.json?search=${encodeURIComponent(`status:"Ongoing" AND (product_description:"${cleanName}"${generic ? ` OR product_description:"${generic}"` : ""})`)}&limit=2`,
      )
        .then((data) => {
          okCalls++;
          const hit = data?.results?.[0];
          if (!hit) return;
          findings.push({
            registry: "US FDA openFDA",
            status: "recalled",
            title: `Ongoing FDA Drug Recall: ${String(hit.recall_number ?? "")}`,
            detail: String(
              hit.reason_for_recall ?? hit.product_description ?? "",
            ).slice(0, 260),
            code: String(hit.recall_number ?? ""),
            url: "https://open.fda.gov/apis/drug/enforcement/",
            sourceAttribution: "Source: US FDA Drug Enforcement & Recalls",
          });
          flags.push({
            code: "ACTIVE_RECALL",
            severity: "danger",
            title: "Ongoing US FDA drug recall alert",
            detail: `${String(hit.classification ?? "Recall")}: ${String(hit.reason_for_recall ?? "").slice(0, 200)}`,
          });
        })
        .catch((err) => {
          if (is404(err)) okCalls++;
          else failedCalls++;
        }),
    );
  }

  // 6b. openFDA Food/Supplement Enforcement / Recalls (food/enforcement.json)
  if (isSupplementOrFood || opts.category === "Mother and baby") {
    tasks.push(
      fetchOpenFda(
        "openFDA-FoodRecall",
        `https://api.fda.gov/food/enforcement.json?search=${encodeURIComponent(`status:"Ongoing" AND product_description:"${cleanName}"`)}&limit=2`,
      )
        .then((data) => {
          okCalls++;
          const hit = data?.results?.[0];
          if (!hit) return;
          findings.push({
            registry: "US FDA openFDA",
            status: "recalled",
            title: `Ongoing FDA Food/Supplement Recall: ${String(hit.recall_number ?? "")}`,
            detail: String(
              hit.reason_for_recall ?? hit.product_description ?? "",
            ).slice(0, 260),
            code: String(hit.recall_number ?? ""),
            url: "https://open.fda.gov/apis/food/enforcement/",
            sourceAttribution: "Source: US FDA Food & Supplement Enforcement",
          });
          flags.push({
            code: "ACTIVE_RECALL",
            severity: "danger",
            title: "Ongoing US FDA supplement/food recall alert",
            detail: String(hit.reason_for_recall ?? "").slice(0, 200),
          });
        })
        .catch((err) => {
          if (is404(err)) okCalls++;
          else failedCalls++;
        }),
    );
  }

  // 7. openFDA Cosmetic Adverse Events (cosmetic/event.json)
  if (isCosmetic) {
    tasks.push(
      fetchOpenFda(
        "openFDA-Cosmetic",
        `https://api.fda.gov/cosmetic/event.json?search=${encodeURIComponent(`products.product_name:"${cleanName}"`)}&limit=2`,
      )
        .then((data) => {
          okCalls++;
          const total = Number(data?.meta?.results?.total ?? 0);
          if (total <= 0) return;
          const r = data?.results?.[0];
          const reactions = Array.isArray(r?.reactions)
            ? r.reactions.slice(0, 4).join(", ")
            : "";
          findings.push({
            registry: "US FDA openFDA",
            status: "warning",
            title: `${total} US FDA Cosmetic Adverse Event record(s)`,
            detail: `CAERS cosmetic safety database contains ${total} report(s) matching "${cleanName}"${reactions ? ` (e.g. ${reactions})` : ""}. Check ingredients for steroids/hydroquinone/mercury.`,
            url: "https://open.fda.gov/apis/cosmetic/event/",
            sourceAttribution: "Source: US FDA CAERS Cosmetic Event Reporting",
          });
        })
        .catch((err) => {
          if (is404(err)) okCalls++;
          else failedCalls++;
        }),
    );
  }

  await Promise.allSettled(tasks);
  return {
    findings,
    flags,
    boxedWarningSummary,
    topFaersReactions,
    okCalls,
    failedCalls,
  };
}
