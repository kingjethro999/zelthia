import type { UserRole } from "@/lib/auth-types";
import type {
  AdminVerificationItem,
  Facility,
  FacilityKind,
  Product,
  VerificationEvidence,
} from "@/lib/inventory-types";

export interface AdminOverviewSeriesPoint {
  date: string;
  users: number;
  conversations: number;
  facilities: number;
}

export interface AdminAuditEntry {
  id: string;
  adminId: string | null;
  adminName: string | null;
  adminEmail: string | null;
  action: string;
  targetType: string;
  targetId: string | null;
  details: Record<string, unknown>;
  createdAt: string;
}

export interface AdminOverviewData {
  users: {
    total: number;
    patients: number;
    providers: number;
    encrypted: number;
    onboarded: number;
  };
  facilities: {
    total: number;
    verified: number;
    pending: number;
    rejected: number;
    none: number;
    citiesCount: number;
  };
  products: {
    total: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
    expiringSoon: number;
    expired: number;
    rxOnly: number;
  };
  activity: {
    conversations: number;
    messages: number;
    activeSessions: number;
    rateLimitHits24h: number;
  };
  series14d: AdminOverviewSeriesPoint[];
  pendingPreview: AdminVerificationItem[];
  recentAudit: AdminAuditEntry[];
  systemSummary: {
    dbLatencyMs: number;
    servicesConfigured: number;
    servicesTotal: number;
  };
}

export interface AdminFacilityListItem extends Facility {
  owner: {
    id: string;
    name: string;
    email: string;
  };
  productCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  verifiedAt: string | null;
  updatedAt: string;
}

export interface AdminFacilityDetail {
  facility: AdminFacilityListItem;
  evidence: VerificationEvidence[];
  products: Product[];
}

export interface AdminProductListItem extends Product {
  facilityName: string;
  facilityKind: FacilityKind;
  facilityCity: string;
  facilityVerified: boolean;
}

export interface AdminProductSummary {
  total: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  expired: number;
  expiringSoon: number;
  rxOnly: number;
}

export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isAdmin: boolean;
  encrypted: boolean;
  onboarded: boolean;
  termsVersion: string;
  termsAcceptedAt: string | null;
  createdAt: string;
  activeSessions: number;
  facilityCount: number;
  conversationCount: number;
  hasProfile: boolean;
}

export interface AdminSystemHealth {
  dbLatencyMs: number;
  dbSizeBytes: number;
  tables: { name: string; count: number }[];
  encryption: {
    usersTotal: number;
    usersEncrypted: number;
    profilesTotal: number;
    profilesEncrypted: number;
    conversationsTotal: number;
    conversationsEncrypted: number;
    messagesTotal: number;
    messagesEncrypted: number;
  };
  maintenance: {
    expiredSessions: number;
    staleRateLimits: number;
  };
  rateLimits24h: { group: string; hits: number }[];
  services: {
    id: string;
    label: string;
    category: string;
    configured: boolean;
  }[];
  compliance: {
    usersConsented: number;
    usersProcessingRestricted: number;
    termsVersion: string;
  };
  datasets: {
    id: string;
    label: string;
    records: number;
    source: string;
    status: "ready" | "fallback";
  }[];
}
