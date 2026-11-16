import "server-only";
import type { AgentStep, ChatEvent, MessageMeta } from "@/lib/chat-types";
import type { DirectoryMatch, WebPlace } from "@/lib/inventory-types";
import type { BiometricProfile } from "./types";
import { buildSystemPrompt } from "./prompts";
import { parseAiResponse, stripTags } from "./parser";
import { complete, readWithVision, stream, type Turn } from "./providers";
import { generateClinicalFallback } from "./fallback";
import { searchDirectory } from "@/lib/server/inventory";
import { searchPlaces } from "@/lib/server/web-search";

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
    const step: AgentStep = { id: `s${++this.n}`, label, status: "running", startedAt: Date.now() };
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

const READ_PROMPT = `You are reading a file a patient uploaded to a health assistant. It may be a doctor's handwritten note or referral card, a prescription, a lab or scan report, a medicine pack, or a photo of a body part.
Reply in exactly these sections:
DOCUMENT TYPE: one short line.
TRANSCRIPTION: every word you can read, exactly as written, including handwriting. Expand medical abbreviations in square brackets, e.g. "2D ECHO [two-dimensional echocardiogram]". Write [illegible] for anything you cannot read. If it is a photo with no text, describe what is visible.
KEY POINTS: short bullet list of findings, diagnoses, tests or procedures requested, and medicines with doses.
Do not add advice.`;

async function pdfText(base64: string) {
  const { extractText, getDocumentProxy } = await import("unpdf");
  const pdf = await getDocumentProxy(new Uint8Array(Buffer.from(base64, "base64")));
  const { totalPages, text } = await extractText(pdf, { mergePages: true });
  return { pages: totalPages, text: String(text).replace(/\s+\n/g, "\n").trim() };
}

