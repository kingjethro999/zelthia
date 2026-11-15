import { BiometricProfile } from "./types";
import { buildSystemPrompt } from "./prompts";

interface MessageParam {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function callGroq(
  messages: MessageParam[],
  biometrics?: BiometricProfile,
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const model = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
  const url = "https://api.groq.com/openai/v1/chat/completions";

  const systemPrompt = buildSystemPrompt(biometrics);

  const formattedMessages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }> = [{ role: "system", content: systemPrompt }];

  for (const m of messages) {
    if (m.role === "system") continue;
    formattedMessages.push({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: formattedMessages,
        temperature: 0.2,
        max_tokens: 1500,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "Unknown error");
      throw new Error(
        `Groq API error status ${res.status}: ${errText.slice(0, 300)}`,
      );
    }

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error("No text returned in Groq response");
    }

    return text;
  } finally {
    clearTimeout(timeoutId);
  }
}
