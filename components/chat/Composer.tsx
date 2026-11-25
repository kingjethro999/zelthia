"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import Image from "next/image";
import { ArrowUp, Camera, FileText, Paperclip, Plus, Square, X } from "lucide-react";
import { ACCEPTED_MIME, MAX_ATTACHMENTS, MAX_ATTACHMENT_BYTES } from "@/lib/chat-types";
import type { PendingFile } from "@/lib/store/chat";
import { cn } from "@/lib/utils";

/** Total base64 payload must stay under Vercel's 4.5 MB request limit. */
const MAX_TOTAL_BYTES = 3.8 * 1024 * 1024;
const MAX_IMAGE_EDGE = 2000;

const toBase64 = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1] ?? "");
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });

/** Shrinks large photos so handwriting stays legible but uploads stay small. */
async function prepareImage(file: File): Promise<Blob> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size < 600 * 1024) return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", 0.85));
    return blob && blob.size < file.size ? blob : file;
  } catch (err) {
    console.warn("Image resize failed; sending original", err);
    return file;
  }
}

export interface ComposerHandle {
  addFiles: (files: FileList | File[]) => void;
  openPicker: () => void;
  focus: () => void;
}

interface ComposerProps {
  pending: boolean;
  onSend: (text: string, files: PendingFile[]) => void;
  onStop: () => void;
  placeholder: string;
}

