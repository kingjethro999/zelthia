"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Barcode,
  Boxes,
  Camera,
  Check,
  FlipHorizontal2,
  Layers,
  LoaderCircle,
  PackageCheck,
  RefreshCw,
  ScanLine,
  ShieldAlert,
  Sparkles,
  Upload,
  Zap,
  ZapOff,
} from "lucide-react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Stepper, TextField } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { DirectoryMatches, WebSources } from "@/components/chat/ResultCards";
import { ImageGallery } from "@/components/chat/ImageGallery";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_FORMS,
  type DirectoryMatch,
  type Product,
  type RegulatoryReport,
  type WebImage,
  type WebPlace,
} from "@/lib/inventory-types";
import { usePresence } from "@/lib/motion";
import { decode1DBarcodeFromImageData, parseScannedCode } from "@/lib/barcode";
import { triggerHaptic } from "@/lib/spring";
import { cn } from "@/lib/utils";
import { RegulatoryReportCard } from "./RegulatoryReportCard";
import type { ProductDraft } from "./ProductDialog";

type InputMode = "camera" | "upload" | "manual";

export interface PublicVerifyResult {
  extractedQuery: string;
  report: RegulatoryReport;
  matches: DirectoryMatch[];
  places: WebPlace[];
  images: WebImage[];
}

interface FacilityScanResponse {
  draft: ProductDraft;
  report: RegulatoryReport;
  existingProduct: Product | null;
  webReferences?: WebPlace[];
  images?: WebImage[];
}

interface BarcodeDetectorLike {
  detect: (
    source: HTMLVideoElement | HTMLCanvasElement,
  ) => Promise<Array<{ rawValue?: string }>>;
}

declare global {
  interface Window {
    BarcodeDetector?: new (opts?: {
      formats?: string[];
    }) => BarcodeDetectorLike;
  }
}

const QUICK_QTY_STEPS = [1, 10, 24, 50, 100];

const SCAN_FORMATS = [
  "ean_13",
  "ean_8",
  "upc_a",
  "upc_e",
  "code_128",
  "code_39",
  "qr_code",
  "data_matrix",
];

function compressCanvasToBase64(
  source: HTMLVideoElement | HTMLImageElement,
  srcWidth: number,
  srcHeight: number,
  maxSide = 1440,
  quality = 0.84,
): string {
  const scale = Math.min(1, maxSide / Math.max(1, srcWidth, srcHeight));
  const w = Math.max(1, Math.round(srcWidth * scale));
  const h = Math.max(1, Math.round(srcHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.drawImage(source, 0, 0, w, h);
  const dataUrl = canvas.toDataURL("image/jpeg", quality);
  return dataUrl.split(",")[1] ?? "";
}

async function fileToCompressedJpegBase64(file: File): Promise<string> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Could not decode photo."));
      el.src = objectUrl;
    });
    return compressCanvasToBase64(
      img,
      img.naturalWidth || img.width,
      img.naturalHeight || img.height,
      1600,
      0.85,
    );
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function triggerVerdictHaptic(verdict: RegulatoryReport["verdict"]) {
  if (verdict === "verified") triggerHaptic("commit");
  else if (verdict === "danger") triggerHaptic("error");
  else triggerHaptic("warning");
}

export interface ScanToStockSheetProps {
  open: boolean;
  onClose: () => void;
  mode?: "stock" | "verify";
  facilityId?: string;
  city?: string | null;
  initialCode?: string;
  onStocked?: (product: Product) => void;
  onVerified?: (res: PublicVerifyResult) => void;
}

export function ScanToStockSheet(props: ScanToStockSheetProps) {
  const { mounted } = usePresence(props.open);
  if (!mounted) return null;
  return <ScanToStockInner {...props} />;
}

