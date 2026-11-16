import "server-only";
import { BiometricProfile } from "./types";
import { buildSystemPrompt } from "./prompts";

interface MessageParam {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface OpenAICompatibleConfig {
  name: string;
  baseUrl: string;
  apiKey: string;
  model: string;
  maxTokens: number;
  timeoutMs: number;
}

/** Calls any OpenAI-style /chat/completions endpoint (Groq, NVIDIA, APMIX, OpenAI). */
export async function callOpenAICompatible(
  cfg: OpenAICompatibleConfig,
  messages: MessageParam[],
  biometrics?: BiometricProfile,
): Promise<string> {
  const formatted = [
    { role: "system" as const, content: buildSystemPrompt(biometrics) },
    ...messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
        content: m.content,
      })),
  ];

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), cfg.timeoutMs);
  try {
    const res = await fetch(`${cfg.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cfg.apiKey}`,
      },
      body: JSON.stringify({
        model: cfg.model,
        messages: formatted,
        temperature: 0.2,
        max_tokens: cfg.maxTokens,
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`${cfg.name} responded ${res.status}: ${errText.slice(0, 300)}`);
    }
    const data = await res.json();
    const text: unknown = data?.choices?.[0]?.message?.content;
    if (typeof text !== "string" || !text.trim()) {
      throw new Error(`${cfg.name} returned no text`);
    }
    return text;
  } finally {
    clearTimeout(timer);
  }
}
