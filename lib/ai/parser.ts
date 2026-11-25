import type { TriageLevel } from "./types";

const TRIAGE_RE = /\[TRIAGE:\s*(LOW|MODERATE|URGENT)\]/i;

/** Removes control tags the model writes for the app, including a half-written one mid-stream. */
export function stripTags(raw: string): string {
  return raw
    .replace(/\[TRIAGE:[^\]]*\]/gi, "")
    .replace(/\[REFERRAL:\s*\{[\s\S]*?\}\]/gi, "")
    .replace(/^\s*\[(T|TR|TRI|TRIA|TRIAG|TRIAGE)[^\]\n]*$/i, "")
    .trim();
}

export function parseAiResponse(raw: string): {
  message: string;
  triageLevel: TriageLevel;
} {
  const match = raw.match(TRIAGE_RE);
  let triageLevel: TriageLevel = "low";
  if (match) {
    triageLevel = match[1].toLowerCase() as TriageLevel;
  } else {
    const lower = raw.toLowerCase();
    if (
      /(call 112|emergency (department|room|unit)|life-threatening|ambulance)/.test(
        lower,
      )
    ) {
      triageLevel = "urgent";
    } else if (
      /(see a doctor|consult a doctor|within 24|within 48|healthcare provider)/.test(
        lower,
      )
    ) {
      triageLevel = "moderate";
    }
  }
  return { message: stripTags(raw), triageLevel };
}
