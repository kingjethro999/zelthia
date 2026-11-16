"use client";

import { useEffect, useRef, useState } from "react";
import { LoaderCircle, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

const fmt = (s: number) => {
  if (!Number.isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
};

/** Compact audio player with a seekable progress bar. */
export function AudioPlayer({ src, label, className }: { src: string; label: string; className?: string }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const a = ref.current;
    if (!a) return;
    const onTime = () => setTime(a.currentTime);
    // MediaRecorder webm files report Infinity until fully read.
    const onMeta = () => setDuration(Number.isFinite(a.duration) ? a.duration : 0);
    const onEnd = () => setPlaying(false);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("durationchange", onMeta);
    a.addEventListener("ended", onEnd);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("durationchange", onMeta);
      a.removeEventListener("ended", onEnd);
    };
  }, []);

  const toggle = async () => {
    const a = ref.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
      return;
    }
    setLoading(true);
    try {
      await a.play();
      setPlaying(true);
      setFailed(false);
    } catch (err) {
      console.warn("Audio playback failed", err);
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  const pct = duration ? Math.min(100, (time / duration) * 100) : 0;

  return (
    <div className={cn("flex items-center gap-3 rounded-2xl border border-line bg-paper p-2 pr-3", className)}>
      <audio ref={ref} src={src} preload="metadata" />
      <button
        type="button"
        onClick={toggle}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-white hover:bg-brand-strong dark:text-[#06231a]"
        aria-label={playing ? `Pause ${label}` : `Play ${label}`}
      >
        {loading ? (
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
        ) : playing ? (
          <Pause className="h-4 w-4 fill-current" aria-hidden />
        ) : (
          <Play className="ml-0.5 h-4 w-4 fill-current" aria-hidden />
        )}
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-ink">{failed ? "Couldn't play this recording" : label}</p>
        <div
          role="slider"
          tabIndex={0}
          aria-label={`Seek ${label}`}
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-valuenow={Math.round(time)}
          aria-valuetext={`${fmt(time)} of ${fmt(duration)}`}
          onClick={(e) => {
            const a = ref.current;
            if (!a || !duration) return;
            const r = e.currentTarget.getBoundingClientRect();
            a.currentTime = ((e.clientX - r.left) / r.width) * duration;
          }}
          onKeyDown={(e) => {
            const a = ref.current;
            if (!a) return;
            if (e.key === "ArrowRight") a.currentTime = Math.min(duration, a.currentTime + 5);
            if (e.key === "ArrowLeft") a.currentTime = Math.max(0, a.currentTime - 5);
          }}
          className="mt-1.5 h-1.5 cursor-pointer rounded-full bg-line"
        >
          <div className="h-full rounded-full bg-brand transition-[width]" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <span className="shrink-0 tabular-nums text-xs text-muted">
        {fmt(time)}
        {duration ? ` / ${fmt(duration)}` : ""}
      </span>
    </div>
  );
}