export const Composer = forwardRef<ComposerHandle, ComposerProps>(function Composer(
  { pending, onSend, onStop, placeholder },
  ref,
) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<PendingFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
    // Only show a scrollbar once the box has reached its maximum height.
    el.style.overflowY = el.scrollHeight > 200 ? "auto" : "hidden";
  }, [text]);

  useEffect(() => {
    if (!menu) return;
    const close = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [menu]);

  const addFiles = async (list: FileList | File[]) => {
    setError(null);
    setBusy(true);
    const next = [...files];
    for (const file of Array.from(list)) {
      if (next.length >= MAX_ATTACHMENTS) {
        setError(`You can attach up to ${MAX_ATTACHMENTS} files per message.`);
        break;
      }
      const mime = file.type || (file.name.toLowerCase().endsWith(".pdf") ? "application/pdf" : "");
      if (!ACCEPTED_MIME.includes(mime)) {
        setError(`${file.name}: attach a photo (JPG, PNG, WebP, HEIC), a PDF or a text file.`);
        continue;
      }
      const blob = mime.startsWith("image/") ? await prepareImage(file) : file;
      if (blob.size > MAX_ATTACHMENT_BYTES) {
        setError(`${file.name} is over 3 MB. Take a closer photo or export fewer pages.`);
        continue;
      }
      const total = next.reduce((n, f) => n + f.size, 0) + blob.size;
      if (total > MAX_TOTAL_BYTES) {
        setError("These files are too large to send together. Send them in separate messages.");
        break;
      }
      next.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: file.name,
        mime: blob === file ? mime : "image/jpeg",
        size: blob.size,
        base64: await toBase64(blob),
        previewUrl: mime.startsWith("image/") && mime !== "image/heic" && mime !== "image/heif" ? URL.createObjectURL(blob) : undefined,
      });
    }
    setFiles(next);
    setBusy(false);
    inputRef.current?.focus();
  };

  useImperativeHandle(ref, () => ({
    addFiles: (l) => void addFiles(l),
    openPicker: () => fileRef.current?.click(),
    focus: () => inputRef.current?.focus(),
  }));

  const removeFile = (id: string) =>
    setFiles((fs) => {
      const f = fs.find((x) => x.id === id);
      if (f?.previewUrl) URL.revokeObjectURL(f.previewUrl);
      return fs.filter((x) => x.id !== id);
    });

  const submit = () => {
    if (pending || busy || (!text.trim() && !files.length)) return;
    onSend(text.trim(), files);
    setText("");
    setFiles([]);
    setError(null);
  };

  const canSend = (text.trim() || files.length) && !busy;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="rounded-3xl border border-line bg-surface p-2 shadow-[0_8px_30px_-12px_rgba(13,59,53,0.25)] focus-within:border-brand/50"
    >
      {files.length > 0 && (
        <ul className="flex flex-wrap gap-2 px-1.5 pb-2 pt-1" aria-label="Attached files">
          {files.map((f) => (
            <li key={f.id} className="animate-pop relative">
              {f.previewUrl ? (
                <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-line">
                  <Image src={f.previewUrl} alt={f.name} fill unoptimized className="object-cover" />
                </div>
              ) : (
                <div className="flex h-16 w-48 items-center gap-2 rounded-xl border border-line bg-paper px-2.5">
                  <FileText className="h-6 w-6 shrink-0 text-alert" aria-hidden />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-ink">{f.name}</span>
                    <span className="block text-xs text-muted">{Math.max(1, Math.round(f.size / 1024))} KB</span>
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={() => removeFile(f.id)}
                className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-line bg-surface text-muted shadow hover:text-ink"
                aria-label={`Remove ${f.name}`}
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      <label htmlFor="chat-input" className="sr-only">
        Message Zelthia
      </label>
      <textarea
        id="chat-input"
        ref={inputRef}
        rows={1}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            submit();
          }
        }}
        onPaste={(e) => {
          const pasted = Array.from(e.clipboardData.files);
          if (pasted.length) {
            e.preventDefault();
            void addFiles(pasted);
          }
        }}
        placeholder={placeholder}
        className="block max-h-[200px] min-h-11 w-full resize-none overflow-hidden bg-transparent px-3 py-2.5 text-[15px] text-ink placeholder:truncate placeholder:text-muted focus:outline-none"
      />

      <div className="flex items-center justify-between gap-2 px-1">
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenu((m) => !m)}
            aria-haspopup="menu"
            aria-expanded={menu}
            className="press flex h-9 w-9 items-center justify-center rounded-full border border-line text-muted hover:bg-mist hover:text-ink"
            aria-label="Add photos or files"
          >
            <Plus className="h-[18px] w-[18px]" aria-hidden />
          </button>
          {menu && (
            <div role="menu" className="animate-pop material-popover absolute bottom-11 left-0 z-20 w-64 origin-bottom-left rounded-2xl border border-line p-1.5">
              <button
                role="menuitem"
                type="button"
                onClick={() => {
                  setMenu(false);
                  fileRef.current?.click();
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-ink hover:bg-mist"
              >
                <Paperclip className="h-4 w-4 text-muted" aria-hidden />
                <span>
                  Upload photos or files
                  <span className="block text-xs text-muted">Doctor&apos;s notes, scans, lab results, PDFs</span>
                </span>
              </button>
              <button
                role="menuitem"
                type="button"
                onClick={() => {
                  setMenu(false);
                  cameraRef.current?.click();
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-ink hover:bg-mist"
              >
                <Camera className="h-4 w-4 text-muted" aria-hidden />
                Take a photo
              </button>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            multiple
            accept={ACCEPTED_MIME.join(",")}
            aria-label="Upload photos or files"
            className="hidden"
            tabIndex={-1}
            aria-hidden
            onChange={(e) => {
              if (e.target.files) void addFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            aria-label="Take a photo"
            className="hidden"
            tabIndex={-1}
            aria-hidden
            onChange={(e) => {
              if (e.target.files) void addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        {pending ? (
          <button
            type="button"
            onClick={onStop}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-paper"
            aria-label="Stop answering"
          >
            <Square className="h-3.5 w-3.5 fill-current" aria-hidden />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!canSend}
            className={cn(
              "press flex h-9 w-9 items-center justify-center rounded-full",
              canSend ? "bg-brand text-white hover:bg-brand-strong dark:text-[#06231a]" : "bg-mist text-muted",
            )}
            aria-label="Send message"
          >
            <ArrowUp className="h-[18px] w-[18px]" aria-hidden />
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="px-3 pb-1 pt-2 text-sm text-alert">
          {error}
        </p>
      )}
    </form>
  );
});
