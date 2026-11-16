import "server-only";
import type {
  AttachmentView,
  ChatMessageView,
  ConversationSummary,
  MessageMeta,
} from "@/lib/chat-types";
import { query } from "./db";
import { isUuid } from "./inventory";

interface MessageRow {
  id: string;
  role: "user" | "assistant";
  content: string;
  meta: MessageMeta;
  created_at: Date;
  attachments: { id: string; name: string; mime: string; size: number }[] | null;
}

export async function listConversations(userId: string): Promise<ConversationSummary[]> {
  const rows = await query<{ id: string; title: string; updated_at: Date }>(
    `select id, title, updated_at from conversations
      where user_id = $1 order by updated_at desc limit 200`,
    [userId],
  );
  return rows.map((r) => ({ id: r.id, title: r.title, updatedAt: r.updated_at.toISOString() }));
}

export async function getConversation(id: string, userId: string) {
  if (!isUuid(id)) return null;
  const rows = await query<{ id: string; title: string }>(
    "select id, title from conversations where id = $1 and user_id = $2",
    [id, userId],
  );
  return rows[0] ?? null;
}

export async function createConversation(userId: string, title: string) {
  const rows = await query<{ id: string; title: string }>(
    "insert into conversations (user_id, title) values ($1, $2) returning id, title",
    [userId, title.slice(0, 120) || "New chat"],
  );
  return rows[0];
}

export async function renameConversation(id: string, userId: string, title: string) {
  const rows = await query<{ id: string }>(
    "update conversations set title = $3 where id = $1 and user_id = $2 returning id",
    [id, userId, title.trim().slice(0, 120) || "New chat"],
  );
  return rows.length > 0;
}

export async function touchConversation(id: string) {
  await query("update conversations set updated_at = now() where id = $1", [id]);
}

export async function deleteConversation(id: string, userId: string) {
  if (!isUuid(id)) return [];
  // Return stored files so the caller can remove them from storage too.
  const files = await query<{ storage_id: string; resource_type: string; format: string }>(
    `select a.storage_id, a.resource_type, a.format from attachments a
       join messages m on m.id = a.message_id
       join conversations c on c.id = m.conversation_id
      where c.id = $1 and c.user_id = $2 and a.storage_id is not null`,
    [id, userId],
  );
  await query("delete from conversations where id = $1 and user_id = $2", [id, userId]);
  return files;
}

const toView = (r: MessageRow): ChatMessageView => ({
  id: r.id,
  role: r.role,
  content: r.content,
  createdAt: r.created_at.toISOString(),
  meta: r.meta ?? {},
  attachments: (r.attachments ?? []).map(
    (a): AttachmentView => ({
      id: a.id,
      name: a.name,
      mime: a.mime,
      size: a.size,
      url: `/api/attachments/${a.id}`,
    }),
  ),
});

export async function getMessages(conversationId: string): Promise<ChatMessageView[]> {
  const rows = await query<MessageRow>(
    `select m.id, m.role, m.content, m.meta, m.created_at,
            (select json_agg(json_build_object('id', a.id, 'name', a.name, 'mime', a.mime, 'size', a.size)
                             order by a.created_at)
               from attachments a where a.message_id = m.id) as attachments
       from messages m where m.conversation_id = $1 order by m.created_at`,
    [conversationId],
  );
  return rows.map(toView);
}

/** Text the model sees for earlier turns, including what was read from attachments. */
export async function getHistoryTurns(conversationId: string, limit = 20) {
  const rows = await query<{ role: "user" | "assistant"; content: string; notes: string | null }>(
    `select * from (
       select m.role, m.content, m.created_at,
              (select string_agg('[Attached ' || a.name || ']\n' || coalesce(a.extracted_text, ''), '\n\n')
                 from attachments a where a.message_id = m.id) as notes
         from messages m where m.conversation_id = $1
        order by m.created_at desc limit $2) t
     order by t.created_at`,
    [conversationId, limit],
  );
  return rows.map((r) => ({
    role: r.role,
    content: r.notes ? `${r.content}\n\n${r.notes.slice(0, 6000)}` : r.content,
  }));
}

export async function insertMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string,
  meta: MessageMeta = {},
) {
  const rows = await query<{ id: string; created_at: Date }>(
    `insert into messages (conversation_id, role, content, meta)
     values ($1, $2, $3, $4) returning id, created_at`,
    [conversationId, role, content, JSON.stringify(meta)],
  );
  return rows[0];
}

export async function insertAttachment(a: {
  userId: string;
  messageId: string;
  name: string;
  mime: string;
  size: number;
  storageId: string | null;
  resourceType: string | null;
  format: string | null;
  extractedText: string;
}) {
  const rows = await query<{ id: string }>(
    `insert into attachments (user_id, message_id, name, mime, size, storage_id, resource_type, format, extracted_text)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9) returning id`,
    [a.userId, a.messageId, a.name, a.mime, a.size, a.storageId, a.resourceType, a.format, a.extractedText],
  );
  return rows[0].id;
}

export async function getOwnedAttachment(id: string, userId: string) {
  if (!isUuid(id)) return null;
  const rows = await query<{
    name: string;
    mime: string;
    storage_id: string | null;
    resource_type: string | null;
    format: string | null;
  }>(
    "select name, mime, storage_id, resource_type, format from attachments where id = $1 and user_id = $2",
    [id, userId],
  );
  return rows[0] ?? null;
}
