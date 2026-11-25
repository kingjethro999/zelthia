import "server-only";
import { fetchService } from "./http";

const timeout = () => Number(process.env.TRANSCRIPTION_TIMEOUT_MS) || 45000;

/** Speech to text: Groq Whisper first, Gemini as a fallback. */
export async function transcribe(audio: Buffer, mime: string): Promise<string> {
  const errors: string[] = [];
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    try {
      const form = new FormData();
      const ext = mime.includes("mp4")
        ? "m4a"
        : mime.includes("ogg")
          ? "ogg"
          : mime.includes("wav")
            ? "wav"
            : "webm";
      form.append(
        "file",
        new Blob([new Uint8Array(audio)], { type: mime }),
        `directions.${ext}`,
      );
      form.append(
        "model",
        process.env.GROQ_TRANSCRIPTION_MODEL || "whisper-large-v3-turbo",
      );
      form.append("response_format", "json");
      const res = await fetchService(
        "Groq transcription",
        "https://api.groq.com/openai/v1/audio/transcriptions",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${groqKey}` },
          body: form,
          signal: AbortSignal.timeout(timeout()),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(
          `Groq transcription responded ${res.status}: ${JSON.stringify(data).slice(0, 200)}`,
        );
      if (typeof data.text === "string") return data.text.trim();
      throw new Error("Groq transcription returned no text");
    } catch (err) {
      errors.push((err as Error).message);
    }
  }
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
      const res = await fetchService(
        "Gemini transcription",
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": geminiKey,
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    inline_data: {
                      mime_type: mime.split(";")[0],
                      data: audio.toString("base64"),
                    },
                  },
                  {
                    text: "Transcribe this recording word for word. Reply with the transcript only.",
                  },
                ],
              },
            ],
            generationConfig: { temperature: 0 },
          }),
          signal: AbortSignal.timeout(timeout()),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(`Gemini transcription responded ${res.status}`);
      const text = (data?.candidates?.[0]?.content?.parts ?? [])
        .map((p: { text?: string }) => p.text ?? "")
        .join("");
      if (text.trim()) return text.trim();
      throw new Error("Gemini transcription returned no text");
    } catch (err) {
      errors.push((err as Error).message);
    }
  }
  throw new Error(
    `Transcription failed: ${errors.join(" | ") || "no provider configured"}`,
  );
}
