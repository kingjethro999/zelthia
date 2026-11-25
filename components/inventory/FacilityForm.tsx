"use client";

import { useState } from "react";
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
import { VoiceRecorder } from "./VoiceRecorder";

const STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

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

export type FacilityDraft = Omit<Facility, "id" | "createdAt" | "verification">;

export const EMPTY_FACILITY: FacilityDraft = {
  name: "",
  kind: "pharmacy",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "",
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
          placeholder="0803 000 0000"
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
          placeholder="e.g. PCN/FP/2020/04512"
          icon={FileBadge}
          value={f.licenseNumber}
          onChange={(e) => set("licenseNumber", e.target.value)}
          hint="PCN, MDCN, HEFAMAA or state ministry number."
        />
        <p className="mt-2 flex items-start gap-2 rounded-xl bg-brand-soft/60 p-3 text-sm text-ink">
          <BadgeCheck
            className="mt-0.5 h-4 w-4 shrink-0 text-brand"
            aria-hidden
          />
          <span>
            Only facilities with a licence or registration number get the green
            verified tick in search and chat. We check it automatically when you
            save. If we can&apos;t confirm it online, a person reviews it within
            7 days.
          </span>
        </p>
      </div>
    </div>
  );
}

export function LocationSection({ f, set, setF, fieldError }: SectionProps) {
  return (
    <div className="space-y-5">
      <TextField
        label="Street address"
        icon={MapPin}
        value={f.address}
        onChange={(e) => set("address", e.target.value)}
        error={fieldError("address")}
        placeholder="12 Aminu Kano Crescent, Wuse 2"
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="City or town"
          value={f.city}
          onChange={(e) => set("city", e.target.value)}
          error={fieldError("city")}
          placeholder="Abuja"
        />
        <Select
          label="State"
          value={f.state}
          onChange={(v) => set("state", v)}
          placeholder="Choose a state"
          options={STATES.map((s) => ({ value: s, label: s }))}
        />
      </div>
      <div className="space-y-3">
        <TextArea
          label="Directions using landmarks"
          value={f.directions}
          onChange={(e) => set("directions", e.target.value)}
          placeholder="Opposite First Bank, first gate after the Total filling station. Blue building with a green cross."
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
