"use client";

import { useEffect } from "react";
import { useSession } from "@/lib/store/session";

/** Restores the cached session, then confirms it with the server. */
export function SessionProvider() {
  useEffect(() => {
    Promise.resolve(useSession.persist.rehydrate()).finally(() => {
      void useSession.getState().hydrate();
    });

    if ("serviceWorker" in navigator) {
      if (process.env.NODE_ENV === "production") {
        navigator.serviceWorker.register("/sw.js").catch((err) => {
          console.warn("Service worker registration failed", err);
        });
      } else {
        // A worker left over from a production run would serve stale dev
        // scripts; remove it and its caches while developing.
        void navigator.serviceWorker.getRegistrations().then((regs) => {
          if (!regs.length) return;
          Promise.all(regs.map((r) => r.unregister()))
            .then(() => caches.keys())
            .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
            .catch((err) => console.warn("Couldn't clear old service worker", err));
        });
      }
    }
  }, []);
  return null;
}
