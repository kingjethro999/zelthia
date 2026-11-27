import "server-only";
import type { AgentStep, ChatEvent, MessageMeta } from "@/lib/chat-types";
import type {
  DirectoryMatch,
  RegulatoryReport,
  WebImage,
  WebPlace,
} from "@/lib/inventory-types";
import { extractRegulatoryCodes } from "@/lib/barcode";
import type { BiometricProfile } from "./types";
import { buildSystemPrompt } from "./prompts";
import { parseAiResponse, stripTags } from "./parser";
import { complete, readWithVision, stream, type Turn } from "./providers";
import { generateClinicalFallback } from "./fallback";
import { searchDirectory } from "@/lib/server/inventory";
import { searchDataProtectionProvisions } from "@/lib/server/compliance";
import { getMhraAgencyOverview } from "@/lib/server/mhra";
import { verifyHealthProduct } from "@/lib/server/regulatory";
import { queryAdultSocialCareFinance } from "@/lib/server/social-care";
import {
  searchImages,
  searchPlaces,
  searchWebGeneral,
} from "@/lib/server/web-search";

export interface IncomingFile {
  name: string;
  mime: string;
  size: number;
  base64: string;
}

export interface ReadFile extends IncomingFile {
  extracted: string;
}

type Emit = (e: ChatEvent) => void;

/** Tracks visible steps; every label describes real work as it happens. */
export class StepTracker {
  steps: AgentStep[] = [];
  private n = 0;
  constructor(private emit: Emit) {}

  start(label: string) {
    const step: AgentStep = {
      id: `s${++this.n}`,
      label,
      status: "running",
      startedAt: Date.now(),
    };
    this.steps.push(step);
    this.emit({ type: "step", step: { ...step } });
    return step;
  }

  finish(step: AgentStep, detail?: string, status: "done" | "failed" = "done") {
    step.status = status;
    step.detail = detail;
    step.endedAt = Date.now();
    this.emit({ type: "step", step: { ...step } });
  }
}

/* ---------- 1. read attachments ---------- */

const READ_PROMPT = `You are reading a file a patient uploaded to a health assistant. It may be a doctor's handwritten note or referral card, a prescription, a lab or scan report, a medicine pack, skin cream, supplement, barcode, or a photo of a body part.
Reply in exactly these sections:
DOCUMENT TYPE: one short line.
TRANSCRIPTION: every word you can read, exactly as written, including handwriting. Expand medical abbreviations in square brackets, e.g. "2D ECHO [two-dimensional echocardiogram]". Write [illegible] for anything you cannot read. If it is a photo with no text, describe what is visible.
REGULATORY & PACK IDENTIFIERS: list any NAFDAC Reg. No., barcode digits, US NDC, China Guoyao Zhunzi (国药准字...), 20-digit Chinese traceability code, UK MHRA PL, DIN, batch/lot number, expiry date, manufacturer, and country of origin visible (or "None visible").
KEY POINTS: short bullet list of findings, diagnoses, active ingredients, tests or procedures requested, and medicines with doses.
Do not add advice.`;

async function pdfText(base64: string) {
  const { extractText, getDocumentProxy } = await import("unpdf");
  const pdf = await getDocumentProxy(
    new Uint8Array(Buffer.from(base64, "base64")),
  );
  const { totalPages, text } = await extractText(pdf, { mergePages: true });
  return {
    pages: totalPages,
    text: String(text).replace(/\s+\n/g, "\n").trim(),
  };
}

