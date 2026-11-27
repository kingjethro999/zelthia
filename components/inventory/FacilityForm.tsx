"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  Building2,
  Clock,
  FileBadge,
  Hospital,
  Mail,
  MapPin,
  Microscope,
  Phone,
  Stethoscope,
  Store,
  Pill,
  BadgeCheck,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ChoiceGroup } from "@/components/ui/Choice";
import { TagInput, TextArea, TextField } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import {
  FACILITY_KIND_LABEL,
  type Facility,
  type FacilityKind,
} from "@/lib/inventory-types";
import { useUserGeo } from "@/lib/store/location";
import { VoiceRecorder } from "./VoiceRecorder";

/**
 * Wording that changes with the country a facility is in. Countries not
 * listed get neutral examples rather than Nigerian ones.
 */
interface CountryCopy {
  regionLabel?: string;
  city?: string;
  address?: string;
  directions?: string;
  licence?: string;
  licenceHint?: string;
}

const COUNTRY_COPY: Record<string, CountryCopy> = {
  NG: {
    regionLabel: "State",
    city: "Abuja",
    address: "12 Aminu Kano Crescent, Wuse 2",
    directions:
      "Opposite First Bank, first gate after the Total filling station. Blue building with a green cross.",
    licence: "e.g. PCN/FP/2020/04512",
    licenceHint:
      "PCN premises licence, MDCN, HEFAMAA or state ministry number.",
  },
  GH: {
    regionLabel: "Region",
    city: "Accra",
    licenceHint: "Pharmacy Council licence or HeFRA registration number.",
  },
  KE: {
    regionLabel: "County",
    city: "Nairobi",
    licenceHint: "Pharmacy and Poisons Board premises licence or KMPDC number.",
  },
  ZA: {
    regionLabel: "Province",
    city: "Johannesburg",
    licenceHint: "SAPC pharmacy record number or practice number.",
  },
  GB: {
    regionLabel: "Region",
    city: "Manchester",
    address: "14 High Street",
    licence: "e.g. 9011234",
    licenceHint: "GPhC premises number, or CQC provider ID for clinics.",
  },
  US: {
    regionLabel: "State",
    city: "Houston",
    address: "250 Main Street, Suite 4",
    licence: "e.g. PHY-123456",
    licenceHint: "State board of pharmacy licence, or the facility's NPI.",
  },
  CA: {
    regionLabel: "Province or territory",
    city: "Toronto",
    licenceHint:
      "Provincial college of pharmacists or ministry licence number.",
  },
};

const copyFor = (country: string): CountryCopy => COUNTRY_COPY[country] ?? {};

interface CountryOption {
  code: string;
  name: string;
  phoneCode: string;
}

let countriesCache: Promise<CountryOption[]> | null = null;
function loadCountries(): Promise<CountryOption[]> {
  countriesCache ??= fetch("/api/geo/countries")
    .then((r) => r.json())
    .then((d: { countries: CountryOption[] }) => d.countries)
    .catch(() => {
      countriesCache = null;
      return [];
    });
  return countriesCache;
}

function useCountries() {
  const [list, setList] = useState<CountryOption[]>([]);
  useEffect(() => {
    let live = true;
    void loadCountries().then((c) => live && setList(c));
    return () => {
      live = false;
    };
  }, []);
  return list;
}

