/**
 * API Standards response envelopes per docs/06-api-standards.md
 */

export interface ApiResponse<T, M = Record<string, unknown>> {
  data: T;
  meta: M;
}

export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface ApiPaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiErrorResponse {
  message: string;
  code: string;
  errors?: Record<string, string[]>;
  reference_id?: string;
}

export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  params?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  headers?: HeadersInit;
  skipCsrf?: boolean;
  skipSessionEvent?: boolean;
  _isRetry?: boolean;
}

// ==========================================
// Wallet & Funding (Doc 25 §2)
// ==========================================
export interface Wallet {
  id: string; // ULID
  currency: "NGN";
  balance: number; // in kobo (e.g. 500000 = ₦5,000.00)
  balance_formatted: string; // "5000.00"
  created_at: string;
  updated_at: string;
}

export type LedgerDirection = "credit" | "debit";
export type LedgerEntryType =
  | "funding"
  | "order_debit"
  | "refund"
  | "manual_adjustment";

export interface LedgerEntry {
  id: string; // ULID
  direction: LedgerDirection;
  type: LedgerEntryType;
  amount: number; // in kobo
  amount_formatted: string;
  balance_after: number; // in kobo
  balance_after_formatted: string;
  currency: "NGN";
  reference: string;
  description: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export type FundingStatus = "pending" | "success" | "failed" | "reversed";

export interface DedicatedVirtualAccount {
  id: string; // ULID
  provider: string; // "finitypay"
  account_reference: string;
  bank_name: string; // e.g. "Wema Bank"
  bank_code: string | null; // e.g. "035"
  account_number: string; // e.g. "7892341201"
  account_name: string; // e.g. "COFINANCE / John Doe"
  status: "active" | "suspended";
  created_at: string;
}

export interface DedicatedAccountMeta {
  has_account: boolean;
  requires_phone?: boolean;
  already_existed?: boolean;
  created?: boolean;
}

export interface FundingRecord {
  id: string; // ULID
  reference: string;
  provider: string; // e.g. "finitypay"
  amount: number; // in kobo
  amount_formatted: string;
  currency: "NGN";
  status: FundingStatus;
  checkout_url: string | null;
  processed_at: string | null;
  created_at: string;
}

// ==========================================
// Bills & VTU (Doc 25 §2)
// ==========================================
export interface BillCategory {
  code: string; // "airtime" | "data" | "cable_tv" | "electricity" | "solar" | ...
  name: string;
}

export interface BillPackage {
  code: string; // e.g. "112381"
  name: string; // e.g. "MTN 1GB Data Plan (30 Days)"
  amount: number; // In Naira (provider nominal amount)
}

export interface BillServiceItem {
  service_code: string; // e.g. "MTN_DATA", "AIRTEL_AIRTIME", "IKEDC", "DSTV"
  name: string;
  category: string;
  packages?: BillPackage[];
}

export interface DataBundlePackage {
  code: string; // e.g. "112381"
  name: string; // e.g. "MTN 1GB Data Plan (30 Days)"
  amount: number; // In Naira
  size?: string;
  validity?: string;
}

export interface CustomerValidationResult {
  customer_name: string;
  customer_identifier: string;
  address?: string | null;
  outstanding_balance?: number | null;
}

export type BillOrderStatus = "pending" | "processing" | "completed" | "failed";

export interface BillOrder {
  id: string; // ULID
  reference: string; // e.g. "BIL-8F92A0E31C"
  provider_reference: string | null;
  category: string; // "airtime" | "data" | "cable_tv" | "electricity"
  service_code: string; // "MTN_DATA"
  service_name: string; // "MTN Mobile Data"
  package_code: string | null;
  customer_identifier: string; // Phone number, Smartcard number, or Meter number
  customer_name: string | null;
  amount: number; // Debited amount in kobo
  amount_formatted: string;
  face_amount: number; // Nominal package amount in kobo
  face_amount_formatted: string;
  discount_amount: number; // In kobo
  currency: "NGN";
  status: BillOrderStatus;
  token: string | null; // Prepaid electricity token / pin (null for airtime/data)
  metadata: Record<string, unknown> | null;
  processed_at: string | null;
  created_at: string;
}

// ==========================================
// Notifications (Doc 25 §2)
// ==========================================
export interface CustomerNotification {
  id: string; // UUID
  type: string; // e.g. "WalletFundedNotification", "DeviceVerificationOtpNotification"
  title: string | null;
  message: string | null;
  category: string; // "general", "wallet", "security", etc.
  data: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

// ==========================================
// Profile & Security (Doc 25 §2)
// ==========================================
export interface DedicatedVirtualAccountSummary {
  bank_name: string;
  bank_code: string | null;
  account_number: string;
  account_name: string;
  status: string;
  created_at: string | null;
}

export interface CustomerProfile {
  id: string; // ULID
  username: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  phone: string | null;
  email: string;
  email_verified_at: string | null;
  has_virtual_account: boolean;
  virtual_account: DedicatedVirtualAccountSummary | null;
  created_at: string;
}

export interface CustomerSession {
  id: string; // SHA-256 hashed safe identifier
  ip_address: string | null;
  user_agent: string | null;
  is_current: boolean;
  last_activity: string;
}

export interface SecurityActivity {
  id: string;
  event: string; // e.g. "auth.login_success", "auth.password_changed"
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown> | null;
  occurred_at: string;
  created_at: string | null;
}

export interface TrustedDevice {
  id: string; // ULID
  device_name: string;
  ip_address: string | null;
  last_used_at: string | null;
  created_at: string;
}
