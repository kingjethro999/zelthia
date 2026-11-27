"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  requestDeviceLocation,
  useLocationStore,
  type UserGeo,
} from "@/lib/store/location";

/** Pages where asking for a precise position would be out of place. */
const QUIET = /^\/(privacy|terms|sticker|admin|signin|signup)/;

/**
 * Keeps an approximate location from the IP address at all times, and asks
 * the browser for a precise one once per visit, the way map and search sites
 * do. Declining is respected: IP location keeps working so nearby results and
 * emergency guidance still know roughly where the person is.
 */
export function LocationProvider() {
  const pathname = usePathname();

  useEffect(() => {
    const s = useLocationStore.getState();
    if (s.ip) return;
    fetch("/api/geo")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { geo?: UserGeo } | null) => {
        if (d?.geo) useLocationStore.getState().setIp(d.geo);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (QUIET.test(pathname) || !navigator.geolocation) return;
    let cancelled = false;
    const run = async () => {
      let state: PermissionState | null = null;
      try {
        state = (await navigator.permissions.query({ name: "geolocation" }))
          .state;
      } catch {
        /* Permissions API missing (older Safari): fall through to asking */
      }
      if (cancelled) return;
      const st = useLocationStore.getState();
      if (state === "denied") {
        st.setPermission("denied");
        return;
      }
      if (state === "granted") {
        // Already allowed: refresh quietly, no prompt is shown.
        if (!st.device) void requestDeviceLocation();
        else st.setPermission("granted");
        return;
      }
      if (!st.asked) void requestDeviceLocation();
    };
    // Let the page paint first so the prompt doesn't cover a blank screen.
    const t = window.setTimeout(run, 1200);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [pathname]);

  return null;
}
