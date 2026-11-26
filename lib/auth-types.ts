import type { BiometricProfile } from "@/lib/ai/types";

export type UserRole = "patient" | "provider";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  onboarded: boolean;
  isAdmin?: boolean;
  encrypted?: boolean;
  processingRestricted?: boolean;
  termsAcceptedAt?: string | null;
  termsVersion?: string;
}

export interface SessionPayload {
  user: SessionUser | null;
  profile: BiometricProfile | null;
  /** Facilities the user owns; null for personal accounts. */
  facilityCount: number | null;
  /** Ephemeral admin portal path; present only for authenticated admins. */
  adminPath?: string | null;
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
  location: "",
};
