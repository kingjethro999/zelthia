import "server-only";
import { BiometricProfile } from "./types";
import { buildSystemPrompt } from "./prompts";

interface MessageParam {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function callGemini(
  messages: MessageParam[],
  biometrics?: BiometricProfile,
  opts: { model?: string; maxTokens?: number; timeoutMs?: number } = {},
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const model = opts.model || process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const systemPrompt = buildSystemPrompt(biometrics);

  // Convert messages to Gemini contents format
  const contents: Array<{
    role: "user" | "model";
    parts: Array<{ text: string }>;
  }> = [];

  for (const m of messages) {
    if (m.role === "system") continue;
    contents.push({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    });
  }

  // Ensure there's at least one user message
  if (contents.length === 0) {
    throw new Error("No user messages provided for Gemini");
  }

  const body = {
    system_instruction: {
      parts: [{ text: systemPrompt }],
    },
    contents,
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: opts.maxTokens ?? 1500,
    },
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    opts.timeoutMs ?? 12000,
  );

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "Unknown error");
      throw new Error(
        `Gemini API error status ${res.status}: ${errText.slice(0, 300)}`,
      );
    }

    const data = await res.json();
    const candidate = data?.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("No text returned in Gemini response");
    }

    return text;
  } finally {
    clearTimeout(timeoutId);
  }
}
