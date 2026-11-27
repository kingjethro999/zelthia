"use client";

import { useLocationStore } from "./location";

import { create } from "zustand";
import type {
  AgentStep,
  AttachmentView,
  ChatEvent,
  ChatMessageView,
  ConversationSummary,
} from "@/lib/chat-types";
import type { BiometricProfile } from "@/lib/ai/types";

export interface PendingFile {
  id: string;
  name: string;
  mime: string;
  size: number;
  base64: string;
  previewUrl?: string;
}

interface Turn {
  role: "user" | "assistant";
  content: string;
}

interface ChatState {
  conversations: ConversationSummary[];
  listStatus: "idle" | "loading" | "ready" | "error";
  activeId: string | null;
  messages: ChatMessageView[];
  loadingThread: boolean;
  threadError: string | null;
  /** Temporary chats are never written to history. */
  temporary: boolean;
  pending: boolean;
  liveSteps: AgentStep[];
  liveText: string;
  sendError: string | null;
  /** Model-facing turns for chats that aren't saved server-side. */
  localTurns: Turn[];

  loadConversations: () => Promise<void>;
  openConversation: (id: string) => Promise<void>;
  newChat: (opts?: { temporary?: boolean }) => void;
  setTemporary: (on: boolean) => void;
  send: (input: {
    text: string;
    files: PendingFile[];
    profile: BiometricProfile;
    signedIn: boolean;
  }) => Promise<void>;
  stop: () => void;
  rename: (id: string, title: string) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
  reset: () => void;
}

let controller: AbortController | null = null;

/**
 * Updates the address bar without a server round trip; the chat shell is
 * already mounted. "push" adds a history entry so Back returns to the
 * previous chat.
 */
const setUrl = (path: string, mode: "push" | "replace" = "replace") => {
  if (typeof window !== "undefined" && window.location.pathname !== path) {
    if (mode === "push") window.history.pushState(null, "", path);
    else window.history.replaceState(null, "", path);
  }
};

