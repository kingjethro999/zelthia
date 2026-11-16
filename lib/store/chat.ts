"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { BiometricProfile, ChatMessage } from "@/lib/ai/types";

interface ChatState {
  messages: ChatMessage[];
  pending: boolean;
  send: (text: string, profile: BiometricProfile) => Promise<void>;
  reset: () => void;
}

const time = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export const useChat = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      pending: false,

      send: async (raw, profile) => {
        const text = raw.trim();
        if (!text || get().pending) return;
        const user: ChatMessage = { id: `u-${Date.now()}`, role: "user", content: text, timestamp: time() };
        const history = [...get().messages, user];
        set({ messages: history, pending: true });

        try {
          const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: history.map((m) => ({ role: m.role, content: m.content })),
              biometrics: profile,
            }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok && !data.message) throw new Error(`Chat responded ${res.status}`);
          set((s) => ({
            messages: [
              ...s.messages,
              {
                id: `a-${Date.now()}`,
                role: "assistant",
                content: data.message,
                timestamp: time(),
                triageLevel: data.triageLevel ?? "low",
                referral: data.referral,
                modelUsed: data.model,
              },
            ],
          }));
        } catch (err) {
          console.error("Chat request failed", err);
          set((s) => ({
            messages: [
              ...s.messages,
              {
                id: `e-${Date.now()}`,
                role: "assistant",
                content:
                  "**Zelthia couldn't be reached.** Check your connection and send your message again. If symptoms are severe, go to the nearest health facility or call 112.",
                timestamp: time(),
                triageLevel: "moderate",
              },
            ],
          }));
        } finally {
          set({ pending: false });
        }
      },

      reset: () => set({ messages: [], pending: false }),
    }),
    {
      name: "zelthia-chat",
      // Conversations stay in this tab only; closing it clears them.
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({ messages: s.messages }),
      skipHydration: true,
    },
  ),
);
