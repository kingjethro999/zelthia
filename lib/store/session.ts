"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { BiometricProfile } from "@/lib/ai/types";
import {
  EMPTY_PROFILE,
  type SessionPayload,
  type SessionUser,
  type UserRole,
} from "@/lib/auth-types";

type Status = "idle" | "loading" | "ready" | "error";

interface ApiResult {
  ok: boolean;
  error?: string;
  field?: string;
}

interface SessionState {
  status: Status;
  user: SessionUser | null;
  /** Owned facilities for provider accounts; null when unknown or personal. */
  facilityCount: number | null;
  /** Server copy when signed in; device-local copy for guests. */
  profile: BiometricProfile;
  hydrate: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<ApiResult>;
  signUp: (input: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }) => Promise<ApiResult>;
  signOut: () => Promise<void>;
  saveProfile: (
    profile: BiometricProfile,
    opts?: { complete?: boolean; name?: string },
  ) => Promise<ApiResult>;
  deleteAccount: () => Promise<ApiResult>;
}

async function post(url: string, body?: unknown, method = "POST") {
  try {
    const res = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    return { res, data };
  } catch {
    return {
      res: null,
      data: {
        error: "You appear to be offline. Check your connection and try again.",
      },
    };
  }
}

export const useSession = create<SessionState>()(
  persist(
    (set, get) => ({
      status: "idle",
      user: null,
      facilityCount: null,
      profile: EMPTY_PROFILE,

      hydrate: async () => {
        if (get().status === "loading") return;
        set({ status: "loading" });
        try {
          const res = await fetch("/api/auth/session", { cache: "no-store" });
          const data = (await res.json()) as SessionPayload;
          set({
            status: res.ok ? "ready" : "error",
            user: data.user,
            facilityCount: data.facilityCount ?? null,
            profile: data.user
              ? { ...EMPTY_PROFILE, ...(data.profile ?? {}) }
              : get().user
                ? EMPTY_PROFILE // signed out elsewhere: drop the cached server copy
                : get().profile,
          });
        } catch {
          set({ status: "error" });
        }
      },

      signIn: async (email, password) => {
        const { res, data } = await post("/api/auth/signin", {
          email,
          password,
        });
        if (!res?.ok)
          return { ok: false, error: data.error, field: data.field };
        set({
          user: data.user,
          profile: { ...EMPTY_PROFILE, ...(data.profile ?? get().profile) },
          status: "ready",
        });
        void get().hydrate();
        return { ok: true };
      },

      signUp: async (input) => {
        const { res, data } = await post("/api/auth/signup", input);
        if (!res?.ok)
          return { ok: false, error: data.error, field: data.field };
        set({
          user: data.user,
          status: "ready",
          facilityCount: data.user.role === "provider" ? 0 : null,
        });
        return { ok: true };
      },

      signOut: async () => {
        await post("/api/auth/signout");
        set({
          user: null,
          profile: EMPTY_PROFILE,
          status: "ready",
          facilityCount: null,
        });
      },

      saveProfile: async (profile, opts = {}) => {
        if (!get().user) {
          set({ profile });
          return { ok: true };
        }
        const { res, data } = await post(
          "/api/account",
          { profile, complete: opts.complete, name: opts.name },
          "PUT",
        );
        if (!res?.ok) return { ok: false, error: data.error };
        set({ user: data.user, profile: data.profile });
        return { ok: true };
      },

      deleteAccount: async () => {
        const { res, data } = await post("/api/account", undefined, "DELETE");
        if (!res?.ok) return { ok: false, error: data.error };
        set({ user: null, profile: EMPTY_PROFILE });
        return { ok: true };
      },
    }),
    {
      name: "zelthia-session",
      storage: createJSONStorage(() => localStorage),
      // The user object is cached only to avoid a signed-out flash; the server stays the source of truth.
      partialize: (s) => ({
        user: s.user,
        profile: s.profile,
        facilityCount: s.facilityCount,
      }),
      skipHydration: true,
    },
  ),
);
