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
import { useChat } from "./chat";

type Status = "idle" | "loading" | "ready" | "error";

interface ApiResult {
  ok: boolean;
  error?: string;
  field?: string;
}

interface SessionState {
  status: Status;
  user: SessionUser | null;
  /** Ephemeral hidden admin portal path, kept strictly in memory (never localStorage). */
  adminPath: string | null;
  /** Owned facilities for provider accounts; null when unknown or personal. */
  facilityCount: number | null;
  /** Server copy in memory when signed in; device-local copy for guests only. */
  profile: BiometricProfile;
  hydrate: () => Promise<void>;
  signIn: (
    email: string,
    password: string,
  ) => Promise<ApiResult & { redirectTo?: string }>;
  signUp: (input: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    acceptedTerms: boolean;
  }) => Promise<ApiResult>;
  signOut: () => Promise<void>;
  revokeOtherSessions: () => Promise<ApiResult & { revoked?: number }>;
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
      data: { error: "You appear to be offline. Check your connection and try again." },
    };
  }
}

export const useSession = create<SessionState>()(
  persist(
    (set, get) => ({
      status: "idle",
      user: null,
      adminPath: null,
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
            adminPath: data.user?.isAdmin ? (data.adminPath ?? null) : null,
            facilityCount: data.facilityCount ?? null,
            profile: data.user
              ? { ...EMPTY_PROFILE, ...(data.profile ?? {}) }
              : get().user
                ? EMPTY_PROFILE
                : get().profile,
          });
        } catch {
          set({ status: "error" });
        }
      },

      signIn: async (email, password) => {
        const { res, data } = await post("/api/auth/signin", { email, password });
        if (!res?.ok) return { ok: false, error: data.error, field: data.field };
        const adminPath =
          data.user?.isAdmin && typeof data.adminPath === "string"
            ? data.adminPath
            : null;
        const redirectTo =
          data.user?.isAdmin && typeof data.redirectTo === "string"
            ? data.redirectTo
            : undefined;
        set({
          user: data.user,
          adminPath,
          profile: { ...EMPTY_PROFILE, ...(data.profile ?? {}) },
          status: "ready",
        });
        void get().hydrate();
        return { ok: true, redirectTo };
      },

      signUp: async (input) => {
        const { res, data } = await post("/api/auth/signup", input);
        if (!res?.ok) return { ok: false, error: data.error, field: data.field };
        set({
          user: data.user,
          adminPath: null,
          status: "ready",
          facilityCount: data.user.role === "provider" ? 0 : null,
        });
        return { ok: true };
      },

      signOut: async () => {
        await post("/api/auth/signout");
        useChat.getState().reset();
        set({
          user: null,
          adminPath: null,
          profile: EMPTY_PROFILE,
          status: "ready",
          facilityCount: null,
        });
        try {
          localStorage.removeItem("zelthia-session");
        } catch {
          /* ignore storage errors */
        }
      },

      revokeOtherSessions: async () => {
        const { res, data } = await post("/api/auth/sessions/revoke-others");
        if (!res?.ok) return { ok: false, error: data.error };
        return { ok: true, revoked: Number(data.revoked ?? 0) };
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
        useChat.getState().reset();
        set({
          user: null,
          adminPath: null,
          profile: EMPTY_PROFILE,
          facilityCount: null,
        });
        try {
          localStorage.removeItem("zelthia-session");
        } catch {
          /* ignore storage errors */
        }
        return { ok: true };
      },
    }),
    {
      name: "zelthia-session",
      storage: createJSONStorage(() => localStorage),
      // Never persist signed-in health profiles to plaintext localStorage; only guest local profiles live there.
      partialize: (s) => ({
        user: s.user,
        facilityCount: s.facilityCount,
        profile: s.user ? EMPTY_PROFILE : s.profile,
      }),
      skipHydration: true,
    },
  ),
);
