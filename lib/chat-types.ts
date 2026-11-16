import type { TriageLevel } from "@/lib/ai/types";
import type { DirectoryMatch, WebPlace } from "@/lib/inventory-types";

export type StepStatus = "running" | "done" | "failed";

/** One visible unit of work the assistant performed while answering. */
export interface AgentStep {
  id: string;
  label: string;
  status: StepStatus;
  detail?: string;
  startedAt: number;
  endedAt?: number;
}

export interface AttachmentView {
  id?: string;
  name: string;
  mime: string;
  size: number;
  /** Server URL for saved attachments; object URL for ones in flight. */
  url?: string;
}

export interface MessageMeta {
  steps?: AgentStep[];
  triage?: TriageLevel;
  matches?: DirectoryMatch[];
  places?: WebPlace[];
  model?: string;
}

export interface ChatMessageView {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  attachments?: AttachmentView[];
  meta?: MessageMeta;
}

export interface ConversationSummary {
  id: string;
  title: string;
  updatedAt: string;
}

/** Newline-delimited JSON events streamed by POST /api/chat. */
export type ChatEvent =
  | { type: "conversation"; id: string; title: string }
  /** `context` is the user turn as the model saw it (with file transcripts), for unsaved chats. */
  | { type: "user-saved"; message: ChatMessageView; context: string }
  | { type: "step"; step: AgentStep }
  | { type: "delta"; text: string }
  | { type: "done"; message: ChatMessageView }
  | { type: "error"; message: string };

export const MAX_ATTACHMENTS = 4;
/** Base64 payloads must fit in one Vercel request (4.5 MB). */
export const MAX_ATTACHMENT_BYTES = 3 * 1024 * 1024;
export const ACCEPTED_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
  "text/plain",
];
