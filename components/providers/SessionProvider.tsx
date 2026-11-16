"use client";

import { useEffect } from "react";
import { useSession } from "@/lib/store/session";

/** Restores the cached session, then confirms it with the server. */
export function SessionProvider() {
  useEffect(() => {
    Promise.resolve(useSession.persist.rehydrate()).finally(() => {
      void useSession.getState().hydrate();
    });

    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.warn("Service worker registration failed", err);
      });
    }
  }, []);
  return null;
}
