import "server-only";
import ukpgaJson from "./datasets/ukpga-dpa2018.json";
import mhraRefJson from "./datasets/mhra-reference.json";

export interface LawfulBasisEntry {
  activity: string;
  ukLawfulBasis: string;
  specialCategoryCondition: string;
  ndpaBasis: string;
  technicalControl: string;
}

export const LAWFUL_BASIS_MATRIX: LawfulBasisEntry[] = [
  {
    activity: "Patient account authentication & encrypted storage",
    ukLawfulBasis: "UK GDPR Art. 6(1)(a) Consent & Art. 6(1)(b) Contract",
    specialCategoryCondition: "Not special category",
    ndpaBasis: "NDPA 2023 s. 25 (Consent / Contract)",
    technicalControl:
      "Salted scrypt password hash; split-key SHA-256 session cookie (HTTP-only, SameSite=Lax)",
  },
  {
    activity: "Personal biometric & health profile, triage chats & uploaded scans",
    ukLawfulBasis: "UK GDPR Art. 6(1)(a) Explicit Consent",
    specialCategoryCondition:
      "UK GDPR Art. 9(2)(a) Explicit Consent · DPA 2018 s. 10 & s. 11 & Sch. 1",
    ndpaBasis: "NDPA 2023 s. 30 (Sensitive Personal Data explicit consent)",
    technicalControl:
      "Per-user 256-bit DEK wrapped to user password; AES-256-GCM AEAD sealed at rest; zero staff plaintext visibility",
  },
  {
    activity: "Facility licence submission & public directory inventory",
    ukLawfulBasis:
      "UK GDPR Art. 6(1)(b) Service delivery & Art. 6(1)(f) Legitimate safety interest",
    specialCategoryCondition: "Not special category (public business listings)",
    ndpaBasis: "NDPA 2023 s. 25",
    technicalControl:
      "Manual administrator verification against .gov.ng registries with immutable admin_audit_log",
  },
  {
    activity: "Abuse prevention, CSRF protection & PostgreSQL rate limiting",
    ukLawfulBasis: "UK GDPR Art. 6(1)(f) Legitimate security interest (DPA 2018 s. 2)",
    specialCategoryCondition: "Not special category",
    ndpaBasis: "NDPA 2023 s. 39 (Data Security)",
    technicalControl:
      "Sliding-window DB rate limiter, strict Origin/SameSite validation, Content-Security-Policy & HSTS",
  },
];

export const RETENTION_SCHEDULE = [
  {
    category: "Encrypted health profile, chats & encrypted uploads",
    retention: "Retained until deleted by the user or upon account deletion (immediate purge)",
    statute: "UK GDPR Art. 5(1)(e) · DPA 2018 s. 47 · NDPA 2023",
  },
  {
    category: "HTTP-only authentication sessions",
    retention: "Up to 30 days sliding expiry; instant revocation on sign-out or device revoke",
    statute: "DPA 2018 s. 2 Security Principle",
  },
  {
    category: "Rate-limit counters (rate_limits)",
    retention: "24 hours active window; pruned by admin housekeeping",
    statute: "Storage limitation (UK GDPR Art. 5(1)(e))",
  },
  {
    category: "Public regulatory verification cache (regulatory_cache)",
    retention: "7-day fresh TTL with stale timestamped fallback notice; no personal user data stored",
    statute: "Accuracy principle (UK GDPR Art. 5(1)(d))",
  },
];

export function searchDataProtectionProvisions(query: string) {
  const lower = query.toLowerCase().trim();
  const tokens = lower
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 3);

  const matchedAct = tokens.length
    ? ukpgaJson.statute.provisions.filter((p) => {
        const hay = `${p.section} ${p.title} ${p.domain} ${p.excerpt}`.toLowerCase();
        return tokens.some((t) => hay.includes(t));
      })
    : ukpgaJson.statute.provisions.slice(0, 6);

  const matchedMhraPrivacy = tokens.length
    ? mhraRefJson.privacyNotice.sections.filter((s) => {
        const hay = `${s.title} ${s.excerpt}`.toLowerCase();
        return tokens.some((t) => hay.includes(t));
      })
    : mhraRefJson.privacyNotice.sections.slice(0, 6);

  return {
    statute: {
      title: ukpgaJson.statute.title,
      chapter: ukpgaJson.statute.chapter,
      url: ukpgaJson.statute.url,
      totalPages: ukpgaJson.statute.totalPages,
      parts: ukpgaJson.statute.parts,
      matchedProvisions:
        matchedAct.length > 0
          ? matchedAct
          : ukpgaJson.statute.provisions.slice(0, 5),
    },
    nationalSecurityGuidance: ukpgaJson.nationalSecurityGuidance,
    mhraPrivacyModel: {
      url: mhraRefJson.privacyNotice.url,
      updated: mhraRefJson.privacyNotice.updated,
      matchedSections:
        matchedMhraPrivacy.length > 0
          ? matchedMhraPrivacy
          : mhraRefJson.privacyNotice.sections.slice(0, 5),
    },
    lawfulBasisMatrix: LAWFUL_BASIS_MATRIX,
    retentionSchedule: RETENTION_SCHEDULE,
  };
}

export function getComplianceFrameworkSummary() {
  return {
    frameworks: [
      "Nigeria Data Protection Act 2023 (NDPA)",
      "UK Data Protection Act 2018 (UKPGA 2018 c. 12)",
      "UK General Data Protection Regulation (UK GDPR 2016/679)",
    ],
    statuteTotalPages: ukpgaJson.statute.totalPages,
    provisionsIndexed: ukpgaJson.statute.provisions.length,
    nationalSecurityGuidancePages: ukpgaJson.nationalSecurityGuidance.totalPages,
    mhraPrivacySections: mhraRefJson.privacyNotice.sections.length,
    enforcedControls: {
      zeroKnowledgeEncryption:
        "AES-256-GCM split-key encryption on health_profiles, conversations, messages, and ZENC01 attachments",
      explicitConsentAudit:
        "Mandatory signup checkbox + timestamped consent_history JSONB + terms_version",
      subjectAccessAndPortability:
        "GET /api/account/export full Subject Access Request (DPA 2018 s. 45 / Art. 15 & 20)",
      processingRestriction:
        "users.processing_restricted (DPA 2018 s. 47 / Art. 18) enforced in POST /api/chat and PUT /api/account",
      automatedDecisionSafeguard:
        "DPA 2018 s. 14 / Art. 22 informational clinical guidance + human-verified facility licensing",
      erasureAndSessionControl:
        "Immediate cascade DELETE /api/account + multi-device revocation POST /api/auth/sessions/revoke-others",
    },
  };
}
