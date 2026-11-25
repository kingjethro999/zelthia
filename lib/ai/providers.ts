import "server-only";
import { fetchService } from "@/lib/server/http";

export type Turn = { role: "user" | "assistant"; content: string };

const env = (k: string) => process.env[k]?.trim() || "";
const intEnv = (k: string, d: number) => {
  const n = Number.parseInt(env(k), 10);
  return Number.isFinite(n) && n > 0 ? n : d;
};
const timeoutMs = () => intEnv("AI_REQUEST_TIMEOUT_MS", 12000);
/** Long answers stream for longer than a single request timeout. */
const STREAM_TIMEOUT_MS = 90_000;
const REPLY_TOKEN_CAP = 3000;

interface ProviderCfg {
  id: string;
  kind: "openai" | "gemini";
  baseUrl: string;
  apiKey: string;
  model: string;
  visionModel: string | null;
  maxTokens: number;
  /** Gemini reads PDFs natively; others need extracted text. */
  pdf: boolean;
}

function configured(): ProviderCfg[] {
  const defs: Record<string, () => ProviderCfg | null> = {
    groq: () =>
      env("GROQ_API_KEY")
        ? {
            id: "groq",
            kind: "openai",
            baseUrl: env("GROQ_BASE_URL") || "https://api.groq.com/openai/v1",
            apiKey: env("GROQ_API_KEY"),
            model: env("GROQ_MODEL") || "openai/gpt-oss-120b",
            visionModel: env("GROQ_VISION_MODEL") || null,
            maxTokens: Math.min(
              intEnv("GROQ_MAX_OUTPUT_TOKENS", 2000),
              REPLY_TOKEN_CAP,
            ),
            pdf: false,
          }
        : null,
    gemini: () =>
      env("GEMINI_API_KEY")
        ? {
            id: "gemini",
            kind: "gemini",
            baseUrl: "https://generativelanguage.googleapis.com/v1beta",
            apiKey: env("GEMINI_API_KEY"),
            model: env("GEMINI_MODEL") || "gemini-2.5-flash",
            visionModel: env("GEMINI_MODEL") || "gemini-2.5-flash",
            maxTokens: Math.min(
              intEnv("GEMINI_MAX_OUTPUT_TOKENS", 2000),
              REPLY_TOKEN_CAP,
            ),
            pdf: true,
          }
        : null,
    nvidia: () =>
      env("NVIDIA_API_KEY") && env("NVIDIA_MODEL")
        ? {
            id: "nvidia",
            kind: "openai",
            baseUrl:
              env("NVIDIA_BASE_URL") || "https://integrate.api.nvidia.com/v1",
            apiKey: env("NVIDIA_API_KEY"),
            model: env("NVIDIA_MODEL"),
            visionModel: env("NVIDIA_VISION_MODEL") || null,
            maxTokens: Math.min(
              intEnv("NVIDIA_MAX_OUTPUT_TOKENS", 2000),
              REPLY_TOKEN_CAP,
            ),
            pdf: false,
          }
        : null,
    apmix: () =>
      env("APMIX_API_KEY") && env("APMIX_MODEL")
        ? {
            id: "apmix",
            kind: "openai",
            baseUrl: env("APMIX_BASE_URL") || "https://api.apmix.ai/v1",
            apiKey: env("APMIX_API_KEY"),
            model: env("APMIX_MODEL"),
            visionModel: null,
            maxTokens: Math.min(
              intEnv("APMIX_MAX_OUTPUT_TOKENS", 2000),
              REPLY_TOKEN_CAP,
            ),
            pdf: false,
          }
        : null,
    openai: () =>
      env("OPENAI_API_KEY")
        ? {
            id: "openai",
            kind: "openai",
            baseUrl: "https://api.openai.com/v1",
            apiKey: env("OPENAI_API_KEY"),
            model: env("OPENAI_MODEL") || "gpt-4.1-mini",
            visionModel: env("OPENAI_MODEL") || "gpt-4.1-mini",
            maxTokens: Math.min(
              intEnv("OPENAI_MAX_OUTPUT_TOKENS", 2000),
              REPLY_TOKEN_CAP,
            ),
            pdf: false,
          }
        : null,
  };
  const order = (env("AI_PROVIDER_ORDER") || "groq,gemini,nvidia,apmix")
    .split(",")
    .map((s) => s.trim().toLowerCase());
  const list = order
    .map((id) => defs[id]?.())
    .filter((p): p is ProviderCfg => Boolean(p));
  return list.slice(0, 1 + intEnv("AI_MAX_FALLBACKS", 3));
}