export const useChat = create<ChatState>()((set, get) => ({
  conversations: [],
  listStatus: "idle",
  activeId: null,
  messages: [],
  loadingThread: false,
  threadError: null,
  temporary: false,
  pending: false,
  liveSteps: [],
  liveText: "",
  sendError: null,
  localTurns: [],

  loadConversations: async () => {
    set({ listStatus: "loading" });
    try {
      const res = await fetch("/api/conversations", { cache: "no-store" });
      if (res.status === 401)
        return set({ conversations: [], listStatus: "ready" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      set({ conversations: data.conversations, listStatus: "ready" });
    } catch (err) {
      console.error("Loading conversations failed", err);
      set({ listStatus: "error" });
    }
  },

  openConversation: async (id) => {
    if (get().activeId === id && get().messages.length) return;
    get().stop();
    set({
      activeId: id,
      messages: [],
      loadingThread: true,
      threadError: null,
      temporary: false,
      localTurns: [],
      sendError: null,
    });
    setUrl(`/chat/${id}`, "push");
    try {
      const res = await fetch(`/api/conversations/${id}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't load this chat.");
      if (get().activeId === id)
        set({ messages: data.messages, loadingThread: false });
    } catch (err) {
      if (get().activeId === id)
        set({ loadingThread: false, threadError: (err as Error).message });
    }
  },

  newChat: (opts = {}) => {
    get().stop();
    const hadThread = Boolean(get().activeId);
    set({
      activeId: null,
      messages: [],
      localTurns: [],
      liveSteps: [],
      liveText: "",
      sendError: null,
      threadError: null,
      temporary: Boolean(opts.temporary),
    });
    setUrl("/chat", hadThread ? "push" : "replace");
  },

  setTemporary: (on) => {
    if (get().messages.length) get().newChat({ temporary: on });
    else set({ temporary: on });
  },

  send: async ({ text, files, profile, signedIn }) => {
    if (get().pending) return;
    const saved = signedIn && !get().temporary;
    const optimistic: ChatMessageView = {
      id: `local-${Date.now()}`,
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
      attachments: files.map((f): AttachmentView => ({
        name: f.name,
        mime: f.mime,
        size: f.size,
        url: f.previewUrl,
      })),
    };
    set((s) => ({
      messages: [...s.messages, optimistic],
      pending: true,
      liveSteps: [],
      liveText: "",
      sendError: null,
    }));

    controller = new AbortController();
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          text,
          files: files.map(({ name, mime, size, base64 }) => ({
            name,
            mime,
            size,
            base64,
          })),
          conversationId: saved ? get().activeId : null,
          temporary: !saved,
          history: saved ? undefined : get().localTurns,
          biometrics: profile,
          // Precise position only if the person allowed it; the server falls
          // back to their IP location otherwise.
          location: useLocationStore.getState().device,
        }),
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Request failed (${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      const handle = (e: ChatEvent) => {
        switch (e.type) {
          case "conversation": {
            set((s) => ({
              activeId: e.id,
              conversations: [
                {
                  id: e.id,
                  title: e.title,
                  updatedAt: new Date().toISOString(),
                },
                ...s.conversations.filter((c) => c.id !== e.id),
              ],
            }));
            setUrl(`/chat/${e.id}`);
            break;
          }
          case "user-saved":
            set((s) => ({
              messages: s.messages.map((m) =>
                m.id === optimistic.id
                  ? {
                      ...e.message,
                      // Keep local previews until the saved file URL is ready.
                      attachments: e.message.attachments?.map((a, i) => ({
                        ...a,
                        url: a.url ?? optimistic.attachments?.[i]?.url,
                      })),
                    }
                  : m,
              ),
              localTurns: saved
                ? s.localTurns
                : [...s.localTurns, { role: "user", content: e.context }],
            }));
            break;
          case "step":
            set((s) => {
              const i = s.liveSteps.findIndex((x) => x.id === e.step.id);
              const next = [...s.liveSteps];
              if (i >= 0) next[i] = e.step;
              else next.push(e.step);
              return { liveSteps: next };
            });
            break;
          case "delta":
            set((s) => ({ liveText: s.liveText + e.text }));
            break;
          case "done":
            set((s) => ({
              messages: [...s.messages, e.message],
              liveSteps: [],
              liveText: "",
              localTurns: saved
                ? s.localTurns
                : [
                    ...s.localTurns,
                    { role: "assistant", content: e.message.content },
                  ],
              conversations: s.activeId
                ? s.conversations
                    .map((c) =>
                      c.id === s.activeId
                        ? { ...c, updatedAt: new Date().toISOString() }
                        : c,
                    )
                    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
                : s.conversations,
            }));
            break;
          case "error":
            set({ sendError: e.message });
            break;
        }
      };

      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) >= 0) {
          const line = buf.slice(0, nl).trim();
          buf = buf.slice(nl + 1);
          if (line) handle(JSON.parse(line) as ChatEvent);
        }
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        // Keep what was streamed so far as a stopped answer.
        const partial = get().liveText;
        if (partial.trim()) {
          set((s) => ({
            messages: [
              ...s.messages,
              {
                id: `stopped-${Date.now()}`,
                role: "assistant",
                content: `${partial}\n\n*Stopped.*`,
                createdAt: new Date().toISOString(),
                meta: { steps: s.liveSteps },
              },
            ],
          }));
        }
      } else {
        console.error("Chat request failed", err);
        set({
          sendError:
            (err as Error).message ||
            "Zelthia couldn't be reached. Check your connection and try again.",
        });
      }
    } finally {
      controller = null;
      set({ pending: false, liveSteps: [], liveText: "" });
    }
  },

  stop: () => {
    controller?.abort();
  },

  rename: async (id, title) => {
    const prev = get().conversations;
    set({
      conversations: prev.map((c) => (c.id === id ? { ...c, title } : c)),
    });
    const res = await fetch(`/api/conversations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    }).catch(() => null);
    if (!res?.ok) set({ conversations: prev });
    return Boolean(res?.ok);
  },

  remove: async (id) => {
    const prev = get().conversations;
    set({ conversations: prev.filter((c) => c.id !== id) });
    const res = await fetch(`/api/conversations/${id}`, {
      method: "DELETE",
    }).catch(() => null);
    if (!res?.ok) {
      set({ conversations: prev });
      return false;
    }
    if (get().activeId === id) get().newChat();
    return true;
  },

  reset: () =>
    set({
      conversations: [],
      listStatus: "idle",
      activeId: null,
      messages: [],
      localTurns: [],
      temporary: false,
    }),
}));
