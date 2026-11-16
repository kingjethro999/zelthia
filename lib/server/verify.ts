import "server-only";
import { complete } from "@/lib/ai/providers";
import type { Facility, Verification } from "@/lib/inventory-types";
import { fetchService } from "./http";

const PENDING_NOTE =
  "We couldn't confirm this licence online, so a person will review it. This takes up to 7 days.";

interface Hit {
  url: string;
  title: string;
  description: string;
}

async function search(q: string): Promise<Hit[]> {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) return [];
  const res = await fetchService("Firecrawl", "https://api.firecrawl.dev/v2/search", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: q, limit: 6, country: "NG" }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Firecrawl responded ${res.status}`);
  const data = await res.json().catch(() => ({}));
  return ((data?.data?.web ?? []) as Hit[]).filter((h) => h.url);
}

const squash = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * Tries to confirm a facility's licence from public sources. Only returns
 * "verified" when a page contains the licence number itself and the model
 * agrees it belongs to this facility; anything less goes to human review.
 */
export async function verifyFacility(f: Facility): Promise<Verification> {
  if (!f.licenseNumber.trim()) {
    return { status: "none", note: "", url: "" };
  }
  try {
    const results = await Promise.allSettled([
      search(`"${f.licenseNumber}" ${f.name}`),
      search(`${f.name} ${f.city} registered ${f.kind} licence`),
    ]);
    const hits = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
    const licence = squash(f.licenseNumber);
    const withNumber = hits.filter((h) => squash(`${h.title} ${h.description}`).includes(licence));
    if (!withNumber.length) return { status: "pending", note: PENDING_NOTE, url: "" };

    const { text } = await complete(
      `You check whether public web results prove a Nigerian health facility's licence. Reply with JSON only:
{"verified": boolean, "url": "the result that proves it, or empty", "reason": "one short sentence"}
Say verified only if a result clearly ties THIS facility name and location to THIS licence or registration number (e.g. a PCN, MDCN, HEFAMAA or state ministry listing). Similar names or a number alone are not enough.`,
      [
        {
          role: "user",
          content: `Facility: ${f.name} (${f.kind}), ${f.address}, ${f.city} ${f.state}
Licence or registration number: ${f.licenseNumber}
Results:
${withNumber.map((h) => `- ${h.title} | ${h.url} | ${h.description}`).join("\n")}`,
        },
      ],
      { json: true },
    );
    const verdict = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? "{}");
    const url = typeof verdict.url === "string" ? verdict.url : "";
    if (verdict.verified === true && withNumber.some((h) => h.url === url)) {
      return {
        status: "verified",
        note: typeof verdict.reason === "string" ? verdict.reason.slice(0, 240) : "Confirmed from a public listing.",
        url,
      };
    }
    return { status: "pending", note: PENDING_NOTE, url: "" };
  } catch (err) {
    // Fail gracefully: a human reviews anything we can't confirm automatically.
    console.error("Licence verification failed", err);
    return { status: "pending", note: PENDING_NOTE, url: "" };
  }
}
