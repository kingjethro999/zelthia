import type { BiometricProfile } from "@/lib/ai/types";

export type UserRole = "patient" | "provider";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  onboarded: boolean;
}

export interface SessionPayload {
  user: SessionUser | null;
  profile: BiometricProfile | null;
}

export const EMPTY_PROFILE: BiometricProfile = {
  age: "",
  biologicalSex: "",
  bloodGroup: "",
  heightCm: null,
  weightKg: null,
  allergies: [],
  chronicConditions: [],
  currentMedications: [],
  notes: "",
};