function ScanToStockInner({
  open,
  onClose,
  mode = "stock",
  facilityId,
  city,
  initialCode,
  onStocked,
  onVerified,
}: ScanToStockSheetProps) {
  const isVerifyOnly = mode === "verify";

  const [inputMode, setInputMode] = useState<InputMode>(
    initialCode ? "manual" : "camera",
  );
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [batchMode, setBatchMode] = useState(!isVerifyOnly);
  const [stockedCount, setStockedCount] = useState(0);
  const [lastStockedName, setLastStockedName] = useState<string | null>(null);

  const [manualInput, setManualInput] = useState(initialCode ?? "");
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [liveLockedCode, setLiveLockedCode] = useState<string | null>(null);

  // Verification / Stocking result state
  const [report, setReport] = useState<RegulatoryReport | null>(null);
  const [draft, setDraft] = useState<ProductDraft | null>(null);
  const [existingProduct, setExistingProduct] = useState<Product | null>(null);
  const [stockStrategy, setStockStrategy] = useState<"restock" | "new">(
    "restock",
  );
  const [dangerAck, setDangerAck] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Supplementary references
  const [publicMatches, setPublicMatches] = useState<DirectoryMatch[]>([]);
  const [webRefs, setWebRefs] = useState<WebPlace[]>([]);
  const [images, setImages] = useState<WebImage[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scanningLockRef = useRef(false);

  const stopMediaTracks = useCallback(() => {
    const s = streamRef.current;
    if (s) {
      for (const track of s.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const stopCamera = useCallback(() => {
    stopMediaTracks();
    setCameraReady(false);
    setTorchOn(false);
    setTorchSupported(false);
  }, [stopMediaTracks]);

  const resetResult = useCallback((nextMode?: InputMode) => {
    setReport(null);
    setDraft(null);
    setExistingProduct(null);
    setDangerAck(false);
    setScanError(null);
    setSaveError(null);
    setLiveLockedCode(null);
    setCameraError(null);
    setPublicMatches([]);
    setWebRefs([]);
    setImages([]);
    scanningLockRef.current = false;
    if (nextMode) setInputMode(nextMode);
  }, []);

  // Turn off hardware camera tracks immediately when tab hides or sheet unmounts
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) stopMediaTracks();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      stopMediaTracks();
    };
  }, [stopMediaTracks]);

  const submitScan = useCallback(
    async (payload: {
      barcode?: string;
      code?: string;
      query?: string;
      imageBase64?: string;
      imageMime?: string;
      forceRefresh?: boolean;
    }) => {
      if (scanningLockRef.current) return;
      scanningLockRef.current = true;
      setScanning(true);
      setScanError(null);
      setSaveError(null);
      setDangerAck(false);

      try {
        if (isVerifyOnly) {
          const res = await fetch("/api/directory/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...payload,
              city: city ?? undefined,
            }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? "Verification failed.");
          const typed = data as PublicVerifyResult;
          setReport(typed.report);
          setPublicMatches(typed.matches ?? []);
          setWebRefs(typed.places ?? []);
          setImages(typed.images ?? []);
          stopCamera();
          triggerVerdictHaptic(typed.report.verdict);
          onVerified?.(typed);
        } else {
          const res = await fetch("/api/inventory/scan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...payload,
              facilityId,
            }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? "Scan failed.");
          const typed = data as FacilityScanResponse;
          setReport(typed.report);
          setDraft({
            ...typed.draft,
            quantity: Math.max(1, typed.draft.quantity || 1),
          });
          setExistingProduct(typed.existingProduct);
          setStockStrategy(typed.existingProduct ? "restock" : "new");
          setWebRefs(typed.webReferences ?? []);
          setImages(typed.images ?? []);
          stopCamera();
          triggerVerdictHaptic(typed.report.verdict);
        }
      } catch (err) {
        setScanError((err as Error).message || "Could not verify product.");
        triggerHaptic("error");
      } finally {
        setScanning(false);
        scanningLockRef.current = false;
      }
    },
    [city, facilityId, isVerifyOnly, onVerified, stopCamera],
  );

  // Start / stop live camera when modal is open, camera mode active, and no result yet
  useEffect(() => {
    if (!open || inputMode !== "camera" || report !== null) {
      stopMediaTracks();
      return;
    }
    let cancelled = false;

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      Promise.resolve().then(() => {
        if (!cancelled) {
          setCameraError(
            "Camera streaming isn't supported in this browser. Switch to Photo upload or Enter code.",
          );
        }
      });
      return;
    }

    void navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const track = stream.getVideoTracks()[0];
        if (track && typeof track.getCapabilities === "function") {
          const caps = track.getCapabilities() as { torch?: boolean };
          setTorchSupported(Boolean(caps.torch));
        }
        setCameraError(null);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current
            .play()
            .then(() => {
              if (!cancelled) setCameraReady(true);
            })
            .catch(() => {
              if (!cancelled) setCameraReady(true);
            });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCameraReady(false);
          setCameraError(
            "Allow camera permission or switch to Photo upload / Enter code.",
          );
        }
      });

    return () => {
      cancelled = true;
      stopMediaTracks();
    };
  }, [open, inputMode, facing, report, stopMediaTracks]);

  // Continuous 1D/2D barcode scanning loop (native BarcodeDetector + pure-TS EAN fallback)
  useEffect(() => {
    if (!open || inputMode !== "camera" || !cameraReady || report !== null) {
      return;
    }
    const video = videoRef.current;
    if (!video) return;

    const detector =
      typeof window !== "undefined" && window.BarcodeDetector
        ? new window.BarcodeDetector({ formats: SCAN_FORMATS })
        : null;

    let timer: number | null = null;
    let active = true;

    const loop = async () => {
      if (!active || scanningLockRef.current || !videoRef.current) return;
      const v = videoRef.current;
      if (v.readyState >= 2 && v.videoWidth > 100) {
        let detectedRaw: string | null = null;
        if (detector) {
          try {
            const hits = await detector.detect(v);
            detectedRaw = hits[0]?.rawValue?.trim() || null;
          } catch {
            /* fall back to canvas decoder */
          }
        }
        if (!detectedRaw) {
          let canvas = detectCanvasRef.current;
          if (!canvas) {
            canvas = document.createElement("canvas");
            detectCanvasRef.current = canvas;
          }
          const scale = Math.min(1, 720 / v.videoWidth);
          const w = Math.max(120, Math.round(v.videoWidth * scale));
          const h = Math.max(80, Math.round(v.videoHeight * scale));
          if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w;
            canvas.height = h;
          }
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          if (ctx) {
            ctx.drawImage(v, 0, 0, w, h);
            const imgData = ctx.getImageData(0, 0, w, h);
            detectedRaw = decode1DBarcodeFromImageData(imgData);
          }
        }

        if (detectedRaw && active && !scanningLockRef.current) {
          const parsed = parseScannedCode(detectedRaw);
          const label = parsed.ean13 ?? parsed.gtin ?? detectedRaw;
          setLiveLockedCode(label);
          triggerHaptic("tick");
          const frame = compressCanvasToBase64(
            v,
            v.videoWidth,
            v.videoHeight,
            1280,
            0.8,
          );
          await submitScan({
            barcode: detectedRaw,
            imageBase64: frame || undefined,
            imageMime: "image/jpeg",
          });
          return;
        }
      }
      if (active) {
        timer = window.setTimeout(loop, 140);
      }
    };

    timer = window.setTimeout(loop, 240);
    return () => {
      active = false;
      if (timer !== null) window.clearTimeout(timer);
    };
  }, [open, inputMode, cameraReady, report, submitScan]);

  const toggleTorch = async () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track || !torchSupported) return;
    const next = !torchOn;
    try {
      await track.applyConstraints({
        advanced: [{ torch: next } as MediaTrackConstraintSet],
      });
      setTorchOn(next);
      triggerHaptic("tick");
    } catch {
      /* device rejected torch constraint */
    }
  };

  const snapCurrentFrame = () => {
    const v = videoRef.current;
    if (!v || v.readyState < 2 || scanning) return;
    triggerHaptic("tick");
    const b64 = compressCanvasToBase64(
      v,
      v.videoWidth,
      v.videoHeight,
      1440,
      0.84,
    );
    if (!b64) return;
    void submitScan({ imageBase64: b64, imageMime: "image/jpeg" });
  };

  const handleFilePick = async (file: File | undefined) => {
    if (!file || scanning) return;
    try {
      const b64 = await fileToCompressedJpegBase64(file);
      if (!b64) throw new Error("Couldn't read image bytes.");
      triggerHaptic("tick");
      await submitScan({ imageBase64: b64, imageMime: "image/jpeg" });
    } catch (err) {
      setScanError((err as Error).message || "Could not process photo.");
    }
  };

  const handleManualLookup = () => {
    const clean = manualInput.trim();
    if (!clean) return;
    const digits = clean.replace(/\D/g, "");
    const isBarcode =
      (digits.length === 8 ||
        digits.length === 12 ||
        digits.length === 13 ||
        digits.length === 14) &&
      digits === clean;
    const isRegCode =
      /^[A-Z0-9]{1,3}[-/]\d{3,7}L?$/i.test(clean) ||
      /^国药准字|^PL/i.test(clean);

    void submitScan(
      isBarcode
        ? { barcode: clean }
        : isRegCode
          ? { code: clean }
          : { query: clean },
    );
  };

  const handleReverifyDraft = () => {
    if (!draft) return;
    void submitScan({
      query: draft.name,
      code: draft.nafdacNumber || undefined,
      barcode: draft.barcode || undefined,
      forceRefresh: true,
    });
  };

  const saveStockedProduct = async () => {
    if (!facilityId || !draft) return;
    setSaving(true);
    setSaveError(null);
    try {
      const restocking = existingProduct && stockStrategy === "restock";
      const payload: ProductDraft = restocking
        ? {
            ...draft,
            quantity: existingProduct.quantity + Math.max(1, draft.quantity),
            lowStockAt: existingProduct.lowStockAt,
            priceNgn: draft.priceNgn ?? existingProduct.priceNgn,
            notes: draft.notes || existingProduct.notes,
          }
        : draft;

      const res = await fetch(
        restocking
          ? `/api/products/${existingProduct.id}`
          : `/api/facilities/${facilityId}/products`,
        {
          method: restocking ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error ?? "Couldn't save product to stock.");
      }
      const savedProduct = data.product as Product;
      triggerHaptic("commit");
      onStocked?.(savedProduct);
      setStockedCount((n) => n + 1);
      setLastStockedName(savedProduct.name);
      if (batchMode) {
        resetResult("camera");
      } else {
        resetResult();
        onClose();
      }
    } catch (err) {
      setSaveError((err as Error).message || "Failed to save.");
      triggerHaptic("error");
    } finally {
      setSaving(false);
    }
  };

  const dangerLocked =
    !isVerifyOnly && report?.verdict === "danger" && !dangerAck;

  const setDraftField = <K extends keyof ProductDraft>(
    k: K,
    v: ProductDraft[K],
  ) => setDraft((prev) => (prev ? { ...prev, [k]: v } : prev));

  return (
    <Dialog
      open={open}
      onClose={() => {
        stopCamera();
        onClose();
      }}
      variant="sheet"
      className="sm:max-w-2xl"
      title={isVerifyOnly ? "Scan & verify product" : "Scan to stock"}
      description={
        isVerifyOnly
          ? "Scan a barcode or snap a medicine/cream carton to check NAFDAC, FDA & global public registries."
          : "Verify supplier cartons against public registries in real time before placing them on shelves."
      }
      footer={
        report ? (
          isVerifyOnly ? (
            <>
              <Button variant="ghost" onClick={() => resetResult("camera")}>
                <ScanLine className="h-4 w-4" aria-hidden />
                Scan another
              </Button>
              <Button onClick={onClose}>Done</Button>
            </>
          ) : (
            <>
              {saveError && (
                <p
                  role="alert"
                  className="mr-auto flex items-center gap-1.5 text-sm text-alert"
                >
                  <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
                  {saveError}
                </p>
              )}
              <Button
                variant={report.verdict === "danger" ? "danger" : "ghost"}
                onClick={() => resetResult("camera")}
              >
                {report.verdict === "danger"
                  ? "Reject carton & scan next"
                  : "Scan another"}
              </Button>
              <Button
                disabled={dangerLocked || saving}
                loading={saving}
                onClick={saveStockedProduct}
              >
                <PackageCheck className="h-4 w-4" aria-hidden />
                {existingProduct && stockStrategy === "restock"
                  ? `Add +${draft?.quantity ?? 1} to existing stock`
                  : batchMode
                    ? "Save & scan next"
                    : "Save to stock"}
              </Button>
            </>
          )
        ) : (
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        )
      }
    >
      {/* Session progress & batch toggle */}
      {!isVerifyOnly && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-line bg-mist/60 px-3.5 py-2.5 text-xs">
          <div className="flex items-center gap-2">
            <Boxes className="h-4 w-4 text-brand" aria-hidden />
            <span className="font-medium text-ink">
              {stockedCount > 0
                ? `${stockedCount} carton${stockedCount === 1 ? "" : "s"} stocked this session`
                : "Ready for delivery batch intake"}
            </span>
            {lastStockedName && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 font-medium text-brand-strong">
                <Check className="h-3 w-3" aria-hidden />
                {lastStockedName}
              </span>
            )}
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 font-medium text-ink">
            <input
              type="checkbox"
              checked={batchMode}
              onChange={(e) => setBatchMode(e.target.checked)}
              className="h-4 w-4 accent-[var(--brand)]"
            />
            Continuous batch mode
          </label>
        </div>
      )}

      {/* Segmented input mode selector when idle */}
      {!report && (
        <div
          role="tablist"
          aria-label="Scan input method"
          className="mb-4 grid grid-cols-3 gap-1 rounded-2xl border border-line bg-mist p-1"
        >
          {(
            [
              { id: "camera", label: "Live camera", icon: Camera },
              { id: "upload", label: "Pack photo", icon: Upload },
              { id: "manual", label: "Code / name", icon: Barcode },
            ] as const
          ).map(({ id, label, icon: Icon }) => {
            const active = inputMode === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setScanError(null);
                  setInputMode(id);
                }}
                className={cn(
                  "press flex h-10 items-center justify-center gap-1.5 rounded-xl text-xs font-semibold transition-all sm:text-sm",
                  active
                    ? "bg-surface text-ink shadow-xs"
                    : "text-muted hover:text-ink",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {label}
              </button>
            );
          })}
        </div>
      )}

      {scanError && (
        <p
          role="alert"
          className="mb-4 flex items-center gap-2 rounded-2xl border border-alert/30 bg-alert-soft px-4 py-3 text-sm text-alert"
        >
          <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden />
          {scanError}
        </p>
      )}

      {/* ---------- SCANNER INPUT STAGE ---------- */}
      {!report && inputMode === "camera" && (
        <div className="space-y-4">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-line bg-[#061514]">
            {cameraError ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center text-white/85">
                <Camera className="h-8 w-8 text-brand" aria-hidden />
                <p className="max-w-sm text-sm leading-relaxed">
                  {cameraError}
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setInputMode("upload")}
                  >
                    Upload pack photo
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setInputMode("manual")}
                  >
                    Enter NAFDAC / barcode
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  autoPlay
                  className={cn(
                    "h-full w-full object-cover",
                    facing === "user" && "-scale-x-100",
                  )}
                />

                {/* Viewfinder reticle & scanline */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-8">
                  <div className="relative h-44 w-full max-w-sm rounded-2xl border-2 border-white/65 shadow-[0_0_0_9999px_rgba(6,25,26,0.42)]">
                    <div className="scan-beam absolute inset-x-2 top-3 h-0.5 rounded-full bg-brand shadow-[0_0_12px_var(--brand)]" />
                  </div>
                </div>

                {/* Top translucent camera controls */}
                <div className="material-bar absolute inset-x-3 top-3 flex items-center justify-between gap-2 rounded-2xl border border-white/15 px-3 py-2">
                  <span className="flex items-center gap-2 text-xs font-medium text-ink">
                    {scanning ? (
                      <>
                        <LoaderCircle
                          className="h-3.5 w-3.5 animate-spin text-brand"
                          aria-hidden
                        />
                        {liveLockedCode
                          ? `Checking ${liveLockedCode}...`
                          : "Reading pack & checking registries..."}
                      </>
                    ) : (
                      <>
                        <ScanLine
                          className="h-3.5 w-3.5 text-brand"
                          aria-hidden
                        />
                        Align barcode or NAFDAC panel
                      </>
                    )}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {torchSupported && (
                      <button
                        type="button"
                        onClick={toggleTorch}
                        className="press flex h-8 w-8 items-center justify-center rounded-xl bg-surface/85 text-ink"
                        aria-label={
                          torchOn ? "Turn off flash" : "Turn on flash"
                        }
                      >
                        {torchOn ? (
                          <Zap className="h-4 w-4 text-caution" aria-hidden />
                        ) : (
                          <ZapOff className="h-4 w-4" aria-hidden />
                        )}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setFacing((f) =>
                          f === "environment" ? "user" : "environment",
                        )
                      }
                      className="press flex h-8 w-8 items-center justify-center rounded-xl bg-surface/85 text-ink"
                      aria-label="Switch camera"
                    >
                      <FlipHorizontal2 className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {!cameraError && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted">
                Barcodes & GS1 DataMatrix lock automatically; or tap Snap to
                read printed NAFDAC numbers, strength & expiry via AI Vision.
              </p>
              <Button
                type="button"
                size="lg"
                loading={scanning}
                disabled={!cameraReady}
                onClick={snapCurrentFrame}
                className="shrink-0"
              >
                <Sparkles className="h-4 w-4" aria-hidden />
                Snap pack & verify
              </Button>
            </div>
          )}
        </div>
      )}

      {!report && inputMode === "upload" && (
        <div className="rounded-3xl border-2 border-dashed border-line bg-mist/40 p-8 text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              void handleFilePick(f);
            }}
          />
          <Upload className="mx-auto h-9 w-9 text-brand" aria-hidden />
          <h3 className="mt-3 font-display text-lg font-semibold text-ink">
            Upload or take a photo of the carton
          </h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted">
            Capture the front label, NAFDAC registration panel, or barcode
            strip. Large phone photos are compressed securely in your browser.
          </p>
          <Button
            className="mt-5"
            loading={scanning}
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="h-4 w-4" aria-hidden />
            Choose or snap photo
          </Button>
        </div>
      )}

      {!report && inputMode === "manual" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleManualLookup();
          }}
          className="space-y-4 rounded-3xl border border-line bg-surface p-5"
        >
          <TextField
            label="NAFDAC Reg. No., Barcode (GTIN/EAN), NDC, or Product Name"
            icon={Barcode}
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="e.g. A4-9674, 01-4821, 8901234567893, Tydineal"
            hint="Checks NAFDAC Greenbook & Herbal DB, US FDA Orange Book & recalls, Health Canada DPD, UK MHRA & China NMPA."
          />
          <div className="flex flex-wrap gap-2">
            <Button type="submit" loading={scanning}>
              <ScanLine className="h-4 w-4" aria-hidden />
              Verify live now
            </Button>
          </div>
        </form>
      )}

      {/* ---------- VERIFICATION + BATCH STOCKING STAGE ---------- */}
      {report && (
        <div className="space-y-5">
          {report.verdict === "danger" && (
            <div
              role="alert"
              className="rounded-2xl border-2 border-alert bg-alert p-4 text-white"
            >
              <div className="flex items-start gap-3">
                <ShieldAlert className="mt-0.5 h-6 w-6 shrink-0" aria-hidden />
                <div className="flex-1">
                  <p className="font-display text-base font-bold">
                    Hold carton — do not place on shelf
                  </p>
                  <p className="mt-1 text-sm text-white/90">
                    Zelthia detected a high-risk safety mismatch, recall alert,
                    or expired batch. Return the carton to your supplier or
                    inspect the printed code carefully before continuing.
                  </p>
                  {!isVerifyOnly && !dangerAck && (
                    <button
                      type="button"
                      onClick={() => setDangerAck(true)}
                      className="mt-2.5 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold text-white underline-offset-4 hover:bg-white/25 hover:underline"
                    >
                      OCR misread or allow manual inspection override
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          <RegulatoryReportCard
            report={report}
            onRefresh={handleReverifyDraft}
            refreshing={scanning}
          />

          {/* Facility Stocking Intake Form */}
          {!isVerifyOnly && draft && (
            <div className="space-y-4 rounded-3xl border border-line bg-surface p-4 sm:p-5">
              {existingProduct && (
                <div className="rounded-2xl border border-brand/30 bg-brand-soft/50 p-3.5 text-xs">
                  <p className="font-semibold text-ink">
                    Already in stock: {existingProduct.name} (
                    {existingProduct.quantity} units)
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setStockStrategy("restock")}
                      className={cn(
                        "rounded-xl px-3 py-1.5 font-semibold transition-colors",
                        stockStrategy === "restock"
                          ? "bg-brand text-white dark:text-[#06231a]"
                          : "border border-line bg-surface text-ink",
                      )}
                    >
                      Add to existing stock
                    </button>
                    <button
                      type="button"
                      onClick={() => setStockStrategy("new")}
                      className={cn(
                        "rounded-xl px-3 py-1.5 font-semibold transition-colors",
                        stockStrategy === "new"
                          ? "bg-brand text-white dark:text-[#06231a]"
                          : "border border-line bg-surface text-ink",
                      )}
                    >
                      Save as separate batch item
                    </button>
                  </div>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Stepper
                    label="Carton / pack quantity"
                    min={1}
                    max={1000000}
                    start={1}
                    value={draft.quantity}
                    onChange={(v) => setDraftField("quantity", v ?? 1)}
                  />
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {QUICK_QTY_STEPS.map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() =>
                          setDraftField("quantity", (draft.quantity || 0) + n)
                        }
                        className="press rounded-lg border border-line bg-mist px-2.5 py-1 text-xs font-semibold tabular-nums text-ink hover:border-brand/50"
                      >
                        +{n}
                      </button>
                    ))}
                  </div>
                </div>
                <TextField
                  label="Selling price (₦)"
                  inputMode="decimal"
                  value={draft.priceNgn ?? ""}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^\d.]/g, "");
                    setDraftField("priceNgn", raw === "" ? null : Number(raw));
                  }}
                  placeholder="e.g. 2500"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Product name"
                  value={draft.name}
                  onChange={(e) => setDraftField("name", e.target.value)}
                />
                <TextField
                  label="Active ingredient"
                  value={draft.genericName}
                  onChange={(e) => setDraftField("genericName", e.target.value)}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  label="Category"
                  icon={Layers}
                  value={draft.category}
                  onChange={(v) => setDraftField("category", v)}
                  options={PRODUCT_CATEGORIES.map((c) => ({
                    value: c,
                    label: c,
                  }))}
                />
                <Select
                  label="Form"
                  value={draft.form}
                  placeholder="Choose form"
                  onChange={(v) => setDraftField("form", v)}
                  options={PRODUCT_FORMS.map((f) => ({ value: f, label: f }))}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <TextField
                  label="NAFDAC Reg. No."
                  value={draft.nafdacNumber}
                  onChange={(e) =>
                    setDraftField(
                      "nafdacNumber",
                      e.target.value.toUpperCase().replace(/\s+/g, ""),
                    )
                  }
                  placeholder="e.g. A4-9674"
                />
                <TextField
                  label="Barcode / GTIN"
                  value={draft.barcode}
                  onChange={(e) =>
                    setDraftField("barcode", e.target.value.trim())
                  }
                  placeholder="EAN / UPC"
                />
                <TextField
                  label="Batch no."
                  value={draft.batch}
                  onChange={(e) => setDraftField("batch", e.target.value)}
                  placeholder="Lot / BN"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <TextField
                  label="Manufacturer"
                  value={draft.manufacturer}
                  onChange={(e) =>
                    setDraftField("manufacturer", e.target.value)
                  }
                />
                <TextField
                  label="Country of origin"
                  value={draft.countryOfOrigin}
                  onChange={(e) =>
                    setDraftField("countryOfOrigin", e.target.value)
                  }
                />
                <TextField
                  label="Expiry (YYYY-MM-DD)"
                  value={draft.expiresOn ?? ""}
                  onChange={(e) =>
                    setDraftField("expiresOn", e.target.value.trim() || null)
                  }
                  placeholder="2027-12-31"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  loading={scanning}
                  onClick={handleReverifyDraft}
                >
                  <RefreshCw className="h-3.5 w-3.5" aria-hidden />
                  Re-check edited fields live
                </Button>
              </div>
            </div>
          )}

          {/* Public Verify Directory & Web Matches */}
          {isVerifyOnly && (
            <>
              <DirectoryMatches matches={publicMatches} />
              <ImageGallery images={images} />
              <WebSources places={webRefs} />
            </>
          )}
          {!isVerifyOnly && webRefs.length > 0 && (
            <WebSources places={webRefs} />
          )}
        </div>
      )}
    </Dialog>
  );
}
