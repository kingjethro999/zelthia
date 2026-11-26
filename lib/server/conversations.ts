import "server-only";
import { randomUUID } from "node:crypto";
import type {
  AttachmentView,
  ChatMessageView,
  ConversationSummary,
  MessageMeta,
} from "@/lib/chat-types";
import {
  aadAttachmentText,
  aadConvTitle,
  aadMessage,
  decryptText,
  encryptText,
} from "./crypto";
import { query } from "./db";
import { isUuid } from "./inventory";

interface MessageRow {
  id: string;
  role: "user" | "assistant";
  content: string;
  meta: MessageMeta;
  payload_enc: string | null;
  created_at: Date;
  attachments:
    { id: string; name: string; mime: string; size: number }[] | null;
}

function decryptConvTitle(
  id: string,
  userId: string,
  title: string,
  titleEnc: string | null,
  dek: Buffer,
): string {
  if (!titleEnc) return title;
  try {
    return decryptText(titleEnc, dek, aadConvTitle(userId, id));
  } catch {
    return "Encrypted chat";
  }
}

function decryptMsgPayload(
  msgId: string,
  convId: string,
  userId: string,
  content: string,
  meta: MessageMeta,
  payloadEnc: string | null,
  dek: Buffer,
): { content: string; meta: MessageMeta } {
  if (!payloadEnc) return { content, meta: meta ?? {} };
  try {
    const parsed = JSON.parse(
      decryptText(payloadEnc, dek, aadMessage(userId, convId, msgId)),
    ) as { content?: string; meta?: MessageMeta };
    return {
      content: typeof parsed.content === "string" ? parsed.content : "",
      meta: parsed.meta ?? {},
    };
  } catch {
    return { content: "[Encrypted message could not be unlocked]", meta: {} };
  }
}

export async function listConversations(
  userId: string,
  dek: Buffer,
): Promise<ConversationSummary[]> {
  const rows = await query<{
    id: string;
    title: string;
    title_enc: string | null;
    updated_at: Date;
  }>(
    `select id, title, title_enc, updated_at from conversations
      where user_id = $1 order by updated_at desc limit 200`,
    [userId],
  );
  return rows.map((r) => ({
    id: r.id,
    title: decryptConvTitle(r.id, userId, r.title, r.title_enc, dek),
    updatedAt: r.updated_at.toISOString(),
  }));
}

export async function getConversation(id: string, userId: string, dek: Buffer) {
  if (!isUuid(id)) return null;
  const rows = await query<{
    id: string;
    title: string;
    title_enc: string | null;
  }>(
    "select id, title, title_enc from conversations where id = $1 and user_id = $2",
    [id, userId],
  );
  if (!rows[0]) return null;
  return {
    id: rows[0].id,
    title: decryptConvTitle(
      rows[0].id,
      userId,
      rows[0].title,
      rows[0].title_enc,
      dek,
    ),
  };
}

export async function createConversation(
  userId: string,
  title: string,
  dek: Buffer,
) {
  const id = randomUUID();
  const cleanTitle = title.slice(0, 120) || "New chat";
  const titleEnc = encryptText(cleanTitle, dek, aadConvTitle(userId, id));
  await query(
    "insert into conversations (id, user_id, title, title_enc) values ($1, $2, 'Encrypted chat', $3)",
    [id, userId, titleEnc],
  );
  return { id, title: cleanTitle };
}

export async function renameConversation(
  id: string,
  userId: string,
  title: string,
  dek: Buffer,
) {
  if (!isUuid(id)) return false;
  const cleanTitle = title.trim().slice(0, 120) || "New chat";
  const titleEnc = encryptText(cleanTitle, dek, aadConvTitle(userId, id));
  const rows = await query<{ id: string }>(
    "update conversations set title = 'Encrypted chat', title_enc = $3 where id = $1 and user_id = $2 returning id",
    [id, userId, titleEnc],
  );
  return rows.length > 0;
}

export async function touchConversation(id: string) {
  await query("update conversations set updated_at = now() where id = $1", [
    id,
  ]);
}

export async function deleteConversation(id: string, userId: string) {
  if (!isUuid(id)) return [];
  const files = await query<{
    storage_id: string;
    resource_type: string;
    format: string;
  }>(
    `select a.storage_id, a.resource_type, a.format from attachments a
       join messages m on m.id = a.message_id
       join conversations c on c.id = m.conversation_id
      where c.id = $1 and c.user_id = $2 and a.storage_id is not null`,
    [id, userId],
  );
  await query("delete from conversations where id = $1 and user_id = $2", [
    id,
    userId,
  ]);
  return files;
}

