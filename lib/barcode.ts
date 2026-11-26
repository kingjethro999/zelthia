export type NafdacPrefixDomain =
  | "drug"
  | "cosmetic"
  | "herbal_listed"
  | "medical_device"
  | "food_beverage"
  | "unknown";

export type GuoyaoKind =
  | "chemical_drug"
  | "tcm_herbal"
  | "biologic"
  | "supplement_health_food"
  | "imported_repackaged"
  | "other";

export interface ScannedCodeInfo {
  raw: string;
  gtin?: string;
  ean13?: string;
  upcA?: string;
  derivedUsNdc?: string;
  gs1Expiry?: string;
  gs1Batch?: string;
  gs1Serial?: string;
}

export interface ExtractedRegulatoryCodes {
  nafdac?: string;
  nafdacPrefixDomain?: NafdacPrefixDomain;
  nafdacIsListedL?: boolean;
  ndc?: string;
  guoyaoZhunzi?: string;
  guoyaoKind?: GuoyaoKind;
  chineseCosmetic?: string;
  cnTraceability20?: string;
  mhraPl?: string;
  hcDin?: string;
  barcode?: string;
}

/** Validates standard GS1 Modulo-10 check digits for GTIN-8, 12, 13, and 14. */
export function isValidGtin(raw: string): boolean {
  const digits = raw.replace(/\D/g, "");
  if (![8, 12, 13, 14].includes(digits.length)) return false;
  const check = Number(digits[digits.length - 1]);
  const body = digits.slice(0, -1);
  let sum = 0;
  for (let i = 0; i < body.length; i++) {
    const posFromRight = body.length - 1 - i;
    const weight = posFromRight % 2 === 0 ? 3 : 1;
    sum += Number(body[i]) * weight;
  }
  const expected = (10 - (sum % 10)) % 10;
  return expected === check;
}

function gs1DateToIso(yymmdd: string): string | undefined {
  if (!/^\d{6}$/.test(yymmdd)) return undefined;
  const yy = Number.parseInt(yymmdd.slice(0, 2), 10);
  const mm = Number.parseInt(yymmdd.slice(2, 4), 10);
  const dd = Number.parseInt(yymmdd.slice(4, 6), 10);
  if (mm < 1 || mm > 12) return undefined;
  const year = 2000 + yy;
  if (dd === 0) {
    return new Date(Date.UTC(year, mm, 0)).toISOString().slice(0, 10);
  }
  if (dd < 1 || dd > 31) return undefined;
  const d = new Date(Date.UTC(year, mm - 1, dd));
  if (d.getUTCMonth() !== mm - 1) return undefined;
  return d.toISOString().slice(0, 10);
}

/**
 * Parses retail GTIN / EAN-13 / UPC-A barcodes AND pharmaceutical GS1 DataMatrix
 * or GS1-128 strings (`(01)` GTIN, `(17)` Expiry YYMMDD, `(10)` Batch, `(21)` Serial).
 */
