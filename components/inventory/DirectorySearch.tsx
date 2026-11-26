"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  Globe,
  HeartPulse,
  Layers,
  LoaderCircle,
  MapPin,
  MessageCircleHeart,
  PackageSearch,
  Pill,
  ScanLine,
  Search,
  ShieldCheck,
  Store,
} from "lucide-react";
import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Choice";
import { Button, ButtonLink } from "@/components/ui/Button";
import {
  DirectoryMatches,
  RegulatoryChecks,
  WebSources,
} from "@/components/chat/ResultCards";
import { ImageGallery } from "@/components/chat/ImageGallery";
import {
  PRODUCT_CATEGORIES,
  type DirectoryMatch,
  type RegulatoryReport,
  type WebImage,
  type WebPlace,
} from "@/lib/inventory-types";
import { cn } from "@/lib/utils";
import {
  ScanToStockSheet,
  type PublicVerifyResult,
} from "./ScanToStockSheet";

const SUGGESTIONS = [
  { icon: Pill, text: "Paracetamol" },
  { icon: Pill, text: "Amoxicillin" },
  { icon: HeartPulse, text: "Blood pressure check" },
  { icon: ScanLine, text: "Ultrasound scan" },
];

export function DirectorySearch() {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("search") ?? "");
  const [city, setCity] = useState(params.get("city") ?? "ALL");
  const [category, setCategory] = useState("ALL");
  const [inStock, setInStock] = useState(true);
  const [matches, setMatches] = useState<DirectoryMatch[] | null>(null);
  const [cities, setCities] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [web, setWeb] = useState<{
    status: "idle" | "loading" | "done" | "error";
    places: WebPlace[];
    images?: WebImage[];
    report?: RegulatoryReport | null;
    error?: string;
  }>({ status: "idle", places: [], report: null });

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    setWeb({ status: "idle", places: [], report: null });
    const qs = new URLSearchParams({ q, inStock: inStock ? "1" : "0" });
    if (city !== "ALL") qs.set("city", city);
    if (category !== "ALL") qs.set("category", category);
    try {
      const res = await fetch(`/api/directory?${qs}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMatches(data.matches);
      setCities(data.cities);
    } catch (err) {
      setError((err as Error).message || "Search is unavailable right now.");
    } finally {
      setLoading(false);
    }
  }, [q, city, category, inStock]);

  // Re-run when filters change; typing waits for a short pause.
  useEffect(() => {
    const t = setTimeout(run, q ? 350 : 0);
    return () => clearTimeout(t);
  }, [run, q]);

  const verifyAndSearchWeb = async (refresh = false) => {
    const cleanQ = q.trim();
    if (cleanQ.length < 2) return;
    setWeb({ status: "loading", places: [], report: null });
    const qs = new URLSearchParams({ q: cleanQ });
    if (city !== "ALL") qs.set("city", city);
    if (category !== "ALL") qs.set("category", category);
    if (refresh) qs.set("refresh", "1");
    try {
      const res = await fetch(`/api/directory/verify?${qs}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setWeb({
        status: "done",
        places: data.places ?? [],
        images: data.images ?? [],
        report: data.report ?? null,
      });
    } catch (err) {
      setWeb({
        status: "error",
        places: [],
        report: null,
        error:
          (err as Error).message ||
          "Registry & web verification failed right now.",
      });
    }
  };

  const handleVerifiedFromScanner = (res: PublicVerifyResult) => {
    if (res.extractedQuery) setQ(res.extractedQuery);
    if (res.matches?.length) setMatches(res.matches);
    setWeb({
      status: "done",
      places: res.places ?? [],
      images: res.images ?? [],
      report: res.report,
    });
  };

  const searching = q.trim().length > 0;
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pb-12 sm:px-6">
      <div className={cn("", searching ? "pt-2" : "pt-6 sm:pt-14")}>
        <h1
          className={cn(
            "title text-center font-display font-semibold text-ink",
            searching ? "text-2xl" : "text-3xl sm:text-4xl",
          )}
        >
          {searching ? "Find & verify health products" : "What do you need today?"}
        </h1>
        {!searching && (
          <p className="mx-auto mt-3 max-w-xl text-center text-muted">
            Search live pharmacy stock, scan a barcode or carton photo, and check
            NAFDAC, US FDA & global public safety registries.
          </p>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            router.replace(
              q ? `/inventory?search=${encodeURIComponent(q)}` : "/inventory",
            );
            void run();
          }}
          className="mt-6 flex items-center gap-1.5 rounded-3xl border border-line bg-surface p-2 shadow-[0_8px_30px_-18px_rgba(13,59,53,0.35)] transition-shadow focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20"
        >
          <Search className="ml-2.5 h-5 w-5 shrink-0 text-muted" aria-hidden />
          <input
            aria-label="Search for a medicine, NAFDAC number, barcode or service"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Name, NAFDAC no., barcode, or scan"
            className="h-11 min-w-0 flex-1 bg-transparent text-[15px] text-ink placeholder:text-muted focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setScanOpen(true)}
            className="press flex h-10 shrink-0 items-center gap-1.5 rounded-2xl border border-line bg-mist/70 px-3 text-xs font-semibold text-ink hover:border-brand/50"
            aria-label="Scan barcode or snap pack to verify"
          >
            <ScanLine className="h-4 w-4 text-brand" aria-hidden />
            <span className="hidden sm:inline">Scan pack</span>
          </button>
          <Button type="submit" className="shrink-0 rounded-2xl">
            Search
          </Button>
        </form>

        {!searching && (
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {SUGGESTIONS.map(({ icon: Icon, text }) => (
              <button
                key={text}
                type="button"
                onClick={() => setQ(text)}
                className="press press-soft inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-2 text-sm text-ink transition-colors hover:border-brand/50"
              >
                <Icon className="h-4 w-4 text-brand" aria-hidden />
                {text}
              </button>
            ))}
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 items-center gap-2 sm:flex sm:flex-wrap sm:justify-center">
          <Select
            label="City"
            hideLabel
            size="sm"
            icon={MapPin}
            className="min-w-0 sm:w-44"
            value={city}
            onChange={setCity}
            options={[
              { value: "ALL", label: "All cities" },
              ...cities.map((c) => ({ value: c, label: c })),
            ]}
          />
          <Select
            label="Category"
            hideLabel
            size="sm"
            icon={Layers}
            className="min-w-0 sm:w-60"
            value={category}
            onChange={setCategory}
            options={[
              { value: "ALL", label: "All categories" },
              ...PRODUCT_CATEGORIES.map((c) => ({ value: c, label: c })),
            ]}
          />
          <Switch
            checked={inStock}
            onChange={setInStock}
            label="In stock only"
            className="col-span-2 justify-start gap-3 sm:ml-1"
          />
        </div>
      </div>

      <div className="mt-8" aria-live="polite">
        {searching && q.trim().length >= 2 && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">
                Live authenticity & wider web search
              </p>
              <p className="text-xs text-muted">
                Cross-check &ldquo;{q.trim()}&rdquo; across NAFDAC, FDA Orange
                Book, Health Canada & the wider web.
              </p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              loading={web.status === "loading"}
              onClick={() => verifyAndSearchWeb(false)}
            >
              <ShieldCheck className="h-4 w-4 text-brand" aria-hidden />
              Verify & search web
            </Button>
          </div>
        )}

        {web.status === "error" && (
          <p
            role="alert"
            className="mb-5 flex items-center gap-2 rounded-xl border border-alert/25 bg-alert-soft p-3 text-sm text-alert"
          >
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
            {web.error}
          </p>
        )}

        {web.status === "done" && web.report && (
          <div className="mb-6">
            <RegulatoryChecks reports={[web.report]} />
          </div>
        )}

        {error ? (
          <p
            role="alert"
            className="flex items-center gap-2 rounded-xl border border-alert/25 bg-alert-soft p-4 text-sm text-alert"
          >
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
            {error}
          </p>
        ) : matches === null || (loading && !matches.length) ? (
          <p className="flex items-center gap-2 text-sm text-muted">
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
            Searching listings
          </p>
        ) : matches.length ? (
          <>
            <p className="text-sm text-muted">
              {matches.length} result{matches.length === 1 ? "" : "s"} listed on
              Zelthia
            </p>
            <DirectoryMatches matches={matches} />
            {web.status === "done" &&
              (web.places.length > 0 || (web.images?.length ?? 0) > 0) && (
                <div className="mt-6">
                  <ImageGallery images={web.images ?? []} />
                  <WebSources places={web.places} />
                </div>
              )}
          </>
        ) : (
          <div className="rounded-3xl border border-dashed border-line p-6 sm:p-8">
            <PackageSearch className="h-8 w-8 text-muted" aria-hidden />
            <h2 className="mt-3 font-display text-xl font-semibold text-ink">
              {q
                ? `No facility on Zelthia lists "${q}" yet`
                : "No facility has listed stock on Zelthia yet"}
            </h2>
            <p className="mt-1 max-w-xl text-sm text-muted">
              Zelthia only shows what facilities have listed themselves, so
              nothing here is guessed.
              {q &&
                " Run a live registry & web check, scan the pack, or ask the health chat."}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {q && (
                <Button
                  onClick={() => verifyAndSearchWeb(false)}
                  loading={web.status === "loading"}
                >
                  <Globe className="h-4 w-4" aria-hidden />
                  Verify & search web{city !== "ALL" ? ` near ${city}` : ""}
                </Button>
              )}
              {q && (
                <ButtonLink
                  href={`/chat?q=${encodeURIComponent(`Where can I get ${q}${city !== "ALL" ? ` in ${city}` : ""}?`)}`}
                  variant="secondary"
                >
                  <MessageCircleHeart className="h-4 w-4" aria-hidden />
                  Ask the health chat
                </ButtonLink>
              )}
              <ButtonLink href="/provider" variant="ghost">
                <Store className="h-4 w-4" aria-hidden />
                Own a pharmacy? List your stock
              </ButtonLink>
            </div>
            {web.status === "done" &&
              (web.places.length || web.images?.length ? (
                <>
                  <ImageGallery images={web.images ?? []} />
                  <WebSources places={web.places} />
                </>
              ) : (
                <p className="mt-4 text-sm text-muted">
                  The web search didn&apos;t find extra pages either. Consult a
                  licensed pharmacy, clinic, or hospital nearby.
                </p>
              ))}
          </div>
        )}
      </div>

      <p className="mt-10 text-center text-sm text-muted">
        Run a pharmacy, clinic or scan centre?{" "}
        <Link
          href="/provider"
          className="font-semibold text-brand underline-offset-4 hover:underline"
        >
          List your stock and services
        </Link>
      </p>

      <ScanToStockSheet
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        mode="verify"
        city={city === "ALL" ? null : city}
        onVerified={handleVerifiedFromScanner}
      />
    </div>
  );
}
