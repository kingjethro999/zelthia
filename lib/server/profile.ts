import "server-only";
import type {
  BiometricProfile,
  BiologicalSex,
  BloodGroup,
} from "@/lib/ai/types";
import { query } from "./db";

const SEXES: BiologicalSex[] = [
  "male",
  "female",
  "intersex",
  "other",
  "prefer-not-to-say",
  "",
];
const BLOOD: BloodGroup[] = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
  "Unknown",
  "",
];

const num = (v: unknown, min: number, max: number) => {
  const n = typeof v === "string" ? Number(v) : v;
  return typeof n === "number" && Number.isFinite(n) && n >= min && n <= max
    ? Math.round(n * 10) / 10
    : null;
};

const list = (v: unknown) =>
  Array.isArray(v)
    ? v
        .filter((x): x is string => typeof x === "string")
        .map((x) => x.trim().slice(0, 80))
        .filter(Boolean)
        .slice(0, 30)
    : [];

/** Whitelists and bounds every field before it is stored or sent to the AI. */
export function sanitizeProfile(input: unknown): BiometricProfile {
  const p = (input && typeof input === "object" ? input : {}) as Record<
    string,
    unknown
  >;
  const age = num(p.age, 0, 125);
  return {
    age: age === null ? "" : age,
    biologicalSex: SEXES.includes(p.biologicalSex as BiologicalSex)
      ? (p.biologicalSex as BiologicalSex)
      : "",
    bloodGroup: BLOOD.includes(p.bloodGroup as BloodGroup)
      ? (p.bloodGroup as BloodGroup)
      : "",
    heightCm: num(p.heightCm, 40, 250),
    weightKg: num(p.weightKg, 2, 350),
    allergies: list(p.allergies),
    chronicConditions: list(p.chronicConditions),
    currentMedications: list(p.currentMedications),
    notes: typeof p.notes === "string" ? p.notes.slice(0, 1000) : "",
  };
}

export async function getProfile(
  userId: string,
): Promise<BiometricProfile | null> {
  const rows = await query<{ data: BiometricProfile }>(
    "select data from health_profiles where user_id = $1",
    [userId],
  );
  return rows[0]?.data ?? null;
}

export async function saveProfile(userId: string, profile: BiometricProfile) {
  await query(
    `insert into health_profiles (user_id, data, updated_at) values ($1, $2, now())
     on conflict (user_id) do update set data = excluded.data, updated_at = now()`,
    [userId, JSON.stringify(profile)],
  );
}