/* ---------- request builders ---------- */

function openaiBody(
  p: ProviderCfg,
  system: string,
  turns: Turn[],
  extra: object,
) {
  return {
    model: p.model,
    temperature: 0.2,
    max_tokens: p.maxTokens,
    messages: [{ role: "system", content: system }, ...turns],
    ...extra,
  };
}

function geminiBody(
  p: ProviderCfg,
  system: string,
  turns: Turn[],
  json = false,
) {
  return {
    system_instruction: { parts: [{ text: system }] },
    contents: turns.map((t) => ({
      role: t.role === "assistant" ? "model" : "user",
      parts: [{ text: t.content }],
    })),
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: p.maxTokens,
      ...(json ? { responseMimeType: "application/json" } : {}),
    },
  };
}

async function failIfBad(res: Response, id: string) {
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`${id} responded ${res.status}: ${t.slice(0, 200)}`);
  }
}

/* ---------- one-shot completion ---------- */

async function completeOne(
  p: ProviderCfg,
  system: string,
  turns: Turn[],
  json: boolean,
) {
  if (p.kind === "gemini") {
    const res = await fetchService(
      p.id,
      `${p.baseUrl}/models/${p.model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": p.apiKey,
        },
        body: JSON.stringify(geminiBody(p, system, turns, json)),
        signal: AbortSignal.timeout(timeoutMs()),
      },
    );
    await failIfBad(res, p.id);
    const data = await res.json();
    const text = (data?.candidates?.[0]?.content?.parts ?? [])
      .map((x: { text?: string }) => x.text ?? "")
      .join("");
    if (!text) throw new Error(`${p.id} returned no text`);
    return text as string;
  }
  const res = await fetchService(p.id, `${p.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${p.apiKey}`,
    },
    body: JSON.stringify(
      openaiBody(
        p,
        system,
        turns,
        json ? { response_format: { type: "json_object" } } : {},
      ),
    ),
    signal: AbortSignal.timeout(timeoutMs()),
  });
  await failIfBad(res, p.id);
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (typeof text !== "string" || !text.trim())
    throw new Error(`${p.id} returned no text`);
  return text;
}

export async function complete(
  system: string,
  turns: Turn[],
  opts: { json?: boolean } = {},
) {
  const errors: string[] = [];
  for (const p of configured()) {
    try {
      return {
        text: await completeOne(p, system, turns, Boolean(opts.json)),
        model: p.model,
      };
    } catch (err) {
      errors.push((err as Error).message);
      // A provider that rejects json mode may still answer in plain text.
      if (opts.json) {
        try {
          return {
            text: await completeOne(p, system, turns, false),
            model: p.model,
          };
        } catch {
          /* fall through to the next provider */
        }
      }
    }
  }
  throw new Error(`All AI providers failed: ${errors.join(" | ")}`);
}

/* ---------- streaming ---------- */

async function* sseData(res: Response) {
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let nl: number;
    while ((nl = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, nl).trim();
      buf = buf.slice(nl + 1);
      if (line.startsWith("data:")) yield line.slice(5).trim();
    }
  }
}

async function streamOne(
  p: ProviderCfg,
  system: string,
  turns: Turn[],
  onDelta: (t: string) => void,
) {
  let text = "";
  if (p.kind === "gemini") {
    const res = await fetchService(
      p.id,
      `${p.baseUrl}/models/${p.model}:streamGenerateContent?alt=sse`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": p.apiKey,
        },
        body: JSON.stringify(geminiBody(p, system, turns)),
        signal: AbortSignal.timeout(STREAM_TIMEOUT_MS),
      },
    );
    await failIfBad(res, p.id);
    for await (const data of sseData(res)) {
      try {
        const parts = JSON.parse(data)?.candidates?.[0]?.content?.parts ?? [];
        const chunk = parts
          .map((x: { text?: string }) => x.text ?? "")
          .join("");
        if (chunk) {
          text += chunk;
          onDelta(chunk);
        }
      } catch {
        /* keep-alive or partial line */
      }
    }
  } else {
    const res = await fetchService(p.id, `${p.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${p.apiKey}`,
      },
      body: JSON.stringify(openaiBody(p, system, turns, { stream: true })),
      signal: AbortSignal.timeout(STREAM_TIMEOUT_MS),
    });
    await failIfBad(res, p.id);
    for await (const data of sseData(res)) {
      if (data === "[DONE]") break;
      try {
        const chunk = JSON.parse(data)?.choices?.[0]?.delta?.content;
        if (typeof chunk === "string" && chunk) {
          text += chunk;
          onDelta(chunk);
        }
      } catch {
        /* partial line */
      }
    }
  }
  if (!text.trim()) throw new Error(`${p.id} streamed no text`);
  return text;
}

/**
 * Streams from the first provider that produces output. A provider is only
 * abandoned if it fails before sending any text, so the user never sees a
 * half answer spliced with another model's.
 */
export async function stream(
  system: string,
  turns: Turn[],
  onDelta: (t: string) => void,
) {
  const errors: string[] = [];
  for (const p of configured()) {
    let sent = false;
    try {
      const text = await streamOne(p, system, turns, (t) => {
        sent = true;
        onDelta(t);
      });
      return { text, model: p.model };
    } catch (err) {
      errors.push((err as Error).message);
      if (sent) throw err;
    }
  }
  throw new Error(`All AI providers failed: ${errors.join(" | ")}`);
}

/* ---------- vision: read images and documents ---------- */

export interface BinaryInput {
  mime: string;
  base64: string;
}

export async function readWithVision(prompt: string, file: BinaryInput) {
  const isPdf = file.mime === "application/pdf";
  const errors: string[] = [];
  for (const p of configured()) {
    if (!p.visionModel || (isPdf && !p.pdf)) continue;
    try {
      if (p.kind === "gemini") {
        const res = await fetchService(
          p.id,
          `${p.baseUrl}/models/${p.visionModel}:generateContent`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": p.apiKey,
            },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      inline_data: { mime_type: file.mime, data: file.base64 },
                    },
                    { text: prompt },
                  ],
                },
              ],
              generationConfig: { temperature: 0.1, maxOutputTokens: 2000 },
            }),
            signal: AbortSignal.timeout(45000),
          },
        );
        await failIfBad(res, p.id);
        const data = await res.json();
        const text = (data?.candidates?.[0]?.content?.parts ?? [])
          .map((x: { text?: string }) => x.text ?? "")
          .join("");
        if (text.trim()) return { text, model: p.visionModel };
        throw new Error(`${p.id} vision returned no text`);
      }
      const res = await fetchService(p.id, `${p.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${p.apiKey}`,
        },
        body: JSON.stringify({
          model: p.visionModel,
          temperature: 0.1,
          max_tokens: 2000,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                {
                  type: "image_url",
                  image_url: { url: `data:${file.mime};base64,${file.base64}` },
                },
              ],
            },
          ],
        }),
        signal: AbortSignal.timeout(45000),
      });
      await failIfBad(res, p.id);
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content;
      if (typeof text === "string" && text.trim())
        return { text, model: p.visionModel };
      throw new Error(`${p.id} vision returned no text`);
    } catch (err) {
      errors.push((err as Error).message);
    }
  }
  throw new Error(
    `No vision provider could read the file: ${errors.join(" | ")}`,
  );
}
