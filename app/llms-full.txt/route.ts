import { llmsText } from "@/lib/site-facts";

/** Plain-text description of Zelthia for AI agents and answer engines. */
export function GET() {
  return new Response(llmsText(true), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
