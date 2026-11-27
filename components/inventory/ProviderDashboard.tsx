"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  Boxes,
  CircleCheck,
  Building2,
  CalendarClock,
  Minus,
  PackageOpen,
  PackagePlus,
  Pencil,
  Plus,
  ScanLine,
  Search,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  Trash2,
  TriangleAlert,
  ExternalLink,
  QrCode,
} from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ChoiceGroup } from "@/components/ui/Choice";
import { Dialog } from "@/components/ui/Dialog";
import { Select } from "@/components/ui/Select";
import { TagInput } from "@/components/ui/Field";
import {
  FACILITY_KIND_LABEL,
  PRODUCT_CATEGORIES,
  formatMoney,
  stockStatus,
  type Facility,
  type Product,
} from "@/lib/inventory-types";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/store/session";
import { FacilityForm, type FacilityDraft } from "./FacilityForm";
import { FacilityWizard } from "./FacilityWizard";
import { useLastDefined } from "@/lib/motion";
import { ProductDialog, type ProductDraft } from "./ProductDialog";
import { ScanToStockSheet } from "./ScanToStockSheet";
import { VerificationBadge, verificationMessage } from "./VerificationBadge";

type Tab = "stock" | "services" | "details";

async function api<T>(
  url: string,
  init?: RequestInit,
): Promise<
  { ok: true; data: T } | { ok: false; error: string; field?: string }