function firstLine(section: string, text: string) {
  const m = text.match(new RegExp(`${section}:\\s*([^\\n]+)`, "i"));
  return m?.[1]?.replace(/[*_#]/g, "").trim();
}

export async function readFiles(
  files: IncomingFile[],
  steps: StepTracker,
): Promise<ReadFile[]> {
  return Promise.all(
    files.map(async (f) => {
      const step = steps.start(`Reading ${f.name}`);
      try {
        if (f.mime === "text/plain") {
          const text = Buffer.from(f.base64, "base64")
            .toString("utf8")
            .slice(0, 20000);
          steps.finish(step, `Read ${text.split("\n").length} lines of text`);
          return { ...f, extracted: text };
        }
        if (f.mime === "application/pdf") {
          const { pages, text } = await pdfText(f.base64).catch(() => ({
            pages: 0,
            text: "",
          }));
          if (text.length > 80) {
            steps.finish(
              step,
              `Read ${pages} page${pages === 1 ? "" : "s"} of text`,
            );
            return { ...f, extracted: text.slice(0, 20000) };
          }
          // Scanned PDF with no text layer: let a vision model read it.
        }
        const { text } = await readWithVision(READ_PROMPT, {
          mime: f.mime,
          base64: f.base64,
        });
        const kind = firstLine("DOCUMENT TYPE", text);
        const point = text
          .match(/KEY POINTS:\s*\n?\s*[-*]?\s*([^\n]+)/i)?.[1]
          ?.replace(/[*_]/g, "")
          .trim();
        const detail = [kind, point]
          .filter(Boolean)
          .map((t) => t!.replace(/[.\s]+$/, ""))
          .join(". ");
        steps.finish(step, detail || "Read the file");
        return { ...f, extracted: text };
      } catch (err) {
        console.error("Attachment read failed", f.name, err);
        steps.finish(
          step,
          "Couldn't read this file. Try a clearer photo or another format.",
          "failed",
        );
        return { ...f, extracted: "" };
      }
    }),
  );
}

/* ---------- 2. understand what's needed ---------- */

interface Need {
  what: string;
  terms: string[];
  kind: "product" | "service";
}

interface ProductCheck {
  name: string;
  genericName?: string;
  category?: string;
  nafdacCode?: string;
  barcode?: string;
  foreignCode?: string;
}

interface Plan {
  title: string;
  emergency: boolean;
  location: string | null;
  needs: Need[];
  checks: ProductCheck[];
  socialCareQuery: string | null;
  complianceQuery: string | null;
}

const PLAN_PROMPT = `You route requests for a health assistant in Nigeria (with public UK MHRA, US FDA, DHSC Social Care Finance 2025-2026, and UKPGA Data Protection Act 2018 datasets). Read the conversation and decide:
1) Whether the user needs to find a place for a medicine, health/beauty product, test, scan or procedure ("needs").
2) Whether the user mentioned, asked about the authenticity/safety/ingredients of, or uploaded a photo of a specific medicine, skincare cream, soap, herbal product, supplement, or regulatory code ("checks").
3) Whether the user asks about England/UK Adult Social Care Finance 2025-2026 figures ("socialCareQuery"), or UK Data Protection Act 2018 (UKPGA c. 12) / NDPA 2023 privacy rights / MHRA governance ("complianceQuery").

Return only JSON:
{"title": "3 to 6 word chat title",
 "emergency": boolean,
 "location": "city or area the user mentioned, else null",
 "needs": [{"what": "plain name, e.g. 2D echocardiogram", "kind": "product" | "service",
            "terms": ["2-4 short search keywords and common spellings"]}],
 "checks": [{"name": "Brand/product name, e.g. Tydineal Cream",
             "genericName": "Active ingredient if known, else ''",
             "category": "Medicine | Skin care and cosmetics | Vitamins and supplements | Pain relief and muscle care | Medical devices | Other health products",
             "nafdacCode": "NAFDAC number if seen/mentioned, else ''",
             "barcode": "Barcode/GTIN if seen/mentioned, else ''",
             "foreignCode": "NDC, Guoyao Zhunzi, MHRA PL, or DIN if seen, else ''"}],
 "socialCareQuery": "council, region or care question if asked, else null",
 "complianceQuery": "privacy, DPA 2018, UKPGA, NDPA, or MHRA governance query if asked, else null"}
Rules:
- If the user attached a photo of a product pack or asked whether a drug, cream, supplement, or regulatory number is real/safe/registered, include it in "checks" (and also in "needs" with kind "product" if they need to find where to get it).
- If an attached document or conversation says the user should get a test, scan, procedure or medicine, include it in "needs". Prefer tests and scans over routine medicines when both exceed 2.
- "needs" is [] only when nothing has to be physically obtained.
- "checks" is [] for general symptom chat, greetings, or clinic/lab scans without a commercial product.
- At most 2 items each for needs and checks. Never invent a location or registration code.`;

function parsePlan(text: string, fallbackTitle: string): Plan {
  const json = text.match(/\{[\s\S]*\}/)?.[0];
  const raw = json ? JSON.parse(json) : {};
  const needs: Need[] = Array.isArray(raw.needs)
    ? raw.needs
        .filter((n: Need) => n && typeof n.what === "string" && n.what.trim())
        .slice(0, 2)
        .map((n: Need) => ({
          what: n.what.trim().slice(0, 80),
          kind: n.kind === "service" ? "service" : "product",
          terms: (Array.isArray(n.terms) ? n.terms : [n.what])
            .filter((t: unknown): t is string => typeof t === "string")
            .map((t: string) => t.trim().slice(0, 40))
            .filter(Boolean)
            .slice(0, 4),
        }))
    : [];
  const checks: ProductCheck[] = Array.isArray(raw.checks)
    ? raw.checks
        .filter(
          (c: ProductCheck) => c && typeof c.name === "string" && c.name.trim(),
        )
        .slice(0, 2)
        .map((c: ProductCheck) => ({
          name: c.name.trim().slice(0, 120),
          genericName:
            typeof c.genericName === "string"
              ? c.genericName.trim().slice(0, 120)
              : undefined,
          category:
            typeof c.category === "string"
              ? c.category.trim().slice(0, 80)
              : undefined,
          nafdacCode:
            typeof c.nafdacCode === "string"
              ? c.nafdacCode.trim().slice(0, 64)
              : undefined,
          barcode:
            typeof c.barcode === "string"
              ? c.barcode.trim().slice(0, 64)
              : undefined,
          foreignCode:
            typeof c.foreignCode === "string"
              ? c.foreignCode.trim().slice(0, 100)
              : undefined,
        }))
    : [];
  return {
    title:
      typeof raw.title === "string" && raw.title.trim()
        ? raw.title.trim().slice(0, 80)
        : fallbackTitle,
    emergency: raw.emergency === true,
    location:
      typeof raw.location === "string" && raw.location.trim()
        ? raw.location.trim().slice(0, 60)
        : null,
    needs,
    checks,
    socialCareQuery:
      typeof raw.socialCareQuery === "string" && raw.socialCareQuery.trim()
        ? raw.socialCareQuery.trim().slice(0, 120)
        : null,
    complianceQuery:
      typeof raw.complianceQuery === "string" && raw.complianceQuery.trim()
        ? raw.complianceQuery.trim().slice(0, 120)
        : null,
  };
}

/* ---------- full turn ---------- */

export interface TurnInput {
  history: Turn[];
  text: string;
  files: ReadFile[];
  profile: BiometricProfile;
  steps: StepTracker;
  emit: Emit;
}

export interface TurnResult {
  content: string;
  title: string;
  meta: MessageMeta;
}

function cleanUntrusted(s: string, max: number): string {
  return s
    .replace(/\[TRIAGE:[^\]]*\]/gi, "")
    .replace(/\[REFERRAL:\s*\{[\s\S]*?\}\]/gi, "")
    .replace(/<\/?(untrusted_retrieved_data|attached_document)[^>]*>/gi, "")
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, " ")
    .trim()
    .slice(0, max);
}

