import "server-only";
import fs from "node:fs";
import path from "node:path";

export interface OrangeBookEntry {
  ingredient: string;
  dosageFormRoute: string;
  tradeName: string;
  applicant: string;
  strength: string;
  applType: string;
  applNo: string;
  productNo: string;
  teCode: string;
  approvalDate: string;
  rld: string;
  marketingType: "RX" | "OTC" | "DISCN" | string;
  applicantFullName: string;
  patentCount: number;
  exclusivityDate: string | null;
}

interface OrangeBookIndex {
  entries: OrangeBookEntry[];
  byTradePrefix: Map<string, OrangeBookEntry[]>;
  byApplNo: Map<string, OrangeBookEntry[]>;
}

declare global {
  var __zelthiaOrangeBook: OrangeBookIndex | null | undefined;
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

function loadIndex(): OrangeBookIndex | null {
  if (globalThis.__zelthiaOrangeBook !== undefined) {
    return globalThis.__zelthiaOrangeBook;
  }

  const dir = path.join(process.cwd(), "data/EOBZIP_2026_10");
  const productsPath = path.join(dir, "products.txt");
  if (!fs.existsSync(productsPath)) {
    globalThis.__zelthiaOrangeBook = null;
    return null;
  }

  const patentCounts = new Map<string, number>();
  const patentPath = path.join(dir, "patent.txt");
  if (fs.existsSync(patentPath)) {
    const rawPat = fs.readFileSync(patentPath, "utf8");
    const lines = rawPat.split(/\r?\n/);
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      const cols = line.split("~");
      if (cols.length < 3) continue;
      const key = `${cols[0]}~${cols[1]}~${cols[2]}`;
      patentCounts.set(key, (patentCounts.get(key) ?? 0) + 1);
    }
  }

  const exclDates = new Map<string, string>();
  const exclPath = path.join(dir, "exclusivity.txt");
  if (fs.existsSync(exclPath)) {
    const rawExcl = fs.readFileSync(exclPath, "utf8");
    const lines = rawExcl.split(/\r?\n/);
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      const cols = line.split("~");
      if (cols.length < 5) continue;
      const key = `${cols[0]}~${cols[1]}~${cols[2]}`;
      exclDates.set(key, cols[4]?.trim() || "");
    }
  }

  const raw = fs.readFileSync(productsPath, "utf8");
  const lines = raw.split(/\r?\n/);
  const entries: OrangeBookEntry[] = [];
  const byTradePrefix = new Map<string, OrangeBookEntry[]>();
  const byApplNo = new Map<string, OrangeBookEntry[]>();

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const c = line.split("~");
    if (c.length < 14) continue;
    const key = `${c[5]}~${c[6]}~${c[7]}`;
    const entry: OrangeBookEntry = {
      ingredient: c[0].trim(),
      dosageFormRoute: c[1].trim(),
      tradeName: c[2].trim(),
      applicant: c[3].trim(),
      strength: c[4].trim(),
      applType: c[5].trim(),
      applNo: c[6].trim(),
      productNo: c[7].trim(),
      teCode: c[8].trim(),
      approvalDate: c[9].trim(),
      rld: c[10].trim(),
      marketingType: c[12].trim(),
      applicantFullName: c[13].trim(),
      patentCount: patentCounts.get(key) ?? 0,
      exclusivityDate: exclDates.get(key) || null,
    };
    entries.push(entry);

    const bucket = norm(entry.tradeName).slice(0, 3);
    if (bucket.length >= 2) {
      const arr = byTradePrefix.get(bucket);
      if (arr) arr.push(entry);
      else byTradePrefix.set(bucket, [entry]);
    }
    const appArr = byApplNo.get(entry.applNo);
    if (appArr) appArr.push(entry);
    else byApplNo.set(entry.applNo, [entry]);
  }

  const idx: OrangeBookIndex = { entries, byTradePrefix, byApplNo };
  globalThis.__zelthiaOrangeBook = idx;
  return idx;
}

export interface OrangeBookSearchResult {
  available: boolean;
  entries: OrangeBookEntry[];
  allDiscontinued: boolean;
  activeCount: number;
  discontinuedCount: number;
}

/**
 * Searches the indexed US FDA Orange Book dataset (products, patents, exclusivity).
 * Gracefully reports `available: false` in deployments where `data/` is omitted,
 * allowing live openFDA APIs to answer seamlessly.
 */
export function searchOrangeBook(opts: {
  query?: string;
  ingredient?: string;
  applNo?: string;
  limit?: number;
}): OrangeBookSearchResult {
  const idx = loadIndex();
  if (!idx) {
    return {
      available: false,
      entries: [],
      allDiscontinued: false,
      activeCount: 0,
      discontinuedCount: 0,
    };
  }

  const limit = Math.min(20, Math.max(1, opts.limit ?? 8));
  const cleanAppl = (opts.applNo ?? "").replace(/\D/g, "");
  if (cleanAppl.length >= 5) {
    const exact = idx.byApplNo.get(cleanAppl.padStart(6, "0")) ?? [];
    const active = exact.filter((e) => e.marketingType !== "DISCN").length;
    const disc = exact.filter((e) => e.marketingType === "DISCN").length;
    return {
      available: true,
      entries: exact.slice(0, limit),
      allDiscontinued: exact.length > 0 && active === 0,
      activeCount: active,
      discontinuedCount: disc,
    };
  }

  const qNorm = norm(opts.query ?? "");
  const ingNorm = norm(opts.ingredient ?? "");
  const qTokens = qNorm.split(" ").filter((t) => t.length >= 3);
  const ingTokens = ingNorm.split(" ").filter((t) => t.length >= 3);
  if (!qTokens.length && !ingTokens.length) {
    return {
      available: true,
      entries: [],
      allDiscontinued: false,
      activeCount: 0,
      discontinuedCount: 0,
    };
  }

  // Narrow candidate pool first when a trade-name prefix exists
  const scored: Array<{ entry: OrangeBookEntry; score: number }> = [];
  const primaryWord = qTokens[0] ?? "";
  const prefixBucket =
    primaryWord.length >= 3
      ? idx.byTradePrefix.get(primaryWord.slice(0, 3))
      : undefined;
  const pool =
    prefixBucket && prefixBucket.length > 0 && !ingTokens.length
      ? prefixBucket
      : idx.entries;

  for (const e of pool) {
    const tn = norm(e.tradeName);
    const ing = norm(e.ingredient);
    let score = 0;

    if (qNorm && tn === qNorm) score += 12;
    else if (qTokens.length && qTokens.every((t) => tn.includes(t))) score += 7;
    else if (primaryWord.length >= 4 && tn.includes(primaryWord)) score += 4;

    if (ingNorm && ing === ingNorm) score += 8;
    else if (ingTokens.length && ingTokens.every((t) => ing.includes(t)))
      score += 5;
    else if (qTokens.length && qTokens.every((t) => ing.includes(t)))
      score += 4;

    if (score >= 4) {
      if (e.marketingType !== "DISCN") score += 1;
      scored.push({ entry: e, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  const matched = scored.map((s) => s.entry);
  const activeCount = matched.filter((e) => e.marketingType !== "DISCN").length;
  const discontinuedCount = matched.filter(
    (e) => e.marketingType === "DISCN",
  ).length;

  return {
    available: true,
    entries: matched.slice(0, limit),
    allDiscontinued: matched.length > 0 && activeCount === 0,
    activeCount,
    discontinuedCount,
  };
}
