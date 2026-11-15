export type BiologicalSex = 'male' | 'female' | 'other' | 'intersex' | 'prefer-not-to-say' | '';

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Unknown' | '';

export interface BiometricProfile {
  age?: number | string;
  biologicalSex?: BiologicalSex;
  bloodGroup?: BloodGroup;
  allergies?: string[];
  chronicConditions?: string[];
  currentMedications?: string[];
  notes?: string;
}

export type TriageLevel = 'low' | 'moderate' | 'urgent';

export interface CareReferral {
  recommended: boolean;
  facilityType?: 'pharmacy' | 'clinic' | 'hospital' | 'emergency';
  searchQuery?: string;
  actionText?: string;
  reason?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  triageLevel?: TriageLevel;
  referral?: CareReferral;
  modelUsed?: string;
}

export interface ChatRequestBody {
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  biometrics?: BiometricProfile;
}

export interface ChatResponseBody {
  message: string;
  triageLevel: TriageLevel;
  referral?: CareReferral;
  model: string;
  timestamp: string;
}

export function hasActiveBiometrics(profile?: BiometricProfile | null): boolean {
  if (!profile) return false;
  return Boolean(
    (profile.age && String(profile.age).trim() !== '') ||
    (Boolean(profile.biologicalSex) && profile.biologicalSex !== 'prefer-not-to-say') ||
    (Boolean(profile.bloodGroup) && profile.bloodGroup !== 'Unknown') ||
    (profile.allergies && profile.allergies.length > 0) ||
    (profile.chronicConditions && profile.chronicConditions.length > 0) ||
    (profile.currentMedications && profile.currentMedications.length > 0)
  );
}
