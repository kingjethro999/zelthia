import { BiometricProfile, ChatResponseBody } from "./types";
import { callGemini } from "./gemini";
import { callGroq } from "./groq";
import { generateClinicalFallback } from "./fallback";
import { parseAiResponse } from "./parser";

interface GenerateChatOptions {
  messages: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }>;
  biometrics?: BiometricProfile;
}

export async function processChatConversation(
  options: GenerateChatOptions,
): Promise<ChatResponseBody> {
  const { messages, biometrics } = options;

  const lastUserMessage =
    [...messages].reverse().find((m) => m.role === "user")?.content || "";

  let rawOutput = "";
  let modelUsed = "";

  // 1. Attempt Gemini
  if (process.env.GEMINI_API_KEY) {
    try {
      rawOutput = await callGemini(messages, biometrics);
      modelUsed = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    } catch (err: unknown) {
      console.warn(
        "Gemini invocation error, attempting fallback provider:",
        (err as Error)?.message,
      );
    }
  }

  // 2. Attempt Groq if Gemini failed or was unconfigured
  if (!rawOutput && process.env.GROQ_API_KEY) {
    try {
      rawOutput = await callGroq(messages, biometrics);
      modelUsed = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
    } catch (err: unknown) {
      console.warn(
        "Groq invocation error, utilizing clinical fallback:",
        (err as Error)?.message,
      );
    }
  }

  // 3. Fallback to resilient clinical rule engine if both fail
  if (!rawOutput) {
    const fallback = generateClinicalFallback(lastUserMessage, biometrics);
    return {
      message: fallback.message,
      triageLevel: fallback.triageLevel,
      referral: fallback.referral,
      model: "zelthia-clinical-engine-v1",
      timestamp: new Date().toISOString(),
    };
  }

  // 4. Parse AI output
  const parsed = parseAiResponse(rawOutput);

  return {
    message: parsed.message,
    triageLevel: parsed.triageLevel,
    referral: parsed.referral,
    model: modelUsed || "ai-model",
    timestamp: new Date().toISOString(),
  };
}