function firstLine(section: string, text: string) {
  const m = text.match(new RegExp(`${section}:\\s*([^\\n]+)`, "i"));
  return m?.[1]?.replace(/[*_#]/g, "").trim();
}

export async function readFiles(files: IncomingFile[], steps: StepTracker): Promise<ReadFile[]> {
  return Promise.all(
    files.map(async (f) => {
      const step = steps.start(`Reading ${f.name}`);
      try {
        if (f.mime === "text/plain") {
          const text = Buffer.from(f.base64, "base64").toString("utf8").slice(0, 20000);
          steps.finish(step, `Read ${text.split("\n").length} lines of text`);
          return { ...f, extracted: text };
        }
        if (f.mime === "application/pdf") {
          const { pages, text } = await pdfText(f.base64).catch(() => ({ pages: 0, text: "" }));
          if (text.length > 80) {
            steps.finish(step, `Read ${pages} page${pages === 1 ? "" : "s"} of text`);
            return { ...f, extracted: text.slice(0, 20000) };
          }
          // Scanned PDF with no text layer: let a vision model read it.
        }
        const { text } = await readWithVision(READ_PROMPT, { mime: f.mime, base64: f.base64 });
        const kind = firstLine("DOCUMENT TYPE", text);
        const point = text.match(/KEY POINTS:\s*\n?\s*[-*]?\s*([^\n]+)/i)?.[1]?.replace(/[*_]/g, "").trim();
        const detail = [kind, point].filter(Boolean).map((t) => t!.replace(/[.\s]+$/, "")).join(". ");
        steps.finish(step, detail || "Read the file");
        return { ...f, extracted: text };
      } catch (err) {
        console.error("Attachment read failed", f.name, err);
        steps.finish(step, "Couldn't read this file. Try a clearer photo or another format.", "failed");
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

interface Plan {
  title: string;
  emergency: boolean;
  location: string | null;
  needs: Need[];
}

const PLAN_PROMPT = `You route requests for a health assistant in Nigeria. Read the conversation and decide whether the user needs to find a place for a medicine, health or beauty product, test, scan or procedure.
Return only JSON:
{"title": "3 to 6 word chat title",
 "emergency": boolean,
 "location": "city or area the user mentioned, else null",
 "needs": [{"what": "plain name, e.g. 2D echocardiogram", "kind": "product" | "service",
            "terms": ["2-4 short search keywords and common spellings, e.g. echo, echocardiogram, echocardiography"]}]}
Rules:
- If an attached document or the conversation says the user should get a test, scan, procedure or medicine (e.g. "Plan: MRI, 2D ECHO", "Rx: ..."), include each test or scan as a need: the user has to find where to do it. Prefer tests and scans over routine medicines.
- "needs" is [] only when the user just wants advice or information and nothing has to be obtained.
- At most 2 needs. Never invent a location.`;

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
  return {
    title: typeof raw.title === "string" && raw.title.trim() ? raw.title.trim().slice(0, 80) : fallbackTitle,
    emergency: raw.emergency === true,
    location: typeof raw.location === "string" && raw.location.trim() ? raw.location.trim().slice(0, 60) : null,
    needs,
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

function filesBlock(files: ReadFile[]) {
  return files
    .filter((f) => f.extracted)
    .map((f) => `[Attached ${f.name}]\n${f.extracted.slice(0, 8000)}`)
    .join("\n\n");
}

export function userTurnText(text: string, files: ReadFile[]) {
  const notes = filesBlock(files);
  const body = text.trim() || (files.length ? "Please explain this file and what I should do next." : "");
  return notes ? `${body}\n\n${notes}` : body;
}

export async function runTurn({ history, text, files, profile, steps, emit }: TurnInput): Promise<TurnResult> {
  const userText = userTurnText(text, files);
  const turns: Turn[] = [...history, { role: "user", content: userText }];
  const fallbackTitle = (text.trim() || files[0]?.name || "New chat").split(/\s+/).slice(0, 6).join(" ");

  // 2. Plan
  const planStep = steps.start("Working out what you need");
  let plan: Plan = { title: fallbackTitle, emergency: false, location: null, needs: [] };
  try {
    const recent = turns.slice(-6).map((t) => `${t.role.toUpperCase()}: ${t.content.slice(0, 3000)}`).join("\n\n");
    const { text: out } = await complete(PLAN_PROMPT, [{ role: "user", content: recent }], { json: true });
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
      const { places: web } = await searchPlaces(need.what, location, 6);
      places.push(...web);
      steps.finish(
        webStep,
        web.length ? `Found ${web.length} pages to check (not verified by Zelthia)` : "No useful pages found",
        web.length ? "done" : "failed",
      );
    }
  }

  // 5. Answer, grounded only in what was actually found.
  const context = [
    location ? `USER LOCATION: ${location}` : "USER LOCATION: unknown",
    plan.needs.length
      ? `ZELTHIA DIRECTORY RESULTS:\n${
          matches.length
            ? JSON.stringify(
                matches.slice(0, 12).map((m) => ({
                  facility: m.facility.name,
                  kind: m.facility.kind,
                  address: `${m.facility.address}, ${m.facility.city}`,
                  phone: m.facility.phone,
                  hours: m.facility.openingHours,
                  directions: m.facility.directions,
                  ...(m.product
                    ? {
                        product: m.product.name,
                        quantity: m.product.quantity,
                        price_ngn: m.product.priceNgn,
                        prescription_only: m.product.prescriptionOnly,
                      }
                    : { service: m.service }),
                })),
              )
            : "none"
        }\n\nWEB RESULTS:\n${
          places.length
            ? places.map((p) => `- ${p.title} | ${p.url} | ${p.description.slice(0, 240)}`).join("\n")
            : "none"
        }`
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const grounding = plan.needs.length
    ? `GROUNDING RULES (strict):
- The only businesses you may name are those in ZELTHIA DIRECTORY RESULTS and WEB RESULTS above. Do not name any other pharmacy, hospital, clinic, store or brand of shop, not even as an example or "e.g.".
- If you want to suggest looking locally, describe the type of place (e.g. "a community pharmacy" or "a teaching hospital's cardiology unit") without naming one.
- Copy phone numbers, prices and addresses only when complete in the results.`
    : "";
  const system = [buildSystemPrompt(profile), context, grounding].filter(Boolean).join("\n\n");
  let raw = "";
  let model = "";
  try {
    const out = await stream(system, turns, (delta) => emit({ type: "delta", text: delta }));
    raw = out.text;
    model = out.model;
  } catch (err) {
    console.error("All providers failed; using safety rules", err);
    const fb = generateClinicalFallback(userText, profile);
    raw = `[TRIAGE: ${fb.triageLevel.toUpperCase()}]\n${fb.message}`;
    model = "zelthia-safety-rules";
    emit({ type: "delta", text: stripTags(raw) });
  }

  const parsed = parseAiResponse(raw);
  return {
    content: parsed.message,
    title: plan.title,
    meta: {
      steps: steps.steps,
      triage: plan.emergency ? "urgent" : parsed.triageLevel,
      matches: matches.slice(0, 12),
      places: places.slice(0, 8),
      model,
    },
  };
}
