import { randomUUID } from "node:crypto";
import {
  HttpError,
  assertSameOrigin,
  handle,
  json,
  readJson,
  requireProvider,
} from "@/lib/server/api";
import { sniffAudio } from "@/lib/server/file-sniff";
import { uploadPrivate } from "@/lib/server/storage";
import { transcribe } from "@/lib/server/transcribe";
import { query } from "@/lib/server/db";
import { rateLimit } from "@/lib/server/rate-limit";

export const maxDuration = 60;

const AUDIO_MIME = /^audio\/(webm|ogg|mp4|mpeg|wav|x-m4a|aac)(;.*)?$/;
const MAX_BYTES = 3 * 1024 * 1024;

/** Stores a voice recording privately and returns its transcript. */
export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const user = await requireProvider();
    const limit = await rateLimit(`audio:${user.id}`, 20, 10 * 60_000);
    if (!limit.ok)
      throw new HttpError(
        `Too many recordings. Try again in ${limit.retryAfter} seconds.`,
        429,
      );

    const body = await readJson(req);
    const mime = String(body.mime ?? "");
    const base64 = String(body.base64 ?? "");
    if (!AUDIO_MIME.test(mime))
      throw new HttpError("That recording format isn't supported.", 400);

    // Reject oversized payloads before allocating a decoded Buffer.
    const estimatedBytes = Math.floor((base64.length * 3) / 4);
    if (!base64 || estimatedBytes > MAX_BYTES) {
      throw new HttpError("Keep recordings under about 3 minutes.", 400);
    }

    const audio = Buffer.from(base64, "base64");
    if (!audio.length || audio.length > MAX_BYTES) {
      throw new HttpError("Keep recordings under about 3 minutes.", 400);
    }

    const verifiedMime = sniffAudio(audio, mime);
    if (!verifiedMime) {
      throw new HttpError("That file does not appear to be a valid audio recording.", 400);
    }

    const [stored, transcript] = await Promise.all([
      uploadPrivate(
        `data:${verifiedMime};base64,${base64}`,
        `zelthia/audio/${user.id}`,
      ),
      transcribe(audio, verifiedMime).catch((err) => {
        // The audio is still useful on its own; the user can type the words.
        console.error("Transcription failed", err);
        return null;
      }),
    ]);

    const rows = await query<{ id: string }>(
      `insert into attachments (user_id, name, mime, size, storage_id, resource_type, format, extracted_text)
       values ($1,$2,$3,$4,$5,$6,$7,$8) returning id`,
      [
        user.id,
        `directions-${randomUUID().slice(0, 8)}`,
        verifiedMime,
        audio.length,
        stored.storageId,
        stored.resourceType,
        stored.format,
        transcript ?? "",
      ],
    );
    return json({
      id: rows[0].id,
      url: `/api/attachments/${rows[0].id}`,
      transcript,
    });
  } catch (err) {
    return handle("POST /api/audio", err);
  }
}
