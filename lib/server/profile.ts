import "server-only";
import type {
  BiometricProfile,
  BiologicalSex,
  BloodGroup,
} from "@/lib/ai/types";
import { aadProfile, decryptText, encryptText } from "./crypto";
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
    location:
      typeof p.location === "string" ? p.location.trim().slice(0, 80) : "",
  };
}

export async function getProfile(
  userId: string,
  dek: Buffer,
): Promise<BiometricProfile | null> {
  const rows = await query<{ data: BiometricProfile; data_enc: string | null }>(
    "select data, data_enc from health_profiles where user_id = $1",
    [userId],
  );
  const row = rows[0];
  if (!row) return null;
  if (row.data_enc) {
    try {
      const parsed = JSON.parse(decryptText(row.data_enc, dek, aadProfile(userId)));
      return sanitizeProfile(parsed);
    } catch (err) {
      console.error("Failed to decrypt health profile", userId, err);
      return null;
    }
  }
  return row.data ? sanitizeProfile(row.data) : null;
}

export async function saveProfile(
  userId: string,
  profile: BiometricProfile,
  dek: Buffer,
) {
  const enc = encryptText(JSON.stringify(profile), dek, aadProfile(userId));
  await query(
    `insert into health_profiles (user_id, data, data_enc, updated_at) values ($1, '{}'::jsonb, $2, now())
     on conflict (user_id) do update set data = '{}'::jsonb, data_enc = excluded.data_enc, updated_at = now()`,
    [userId, enc],
  );
}
