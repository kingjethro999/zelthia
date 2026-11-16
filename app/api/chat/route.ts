import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { readFiles, runTurn, StepTracker, userTurnText, type IncomingFile } from "@/lib/ai/agent";
import type { Turn } from "@/lib/ai/providers";
import {
  ACCEPTED_MIME,
  MAX_ATTACHMENTS,
  MAX_ATTACHMENT_BYTES,
  type AttachmentView,
  type ChatEvent,
  type ChatMessageView,
} from "@/lib/chat-types";
import { getSessionUser } from "@/lib/server/auth";
import { getProfile, sanitizeProfile } from "@/lib/server/profile";
import {
  createConversation,
  getConversation,
  getHistoryTurns,
  insertAttachment,
  insertMessage,
  renameConversation,
  touchConversation,
} from "@/lib/server/conversations";
import { uploadPrivate } from "@/lib/server/storage";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";

export const maxDuration = 120;

function bad(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return bad("Send a JSON body.");
  }

  const text = typeof body.text === "string" ? body.text.slice(0, 8000) : "";
  const rawFiles = Array.isArray(body.files) ? body.files : [];
  if (!text.trim() && rawFiles.length === 0) return bad("Type a message or attach a file.");
  if (rawFiles.length > MAX_ATTACHMENTS) return bad(`Attach up to ${MAX_ATTACHMENTS} files at a time.`);

  const files: IncomingFile[] = [];
  for (const f of rawFiles as Record<string, unknown>[]) {
    const mime = String(f?.mime ?? "");
    const base64 = String(f?.base64 ?? "");
    const name = String(f?.name ?? "file").slice(0, 120);
    if (!ACCEPTED_MIME.includes(mime)) return bad(`${name} isn't a supported file type.`);
    const size = Math.floor((base64.length * 3) / 4);
    if (!base64 || size > MAX_ATTACHMENT_BYTES) return bad(`${name} is larger than 3 MB.`);
    files.push({ name, mime, size, base64 });
  }

  let user = null;
  try {
    user = await getSessionUser();
  } catch (err) {
    console.warn("Chat: session lookup failed, continuing as guest", err);
  }
  const limit = user ? rateLimit(`chat:u:${user.id}`, 40, 10 * 60_000) : rateLimit(`chat:ip:${clientIp(req)}`, 15, 10 * 60_000);
  if (!limit.ok) return bad(`You're sending messages quickly. Try again in ${limit.retryAfter} seconds.`, 429);

  const saved = Boolean(user) && body.temporary !== true;
  let conversationId: string | null = null;
  let isNew = false;
  if (saved && typeof body.conversationId === "string") {
    const conv = await getConversation(body.conversationId, user!.id);
    if (!conv) return bad("That conversation doesn't exist.", 404);
    conversationId = conv.id;
  }

  const encoder = new TextEncoder();
  const streamBody = new ReadableStream({
    async start(controller) {
      const emit = (e: ChatEvent) => controller.enqueue(encoder.encode(`${JSON.stringify(e)}\n`));
      try {
        if (saved && !conversationId) {
          const conv = await createConversation(user!.id, "New chat");
          conversationId = conv.id;
          isNew = true;
          emit({ type: "conversation", id: conv.id, title: conv.title });
        }

        // Profile: the saved one for signed-in users, the device copy for guests.
        let profile = sanitizeProfile(body.biometrics);
        if (user) {
          const p = await getProfile(user.id).catch(() => null);
          if (p) profile = sanitizeProfile(p);
        }

        let history: Turn[] = [];
        if (saved && conversationId && !isNew) {
          history = await getHistoryTurns(conversationId);
        } else if (Array.isArray(body.history)) {
          history = (body.history as Turn[])
            .filter((t) => t && (t.role === "user" || t.role === "assistant") && typeof t.content === "string")
            .slice(-20)
            .map((t) => ({ role: t.role, content: t.content.slice(0, 12000) }));
        }

        const steps = new StepTracker(emit);
        const read = await readFiles(files, steps);

        // Save the user's message and files before answering, so a dropped connection loses nothing.
        let userView: ChatMessageView = {
          id: randomUUID(),
          role: "user",
          content: text,
          createdAt: new Date().toISOString(),
          attachments: read.map((f) => ({ name: f.name, mime: f.mime, size: f.size })),
        };
        if (saved && conversationId) {
          const row = await insertMessage(conversationId, "user", text);
          const attachments: AttachmentView[] = [];
          await Promise.all(
            read.map(async (f, i) => {
              let stored = null;
              try {
                stored = await uploadPrivate(`data:${f.mime};base64,${f.base64}`, `zelthia/chat/${user!.id}`);
              } catch (err) {
                console.error("Attachment upload failed; keeping the transcript only", err);
              }
              const id = await insertAttachment({
                userId: user!.id,
                messageId: row.id,
                name: f.name,
                mime: f.mime,
                size: f.size,
                storageId: stored?.storageId ?? null,
                resourceType: stored?.resourceType ?? null,
                format: stored?.format ?? null,
                extractedText: f.extracted,
              });
              attachments[i] = { id, name: f.name, mime: f.mime, size: f.size, url: stored ? `/api/attachments/${id}` : undefined };
            }),
          );
          userView = { ...userView, id: row.id, createdAt: row.created_at.toISOString(), attachments };
        }
        emit({ type: "user-saved", message: userView, context: userTurnText(text, read) });

        const result = await runTurn({ history, text, files: read, profile, steps, emit });

        let assistant: ChatMessageView = {
          id: randomUUID(),
          role: "assistant",
          content: result.content,
          createdAt: new Date().toISOString(),
          meta: result.meta,
        };
        if (saved && conversationId) {
          const row = await insertMessage(conversationId, "assistant", result.content, result.meta);
          assistant = { ...assistant, id: row.id, createdAt: row.created_at.toISOString() };
          if (isNew) {
            await renameConversation(conversationId, user!.id, result.title);
            emit({ type: "conversation", id: conversationId, title: result.title });
          }
          await touchConversation(conversationId);
        }
        emit({ type: "done", message: assistant });
      } catch (err) {
        console.error("POST /api/chat failed", err);
        emit({
          type: "error",
          message: "Zelthia couldn't finish this answer. Check your connection and send it again. If symptoms are severe, call 112.",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(streamBody, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
