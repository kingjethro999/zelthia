"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface UserGeo {
  country: string;
  countryName: string;
  region: string | null;
  city: string | null;
  lat: number | null;
  lon: number | null;
  source: "header" | "ip" | "default" | "device";
}

export type GeoPermission = "unknown" | "prompt" | "granted" | "denied" | "unsupported";

interface LocationState {
  /** From the IP address. Always fetched, whatever the person decides. */
  ip: UserGeo | null;
  /** From the browser, only after the person allows location access. */
  device: UserGeo | null;
  permission: GeoPermission;
  /** The browser prompt was shown this session, so it is not shown again. */
  asked: boolean;
  setIp: (g: UserGeo) => void;
  setDevice: (g: UserGeo | null) => void;
  setPermission: (p: GeoPermission) => void;
  setAsked: () => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      ip: null,
      device: null,
      permission: "unknown",
      asked: false,
      setIp: (ip) => set({ ip }),
      setDevice: (device) => set({ device }),
      setPermission: (permission) => set({ permission }),
      setAsked: () => set({ asked: true }),
    }),
    {
      name: "zelthia-location",
      // Session only: a precise position should not outlive the visit.
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({ ip: s.ip, device: s.device, asked: s.asked }),
    },
  ),
);

/** Best known location: the device position when allowed, else the IP guess. */
export function useUserGeo(): UserGeo | null {
  return useLocationStore((s) => s.device ?? s.ip);
}

/** Plain snapshot for request bodies outside React. */
export function currentGeo(): UserGeo | null {
  const s = useLocationStore.getState();
  return s.device ?? s.ip;
}

async function reverse(lat: number, lon: number): Promise<UserGeo | null> {
  try {
    const res = await fetch(`/api/geo/reverse?lat=${lat}&lon=${lon}`);
    if (!res.ok) return null;
    return ((await res.json()) as { geo: UserGeo }).geo;
  } catch {
    return null;
  }
}

/**
 * Asks the browser for the current position. The browser shows its own
 * permission prompt the first time; declining keeps IP location in use.
 */
export function requestDeviceLocation(): Promise<UserGeo | null> {
  const st = useLocationStore.getState();
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    st.setPermission("unsupported");
    return Promise.resolve(null);
  }
  st.setAsked();
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        st.setPermission("granted");
        const ipGeo = useLocationStore.getState().ip;
        const geo = (await reverse(
          pos.coords.latitude,
          pos.coords.longitude,
        )) ?? {
          // Reverse lookup failed: keep the precise point with the IP country.
          country: ipGeo?.country ?? "NG",
          countryName: ipGeo?.countryName ?? "Nigeria",
          region: ipGeo?.region ?? null,
          city: ipGeo?.city ?? null,
          lat: Number(pos.coords.latitude.toFixed(3)),
          lon: Number(pos.coords.longitude.toFixed(3)),
          source: "device" as const,
        };
        useLocationStore.getState().setDevice(geo);
        resolve(geo);
      },
      (err) => {
        st.setPermission(err.code === err.PERMISSION_DENIED ? "denied" : "prompt");
        resolve(null);
      },
      { enableHighAccuracy: false, timeout: 15_000, maximumAge: 10 * 60_000 },
    );
  });
}
