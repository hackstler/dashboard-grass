// ── Auth ────────────────────────────────────────────────────────────────────

export interface OrgFeatures {
  quotes?: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  surname: string | null;
  phone: string | null;
  orgId: string;
  role: "admin" | "user" | "super_admin";
  onboardingComplete?: boolean;
  firstName?: string | null;
  lastName?: string | null;
  orgFeatures?: OrgFeatures;
}

export type AuthStrategyType = "password" | "firebase";

export interface LoginResponse {
  token: string;
  user: { id: string; email: string; orgId: string; role: string };
}

export type AuthState =
  | { status: "loading" }
  | { status: "unauthenticated" }
  | { status: "authenticated"; user: User };

// ── Navigation ──────────────────────────────────────────────────────────────

export type ActiveView =
  | "overview"
  | "chat"
  | "whatsapp"
  | "knowledge-upload"
  | "knowledge-list"
  | "users"
  | "organizations"
  | "catalogs"
  | "whatsapp-connections"
  | "settings"
  | "my-organization"
  | "profile"
  | "quotes";

// ── Chat ────────────────────────────────────────────────────────────────────

export interface ChatConversation {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatAttachment {
  filename: string;
  base64: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  metadata: {
    model?: string;
    retrievedChunks?: string[];
  } | null;
  attachments?: ChatAttachment[];
  /** Action pending user confirmation (HITL) */
  pendingAction?: PendingActionEvent;
  createdAt: string;
}

export interface ChatSource {
  id: string;
  documentTitle: string;
  documentSource: string;
  score: number;
  excerpt: string;
}

export interface PendingActionEvent {
  actionId: string;
  actionType: string;
  preview: Record<string, unknown>;
}

export type ChatStreamEvent =
  | { type: "tool-call"; toolName: string }
  | { type: "tool-error"; toolName: string; error: string }
  | { type: "agent-start"; agentId: string }
  | { type: "agent-end"; agentId: string }
  | { type: "step-start" }
  | { type: "step-finish"; finishReason: string }
  | { type: "sources"; chunks: ChatSource[] }
  | { type: "text"; text: string }
  | { type: "attachment"; filename: string; base64: string }
  | { type: "pending-action"; actionId: string; actionType: string; preview: Record<string, unknown> }
  | { type: "done" }
  | { type: "error"; message: string };

// ── Admin ───────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  surname: string | null;
  phone: string | null;
  orgId: string;
  role: string;
  createdAt: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  name?: string;
  surname?: string;
  phone?: string;
  orgId: string;
  role: "admin" | "user" | "super_admin";
}

export interface InviteUserData {
  email: string;
  phone?: string;
  orgId: string;
  role: "admin" | "user" | "super_admin";
}

export interface UpdateUserData {
  email?: string;
  name?: string;
  surname?: string;
  role?: string;
  password?: string;
  orgId?: string;
}

// ── Organizations ───────────────────────────────────────────────────────────

export interface Organization {
  orgId: string;
  name: string | null;
  userCount: number;
  docCount: number;
  createdAt: string | null;
}

export interface QuoteSettings {
  paymentTerms?: string;
  quoteValidityDays?: number;
  companyRegistration?: string;
}

export interface OrganizationDetail {
  id: string;
  orgId: string;
  slug: string | null;
  name: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  nif: string | null;
  logo: string | null;
  vatRate: number | null;
  currency: string;
  quoteSettings: QuoteSettings | null;
  businessLogicUrl: string | null;
  businessLogicApiKey: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrganizationData {
  orgId: string;
  adminEmail: string;
  slug?: string;
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  nif?: string;
  logo?: string;
  vatRate?: number;
  currency?: string;
}

export interface UpdateOrganizationData {
  slug?: string | null;
  name?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  nif?: string | null;
  logo?: string | null;
  vatRate?: number | null;
  currency?: string;
  quoteSettings?: QuoteSettings | null;
  businessLogicUrl?: string | null;
  businessLogicApiKey?: string | null;
}

// ── Channels ────────────────────────────────────────────────────────────────

export interface WhatsAppStatus {
  status: "not_enabled" | "pending" | "disconnected" | "qr" | "code" | "connected";
  phone: string | null;
  linkingMethod?: "qr" | "code";
  pairingCode?: string | null;
  updatedAt?: string;
}

// ── Google ───────────────────────────────────────────────────────────────────

export interface GoogleConnectionStatus {
  connected: boolean;
  scopes: string[];
}

// ── Catalogs ────────────────────────────────────────────────────────────────

export interface CatalogData {
  id: string;
  orgId: string;
  name: string;
  effectiveDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  orgName?: string | null;
}

export interface CatalogItemData {
  id: string;
  catalogId: string;
  code: number;
  name: string;
  description: string | null;
  category: string | null;
  pricePerUnit: string;
  unit: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  priceRange?: {
    solado?: { min: number; max: number };
    tierra?: { min: number; max: number };
  } | null;
}

export interface CreateCatalogData {
  name: string;
  effectiveDate: string;
  isActive?: boolean;
}

export interface UpdateCatalogData {
  name?: string;
  effectiveDate?: string;
  isActive?: boolean;
}

export interface CreateItemData {
  code?: number;
  name: string;
  description?: string | null;
  category?: string | null;
  pricePerUnit: number;
  unit: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateItemData {
  code?: number;
  name?: string;
  description?: string | null;
  category?: string | null;
  pricePerUnit?: number;
  unit?: string;
  sortOrder?: number;
  isActive?: boolean;
}

// ── Quotes ─────────────────────────────────────────────────────────────

export interface QuoteSummary {
  id: string;
  quoteNumber: string;
  clientName: string;
  clientAddress: string | null;
  total: string;
  filename: string;
  createdAt: string;
}

// ── Documents ───────────────────────────────────────────────────────────────

export type DocumentContentType =
  | "pdf"
  | "markdown"
  | "html"
  | "code"
  | "text"
  | "url"
  | "youtube";

export type DocumentStatus = "pending" | "processing" | "indexed" | "failed";

export interface DocumentSource {
  id: string;
  orgId: string | null;
  topicId: string | null;
  title: string;
  source: string;
  contentType: DocumentContentType;
  status: DocumentStatus;
  chunkCount: number | null;
  metadata: {
    size?: number;
    pageCount?: number;
    author?: string;
    language?: string;
    tags?: string[];
    error?: string;
    [key: string]: unknown;
  } | null;
  createdAt: string;
  indexedAt: string | null;
}

export interface IngestResult {
  documentId: string;
  status: "indexed" | "failed";
  chunkCount: number;
  error?: string;
}

// ── Invitations ─────────────────────────────────────────────────────────────

export interface Invitation {
  id: string;
  orgId: string;
  role: string;
  email: string | null;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
}

export interface InviteValidation {
  valid: boolean;
  orgId?: string;
  orgName?: string | null;
  role?: string;
  email?: string | null;
  reason?: "expired" | "used" | "invalid";
}

// ── UI ──────────────────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

// ── WhatsApp Connections ────────────────────────────────────────────────────

export interface WhatsAppConnection {
  id: string;
  userId: string;
  userEmail: string | null;
  orgId: string;
  status: string;
  phone: string | null;
  updatedAt: string;
}