function filesBlock(files: ReadFile[]) {
  return files
    .filter((f) => f.extracted)
    .map((f) => {
      const safeName = cleanUntrusted(f.name, 120).replace(/"/g, "'");
      return `<attached_document name="${safeName}">\n${cleanUntrusted(f.extracted, 8000)}\n</attached_document>`;
    })
    .join("\n\n");
}

export function userTurnText(text: string, files: ReadFile[]) {
  const notes = filesBlock(files);
  const body =
    text.trim() ||
    (files.length ? "Please explain this file and what I should do next." : "");
  return notes ? `${body}\n\n${notes}` : body;
}

export async function runTurn({
  history,
  text,
  files,
  profile,
  steps,
  emit,
}: TurnInput): Promise<TurnResult> {
  const userText = userTurnText(text, files);
  const turns: Turn[] = [...history, { role: "user", content: userText }];
  const fallbackTitle = (text.trim() || files[0]?.name || "New chat")
    .split(/\s+/)
    .slice(0, 6)
    .join(" ");

  // 2. Plan. Greetings and small talk need no planning call or visible step.
  let plan: Plan = {
    title: fallbackTitle,
    emergency: false,
    location: null,
    needs: [],
    checks: [],
    socialCareQuery: null,
    complianceQuery: null,
  };
  const smallTalk =
    !files.length &&
    text.trim().length < 40 &&
    /^(hi|hello|hey|yo|good (morning|afternoon|evening|day)|thanks?( you)?|thank you|ok(ay)?|how are you|who are you|what can you do|help)[\s!.?,]*$/i.test(
      text.trim(),
    );
  const planStep = smallTalk ? null : steps.start("Working out what you need");
  if (planStep)
    try {
      const recent = turns
        .slice(-6)
        .map((t) => `${t.role.toUpperCase()}: ${t.content.slice(0, 3000)}`)
        .join("\n\n");
      const { text: out } = await complete(
        PLAN_PROMPT,
        [{ role: "user", content: recent }],
        { json: true },
      );
      plan = parsePlan(out, fallbackTitle);
      steps.finish(
        planStep,
        plan.emergency
          ? "This sounds urgent"
          : plan.needs.length
            ? `Looking for ${plan.needs.map((n) => n.what).join(" and ")}`
            : "No place to look up, answering directly",
      );
    } catch (err) {
      console.warn("Planner failed", (err as Error).message);
      steps.finish(planStep, "Answering directly");
    }

  const location = plan.location ?? (profile.location?.trim() || null);
  const matches: DirectoryMatch[] = [];
  const places: WebPlace[] = [];
  const images: WebImage[] = [];
  const regulatory: RegulatoryReport[] = [];

  // Ensure every product need or inline regulatory code triggers verification
  const inlineCodes = extractRegulatoryCodes(userText);
  const allChecks: ProductCheck[] = [...plan.checks];
  for (const n of plan.needs) {
    if (
      n.kind === "product" &&
      !allChecks.some((c) => c.name.toLowerCase() === n.what.toLowerCase())
    ) {
      allChecks.push({ name: n.what });
    }
  }
  if (
    !allChecks.length &&
    (inlineCodes.nafdac ||
      inlineCodes.barcode ||
      inlineCodes.guoyaoZhunzi ||
      inlineCodes.ndc)
  ) {
    allChecks.push({
      name:
        inlineCodes.nafdac ??
        inlineCodes.guoyaoZhunzi ??
        inlineCodes.ndc ??
        inlineCodes.barcode ??
        text.slice(0, 60),
      nafdacCode: inlineCodes.nafdac,
      barcode: inlineCodes.barcode,
      foreignCode: inlineCodes.guoyaoZhunzi ?? inlineCodes.ndc,
    });
  }

  const regulatoryPromise = Promise.all(
    allChecks.slice(0, 2).map(async (chk) => {
      const regStep = steps.start(
        `Checking NAFDAC Greenbook, US FDA Orange Book & global registries for ${chk.name}`,
      );
      try {
        const rep = await verifyHealthProduct({
          name: chk.name,
          genericName: chk.genericName,
          category: chk.category,
          nafdacCode: chk.nafdacCode || inlineCodes.nafdac,
          barcode: chk.barcode || inlineCodes.barcode,
          foreignCode:
            chk.foreignCode ||
            inlineCodes.guoyaoZhunzi ||
            inlineCodes.ndc ||
            inlineCodes.mhraPl,
        });
        steps.finish(
          regStep,
          rep.staleFallback
            ? `Live registry unavailable — showing cached record from ${rep.staleFromDate}`
            : rep.headline,
          rep.verdict === "danger" ? "failed" : "done",
        );
        return rep;
      } catch (err) {
        console.warn("Regulatory verification failed", (err as Error).message);
        steps.finish(
          regStep,
          "Could not reach public registries right now",
          "failed",
        );
        return null;
      }
    }),
  );

  // 3-4. Directory first, then the web, for each need.
  for (const need of plan.needs) {
    const terms = [...new Set([need.what, ...need.terms])];
    const dirStep = steps.start(`Checking Zelthia listings for ${need.what}`);
    let found: DirectoryMatch[] = [];
    try {
      found = await searchDirectory({ terms, city: location, limit: 12 });
      let detail = found.length
        ? `${found.length} listing${found.length === 1 ? "" : "s"}${location ? ` in ${location}` : ""}`
        : `No facility on Zelthia lists it${location ? ` in ${location}` : ""} yet`;
      if (!found.length && location) {
        found = await searchDirectory({ terms, limit: 12 });
        if (found.length) detail += `, ${found.length} elsewhere`;
      }
      steps.finish(dirStep, detail);
    } catch (err) {
      console.error("Directory search failed", err);
      steps.finish(dirStep, "Couldn't reach the Zelthia directory", "failed");
    }
    matches.push(...found);

    if (found.length < 2) {
      const webStep = steps.start(
        `Searching the web for ${need.what}${location ? ` near ${location}` : " in Nigeria"}`,
      );
      const [{ places: web }, wide, pics] = await Promise.all([
        searchPlaces(need.what, location, 6),
        searchWebGeneral(
          `${need.what}${location ? ` ${location}` : ""} Nigeria`,
          { limit: 4, country: "NG", filterLowValue: true },
        ).catch(() => ({ results: [] as WebPlace[] })),
        searchImages(need.what, location, 8),
      ]);
      const combined = [...web];
      for (const w of wide.results) {
        if (!combined.some((x) => x.url === w.url)) combined.push(w);
      }
      places.push(...combined);
      images.push(
        ...pics.filter((p) => !images.some((x) => x.imageUrl === p.imageUrl)),
      );
      const counts = [
        combined.length ? `${combined.length} pages` : "",
        pics.length ? `${pics.length} photos` : "",
      ].filter(Boolean);
      steps.finish(
        webStep,
        counts.length
          ? `Found ${counts.join(" and ")} to check (not verified by Zelthia)`
          : "No useful pages found",
        counts.length ? "done" : "failed",
      );
    }
  }

  const resolvedReg = await regulatoryPromise;
  for (const r of resolvedReg) {
    if (r) regulatory.push(r);
  }

  // Deterministic + planner-driven lookups for DHSC Adult Social Care 2025-2026 & UKPGA DPA 2018 / MHRA Governance
  const wantSocialCare =
    Boolean(plan.socialCareQuery) ||
    /\b(adult social care|social care finance|local authority expenditure|care funding|council care spend)\b/i.test(
      userText,
    );
  const wantCompliance =
    Boolean(plan.complianceQuery) ||
    /\b(data protection act|ukpga|dpa 2018|uk gdpr|ndpa|subject access request|national security certificate|mhra annual report|mhra privacy|safety public assessment)\b/i.test(
      userText,
    );

  let socialCareContext: ReturnType<typeof queryAdultSocialCareFinance> | null =
    null;
  if (wantSocialCare) {
    const ascStep = steps.start(
      "Checking DHSC England Adult Social Care Finance 2025–2026 dataset",
    );
    socialCareContext = queryAdultSocialCareFinance({
      query: plan.socialCareQuery ?? text,
      limit: 6,
    });
    steps.finish(
      ascStep,
      `Loaded £${(socialCareContext.englandTotals.totalGrossCurrentExpenditureK / 1_000_000).toFixed(2)}B England gross spend across ${socialCareContext.matchedRegions.length} regions`,
    );
  }

  let complianceContext: {
    dpa: ReturnType<typeof searchDataProtectionProvisions>;
    mhraOverview: ReturnType<typeof getMhraAgencyOverview>;
  } | null = null;
  if (wantCompliance) {
    const compStep = steps.start(
      "Checking UK Data Protection Act 2018 (UKPGA c. 12) & MHRA governance records",
    );
    complianceContext = {
      dpa: searchDataProtectionProvisions(plan.complianceQuery ?? text),
      mhraOverview: getMhraAgencyOverview(),
    };
    steps.finish(
      compStep,
      `Matched ${complianceContext.dpa.statute.matchedProvisions.length} statutory provision(s) & ${complianceContext.mhraOverview.parsCatalog.totalReports} MHRA reports`,
    );
  }

  // 5. Answer, grounded only in what was actually found. Keep untrusted retrieved data
  // out of the system prompt and wrapped in explicit data delimiters in the user turn.
  const locationLine = location
    ? `USER LOCATION: ${cleanUntrusted(location, 160)}`
    : "USER LOCATION: unknown";

  const hasContext =
    plan.needs.length > 0 ||
    regulatory.length > 0 ||
    Boolean(socialCareContext) ||
    Boolean(complianceContext);
  const retrievedData = hasContext
    ? `<untrusted_retrieved_data>\n${
        socialCareContext
          ? `ENGLAND ADULT SOCIAL CARE FINANCE 2025-2026 (GOV.UK DHSC):\n${JSON.stringify(
              {
                source: socialCareContext.source,
                updated: socialCareContext.updated,
                csvRowsProcessed: socialCareContext.totalCsvRowsProcessed,
                dataQualityNotice: socialCareContext.dataQualityNotice,
                englandTotals: socialCareContext.englandTotals,
                matchedRegions: socialCareContext.matchedRegions,
                matchedLocalAuthorities:
                  socialCareContext.matchedLocalAuthorities,
              },
            )}\n\n`
          : ""
      }${
        complianceContext
          ? `UKPGA DATA PROTECTION ACT 2018 & MHRA GOVERNANCE RECORDS:\n${JSON.stringify(
              {
                statute: complianceContext.dpa.statute,
                nationalSecurityGuidance:
                  complianceContext.dpa.nationalSecurityGuidance,
                lawfulBasisMatrix: complianceContext.dpa.lawfulBasisMatrix,
                retentionSchedule: complianceContext.dpa.retentionSchedule,
                mhraAnnualReport: complianceContext.mhraOverview.annualReport,
                mhraLeadership2026:
                  complianceContext.mhraOverview.leadershipStructure2026,
                mhraParsSummary: {
                  totalReports:
                    complianceContext.mhraOverview.parsCatalog.totalReports,
                  latestReports:
                    complianceContext.mhraOverview.parsCatalog.latestReports,
                },
              },
            )}\n\n`
          : ""
      }${
        regulatory.length
          ? `REGULATORY VERIFICATION RESULTS:\n${JSON.stringify(
              regulatory.map((r) => ({
                query: cleanUntrusted(r.query, 120),
                verdict: r.verdict,
                headline: cleanUntrusted(r.headline, 180),
                summary: cleanUntrusted(r.summary, 360),
                nafdac_code: r.nafdacCode ?? null,
                barcode: r.barcode ?? null,
                stale_fallback: r.staleFallback,
                stale_from_date: r.staleFromDate ?? null,
                flags: r.flags.map((f) => ({
                  code: f.code,
                  severity: f.severity,
                  title: cleanUntrusted(f.title, 120),
                  detail: cleanUntrusted(f.detail, 260),
                })),
                // Listings first: "signal" findings (adverse events, labels,
                // news) are context and never proof of registration.
                findings: [...r.findings]
                  .sort(
                    (a, b) =>
                      Number(a.evidence === "signal") -
                      Number(b.evidence === "signal"),
                  )
                  .slice(0, 6)
                  .map((f) => ({
                    registry: f.registry,
                    status: f.status,
                    evidence: f.evidence ?? "name",
                    title: cleanUntrusted(f.title, 140),
                    detail: cleanUntrusted(f.detail, 240),
                    source: cleanUntrusted(f.sourceAttribution, 120),
                  })),
                unlisted_warning: r.unlistedWarning ?? null,
              })),
            )}\n\n`
          : ""
      }ZELTHIA DIRECTORY RESULTS:\n${
        matches.length
          ? JSON.stringify(
              matches.slice(0, 12).map((m) => ({
                facility: cleanUntrusted(m.facility.name, 120),
                kind: m.facility.kind,
                licence_verified:
                  m.facility.verification?.status === "verified",
                has_recorded_directions: Boolean(m.facility.directionsAudioUrl),
                address: cleanUntrusted(
                  `${m.facility.address}, ${m.facility.city}`,
                  200,
                ),
                phone: cleanUntrusted(m.facility.phone, 40),
                hours: cleanUntrusted(m.facility.openingHours, 160),
                directions: cleanUntrusted(m.facility.directions, 400),
                ...(m.product
                  ? {
                      product: cleanUntrusted(m.product.name, 160),
                      quantity: m.product.quantity,
                      price_ngn: m.product.priceNgn,
                      prescription_only: m.product.prescriptionOnly,
                      nafdac_no: cleanUntrusted(m.product.nafdacNumber, 64),
                      regulatory_status: m.product.regulatoryStatus,
                    }
                  : { service: cleanUntrusted(m.service ?? "", 100) }),
              })),
            )
          : "none"
      }\n\nWEB RESULTS:\n${
        places.length
          ? places
              .map(
                (p) =>
                  `- ${cleanUntrusted(p.title, 160)} | ${cleanUntrusted(p.url, 300)} | ${cleanUntrusted(p.description, 240)}`,
              )
              .join("\n")
          : "none"
      }\n</untrusted_retrieved_data>`
    : "";

  const grounding = hasContext
    ? `GROUNDING RULES (strict):
- The only businesses you may name are those in ZELTHIA DIRECTORY RESULTS and WEB RESULTS inside <untrusted_retrieved_data>. Do not name any other pharmacy, hospital, clinic, store or brand of shop, not even as an example or "e.g.".
- If you want to suggest looking locally, describe the type of place (e.g. "a community pharmacy" or "a teaching hospital's cardiology unit") without naming one.
- Copy phone numbers, prices and addresses only when complete in the results.
- Call a facility "verified" only when licence_verified is true. If it has recorded directions, mention they can listen to them on the card below.
- Facility cards with phone, directions and stock are shown under your answer, so keep your own summary short.
- Photos from the web search are shown under your answer and link to their source pages; you may refer to them.
- A finding with evidence "signal" (adverse event counts, labels, assessment reports, news) is safety context only; never describe it as the product being registered or approved. evidence "code" means the printed number matched the registry record; evidence "name" means only a product with that name is registered, so the pack itself still needs checking.
- If flags include NAFDAC_CODE_NOT_FOUND, say plainly that the NAFDAC number was not found on the Greenbook, do not guess why, and advise consulting a licensed pharmacy, clinic or hospital nearby before use. If flags include VERIFICATION_UNAVAILABLE, say the check could not be completed rather than calling the product unlisted.
- If REGULATORY VERIFICATION RESULTS shows verdict "unverified" or unlisted_warning is set, explicitly warn the user that no documented regulatory listing could be found across NAFDAC, US FDA, or international registries and advise consulting a licensed pharmacy, clinic, or hospital nearby. NEVER invent an explanation for why a product is unlisted.
- If REGULATORY VERIFICATION RESULTS shows verdict "danger" or "caution", clearly highlight the exact flags (e.g. NAFDAC category mismatch, expired registration, active recall) and cite each source attribution shown.
- If ZELTHIA DIRECTORY RESULTS is "none" and the user was looking for where to get something, say clearly that no facility on Zelthia has it in stock yet, then point to the web results.`
    : "";
  const system = [buildSystemPrompt(profile), locationLine, grounding]
    .filter(Boolean)
    .join("\n\n");
  const modelTurns: Turn[] = retrievedData
    ? [
        ...turns.slice(0, -1),
        { role: "user", content: `${userText}\n\n${retrievedData}` },
      ]
    : turns;
  let raw = "";
  let model = "";
  try {
    const out = await stream(system, modelTurns, (delta) =>
      emit({ type: "delta", text: delta }),
    );
    raw = out.text;
    model = out.model;
  } catch (err) {
    console.error("All providers failed; using safety rules", err);
    const fb = generateClinicalFallback(userText, profile);
    // Say plainly that this is the offline safety net, not a full answer.
    const note =
      fb.triageLevel === "urgent"
        ? ""
        : "My full assistant isn't reachable right now, so this is general guidance only. Try again shortly for an answer that fits your situation.\n\n";
    raw = `[TRIAGE: ${fb.triageLevel.toUpperCase()}]\n${note}${fb.message}`;
    model = "zelthia-safety-rules";
    emit({ type: "delta", text: stripTags(raw) });
  }

  const parsed = parseAiResponse(raw);
  return {
    content: parsed.message,
    title: plan.title,
    meta: {
      // A lone planning step that found nothing to look up isn't worth showing afterwards.
      steps:
        steps.steps.length === 1 &&
        steps.steps[0].label === "Working out what you need"
          ? []
          : steps.steps,
      triage: plan.emergency ? "urgent" : parsed.triageLevel,
      matches: matches.slice(0, 12),
      regulatory,
      places: places.slice(0, 8),
      images: images.slice(0, 12),
      model,
    },
  };
}