export function parseScannedCode(rawInput: string): ScannedCodeInfo {
  const raw = rawInput.trim();
  const strippedSym = raw.replace(/^](?:d2|C1|e0|E0)/, "");
  const out: ScannedCodeInfo = { raw };

  // 1. Human-readable parenthesized GS1: (01)08901234567893(17)271200(10)BN24A
  const hasParens = /\(01\)/.test(strippedSym);
  if (hasParens) {
    const m01 = strippedSym.match(/\(01\)(\d{14})/);
    const m17 = strippedSym.match(/\(17\)(\d{6})/);
    const m10 = strippedSym.match(/\(10\)([^\x1d(]{1,20})/);
    const m21 = strippedSym.match(/\(21\)([^\x1d(]{1,20})/);
    if (m01 && isValidGtin(m01[1])) out.gtin = m01[1];
    if (m17) out.gs1Expiry = gs1DateToIso(m17[1]);
    if (m10) out.gs1Batch = m10[1].trim();
    if (m21) out.gs1Serial = m21[1].trim();
  } else if (
    /^01\d{14}/.test(strippedSym) ||
    strippedSym.includes("\x1d")
  ) {
    // 2. Unparenthesized GS1 FNC1 stream (common from hardware DataMatrix scanners)
    let cursor = 0;
    while (cursor < strippedSym.length) {
      if (strippedSym[cursor] === "\x1d") {
        cursor++;
        continue;
      }
      const ai2 = strippedSym.slice(cursor, cursor + 2);
      if (ai2 === "01" && /^\d{14}/.test(strippedSym.slice(cursor + 2, cursor + 16))) {
        const g = strippedSym.slice(cursor + 2, cursor + 16);
        if (isValidGtin(g)) out.gtin = g;
        cursor += 16;
      } else if (ai2 === "17" && /^\d{6}/.test(strippedSym.slice(cursor + 2, cursor + 8))) {
        out.gs1Expiry = gs1DateToIso(strippedSym.slice(cursor + 2, cursor + 8));
        cursor += 8;
      } else if (ai2 === "11" && /^\d{6}/.test(strippedSym.slice(cursor + 2, cursor + 8))) {
        cursor += 8;
      } else if (ai2 === "10" || ai2 === "21") {
        const nextSep = strippedSym.indexOf("\x1d", cursor + 2);
        const end = nextSep === -1 ? Math.min(strippedSym.length, cursor + 22) : nextSep;
        const val = strippedSym.slice(cursor + 2, end).trim();
        if (ai2 === "10" && val) out.gs1Batch = val;
        if (ai2 === "21" && val) out.gs1Serial = val;
        cursor = nextSep === -1 ? strippedSym.length : nextSep + 1;
      } else {
        break;
      }
    }
  } else {
    // 3. Plain retail barcode digits (EAN-8, UPC-A, EAN-13, GTIN-14)
    const digits = strippedSym.replace(/\D/g, "");
    if ([8, 12, 13, 14].includes(digits.length) && isValidGtin(digits)) {
      if (digits.length === 14) out.gtin = digits;
      else if (digits.length === 13) {
        out.ean13 = digits;
        out.gtin = `0${digits}`;
      } else if (digits.length === 12) {
        out.upcA = digits;
        out.ean13 = `0${digits}`;
        out.gtin = `00${digits}`;
      } else if (digits.length === 8) {
        out.gtin = `000000${digits}`;
      }
    }
  }

  if (out.gtin && !out.ean13 && out.gtin.startsWith("0")) {
    out.ean13 = out.gtin.slice(1);
  }
  if (out.ean13 && !out.upcA && out.ean13.startsWith("0")) {
    out.upcA = out.ean13.slice(1);
  }
  // US Pharmaceutical UPC-A starts with "3" followed by 10-digit NDC
  if (out.upcA && out.upcA.startsWith("3") && out.upcA.length === 12) {
    out.derivedUsNdc = out.upcA.slice(1, 11);
  }
  return out;
}

export function classifyNafdacCode(rawCode: string): {
  normalized: string;
  domain: NafdacPrefixDomain;
  isListedL: boolean;
} {
  const normalized = rawCode
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/\//g, "-");
  const isListedL = /L$/.test(normalized);
  const prefix = normalized.split("-")[0] ?? "";

  if (isListedL || prefix === "A7") {
    return { normalized, domain: "herbal_listed", isListedL: true };
  }
  if (["04", "A4", "B4"].includes(prefix)) {
    return { normalized, domain: "drug", isListedL: false };
  }
  if (["02", "C4", "A2"].includes(prefix)) {
    return { normalized, domain: "cosmetic", isListedL: false };
  }
  if (prefix === "03") {
    return { normalized, domain: "medical_device", isListedL: false };
  }
  if (["01", "08", "A1", "B1", "C1", "A8"].includes(prefix)) {
    return { normalized, domain: "food_beverage", isListedL: false };
  }
  return { normalized, domain: "unknown", isListedL: false };
}

/**
 * Extracts regulatory registration numbers (NAFDAC, FDA NDC, China Guoyao Zhunzi
 * & Cosmetic G/J, 20-digit Chinese drug traceability, UK MHRA PL, Health Canada DIN)
 * and GS1/GTIN barcodes from OCR text or user queries.
 */
export function extractRegulatoryCodes(text: string): ExtractedRegulatoryCodes {
  const out: ExtractedRegulatoryCodes = {};
  const clean = text.trim();
  if (!clean) return out;

  // NAFDAC with explicit keyword first, then strict known prefix pattern
  const explicitNafdac = clean.match(
    /NAFDAC\s*(?:REG\.?\s*(?:NO\.?)?)?\s*[:#-]?\s*([A-Z0-9]{1,3}\s*[-/]\s*\d{3,7}\s*L?)\b/i,
  );
  const canonicalNafdac = clean.match(
    /\b((?:A4|B4|04|C4|A7|01|02|03|08|A1|B1|C1|A2|A8)\s*-\s*\d{3,7}\s*L?)\b/i,
  );
  const nafdacRaw = explicitNafdac?.[1] ?? canonicalNafdac?.[1];
  if (nafdacRaw) {
    const cls = classifyNafdacCode(nafdacRaw);
    out.nafdac = cls.normalized;
    out.nafdacPrefixDomain = cls.domain;
    out.nafdacIsListedL = cls.isListedL;
  }

  // China NMPA Guoyao Zhunzi (国药准字 + H/Z/S/B/J + 8 digits)
  const cnDrug = clean.match(/国药准字\s*([HZSBTFJ])\s*(\d{8})/i);
  if (cnDrug) {
    const letter = cnDrug[1].toUpperCase();
    out.guoyaoZhunzi = `国药准字${letter}${cnDrug[2]}`;
    out.guoyaoKind =
      letter === "H"
        ? "chemical_drug"
        : letter === "Z"
          ? "tcm_herbal"
          : letter === "S"
            ? "biologic"
            : letter === "B"
              ? "supplement_health_food"
              : letter === "J"
                ? "imported_repackaged"
                : "other";
  }

  // China NMPA Cosmetics (国妆特字G..., 国妆网备进字..., 国妆备进字J...)
  const cnCosm = clean.match(
    /国妆(?:特字\s*G|备进字\s*J|网备进字[^\s,，;；)]{0,6})\s*\d{4,12}/i,
  );
  if (cnCosm) {
    out.chineseCosmetic = cnCosm[0].replace(/\s+/g, "");
  }

  // China 20-digit Electronic Supervision / Traceability code (typically starts with 8)
  const cn20 = clean.match(/\b(8\d{19})\b/);
  if (cn20) {
    out.cnTraceability20 = cn20[1];
  }

  // US NDC (4-4-2, 5-3-2, 5-4-1, 5-4-2; guard against YYYY-MM-DD dates)
  const ndcMatch = clean.match(/\b(\d{4,5}-\d{3,4}-\d{1,2})\b/);
  if (ndcMatch && !/^(19|20)\d{2}-\d{2}-\d{2}$/.test(ndcMatch[1])) {
    const parts = ndcMatch[1].split("-");
    const sumLen = parts[0].length + parts[1].length + parts[2].length;
    if (sumLen >= 10 && sumLen <= 11) {
      out.ndc = ndcMatch[1];
    }
  }

  // UK MHRA Product Licence
  const mhra = clean.match(/\b(PL(?:GB|PI)?\s*\d{5}\s*\/\s*\d{4})\b/i);
  if (mhra) {
    out.mhraPl = mhra[1].toUpperCase().replace(/\s+/g, "");
  }

  // Health Canada DIN / NPN
  const hc = clean.match(/\b((?:DIN|NPN)\s*[:#-]?\s*\d{8})\b/i);
  if (hc) {
    out.hcDin = hc[1].toUpperCase().replace(/[^A-Z0-9]/g, "");
  }

  // Barcode / GTIN (look for GS1 or standalone 8/12/13/14 valid check digit)
  const gs1 = clean.match(/(?:^|[\s(])(?:\(01\)|01)\d{14}[^\s]*/);
  if (gs1) {
    const parsed = parseScannedCode(gs1[0].trim());
    if (parsed.ean13 || parsed.gtin) out.barcode = parsed.ean13 ?? parsed.gtin;
  }
  if (!out.barcode) {
    const candidates = clean.match(/\b(\d{8}|\d{12}|\d{13}|\d{14})\b/g) ?? [];
    for (const c of candidates) {
      if (isValidGtin(c)) {
        out.barcode = c;
        break;
      }
    }
  }

  return out;
}

/* ---------- Pure-TS 1D EAN-13 / UPC-A / EAN-8 Canvas Scanline Decoder ---------- */

const L_PATTERNS: readonly [number, number, number, number][] = [
  [3, 2, 1, 1],
  [2, 2, 2, 1],
  [2, 1, 2, 2],
  [1, 4, 1, 1],
  [1, 1, 3, 2],
  [1, 2, 3, 1],
  [1, 1, 1, 4],
  [1, 3, 1, 2],
  [1, 2, 1, 3],
  [3, 1, 1, 2],
];

const G_PATTERNS: readonly [number, number, number, number][] = L_PATTERNS.map(
  (p) => [p[3], p[2], p[1], p[0]],
);

const FIRST_DIGIT_PARITY = [
  "LLLLLL",
  "LLGLGG",
  "LLGGLG",
  "LLGGGL",
  "LGLLGG",
  "LGGLLG",
  "LGGGLL",
  "LGLGLG",
  "LGLGGL",
  "LGGLGL",
];

function matchDigitPattern(
  runs: number[],
  offset: number,
  table: readonly [number, number, number, number][],
): { digit: number; err: number } {
  const sum =
    runs[offset] + runs[offset + 1] + runs[offset + 2] + runs[offset + 3];
  if (sum <= 0) return { digit: -1, err: 99 };
  const n0 = (runs[offset] / sum) * 7;
  const n1 = (runs[offset + 1] / sum) * 7;
  const n2 = (runs[offset + 2] / sum) * 7;
  const n3 = (runs[offset + 3] / sum) * 7;

  let bestDigit = -1;
  let bestErr = Number.POSITIVE_INFINITY;
  for (let d = 0; d < 10; d++) {
    const p = table[d];
    const err =
      Math.abs(n0 - p[0]) +
      Math.abs(n1 - p[1]) +
      Math.abs(n2 - p[2]) +
      Math.abs(n3 - p[3]);
    if (err < bestErr) {
      bestErr = err;
      bestDigit = d;
    }
  }
  return { digit: bestDigit, err: bestErr };
}

function isGuardTuple(vals: number[], expectedCount: number): boolean {
  const avg = vals.reduce((a, b) => a + b, 0) / expectedCount;
  if (avg <= 0) return false;
  return vals.every((v) => v >= avg * 0.45 && v <= avg * 1.8);
}

function tryDecodeEan13Window(runs: number[], startIdx: number): string | null {
  if (startIdx + 59 > runs.length) return null;
  if (!isGuardTuple(runs.slice(startIdx, startIdx + 3), 3)) return null;
  if (!isGuardTuple(runs.slice(startIdx + 27, startIdx + 32), 5)) return null;
  if (!isGuardTuple(runs.slice(startIdx + 56, startIdx + 59), 3)) return null;

  let paritySeq = "";
  const leftDigits: number[] = [];
  for (let i = 0; i < 6; i++) {
    const off = startIdx + 3 + i * 4;
    const lMatch = matchDigitPattern(runs, off, L_PATTERNS);
    const gMatch = matchDigitPattern(runs, off, G_PATTERNS);
    if (Math.min(lMatch.err, gMatch.err) > 1.35) return null;
    if (lMatch.err <= gMatch.err) {
      paritySeq += "L";
      leftDigits.push(lMatch.digit);
    } else {
      paritySeq += "G";
      leftDigits.push(gMatch.digit);
    }
  }
  const firstDigit = FIRST_DIGIT_PARITY.indexOf(paritySeq);
  if (firstDigit < 0) return null;

  const rightDigits: number[] = [];
  for (let i = 0; i < 6; i++) {
    const off = startIdx + 32 + i * 4;
    const rMatch = matchDigitPattern(runs, off, L_PATTERNS);
    if (rMatch.err > 1.35) return null;
    rightDigits.push(rMatch.digit);
  }
  const code = `${firstDigit}${leftDigits.join("")}${rightDigits.join("")}`;
  return isValidGtin(code) ? code : null;
}

function tryDecodeEan8Window(runs: number[], startIdx: number): string | null {
  if (startIdx + 43 > runs.length) return null;
  if (!isGuardTuple(runs.slice(startIdx, startIdx + 3), 3)) return null;
  if (!isGuardTuple(runs.slice(startIdx + 19, startIdx + 24), 5)) return null;
  if (!isGuardTuple(runs.slice(startIdx + 40, startIdx + 43), 3)) return null;

  const digits: number[] = [];
  for (let i = 0; i < 4; i++) {
    const m = matchDigitPattern(runs, startIdx + 3 + i * 4, L_PATTERNS);
    if (m.err > 1.35) return null;
    digits.push(m.digit);
  }
  for (let i = 0; i < 4; i++) {
    const m = matchDigitPattern(runs, startIdx + 24 + i * 4, L_PATTERNS);
    if (m.err > 1.35) return null;
    digits.push(m.digit);
  }
  const code = digits.join("");
  return isValidGtin(code) ? code : null;
}

function scanRowRuns(
  data: Uint8ClampedArray,
  width: number,
  row: number,
): number[] {
  const rowStart = row * width * 4;
  const lum = new Float32Array(width);
  let minL = 255;
  let maxL = 0;
  for (let x = 0; x < width; x++) {
    const idx = rowStart + x * 4;
    const y = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
    lum[x] = y;
    if (y < minL) minL = y;
    if (y > maxL) maxL = y;
  }
  if (maxL - minL < 28) return [];

  // Local sliding window threshold handles shadows and uneven lighting across packs
  const win = Math.max(16, Math.round(width / 12));
  const prefix = new Float64Array(width + 1);
  for (let x = 0; x < width; x++) prefix[x + 1] = prefix[x] + lum[x];

  const binary = new Uint8Array(width);
  for (let x = 0; x < width; x++) {
    const l = Math.max(0, x - win);
    const r = Math.min(width, x + win + 1);
    const localMean = (prefix[r] - prefix[l]) / (r - l);
    binary[x] = lum[x] < localMean - 6 ? 1 : 0;
  }

  // Build alternating bar/space run widths starting from the first black bar
  const runs: number[] = [];
  let i = 0;
  while (i < width && binary[i] === 0) i++;
  if (i >= width) return [];
  let cur = binary[i];
  let len = 0;
  for (; i < width; i++) {
    if (binary[i] === cur) {
      len++;
    } else {
      runs.push(len);
      cur = binary[i];
      len = 1;
    }
  }
  if (len > 0 && cur === 1) runs.push(len);
  return runs;
}

/**
 * Pure-TypeScript 1D EAN-13 / UPC-A / EAN-8 camera frame fallback decoder for
 * browsers without native `BarcodeDetector` (e.g. Safari, Firefox, desktop webcams).
 * Samples multiple horizontal scanlines and requires consensus between >= 2 rows.
 */
export function decode1DBarcodeFromImageData(imageData: {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}): string | null {
  const { data, width, height } = imageData;
  if (width < 120 || height < 40) return null;

  const counts = new Map<string, number>();
  const rows = [0.28, 0.34, 0.4, 0.46, 0.5, 0.54, 0.6, 0.66, 0.72];

  for (const frac of rows) {
    const y = Math.min(height - 1, Math.max(0, Math.floor(height * frac)));
    const forward = scanRowRuns(data, width, y);
    if (forward.length < 43) continue;

    for (const seq of [forward, [...forward].reverse()]) {
      // Bar runs always begin at even indices when starting on a dark bar
      for (let s = 0; s + 59 <= seq.length; s += 2) {
        const hit13 = tryDecodeEan13Window(seq, s);
        if (hit13) {
          counts.set(hit13, (counts.get(hit13) ?? 0) + 1);
          break;
        }
      }
      for (let s = 0; s + 43 <= seq.length; s += 2) {
        const hit8 = tryDecodeEan8Window(seq, s);
        if (hit8) {
          counts.set(hit8, (counts.get(hit8) ?? 0) + 1);
          break;
        }
      }
    }
  }

  let best: string | null = null;
  let bestCount = 0;
  for (const [code, c] of counts) {
    if (c > bestCount) {
      best = code;
      bestCount = c;
    }
  }
  return bestCount >= 2 ? best : null;
}
