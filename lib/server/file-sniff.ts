import "server-only";

const HEIF_BRANDS = new Set([
  "heic",
  "heix",
  "hevc",
  "hevx",
  "mif1",
  "msf1",
  "heis",
  "heim",
]);

function sniffImage(buf: Buffer): string | null {
  if (
    buf.length >= 3 &&
    buf[0] === 0xff &&
    buf[1] === 0xd8 &&
    buf[2] === 0xff
  ) {
    return "image/jpeg";
  }
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  ) {
    return "image/png";
  }
  if (
    buf.length >= 12 &&
    buf.subarray(0, 4).toString("ascii") === "RIFF" &&
    buf.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }
  if (buf.length >= 12 && buf.subarray(4, 8).toString("ascii") === "ftyp") {
    const brand = buf.subarray(8, 12).toString("ascii").toLowerCase();
    if (HEIF_BRANDS.has(brand)) {
      return brand === "mif1" || brand === "msf1" ? "image/heif" : "image/heic";
    }
  }
  return null;
}

function isPlainText(buf: Buffer): boolean {
  if (buf.length === 0) return false;
  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(buf);
  } catch {
    return false;
  }
  let ctrl = 0;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code === 0) return false;
    if (code < 0x20 && code !== 0x09 && code !== 0x0a && code !== 0x0d) {
      ctrl++;
    }
  }
  return ctrl / text.length < 0.05;
}

/**
 * Verifies real magic bytes / content for chat uploads so spoofed MIME types
 * (e.g. HTML, SVG, or executables labelled as PNG/PDF) are rejected.
 */
export function sniffChatAttachment(
  buf: Buffer,
  declaredMime: string,
): string | null {
  const clean = declaredMime.split(";")[0].trim().toLowerCase();
  if (clean.startsWith("image/")) {
    return sniffImage(buf);
  }
  if (clean === "application/pdf") {
    return buf.length >= 5 && buf.subarray(0, 5).toString("ascii") === "%PDF-"
      ? "application/pdf"
      : null;
  }
  if (clean === "text/plain") {
    return isPlainText(buf) ? "text/plain" : null;
  }
  return null;
}

/**
 * Verifies magic bytes for audio recordings before uploading or transcribing.
 */
export function sniffAudio(buf: Buffer, declaredMime: string): string | null {
  const clean = declaredMime.split(";")[0].trim().toLowerCase();
  if (!clean.startsWith("audio/") || buf.length < 12) return null;

  if (
    buf[0] === 0x1a &&
    buf[1] === 0x45 &&
    buf[2] === 0xdf &&
    buf[3] === 0xa3
  ) {
    return "audio/webm";
  }
  if (buf.subarray(0, 4).toString("ascii") === "OggS") {
    return "audio/ogg";
  }
  if (
    buf.subarray(0, 4).toString("ascii") === "RIFF" &&
    buf.subarray(8, 12).toString("ascii") === "WAVE"
  ) {
    return "audio/wav";
  }
  if (buf.subarray(4, 8).toString("ascii") === "ftyp") {
    return "audio/mp4";
  }
  if (
    buf.subarray(0, 3).toString("ascii") === "ID3" ||
    (buf[0] === 0xff &&
      (buf[1] === 0xfb ||
        buf[1] === 0xf3 ||
        buf[1] === 0xf2 ||
        buf[1] === 0xe3))
  ) {
    return "audio/mpeg";
  }
  if (buf[0] === 0xff && (buf[1] === 0xf1 || buf[1] === 0xf9)) {
    return "audio/aac";
  }
  return null;
}
