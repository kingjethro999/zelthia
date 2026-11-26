"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface OverlayContextValue {
  recessed: boolean;
  acquire: () => void;
  release: () => void;
}

const OverlayCtx = createContext<OverlayContextValue>({
  recessed: false,
  acquire: () => {},
  release: () => {},
});

export function OverlayProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0);

  const acquire = useCallback(() => {
    setCount((c) => c + 1);
  }, []);

  const release = useCallback(() => {
    setCount((c) => Math.max(0, c - 1));
  }, []);

  const value = useMemo(
    () => ({ recessed: count > 0, acquire, release }),
    [count, acquire, release],
  );

  return <OverlayCtx.Provider value={value}>{children}</OverlayCtx.Provider>;
}

export function useOverlayRecessed(): boolean {
  return useContext(OverlayCtx).recessed;
}

export function useRegisterOverlay(active: boolean): void {
  const { acquire, release } = useContext(OverlayCtx);
  useEffect(() => {
    if (!active) return;
    acquire();
    return () => release();
  }, [active, acquire, release]);
}
