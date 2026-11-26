import { NextResponse, connection } from "next/server";
import { getSessionContext, getUserConsentAudit } from "@/lib/server/auth";
import {
  LAWFUL_BASIS_MATRIX,
  RETENTION_SCHEDULE,
  getComplianceFrameworkSummary,
} from "@/lib/server/compliance";
import { exportUserConversations } from "@/lib/server/conversations";
import { getProfile } from "@/lib/server/profile";

/**
 * Exports the authenticated user's full Subject Access Request (SAR) & Data Portability
 * bundle (UKPGA Data Protection Act 2018 s. 45 / UK GDPR Art. 15 & 20 / NDPA 2023).
 */
export async function GET() {
  await connection();
  try {
    const ctx = await getSessionContext();
    if (!ctx) {
      return NextResponse.json(
        { error: "Sign in to export your data." },
        { status: 401 },
      );
    }
    const [profile, conversations, consentAudit] = await Promise.all([
      getProfile(ctx.user.id, ctx.dek),
      exportUserConversations(ctx.user.id, ctx.dek),
      getUserConsentAudit(ctx.user.id),
    ]);
    const payload = {
      exportedAt: new Date().toISOString(),
      subjectAccessRequest: {
        statutes: [
          "UK Data Protection Act 2018 (UKPGA 2018 c. 12, Section 45 Right of Access & Section 14 Automated Decision Safeguards)",
          "UK General Data Protection Regulation (Articles 15, 18, 20 & 22)",
          "Nigeria Data Protection Act 2023 (Data Portability & Sensitive Health Data Consent)",
        ],
        automatedDecisionSafeguards:
          "Clinical guidance is informational only and does not substitute licensed medical diagnosis. Facility verification ticks are granted solely by human administrators reviewing official public records.",
      },
      account: {
        id: ctx.user.id,
        name: ctx.user.name,
        email: ctx.user.email,
        role: ctx.user.role,
        encryptedAtRest: Boolean(ctx.user.encrypted),
        ...consentAudit,
      },
      complianceSummary: getComplianceFrameworkSummary(),
      lawfulBasisMatrix: LAWFUL_BASIS_MATRIX,
      retentionSchedule: RETENTION_SCHEDULE,
      healthProfile: profile,
      conversations,
    };
    return new NextResponse(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": 'attachment; filename="zelthia-my-data.json"',
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("GET /api/account/export failed", err);
    return NextResponse.json(
      { error: "Could not export your data right now." },
      { status: 503 },
    );
  }
}
