"use client";

import { useEffect, useRef, useState } from "react";
import { LoaderCircle, Mic, RotateCcw, Square, Trash2 } from "lucide-react";
import { AudioPlayer } from "@/components/ui/AudioPlayer";

const MAX_SECONDS = 180;

function pickMime() {
  if (typeof MediaRecorder === "undefined") return "";
  for (const m of ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"]) {
    if (MediaRecorder.isTypeSupported(m)) return m;
  }
  return "";
}

const toBase64 = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1] ?? "");
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });

/**
 * Records spoken directions, stores the audio and returns a transcript.
 * Both are saved: patients can listen or read.
 */
export function VoiceRecorder({
  audioUrl,
  onSaved,
  onRemove,
}: {
  audioUrl: string | null;
  onSaved: (r: { id: string; url: string; transcript: string | null }) => void;
  onRemove: () => void;
}) {
  const [state, setState] = useState<"idle" | "recording" | "saving">("idle");
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [level, setLevel] = useState(0);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const stopTimer = useRef<() => void>(() => {});

  useEffect(() => () => stopTimer.current(), []);

  const start = async () => {
    setError(null);
    const mime = pickMime();
    if (!mime || !navigator.mediaDevices?.getUserMedia) {
      setError("This browser can't record audio. Type the directions instead.");
      return;
    }
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError("Microphone access was blocked. Allow it in your browser settings, or type the directions.");
      return;
    }

    // Live input level so people can see it's hearing them.
    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    ctx.createMediaStreamSource(stream).connect(analyser);
    const buf = new Uint8Array(analyser.frequencyBinCount);
    let raf = 0;
    const tick = () => {
      analyser.getByteFrequencyData(buf);
      setLevel(buf.reduce((a, b) => a + b, 0) / buf.length / 128);
      raf = requestAnimationFrame(tick);
    };
    tick();

    const rec = new MediaRecorder(stream, { mimeType: mime, audioBitsPerSecond: 32000 });
    chunks.current = [];
    rec.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
    rec.onstop = async () => {
      stopTimer.current();
      cancelAnimationFrame(raf);
      void ctx.close();
      stream.getTracks().forEach((t) => t.stop());
      const blob = new Blob(chunks.current, { type: mime.split(";")[0] });
      if (blob.size < 1000) {
        setState("idle");
        setError("That recording was empty. Try again a little closer to the microphone.");
        return;
      }
      setState("saving");
      try {
        const res = await fetch("/api/audio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mime, base64: await toBase64(blob) }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error ?? "The recording wasn't saved.");
        onSaved(data);
        if (!data.transcript) setError("Saved the recording, but couldn't turn it into text. Type the words below.");
      } catch (err) {
        setError((err as Error).message || "The recording wasn't saved. Check your connection and try again.");
      } finally {
        setState("idle");
      }
    };
    rec.start(1000);
    recorder.current = rec;
    setSeconds(0);
    setState("recording");
    const started = Date.now();
    const t = setInterval(() => {
      const s = Math.floor((Date.now() - started) / 1000);
      setSeconds(s);
      if (s >= MAX_SECONDS) rec.stop();
    }, 250);
    stopTimer.current = () => clearInterval(t);
  };

  const stop = () => recorder.current?.state === "recording" && recorder.current.stop();

  return (
    <div className="space-y-2">
      {state === "recording" ? (
        <div className="flex items-center gap-3 rounded-2xl border border-alert/30 bg-alert-soft p-2 pr-3">
          <button
            type="button"
            onClick={stop}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-alert text-white"
            aria-label="Stop recording"
          >
            <Square className="h-3.5 w-3.5 fill-current" aria-hidden />
          </button>
          <div className="flex h-6 flex-1 items-center gap-0.5" aria-hidden>
            {Array.from({ length: 28 }, (_, i) => (
              <span
                key={i}
                className="w-1 rounded-full bg-alert/70 transition-[height] duration-100"
                style={{ height: `${Math.max(12, Math.min(100, level * 100 * (0.5 + Math.abs(Math.sin(i * 1.7 + seconds)))))}%` }}
              />
            ))}
          </div>
          <span className="tabular-nums text-sm font-medium text-alert">
            {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
          </span>
          <span className="sr-only" role="status">
            Recording
          </span>
        </div>
      ) : state === "saving" ? (
        <p role="status" className="flex items-center gap-2 rounded-2xl border border-line bg-paper p-3 text-sm text-muted">
          <LoaderCircle className="h-4 w-4 animate-spin text-brand" aria-hidden />
          Saving and transcribing your recording
        </p>
      ) : audioUrl ? (
        <div className="flex items-center gap-2">
          <AudioPlayer src={audioUrl} label="Recorded directions" className="flex-1" />
          <button type="button" onClick={start} className="flex h-10 w-10 items-center justify-center rounded-xl text-muted hover:bg-mist hover:text-ink" aria-label="Record again">
            <RotateCcw className="h-4 w-4" aria-hidden />
          </button>
          <button type="button" onClick={onRemove} className="flex h-10 w-10 items-center justify-center rounded-xl text-muted hover:bg-alert-soft hover:text-alert" aria-label="Remove recording">
            <Trash2 className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={start}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-surface px-3.5 text-sm font-medium text-ink hover:border-brand/50"
        >
          <Mic className="h-4 w-4 text-brand" aria-hidden />
          Record directions instead
        </button>
      )}
      {error && (
        <p role="alert" className="text-xs font-medium text-alert">
          {error}
        </p>
      )}
    </div>
  );
}
