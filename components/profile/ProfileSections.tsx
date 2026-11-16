"use client";

import { useState } from "react";
import {
  Droplet,
  HelpCircle,
  Mars,
  NonBinary,
  Pill,
  ShieldAlert,
  Activity,
  Venus,
  VenusAndMars,
  EyeOff,
} from "lucide-react";
import { ChoiceGroup } from "@/components/ui/Choice";
import { Stepper, TagInput, TextArea } from "@/components/ui/Field";
import type { BiometricProfile, BiologicalSex, BloodGroup } from "@/lib/ai/types";
import { cn } from "@/lib/utils";

type Patch = (patch: Partial<BiometricProfile>) => void;

const SEX_OPTIONS = [
  { value: "female", label: "Female", icon: Venus },
  { value: "male", label: "Male", icon: Mars },
  { value: "intersex", label: "Intersex", icon: VenusAndMars },
  { value: "other", label: "Other", icon: NonBinary },
  { value: "prefer-not-to-say", label: "Prefer not to say", icon: EyeOff },
] as const;

const BLOOD_GROUPS: BloodGroup[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export const ALLERGY_SUGGESTIONS = ["Penicillin", "Sulfa drugs", "Aspirin / NSAIDs", "Codeine", "Peanuts", "Latex", "Shellfish"];
export const CONDITION_SUGGESTIONS = ["Hypertension", "Asthma", "Type 2 diabetes", "Sickle cell disease", "Peptic ulcer", "Migraine", "Pregnancy"];
export const MEDICATION_SUGGESTIONS = ["Metformin", "Amlodipine", "Lisinopril", "Salbutamol inhaler", "Omeprazole", "Hydroxyurea", "Folic acid"];

const toNum = (v: BiometricProfile["age"]) =>
  v === "" || v === undefined || v === null ? null : Number(v);

export function AboutFields({ profile, patch }: { profile: BiometricProfile; patch: Patch }) {
  return (
    <div className="space-y-6">
      <Stepper
        label="Age"
        unit="years"
        start={25}
        min={0}
        max={125}
        value={toNum(profile.age)}
        onChange={(v) => patch({ age: v ?? "" })}
        hint="Doses and warning signs change with age."
        className="max-w-xs"
      />
      <ChoiceGroup<BiologicalSex>
        label="Sex assigned at birth"
        value={profile.biologicalSex ?? ""}
        onChange={(v) => patch({ biologicalSex: v })}
        columns={3}
        options={SEX_OPTIONS.map((o) => ({ ...o }))}
      />
    </div>
  );
}

const CM_PER_IN = 2.54;
const KG_PER_LB = 0.45359237;

function bmiLabel(bmi: number) {
  if (bmi < 18.5) return { text: "Below the healthy range", tone: "text-caution" };
  if (bmi < 25) return { text: "In the healthy range", tone: "text-brand" };
  if (bmi < 30) return { text: "Above the healthy range", tone: "text-caution" };
  return { text: "Well above the healthy range", tone: "text-alert" };
}

export function BodyFields({ profile, patch }: { profile: BiometricProfile; patch: Patch }) {
  const [heightUnit, setHeightUnit] = useState<"cm" | "ft">("cm");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lb">("kg");
  const h = profile.heightCm ?? null;
  const w = profile.weightKg ?? null;

  const totalIn = h ? Math.round(h / CM_PER_IN) : null;
  const ft = totalIn !== null ? Math.floor(totalIn / 12) : null;
  const inch = totalIn !== null ? totalIn % 12 : null;
  const setFtIn = (f: number | null, i: number | null) => {
    if (f === null && i === null) return patch({ heightCm: null });
    patch({ heightCm: Math.round(((f ?? 0) * 12 + (i ?? 0)) * CM_PER_IN) });
  };

  const bmi = h && w ? w / (h / 100) ** 2 : null;
  const band = bmi ? bmiLabel(bmi) : null;
  // Marker position across a 15–40 BMI scale.
  const marker = bmi ? Math.min(100, Math.max(0, ((bmi - 15) / 25) * 100)) : null;

  return (
    <div className="space-y-7">
      <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-ink" id="height-heading">
              Height
            </span>
            <ChoiceGroup
              label="Height unit"
              hideLabel
              variant="pills"
              value={heightUnit}
              onChange={setHeightUnit}
              options={[
                { value: "cm", label: "cm" },
                { value: "ft", label: "ft / in" },
              ]}
            />
          </div>
          {heightUnit === "cm" ? (
            <Stepper
              label="Height in centimetres"
              hideLabel
              start={165}
              unit="cm"
              min={40}
              max={250}
              value={h}
              onChange={(v) => patch({ heightCm: v })}
            />
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Stepper label="Feet" hideLabel start={5} unit="ft" min={1} max={8} value={ft} onChange={(v) => setFtIn(v, inch)} />
              <Stepper label="Inches" hideLabel start={6} unit="in" min={0} max={11} value={inch} onChange={(v) => setFtIn(ft, v)} />
            </div>
          )}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-ink">Weight</span>
            <ChoiceGroup
              label="Weight unit"
              hideLabel
              variant="pills"
              value={weightUnit}
              onChange={setWeightUnit}
              options={[
                { value: "kg", label: "kg" },
                { value: "lb", label: "lb" },
              ]}
            />
          </div>
          {weightUnit === "kg" ? (
            <Stepper
              label="Weight in kilograms"
              hideLabel
              start={65}
              unit="kg"
              min={2}
              max={350}
              value={w}
              onChange={(v) => patch({ weightKg: v })}
            />
          ) : (
            <Stepper
              label="Weight in pounds"
              hideLabel
              start={145}
              unit="lb"
              min={5}
              max={770}
              value={w ? Math.round(w / KG_PER_LB) : null}
              onChange={(v) => patch({ weightKg: v === null ? null : Math.round(v * KG_PER_LB * 10) / 10 })}
            />
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-mist/60 p-4" aria-live="polite">
        {bmi && band && marker !== null ? (
          <>
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-sm text-muted">
                Body mass index{" "}
                <span className="font-display text-2xl font-semibold tabular-nums text-ink">
                  {bmi.toFixed(1)}
                </span>
              </p>
              <p className={cn("text-sm font-medium", band.tone)}>{band.text}</p>
            </div>
            <div className="relative mt-3 h-2 rounded-full bg-gradient-to-r from-[#e2b543] via-[#2fb27f] via-40% to-[#d9603f]">
              <span
                className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-ink shadow transition-[left] duration-300"
                style={{ left: `${marker}%` }}
                aria-hidden
              />
            </div>
          </>
        ) : (
          <p className="flex items-center gap-2 text-sm text-muted">
            <HelpCircle className="h-4 w-4 shrink-0" aria-hidden />
            Add height and weight to see your body mass index. Zelthia uses it to sense-check doses.
          </p>
        )}
      </div>

      <ChoiceGroup<BloodGroup>
        label="Blood group"
        value={profile.bloodGroup ?? ""}
        onChange={(v) => patch({ bloodGroup: v })}
        columns={4}
        options={[
          ...BLOOD_GROUPS.map((g) => ({ value: g, label: g, icon: Droplet })),
          { value: "Unknown" as BloodGroup, label: "Not sure", icon: HelpCircle },
        ]}
      />
    </div>
  );
}

export function HistoryFields({ profile, patch }: { profile: BiometricProfile; patch: Patch }) {
  return (
    <div className="space-y-6">
      <TagInput
        label="Allergies and drug reactions"
        hint="Zelthia warns you before suggesting anything on this list."
        tone="caution"
        icon={ShieldAlert}
        values={profile.allergies ?? []}
        onChange={(v) => patch({ allergies: v })}
        suggestions={ALLERGY_SUGGESTIONS}
        placeholder="e.g. Penicillin"
      />
      <TagInput
        label="Long-term conditions"
        tone="brand"
        icon={Activity}
        values={profile.chronicConditions ?? []}
        onChange={(v) => patch({ chronicConditions: v })}
        suggestions={CONDITION_SUGGESTIONS}
        placeholder="e.g. Asthma"
      />
      <TagInput
        label="Medicines you take regularly"
        hint="Used to check for interactions."
        tone="sky"
        icon={Pill}
        values={profile.currentMedications ?? []}
        onChange={(v) => patch({ currentMedications: v })}
        suggestions={MEDICATION_SUGGESTIONS}
        placeholder="e.g. Metformin 500 mg"
      />
    </div>
  );
}

export function NotesField({ profile, patch }: { profile: BiometricProfile; patch: Patch }) {
  return (
    <TextArea
      label="Anything else a pharmacist should know?"
      hint="Pregnancy, breastfeeding, a recent operation, or anything else that matters."
      value={profile.notes ?? ""}
      maxLength={1000}
      onChange={(e) => patch({ notes: e.target.value })}
      placeholder="e.g. 20 weeks pregnant"
      rows={4}
    />
  );
}
