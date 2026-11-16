import "server-only";
import { BiometricProfile, ChatResponseBody } from "./types";
import { callGemini } from "./gemini";
import { callOpenAICompatible } from "./openai-compatible";
import { generateClinicalFallback } from "./fallback";
import { parseAiResponse } from "./parser";

type Msg = { role: "user" | "assistant" | "system"; content: string };

interface Provider {
  id: string;
  model: string;
  run: (messages: Msg[], biometrics?: BiometricProfile) => Promise<string>;
}

const env = (k: string) => process.env[k]?.trim() || "";
const intEnv = (k: string, fallback: number) => {
  const n = Number.parseInt(env(k), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

/** Output cap per request; the chat reply format never needs more than this. */
const REPLY_TOKEN_CAP = 2600;

function openAIProvider(
  id: string,
  prefix: string,
  defaults: { baseUrl: string; model: string },
): Provider | null {
  const apiKey = env(`${prefix}_API_KEY`);
  if (!apiKey) return null;
  const model = env(`${prefix}_MODEL`) || defaults.model;
  return {
    id,
    model,
    run: (messages, biometrics) =>
      callOpenAICompatible(
        {
          name: id,
          baseUrl: env(`${prefix}_BASE_URL`) || defaults.baseUrl,
          apiKey,
          model,
          maxTokens: Math.min(intEnv(`${prefix}_MAX_OUTPUT_TOKENS`, 1500), REPLY_TOKEN_CAP),
          timeoutMs: intEnv("AI_REQUEST_TIMEOUT_MS", 12000),
        },
        messages,
        biometrics,
      ),
  };
}

function buildProviders(): Provider[] {
  const registry: Record<string, () => Provider | null> = {
    groq: () =>
      openAIProvider("groq", "GROQ", {
        baseUrl: "https://api.groq.com/openai/v1",
        model: "openai/gpt-oss-120b",
      }),
    gemini: () => {
      if (!env("GEMINI_API_KEY")) return null;
      const model = env("GEMINI_MODEL") || "gemini-2.5-flash";
      return {
        id: "gemini",
        model,
        run: (messages, biometrics) =>
          callGemini(messages, biometrics, {
            model,
            maxTokens: Math.min(intEnv("GEMINI_MAX_OUTPUT_TOKENS", 1500), REPLY_TOKEN_CAP),
            timeoutMs: intEnv("AI_REQUEST_TIMEOUT_MS", 12000),
          }),
      };
    },
    nvidia: () =>
      openAIProvider("nvidia", "NVIDIA", {
        baseUrl: "https://integrate.api.nvidia.com/v1",
        model: "nvidia/llama-3.3-nemotron-super-49b-v1",
      }),
    apmix: () =>
      openAIProvider("apmix", "APMIX", { baseUrl: "https://api.apmix.ai/v1", model: "" }),
    openai: () =>
      openAIProvider("openai", "OPENAI", {
        baseUrl: "https://api.openai.com/v1",
        model: "gpt-4.1-mini",
      }),
  };

  const order = (env("AI_PROVIDER_ORDER") || "groq,gemini,nvidia,apmix")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const providers = order
    .map((id) => registry[id]?.() ?? null)
    .filter((p): p is Provider => Boolean(p && p.model));

  // AI_MAX_FALLBACKS counts providers tried after the first one.
  return providers.slice(0, 1 + intEnv("AI_MAX_FALLBACKS", 3));
}

export async function processChatConversation(options: {
  messages: Msg[];
  biometrics?: BiometricProfile;
}): Promise<ChatResponseBody> {
  const { messages, biometrics } = options;

  for (const provider of buildProviders()) {
    try {
      const raw = await provider.run(messages, biometrics);
      const parsed = parseAiResponse(raw);
      return {
        message: parsed.message,
        triageLevel: parsed.triageLevel,
        referral: parsed.referral,
        model: provider.model,
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      console.warn(`AI provider ${provider.id} failed, trying next:`, (err as Error).message);
    }
  }

  // Every provider failed or none is configured: rule-based safety engine.
  const lastUserMessage =
    [...messages].reverse().find((m) => m.role === "user")?.content || "";
  const fallback = generateClinicalFallback(lastUserMessage, biometrics);
  return {
    message: fallback.message,
    triageLevel: fallback.triageLevel,
    referral: fallback.referral,
    model: "zelthia-safety-rules",
    timestamp: new Date().toISOString(),
  };
}
