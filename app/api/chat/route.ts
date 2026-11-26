import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import {
  readFiles,
  runTurn,
  StepTracker,
  userTurnText,
  type IncomingFile,
} from "@/lib/ai/agent";
import type { Turn } from "@/lib/ai/providers";
import {
  ACCEPTED_MIME,
  MAX_ATTACHMENTS,
  MAX_ATTACHMENT_BYTES,
  type AttachmentView,
  type ChatEvent,
  type ChatMessageView,
} from "@/lib/chat-types";
import { getSessionContext, type SessionContext } from "@/lib/server/auth";
import { aadAttachmentFile, encryptBytes } from "@/lib/server/crypto";
import { assertJson, assertSameOrigin, handle } from "@/lib/server/api";
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
import { uploadPrivateRaw } from "@/lib/server/storage";
import { sniffChatAttachment } from "@/lib/server/file-sniff";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";

export const maxDuration = 120;

function bad(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

export async function POST(req: NextRequest) {
  try {
    assertSameOrigin(req);
    assertJson(req);
  } catch (err) {
    return handle("POST /api/chat", err);
  }
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return bad("Send a JSON body.");
  }

  const text = typeof body.text === "string" ? body.text.slice(0, 8000) : "";
  const rawFiles = Array.isArray(body.files) ? body.files : [];
  if (!text.trim() && rawFiles.length === 0)
    return bad("Type a message or attach a file.");
  if (rawFiles.length > MAX_ATTACHMENTS)
    return bad(`Attach up to ${MAX_ATTACHMENTS} files at a time.`);

  const files: IncomingFile[] = [];
  for (const f of rawFiles as Record<string, unknown>[]) {
    const mime = String(f?.mime ?? "");
    const base64 = String(f?.base64 ?? "");
    const name = String(f?.name ?? "file").slice(0, 120);
    if (!ACCEPTED_MIME.includes(mime))
      return bad(`${name} isn't a supported file type.`);
    const estSize = Math.floor((base64.length * 3) / 4);
    if (!base64 || estSize > MAX_ATTACHMENT_BYTES)
      return bad(`${name} is larger than 3 MB.`);
    const rawBuf = Buffer.from(base64, "base64");
    if (!rawBuf.length || rawBuf.length > MAX_ATTACHMENT_BYTES)
      return bad(`${name} is larger than 3 MB.`);
    const verifiedMime = sniffChatAttachment(rawBuf, mime);
    if (!verifiedMime)
      return bad(
        `${name} does not match a supported image, PDF, or text file.`,
      );
    files.push({ name, mime: verifiedMime, size: rawBuf.length, base64 });
  }

  let ctx: SessionContext | null = null;
  let sessionFailed = false;
  try {
    ctx = await getSessionContext();
  } catch (err) {
    // Recover by answering as a guest; the user is told once the stream opens.
    console.warn("Chat: session lookup failed, continuing as guest", err);
    sessionFailed = true;
  }
  const user = ctx?.user ?? null;
  const limit = user
    ? await rateLimit(`chat:u:${user.id}`, 40, 10 * 60_000)
    : await rateLimit(`chat:ip:${clientIp(req)}`, 15, 10 * 60_000);
  if (!limit.ok)
    return bad(
      `You're sending messages quickly. Try again in ${limit.retryAfter} seconds.`,
      429,
    );

  const saved = Boolean(ctx) && body.temporary !== true;
  let conversationId: string | null = null;
  let isNew = false;
  if (saved && ctx && typeof body.conversationId === "string") {
    const conv = await getConversation(
      body.conversationId,
      ctx.user.id,
      ctx.dek,
    );
    if (!conv) return bad("That conversation doesn't exist.", 404);
    conversationId = conv.id;
  }

  const encoder = new TextEncoder();
  const streamBody = new ReadableStream({
    async start(controller) {
      const emit = (e: ChatEvent) =>
        controller.enqueue(encoder.encode(`${JSON.stringify(e)}\n`));
      const steps = new StepTracker(emit);
      try {
        if (sessionFailed) {
          steps.finish(
            steps.start("Checking your account"),
            "Couldn't reach your account, so this chat won't be saved. Your answer is unaffected.",
            "failed",
          );
        }
        if (saved && ctx && !conversationId) {
          const conv = await createConversation(
            ctx.user.id,
            "New chat",
            ctx.dek,
          );
          conversationId = conv.id;
          isNew = true;
          emit({ type: "conversation", id: conv.id, title: conv.title });
        }

        // Profile: the encrypted server copy for signed-in users, the device copy for guests.
        let profile = sanitizeProfile(body.biometrics);
        if (ctx) {
          const p = await getProfile(ctx.user.id, ctx.dek).catch(() => null);
          if (p) profile = sanitizeProfile(p);
        }

        let history: Turn[] = [];
        if (saved && ctx && conversationId && !isNew) {
          history = await getHistoryTurns(conversationId, ctx.user.id, ctx.dek);
        } else if (Array.isArray(body.history)) {
          const filtered = (body.history as Turn[])
            .filter(
              (t) =>
                t &&
                (t.role === "user" || t.role === "assistant") &&
                typeof t.content === "string",
            )
            .slice(-12)
            .map((t) => ({ role: t.role, content: t.content.slice(0, 4000) }));
          let budget = 20_000;
          const bounded: Turn[] = [];
          for (let i = filtered.length - 1; i >= 0 && budget > 0; i--) {
            const c = filtered[i].content.slice(0, budget);
            budget -= c.length;
            bounded.unshift({ role: filtered[i].role, content: c });
          }
          history = bounded;
        }

        const read = await readFiles(files, steps);

        // Save the encrypted user message and encrypted files before answering, so a dropped connection loses nothing.
        let userView: ChatMessageView = {
          id: randomUUID(),
          role: "user",
          content: text,
          createdAt: new Date().toISOString(),
          attachments: read.map((f) => ({
            name: f.name,
            mime: f.mime,
            size: f.size,
          })),
        };
        if (saved && ctx && conversationId) {
          const row = await insertMessage(
            conversationId,
            ctx.user.id,
            "user",
            text,
            {},
            ctx.dek,
          );
          const attachments: AttachmentView[] = [];
          await Promise.all(
            read.map(async (f, i) => {
              const attId = randomUUID();
              let stored = null;
              try {
                const encryptedBlob = encryptBytes(
                  Buffer.from(f.base64, "base64"),
                  ctx.dek,
                  aadAttachmentFile(ctx.user.id, attId),
                );
                stored = await uploadPrivateRaw(
                  encryptedBlob,
                  `zelthia/chat/${ctx.user.id}`,
                );
              } catch (err) {
                // Recover: the file was already read for this answer; tell the user it isn't stored.
                console.error(
                  "Attachment upload failed; keeping the transcript only",
                  err,
                );
                steps.finish(
                  steps.start(`Saving ${f.name}`),
                  "Couldn't store this file, so it won't open from your history. It was still read for this answer.",
                  "failed",
                );
              }
              await insertAttachment({
                id: attId,
                userId: ctx.user.id,
                messageId: row.id,
                name: f.name,
                mime: f.mime,
                size: f.size,
                storageId: stored?.storageId ?? null,
                resourceType: stored?.resourceType ?? null,
                format: stored?.format ?? null,
                extractedText: f.extracted,
                encrypted: Boolean(stored),
                dek: ctx.dek,
              });
              attachments[i] = {
                id: attId,
                name: f.name,
                mime: f.mime,
                size: f.size,
                url: stored ? `/api/attachments/${attId}` : undefined,
              };
            }),
          );
          userView = {
            ...userView,
            id: row.id,
            createdAt: row.created_at.toISOString(),
            attachments,
          };
        }
        emit({
          type: "user-saved",
          message: userView,
          context: userTurnText(text, read),
        });

        const result = await runTurn({
          history,
          text,
          files: read,
          profile,
          steps,
          emit,
        });

        let assistant: ChatMessageView = {
          id: randomUUID(),
          role: "assistant",
          content: result.content,
          createdAt: new Date().toISOString(),
          meta: result.meta,
        };
        if (saved && ctx && conversationId) {
          const row = await insertMessage(
            conversationId,
            ctx.user.id,
            "assistant",
            result.content,
            result.meta,
            ctx.dek,
          );
          assistant = {
            ...assistant,
            id: row.id,
            createdAt: row.created_at.toISOString(),
          };
          if (isNew) {
            await renameConversation(
              conversationId,
              ctx.user.id,
              result.title,
              ctx.dek,
            );
            emit({
              type: "conversation",
              id: conversationId,
              title: result.title,
            });
          }
          await touchConversation(conversationId);
        }
        emit({ type: "done", message: assistant });
      } catch (err) {
        console.error("POST /api/chat failed", err);
        emit({
          type: "error",
          message:
            "Zelthia couldn't finish this answer. Check your connection and send it again. If symptoms are severe, call 112.",
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