function useRegions(country: string) {
  const [regions, setRegions] = useState<{ code: string; name: string }[]>([]);
  useEffect(() => {
    if (!country) return;
    const ctrl = new AbortController();
    fetch(`/api/geo/regions?country=${country}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d: { regions: { code: string; name: string }[] }) =>
        setRegions(d.regions ?? []),
      )
      .catch(() => {});
    return () => ctrl.abort();
  }, [country]);
  return country ? regions : [];
}

const SERVICE_SUGGESTIONS = [
  "2D echocardiogram",
  "ECG",
  "X-ray",
  "Ultrasound scan",
  "MRI scan",
  "CT scan",
  "Laboratory tests",
  "Malaria test",
  "Blood pressure check",
  "Vaccination",
  "Antenatal care",
  "Physiotherapy",
  "Dental care",
  "Eye test",
  "Pharmacist consultation",
];

const KIND_ICONS: Record<FacilityKind, typeof Store> = {
  pharmacy: Pill,
  clinic: Stethoscope,
  hospital: Hospital,
  diagnostic: Microscope,
  store: Store,
};

export type FacilityDraft = Omit<
  Facility,
  "id" | "createdAt" | "verification" | "currency"
>;

export const EMPTY_FACILITY: FacilityDraft = {
  name: "",
  kind: "pharmacy",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "",
  country: "",
  directions: "",
  openingHours: "",
  licenseNumber: "",
  services: [],
  directionsAudioId: null,
  directionsAudioUrl: null,
};

type SetFn = <K extends keyof FacilityDraft>(k: K, v: FacilityDraft[K]) => void;
export interface SectionProps {
  f: FacilityDraft;
  set: SetFn;
  setF: React.Dispatch<React.SetStateAction<FacilityDraft>>;
  fieldError: (k: string) => string | undefined;
}

export function BasicsSection({ f, set, fieldError }: SectionProps) {
  const countries = useCountries();
  const geo = useUserGeo();
  // Start from where the person is; they can change it.
  useEffect(() => {
    if (!f.country && geo?.country) set("country", geo.country);
  }, [f.country, geo?.country, set]);
  const copy = copyFor(f.country);
  const dial = countries.find((c) => c.code === f.country)?.phoneCode;
  const dialPrefix = dial ? `+${dial.replace(/^\+/, "")}` : "";
  return (
    <div className="space-y-5">
      <ChoiceGroup<FacilityKind>
        label="What kind of place is it?"
        value={f.kind}
        onChange={(v) => set("kind", v)}
        columns={3}
        options={(Object.keys(FACILITY_KIND_LABEL) as FacilityKind[]).map(
          (k) => ({
            value: k,
            label: FACILITY_KIND_LABEL[k],
            icon: KIND_ICONS[k],
          }),
        )}
      />
      {fieldError("kind") && (
        <p className="text-xs font-medium text-alert">{fieldError("kind")}</p>
      )}
      <div>
        <Select
          label="Country"
          icon={Globe}
          searchable
          value={f.country}
          onChange={(v) => {
            set("country", v);
            set("state", "");
          }}
          placeholder={
            countries.length ? "Choose a country" : "Loading countries"
          }
          options={countries.map((c) => ({ value: c.code, label: c.name }))}
        />
        {fieldError("country") && (
          <p className="mt-1.5 text-xs font-medium text-alert">
            {fieldError("country")}
          </p>
        )}
        <p className="mt-1.5 text-xs text-muted">
          Patients only see facilities in their own country.
        </p>
      </div>
      <TextField
        label="Name patients will see"
        icon={Building2}
        value={f.name}
        onChange={(e) => set("name", e.target.value)}
        error={fieldError("name")}
        placeholder="e.g. Greenfield Pharmacy"
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Phone number"
          type="tel"
          icon={Phone}
          value={f.phone}
          onChange={(e) => set("phone", e.target.value)}
          error={fieldError("phone")}
          placeholder={
            dialPrefix ? `${dialPrefix} …` : "Phone with country code"
          }
          autoComplete="tel"
        />
        <TextField
          label="Email (optional)"
          type="email"
          icon={Mail}
          value={f.email}
          onChange={(e) => set("email", e.target.value)}
          placeholder="desk@example.com"
        />
      </div>
      <div>
        <TextField
          label="Licence or registration number (optional)"
          placeholder={copy.licence ?? "As printed on your licence"}
          icon={FileBadge}
          value={f.licenseNumber}
          onChange={(e) => set("licenseNumber", e.target.value)}
          error={fieldError("licenseNumber")}
          hint={
            copy.licenceHint ??
            "The licence or registration number your health regulator gave you."
          }
        />
        <p className="mt-2 flex items-start gap-2 rounded-xl bg-brand-soft/60 p-3 text-sm text-ink">
          <BadgeCheck
            className="mt-0.5 h-4 w-4 shrink-0 text-brand"
            aria-hidden
          />
          <span>
            Only facilities whose licence has been checked and approved by a
            Zelthia administrator get the green verified tick in search and
            chat. When you save, we look for your licence on your regulator's
            public website so the reviewer has evidence to hand.
          </span>
        </p>
      </div>
    </div>
  );
}

export function LocationSection({ f, set, setF, fieldError }: SectionProps) {
  const copy = copyFor(f.country);
  const regions = useRegions(f.country);
  const regionLabel = copy.regionLabel ?? "State, province or region";
  return (
    <div className="space-y-5">
      <TextField
        label="Street address"
        icon={MapPin}
        value={f.address}
        onChange={(e) => set("address", e.target.value)}
        error={fieldError("address")}
        placeholder={copy.address ?? "Building number and street"}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="City or town"
          value={f.city}
          onChange={(e) => set("city", e.target.value)}
          error={fieldError("city")}
          placeholder={copy.city ?? "Your city or town"}
        />
        {regions.length > 0 ? (
          <div>
            <Select
              label={regionLabel}
              searchable={regions.length > 12}
              value={f.state}
              onChange={(v) => set("state", v)}
              placeholder={`Choose a ${regionLabel.toLowerCase()}`}
              options={regions.map((r) => ({ value: r.name, label: r.name }))}
            />
            {fieldError("state") && (
              <p className="mt-1.5 text-xs font-medium text-alert">
                {fieldError("state")}
              </p>
            )}
          </div>
        ) : (
          <TextField
            label={regionLabel}
            value={f.state}
            onChange={(e) => set("state", e.target.value)}
            error={fieldError("state")}
            placeholder="Optional"
          />
        )}
      </div>
      <div className="space-y-3">
        <TextArea
          label="Directions using landmarks"
          value={f.directions}
          onChange={(e) => set("directions", e.target.value)}
          placeholder={
            copy.directions ??
            "Next to the post office, entrance on the side street. Green sign over the door."
          }
          hint="Type them, record them, or both. Patients can read and listen to them with every result."
          rows={3}
        />
        <VoiceRecorder
          audioUrl={f.directionsAudioUrl}
          onSaved={({ id, url, transcript }) =>
            setF((d) => ({
              ...d,
              directionsAudioId: id,
              directionsAudioUrl: url,
              directions: transcript
                ? d.directions.trim()
                  ? `${d.directions.trim()}\n${transcript}`
                  : transcript
                : d.directions,
            }))
          }
          onRemove={() =>
            setF((d) => ({
              ...d,
              directionsAudioId: null,
              directionsAudioUrl: null,
            }))
          }
        />
      </div>
      <TextField
        label="Opening hours"
        icon={Clock}
        value={f.openingHours}
        onChange={(e) => set("openingHours", e.target.value)}
        placeholder="Mon to Sat, 8am to 9pm"
      />
    </div>
  );
}

export function ServicesSection({ f, set }: SectionProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">
        Scans, tests and procedures you offer. People searching for them,
        including from the health chat, will find you.
      </p>
      <TagInput
        label="Services"
        values={f.services}
        onChange={(v) => set("services", v)}
        suggestions={SERVICE_SUGGESTIONS}
        placeholder="e.g. Ultrasound scan"
        tone="sky"
        icon={Stethoscope}
      />
    </div>
  );
}

export function FacilityForm({
  initial = EMPTY_FACILITY,
  submitLabel,
  onSubmit,
}: {
  initial?: FacilityDraft;
  submitLabel: string;
  onSubmit: (
    draft: FacilityDraft,
  ) => Promise<{ ok: boolean; error?: string; field?: string }>;
}) {
  const [f, setF] = useState<FacilityDraft>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<{
    message: string;
    field?: string;
  } | null>(null);
  const set = <K extends keyof FacilityDraft>(k: K, v: FacilityDraft[K]) =>
    setF((d) => ({ ...d, [k]: v }));
  const fieldError = (k: string) =>
    error?.field === k ? error.message : undefined;

  return (
    <form
      noValidate
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        const res = await onSubmit(f);
        setSaving(false);
        if (!res.ok)
          setError({ message: res.error ?? "Not saved.", field: res.field });
      }}
      className="space-y-8"
    >
      <section className="space-y-5">
        <h2 className="font-display text-lg font-semibold text-ink">
          The basics
        </h2>
        <BasicsSection f={f} set={set} setF={setF} fieldError={fieldError} />
      </section>

      <section className="space-y-5">
        <h2 className="font-display text-lg font-semibold text-ink">
          Where to find you
        </h2>
        <LocationSection f={f} set={set} setF={setF} fieldError={fieldError} />
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-ink">
          Services and tests (optional)
        </h2>
        <ServicesSection f={f} set={set} setF={setF} fieldError={fieldError} />
      </section>

      {error && !error.field && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-alert/25 bg-alert-soft p-3 text-sm text-alert"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {error.message}
        </p>
      )}
      {error?.field && (
        <p role="alert" className="text-sm font-medium text-alert">
          Check the highlighted field: {error.message}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        loading={saving}
        className="w-full sm:w-auto"
      >
        {saving && f.licenseNumber
          ? "Saving and checking licence"
          : submitLabel}
      </Button>
    </form>
  );
}