> {
  try {
    const res = await fetch(url, {
      ...init,
      headers: init?.body ? { "Content-Type": "application/json" } : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok)
      return {
        ok: false,
        error: data.error ?? `Request failed (${res.status})`,
        field: data.field,
      };
    return { ok: true, data };
  } catch {
    return {
      ok: false,
      error: "You appear to be offline. Check your connection and try again.",
    };
  }
}

const daysUntil = (iso: string) =>
  Math.ceil((Date.parse(iso) - Date.now()) / 864e5);

export function ProviderDashboard() {
  const user = useSession((s) => s.user);
  const sessionStatus = useSession((s) => s.status);
  if (sessionStatus === "ready" && user && user.role !== "provider")
    return <PatientGate />;
  return <FacilityDashboard />;
}

function PatientGate() {
  return (
    <Shell>
      <div className="mx-auto max-w-xl pt-8 text-center sm:pt-16">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand-strong">
          <Building2 className="h-7 w-7" aria-hidden />
        </span>
        <h1 className="mt-5 title font-display text-3xl font-semibold text-ink">
          Stock tools are for facility accounts
        </h1>
        <p className="mt-3 text-muted">
          You are signed in with a personal account, which is for the health
          chat and finding medicine. To list a pharmacy, clinic or hospital,
          create a facility account.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/signup?role=provider&switch=1" size="lg">
            <Building2 className="h-5 w-5" aria-hidden />
            Create a facility account
          </ButtonLink>
          <ButtonLink href="/chat" size="lg" variant="secondary">
            Back to health chat
          </ButtonLink>
        </div>
      </div>
    </Shell>
  );
}

function FacilityDashboard() {
  const router = useRouter();
  const params = useSearchParams();
  const [facilities, setFacilities] = useState<Facility[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const selectedId = params.get("facility") ?? facilities?.[0]?.id ?? null;
  const facility =
    facilities?.find((f) => f.id === selectedId) ?? facilities?.[0] ?? null;
  const tabParam = params.get("tab");
  const tab: Tab =
    tabParam === "services" || tabParam === "details" ? tabParam : "stock";
  const setTab = (next: Tab) => {
    const p = new URLSearchParams(params.toString());
    if (next === "stock") p.delete("tab");
    else p.set("tab", next);
    const qs = p.toString();
    router.replace(qs ? `/provider?${qs}` : "/provider", { scroll: false });
  };
  const [notice, setNotice] = useState<string | null>(null);
  const [seenCreated, setSeenCreated] = useState(false);
  if (!seenCreated && facility && params.get("created") === "1") {
    setSeenCreated(true);
    setNotice(verificationMessage(facility.verification));
  }

  useEffect(() => {
    let live = true;
    void api<{ facilities: Facility[] }>("/api/facilities").then((res) => {
      if (!live) return;
      if (res.ok) setFacilities(res.data.facilities);
      else setLoadError(res.error);
    });
    return () => {
      live = false;
    };
  }, []);

  if (loadError) {
    return (
      <Shell>
        <p
          role="alert"
          className="flex items-center gap-2 rounded-xl border border-alert/25 bg-alert-soft p-4 text-sm text-alert"
        >
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
          {loadError}
        </p>
      </Shell>
    );
  }

  if (!facilities) {
    return (
      <Shell>
        <div className="space-y-3" aria-label="Loading your facilities">
          {[40, 70, 55].map((w) => (
            <div
              key={w}
              className="h-5 animate-pulse rounded bg-mist"
              style={{ width: `${w}%` }}
            />
          ))}
        </div>
      </Shell>
    );
  }

  if (!facilities.length || !facility) return <NoFacility />;

  return (
    <Shell>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand-strong">
            <Building2 className="h-7 w-7" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-2 text-sm text-muted">
              {FACILITY_KIND_LABEL[facility.kind]}, {facility.city}
              <VerificationBadge v={facility.verification} />
            </p>
            <h1 className="truncate title font-display text-2xl font-semibold text-ink sm:text-3xl">
              {facility.name}
            </h1>
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          {facilities.length > 1 && (
            <Select
              label="Facility"
              hideLabel
              icon={Building2}
              className="w-64"
              value={facility.id}
              onChange={(id) => {
                const p = new URLSearchParams(params.toString());
                p.set("facility", id);
                router.replace(`/provider?${p.toString()}`);
              }}
              options={facilities.map((f) => ({
                value: f.id,
                label: f.name,
                description: `${FACILITY_KIND_LABEL[f.kind]}, ${f.city}`,
              }))}
            />
          )}
          <ButtonLink
            href={`/facility/${facility.id}`}
            variant="secondary"
            target="_blank"
          >
            <ExternalLink className="h-4 w-4" aria-hidden />
            Public page
          </ButtonLink>
          <ButtonLink
            href={`/sticker/${facility.id}`}
            variant="secondary"
            target="_blank"
          >
            <QrCode className="h-4 w-4" aria-hidden />
            QR sticker
          </ButtonLink>
          <ButtonLink href="/provider/new" variant="secondary">
            <Plus className="h-4 w-4" aria-hidden />
            Add facility
          </ButtonLink>
        </div>
      </div>

      {notice ? (
        <div
          role="status"
          className="animate-rise mt-5 flex items-start gap-3 rounded-2xl border border-line bg-surface p-4"
        >
          <VerificationBadge v={facility.verification} className="shrink-0" />
          <p className="flex-1 text-sm text-ink">{notice}</p>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="text-sm font-medium text-muted hover:text-ink"
          >
            Dismiss
          </button>
        </div>
      ) : facility.verification.status === "rejected" ? (
        <div
          role="status"
          className="animate-rise mt-5 flex items-start gap-3 rounded-2xl border border-alert/25 bg-alert-soft p-4"
        >
          <VerificationBadge v={facility.verification} className="shrink-0" />
          <p className="flex-1 text-sm text-ink">
            {facility.verification.note ||
              verificationMessage(facility.verification)}
          </p>
        </div>
      ) : null}

      <ChoiceGroup<Tab>
        label="Section"
        hideLabel
        variant="pills"
        value={tab}
        onChange={setTab}
        className="mt-6"
        options={[
          { value: "stock", label: "Stock", icon: Boxes },
          { value: "services", label: "Services", icon: Stethoscope },
          { value: "details", label: "Details", icon: Building2 },
        ]}
      />

      <div className="mt-6">
        {tab === "stock" && <StockTab key={facility.id} facility={facility} />}
        {tab === "services" && (
          <ServicesTab
            key={facility.id}
            facility={facility}
            onSaved={(f) =>
              setFacilities((fs) => fs!.map((x) => (x.id === f.id ? f : x)))
            }
          />
        )}
        {tab === "details" && (
          <DetailsTab
            key={facility.id}
            facility={facility}
            onSaved={(f) => {
              setFacilities((fs) => fs!.map((x) => (x.id === f.id ? f : x)));
              if (
                f.licenseNumber !== facility.licenseNumber ||
                f.verification.status !== facility.verification.status
              ) {
                setNotice(verificationMessage(f.verification));
              }
            }}
            onDeleted={(id) => {
              setFacilities((fs) => fs!.filter((x) => x.id !== id));
              setTab("stock");
              router.replace("/provider");
            }}
          />
        )}
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 pb-12 pt-2 sm:px-6">
      {children}
    </div>
  );
}

function NoFacility() {
  const steps = [
    {
      icon: Building2,
      title: "Register your facility",
      body: "Name, address, phone and landmark directions.",
    },
    {
      icon: PackagePlus,
      title: "Add what you stock",
      body: "Medicines, skin care, muscle rubs, devices, test kits.",
    },
    {
      icon: Stethoscope,
      title: "List services",
      body: "Scans and tests like X-ray, ultrasound or 2D echo.",
    },
  ];
  return (
    <Shell>
      <div className="max-w-2xl">
        <PackageOpen className="h-9 w-9 text-brand" aria-hidden />
        <h1 className="mt-4 title font-display text-3xl font-semibold text-ink sm:text-4xl">
          You haven&apos;t listed a facility yet
        </h1>
        <p className="mt-3 text-lg text-muted">
          Register your pharmacy, clinic, hospital, scan centre or health store.
          People searching on Zelthia, including the health chat, will see your
          real stock and services.
        </p>
        <ol className="mt-8 space-y-4">
          {steps.map(({ icon: Icon, title, body }, i) => (
            <li key={title} className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span>
                <span className="block font-semibold text-ink">
                  {i + 1}. {title}
                </span>
                <span className="block text-sm text-muted">{body}</span>
              </span>
            </li>
          ))}
        </ol>
        <ButtonLink href="/provider/new" size="lg" className="mt-8">
          <Plus className="h-5 w-5" aria-hidden />
          Register your facility
        </ButtonLink>
      </div>
    </Shell>
  );
}

function StockTab({ facility }: { facility: Facility }) {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("ALL");
  const [filter, setFilter] = useState<
    "all" | "low" | "out" | "expiring" | "flagged"
  >("all");
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [scanOpen, setScanOpen] = useState(false);
  const [confirm, setConfirm] = useState<Product | null>(null);
  const shownConfirm = useLastDefined(confirm);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    void api<{ products: Product[] }>(
      `/api/facilities/${facility.id}/products`,
    ).then((res) =>
      res.ok ? setProducts(res.data.products) : setError(res.error),
    );
  }, [facility.id]);

  const stats = useMemo(() => {
    const list = products ?? [];
    return {
      total: list.length,
      low: list.filter((p) => stockStatus(p) === "low").length,
      out: list.filter((p) => stockStatus(p) === "out").length,
      expiring: list.filter((p) => p.expiresOn && daysUntil(p.expiresOn) <= 90)
        .length,
      flagged: list.filter(
        (p) =>
          p.regulatoryStatus === "danger" || p.regulatoryStatus === "caution",
      ).length,
    };
  }, [products]);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (products ?? []).filter((p) => {
      if (category !== "ALL" && p.category !== category) return false;
      if (filter === "low" && stockStatus(p) !== "low") return false;
      if (filter === "out" && stockStatus(p) !== "out") return false;
      if (
        filter === "expiring" &&
        !(p.expiresOn && daysUntil(p.expiresOn) <= 90)
      )
        return false;
      if (
        filter === "flagged" &&
        p.regulatoryStatus !== "danger" &&
        p.regulatoryStatus !== "caution"
      )
        return false;
      return (
        !needle ||
        [
          p.name,
          p.genericName,
          p.batch,
          p.category,
          p.nafdacNumber,
          p.barcode,
          p.manufacturer,
        ].some((s) => s.toLowerCase().includes(needle))
      );
    });
  }, [products, q, category, filter]);

  const upsert = (p: Product) =>
    setProducts((ps) => {
      const list = ps ?? [];
      return list.some((x) => x.id === p.id)
        ? list.map((x) => (x.id === p.id ? p : x))
        : [...list, p].sort((a, b) => a.name.localeCompare(b.name));
    });

  const save = async (draft: ProductDraft) => {
    const isNew = editing === "new";
    const res = await api<{ product: Product }>(
      isNew
        ? `/api/facilities/${facility.id}/products`
        : `/api/products/${(editing as Product).id}`,
      { method: isNew ? "POST" : "PUT", body: JSON.stringify(draft) },
    );
    if (!res.ok) return res;
    upsert(res.data.product);
    setEditing(null);
    return { ok: true };
  };

  const adjust = async (p: Product, delta: number) => {
    setBusy(p.id);
    const res = await api<{ product: Product }>(`/api/products/${p.id}`, {
      method: "PATCH",
      body: JSON.stringify({ delta }),
    });
    setBusy(null);
    if (res.ok) upsert(res.data.product);
    else setError(res.error);
  };

  if (error && !products) {
    return (
      <p
        role="alert"
        className="rounded-xl border border-alert/25 bg-alert-soft p-4 text-sm text-alert"
      >
        {error}
      </p>
    );
  }
  if (!products)
    return (
      <div
        className="h-40 animate-pulse rounded-2xl bg-mist"
        aria-label="Loading stock"
      />
    );

  const STAT = [
    {
      key: "all",
      label: "Products",
      value: stats.total,
      icon: Boxes,
      tone: "text-ink",
    },
    {
      key: "low",
      label: "Low stock",
      value: stats.low,
      icon: TriangleAlert,
      tone: "text-caution",
    },
    {
      key: "out",
      label: "Out of stock",
      value: stats.out,
      icon: PackageOpen,
      tone: "text-alert",
    },
    {
      key: "expiring",
      label: "Expiring in 90 days",
      value: stats.expiring,
      icon: CalendarClock,
      tone: "text-sky",
    },
    ...(stats.flagged > 0
      ? ([
          {
            key: "flagged",
            label: "Safety alerts",
            value: stats.flagged,
            icon: ShieldAlert,
            tone: "text-alert",
          },
        ] as const)
      : []),
  ] as const;

  return (
    <>
      <div
        className={cn(
          "grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line",
          STAT.length > 4 ? "lg:grid-cols-5" : "lg:grid-cols-4",
        )}
      >
        {STAT.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setFilter(s.key)}
            aria-pressed={filter === s.key}
            className={cn(
              "bg-surface p-4 text-left transition-colors hover:bg-mist",
              filter === s.key && "bg-mist",
            )}
          >
            <s.icon className={cn("h-5 w-5", s.tone)} aria-hidden />
            <p className="mt-3 font-display text-2xl font-semibold tabular-nums text-ink">
              {s.value}
            </p>
            <p className="text-sm text-muted">{s.label}</p>
          </button>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-dashed border-line p-8 text-center">
          <ScanLine className="mx-auto h-9 w-9 text-brand" aria-hidden />
          <h2 className="mt-3 font-display text-xl font-semibold text-ink">
            Stock & verify supplier cartons in seconds
          </h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted">
            Scan a barcode or snap a pack photo to check NAFDAC, FDA & recalls
            live before shelving—or add an item manually.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2.5">
            <Button onClick={() => setScanOpen(true)}>
              <ScanLine className="h-4 w-4" aria-hidden />
              Scan to stock
            </Button>
            <Button variant="secondary" onClick={() => setEditing("new")}>
              <Plus className="h-4 w-4" aria-hidden />
              Add manually
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-6 flex flex-col gap-2 lg:flex-row lg:items-end">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                aria-hidden
              />
              <input
                aria-label="Search your stock"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name, NAFDAC no., barcode, or batch"
                className="h-11 w-full rounded-xl border border-line bg-surface pl-10 pr-3 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select
                label="Category"
                hideLabel
                className="min-w-44 flex-1 sm:w-56 sm:flex-none"
                value={category}
                onChange={setCategory}
                options={[
                  { value: "ALL", label: "All categories" },
                  ...PRODUCT_CATEGORIES.map((c) => ({ value: c, label: c })),
                ]}
                align="right"
              />
              <Button onClick={() => setScanOpen(true)}>
                <ScanLine className="h-4 w-4" aria-hidden />
                Scan to stock
              </Button>
              <Button variant="secondary" onClick={() => setEditing("new")}>
                <Plus className="h-4 w-4" aria-hidden />
                Add manually
              </Button>
            </div>
          </div>

          {error && (
            <p role="alert" className="mt-3 text-sm text-alert">
              {error}
            </p>
          )}

          {shown.length === 0 ? (
            <p className="mt-6 rounded-2xl bg-mist p-6 text-center text-sm text-muted">
              Nothing matches these filters.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
              {shown.map((p) => {
                const status = stockStatus(p);
                const days = p.expiresOn ? daysUntil(p.expiresOn) : null;
                return (
                  <li
                    key={p.id}
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-ink">
                        {p.name}
                        {p.strength && (
                          <span className="font-normal text-muted">
                            {" "}
                            {p.strength}
                          </span>
                        )}
                      </p>
                      <p className="truncate text-sm text-muted">
                        {[
                          p.category,
                          p.form,
                          p.packSize,
                          formatMoney(p.priceNgn, facility.currency),
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5 text-xs font-medium">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5",
                            status === "out"
                              ? "bg-alert-soft text-alert"
                              : status === "low"
                                ? "bg-caution-soft text-caution"
                                : "bg-brand-soft text-brand-strong",
                          )}
                        >
                          {status === "out"
                            ? "Out of stock"
                            : status === "low"
                              ? "Low stock"
                              : "In stock"}
                        </span>
                        {days !== null && (
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5",
                              days < 0
                                ? "bg-alert-soft text-alert"
                                : days <= 90
                                  ? "bg-sky-soft text-sky"
                                  : "bg-mist text-muted",
                            )}
                          >
                            {days < 0
                              ? "Expired"
                              : `Expires ${new Date(p.expiresOn!).toLocaleDateString("en-NG", { month: "short", year: "numeric" })}`}
                          </span>
                        )}
                        {p.prescriptionOnly && (
                          <span className="rounded-full bg-mist px-2 py-0.5 text-muted">
                            Prescription
                          </span>
                        )}
                        {p.nafdacNumber && (
                          <span className="rounded-full bg-mist px-2 py-0.5 text-ink">
                            NAFDAC {p.nafdacNumber}
                          </span>
                        )}
                        {p.regulatoryStatus === "verified" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-brand-strong">
                            <ShieldCheck className="h-3 w-3" aria-hidden />
                            Registry verified
                          </span>
                        )}
                        {p.regulatoryStatus === "caution" && (
                          <span className="rounded-full bg-caution-soft px-2 py-0.5 text-caution">
                            Registry caution
                          </span>
                        )}
                        {p.regulatoryStatus === "danger" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-alert-soft px-2 py-0.5 text-alert">
                            <ShieldAlert className="h-3 w-3" aria-hidden />
                            Red flag
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 items-stretch overflow-hidden rounded-xl border border-line">
                        <button
                          type="button"
                          disabled={busy === p.id || p.quantity === 0}
                          onClick={() => adjust(p, -1)}
                          className="flex w-10 items-center justify-center text-muted hover:bg-mist hover:text-ink disabled:opacity-40"
                          aria-label={`Remove one ${p.name}`}
                        >
                          <Minus className="h-4 w-4" aria-hidden />
                        </button>
                        <span
                          className="flex min-w-14 items-center justify-center border-x border-line px-2 font-display text-base font-semibold tabular-nums text-ink"
                          aria-label={`${p.quantity} in stock`}
                        >
                          {p.quantity}
                        </span>
                        <button
                          type="button"
                          disabled={busy === p.id}
                          onClick={() => adjust(p, 1)}
                          className="flex w-10 items-center justify-center text-muted hover:bg-mist hover:text-ink disabled:opacity-40"
                          aria-label={`Add one ${p.name}`}
                        >
                          <Plus className="h-4 w-4" aria-hidden />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditing(p)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-muted hover:bg-mist hover:text-ink"
                        aria-label={`Edit ${p.name}`}
                      >
                        <Pencil className="h-4 w-4" aria-hidden />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirm(p)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-muted hover:bg-alert-soft hover:text-alert"
                        aria-label={`Delete ${p.name}`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}

      <ProductDialog
        open={editing !== null}
        initial={editing && editing !== "new" ? editing : null}
        onClose={() => setEditing(null)}
        onSave={save}
        onOpenScanner={() => setScanOpen(true)}
        currency={facility.currency}
        country={facility.country}
      />
      <ScanToStockSheet
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        facilityId={facility.id}
        currency={facility.currency}
        country={facility.country}
        onStocked={upsert}
      />
      <Dialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        title={`Delete ${shownConfirm?.name ?? "product"}?`}
        description="It will stop appearing in searches. This can't be undone."
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirm(null)}>
              Keep it
            </Button>
            <Button
              variant="danger"
              onClick={async () => {
                if (!confirm) return;
                const res = await api(`/api/products/${confirm.id}`, {
                  method: "DELETE",
                });
                if (res.ok)
                  setProducts((ps) => ps!.filter((x) => x.id !== confirm.id));
                else setError(res.error);
                setConfirm(null);
              }}
            >
              <Trash2 className="h-4 w-4" aria-hidden />
              Delete product
            </Button>
          </>
        }
      />
    </>
  );
}

function toDraft(f: Facility): FacilityDraft {
  const {
    id: _id,
    createdAt: _c,
    verification: _v,
    currency: _cur,
    ...rest
  } = f;
  void _id;
  void _c;
  void _v;
  void _cur;
  return rest;
}

function ServicesTab({
  facility,
  onSaved,
}: {
  facility: Facility;
  onSaved: (f: Facility) => void;
}) {
  const [services, setServices] = useState(facility.services);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  return (
    <div className="max-w-2xl">
      <p className="mb-4 text-muted">
        Tests, scans and procedures you offer. People who search for them,
        including from the health chat, will find you.
      </p>
      <TagInput
        label="Services"
        values={services}
        onChange={setServices}
        tone="sky"
        icon={Stethoscope}
        placeholder="e.g. Ultrasound scan"
        suggestions={[
          "2D echocardiogram",
          "ECG",
          "X-ray",
          "Ultrasound scan",
          "MRI scan",
          "CT scan",
          "Laboratory tests",
          "Malaria test",
          "Vaccination",
          "Physiotherapy",
        ]}
      />
      <div className="mt-5 flex items-center gap-3">
        <Button
          loading={saving}
          onClick={async () => {
            setSaving(true);
            const res = await api<{ facility: Facility }>(
              `/api/facilities/${facility.id}`,
              {
                method: "PUT",
                body: JSON.stringify({ ...toDraft(facility), services }),
              },
            );
            setSaving(false);
            if (res.ok) {
              onSaved(res.data.facility);
              setMsg({ ok: true, text: "Services saved" });
            } else setMsg({ ok: false, text: res.error });
          }}
        >
          Save services
        </Button>
        {msg && (
          <p
            role="status"
            className={cn("text-sm", msg.ok ? "text-brand" : "text-alert")}
          >
            {msg.text}
          </p>
        )}
      </div>
    </div>
  );
}

function DetailsTab({
  facility,
  onSaved,
  onDeleted,
}: {
  facility: Facility;
  onSaved: (f: Facility) => void;
  onDeleted: (id: string) => void;
}) {
  const [saved, setSaved] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="max-w-3xl">
      <FacilityForm
        initial={toDraft(facility)}
        submitLabel={saved ? "Saved" : "Save details"}
        onSubmit={async (draft) => {
          setSaved(false);
          const res = await api<{ facility: Facility }>(
            `/api/facilities/${facility.id}`,
            { method: "PUT", body: JSON.stringify(draft) },
          );
          if (!res.ok) return res;
          onSaved(res.data.facility);
          setSaved(true);
          return { ok: true };
        }}
      />
      <section className="mt-12 rounded-3xl border border-alert/25 p-5 sm:p-7">
        <h2 className="font-display text-xl font-semibold text-ink">
          Remove this facility
        </h2>
        <p className="mt-1 text-sm text-muted">
          Deletes the facility and all of its products from Zelthia.
        </p>
        {error && (
          <p role="alert" className="mt-2 text-sm text-alert">
            {error}
          </p>
        )}
        <Button
          variant="danger"
          className="mt-4"
          onClick={() => setConfirm(true)}
        >
          <Trash2 className="h-4 w-4" aria-hidden />
          Delete facility
        </Button>
      </section>
      <Dialog
        open={confirm}
        onClose={() => setConfirm(false)}
        title={`Delete ${facility.name}?`}
        description="The facility, its products and its services are removed from Zelthia. This can't be undone."
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirm(false)}>
              Keep facility
            </Button>
            <Button
              variant="danger"
              loading={deleting}
              onClick={async () => {
                setDeleting(true);
                const res = await api(`/api/facilities/${facility.id}`, {
                  method: "DELETE",
                });
                setDeleting(false);
                setConfirm(false);
                if (res.ok) onDeleted(facility.id);
                else setError(res.error);
              }}
            >
              Delete facility
            </Button>
          </>
        }
      />
    </div>
  );
}

