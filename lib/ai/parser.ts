import { CareReferral, TriageLevel } from './types';

export interface ParsedAiResponse {
  message: string;
  triageLevel: TriageLevel;
  referral?: CareReferral;
}

export function parseAiResponse(raw: string): ParsedAiResponse {
  let content = raw.trim();
  let triageLevel: TriageLevel = 'low';
  let referral: CareReferral | undefined;

  // Extract [TRIAGE: LEVEL]
  const triageMatch = content.match(/\[TRIAGE:\s*(LOW|MODERATE|URGENT)\]/i);
  if (triageMatch) {
    const level = triageMatch[1].toLowerCase() as TriageLevel;
    if (['low', 'moderate', 'urgent'].includes(level)) {
      triageLevel = level;
    }
  } else {
    // Heuristic detection if model omitted the tag
    const lower = content.toLowerCase();
    if (
      lower.includes('emergency department') ||
      lower.includes('emergency room') ||
      lower.includes('call 112') ||
      lower.includes('call 911') ||
      lower.includes('immediate medical attention') ||
      lower.includes('life-threatening') ||
      lower.includes('urgent medical emergency') ||
      lower.includes('dial 112') ||
      lower.includes('dial 911') ||
      lower.includes('ambulance')
    ) {
      triageLevel = 'urgent';
    } else if (
      lower.includes('consult a doctor') ||
      lower.includes('see a healthcare provider') ||
      lower.includes('prescription') ||
      lower.includes('within 24 hours') ||
      lower.includes('within 24–48 hours') ||
      lower.includes('moderate risk')
    ) {
      triageLevel = 'moderate';
    }
  }

  // Extract [REFERRAL: {...}]
  const referralMatch = content.match(/\[REFERRAL:\s*(\{[\s\S]*?\})\]/i);
  if (referralMatch) {
    try {
      const parsed = JSON.parse(referralMatch[1]);
      if (parsed && typeof parsed === 'object') {
        referral = {
          recommended: parsed.recommended !== false,
          facilityType: parsed.facilityType || 'pharmacy',
          searchQuery: parsed.searchQuery || 'Essential Medicines',
          actionText: parsed.actionText || 'Check Local Stock & Availability',
          reason: parsed.reason || 'Verify availability at nearby clinics & pharmacies',
        };
      }
    } catch {
      // Ignore JSON parse errors on malformed tags
    }
  }

  // Clean all [TRIAGE: ...] and [REFERRAL: ...] tags from the output message
  content = content
    .replace(/\[TRIAGE:\s*(LOW|MODERATE|URGENT)\]/gi, '')
    .replace(/\[REFERRAL:\s*(\{[\s\S]*?\})\]/gi, '')
    .replace(/^```json\s*```/gm, '')
    .trim();

  // If no explicit referral was output, check if common medications were discussed
  if (!referral) {
    const lower = content.toLowerCase();
    const commonDrugs: Record<string, string> = {
      'artemether': 'Artemether/Lumefantrine',
      'malaria': 'Artemether/Lumefantrine',
      'paracetamol': 'Paracetamol 500mg',
      'amoxicillin': 'Amoxicillin 500mg',
      'antibiotic': 'Antibiotics',
      'hydrocortisone': 'Hydrocortisone cream',
      'cream': 'Dermatology Cream',
      'ors': 'Oral Rehydration Salts (ORS)',
      'inhaler': 'Salbutamol Inhaler',
      'lisinopril': 'Lisinopril 10mg',
      'metformin': 'Metformin 500mg',
      'insulin': 'Insulin',
      'cetirizine': 'Cetirizine 10mg',
      'antihistamine': 'Antihistamines',
    };

    for (const [kw, name] of Object.entries(commonDrugs)) {
      if (lower.includes(kw)) {
        referral = {
          recommended: true,
          facilityType: 'pharmacy',
          searchQuery: name,
          actionText: `Check Stock for ${name}`,
          reason: `Find verified ${name} in nearby pharmacies on Zelthia.`,
        };
        break;
      }
    }
  }

  return {
    message: content,
    triageLevel,
    referral,
  };
}