export async function getMessages(
  conversationId: string,
  userId: string,
  dek: Buffer,
): Promise<ChatMessageView[]> {
  const rows = await query<MessageRow>(
    `select m.id, m.role, m.content, m.meta, m.payload_enc, m.created_at,
            (select json_agg(json_build_object('id', a.id, 'name', a.name, 'mime', a.mime, 'size', a.size)
                             order by a.created_at)
               from attachments a where a.message_id = m.id) as attachments
       from messages m where m.conversation_id = $1 order by m.created_at`,
    [conversationId],
  );
  return rows.map((r) => {
    const payload = decryptMsgPayload(
      r.id,
      conversationId,
      userId,
      r.content,
      r.meta,
      r.payload_enc,
      dek,
    );
    return {
      id: r.id,
      role: r.role,
      content: payload.content,
      createdAt: r.created_at.toISOString(),
      meta: payload.meta,
      attachments: (r.attachments ?? []).map((a): AttachmentView => ({
        id: a.id,
        name: a.name,
        mime: a.mime,
        size: a.size,
        url: `/api/attachments/${a.id}`,
      })),
    };
  });
}

/** Text the model sees for earlier turns, including decrypted attachment transcripts. */
export async function getHistoryTurns(
  conversationId: string,
  userId: string,
  dek: Buffer,
  limit = 20,
) {
  const rows = await query<{
    id: string;
    role: "user" | "assistant";
    content: string;
    payload_enc: string | null;
    atts:
      | {
          id: string;
          name: string;
          extracted_text: string | null;
          extracted_enc: string | null;
        }[]
      | null;
  }>(
    `select * from (
       select m.id, m.role, m.content, m.payload_enc, m.created_at,
              (select json_agg(json_build_object(
                  'id', a.id,
                  'name', a.name,
                  'extracted_text', a.extracted_text,
                  'extracted_enc', a.extracted_enc
                ) order by a.created_at)
                 from attachments a where a.message_id = m.id) as atts
         from messages m where m.conversation_id = $1
        order by m.created_at desc limit $2) t
     order by t.created_at`,
    [conversationId, limit],
  );

  return rows.map((r) => {
    const payload = decryptMsgPayload(
      r.id,
      conversationId,
      userId,
      r.content,
      {},
      r.payload_enc,
      dek,
    );
    const notes = (r.atts ?? [])
      .map((a) => {
        let text = a.extracted_text ?? "";
        if (a.extracted_enc) {
          try {
            text = decryptText(
              a.extracted_enc,
              dek,
              aadAttachmentText(userId, a.id),
            );
          } catch {
            text = "";
          }
        }
        return `[Attached ${a.name}]\n${text}`;
      })
      .join("\n\n");
    return {
      role: r.role,
      content: notes
        ? `${payload.content}\n\n${notes.slice(0, 6000)}`
        : payload.content,
    };
  });
}

export async function insertMessage(
  conversationId: string,
  userId: string,
  role: "user" | "assistant",
  content: string,
  meta: MessageMeta,
  dek: Buffer,
) {
  const id = randomUUID();
  const payloadEnc = encryptText(
    JSON.stringify({ content, meta }),
    dek,
    aadMessage(userId, conversationId, id),
  );
  const rows = await query<{ id: string; created_at: Date }>(
    `insert into messages (id, conversation_id, role, content, meta, payload_enc)
     values ($1, $2, $3, '', '{}'::jsonb, $4) returning id, created_at`,
    [id, conversationId, role, payloadEnc],
  );
  return rows[0];
}

export async function insertAttachment(a: {
  id?: string;
  userId: string;
  messageId: string;
  name: string;
  mime: string;
  size: number;
  storageId: string | null;
  resourceType: string | null;
  format: string | null;
  extractedText: string;
  encrypted: boolean;
  dek: Buffer;
}) {
  const id = a.id ?? randomUUID();
  const extractedEnc = encryptText(
    a.extractedText,
    a.dek,
    aadAttachmentText(a.userId, id),
  );
  await query(
    `insert into attachments (id, user_id, message_id, name, mime, size, storage_id, resource_type, format, extracted_text, extracted_enc, encrypted)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,'',$10,$11)`,
    [
      id,
      a.userId,
      a.messageId,
      a.name,
      a.mime,
      a.size,
      a.storageId,
      a.resourceType,
      a.format,
      extractedEnc,
      a.encrypted,
    ],
  );
  return id;
}

export async function getOwnedAttachment(id: string, userId: string) {
  if (!isUuid(id)) return null;
  const rows = await query<{
    name: string;
    mime: string;
    storage_id: string | null;
    resource_type: string | null;
    format: string | null;
    encrypted: boolean;
  }>(
    "select name, mime, storage_id, resource_type, format, encrypted from attachments where id = $1 and user_id = $2",
    [id, userId],
  );
  return rows[0] ?? null;
}

export async function exportUserConversations(userId: string, dek: Buffer) {
  const convs = await listConversations(userId, dek);
  return Promise.all(
    convs.map(async (c) => ({
      ...c,
      messages: await getMessages(c.id, userId, dek),
    })),
  );
}