export function NewFacility() {
  const router = useRouter();
  const user = useSession((s) => s.user);
  const sessionStatus = useSession((s) => s.status);
  const welcome = useSearchParams().get("welcome") === "1";
  if (sessionStatus === "ready" && user && user.role !== "provider")
    return <PatientGate />;
  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 lg:py-12">
      {welcome ? (
        <p className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-sm font-medium text-brand-strong">
          <CircleCheck className="h-4 w-4" aria-hidden />
          Welcome to Zelthia for Facilities
        </p>
      ) : (
        <Link
          href="/provider"
          className="text-sm font-medium text-muted hover:text-ink"
        >
          Back to dashboard
        </Link>
      )}
      <h1 className="mt-3 title font-display text-3xl font-semibold text-ink sm:text-4xl">
        Register your facility
      </h1>
      <p className="mb-8 mt-2 text-muted">
        {welcome
          ? "Three short steps, then you can start listing what you stock."
          : "Three short steps."}{" "}
        Everything can be edited after you register.
      </p>
      <FacilityWizard
        submitLabel="Register facility"
        onSubmit={async (draft) => {
          const res = await api<{ facility: Facility }>("/api/facilities", {
            method: "POST",
            body: JSON.stringify(draft),
          });
          if (!res.ok) return res;
          void useSession.getState().hydrate();
          router.replace(
            `/provider?facility=${res.data.facility.id}&created=1`,
          );
          return { ok: true };
        }}
      />
    </div>
  );
}
