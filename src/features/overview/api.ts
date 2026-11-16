/**
 * Account Overview API service and types (F12).
 * Follows Doc 06 response envelopes and Doc 09 §2 & §5 conventions.
 */
import { api } from "@/lib/api";
import { unwrapApiResponse } from "@/lib/api/errors";
import type { ApiResponse } from "@/lib/api/types";

// ---------------------------------------------------------------------------
// Types (placed next to api.ts per Doc 09 §5)
// ---------------------------------------------------------------------------

export type OrderStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "refunded";

export type ServiceType = "airtime" | "data" | "vpn" | "social";

export interface OverviewOrder {
  id: string;
  reference: string;
  service_type: ServiceType;
  service_label: string;
  amount: number; // integer minor units (e.g. kobo)
  currency: string;
  status: OrderStatus;
  recipient?: string;
  created_at: string;
}

export type TransactionDirection = "credit" | "debit";
export type TransactionType =
  | "wallet_funding"
  | "order_payment"
  | "order_refund"
  | "manual_adjustment";

export interface OverviewTransaction {
  id: string;
  reference: string;
  direction: TransactionDirection;
  type: TransactionType;
  description: string;
  amount: number; // integer minor units (e.g. kobo)
  currency: string;
  balance_after: number; // integer minor units
  created_at: string;
}

export interface WalletSummary {
  balance: number; // integer minor units (e.g. 4525000 = ₦45,250.00)
  currency: string;
  ledger_count: number;
  updated_at: string;
  total_deposited?: number; // integer minor units
  total_spent?: number; // integer minor units
}

export interface OverviewMetrics {
  active_services_count: number;
  completed_orders_count: number;
  pending_orders_count: number;
}

export interface OverviewData {
  wallet: WalletSummary;
  metrics: OverviewMetrics;
  recent_orders: OverviewOrder[];
  recent_transactions: OverviewTransaction[];
}

// ---------------------------------------------------------------------------
// API Methods
// ---------------------------------------------------------------------------

/**
 * Fetches dashboard overview aggregated data including wallet balance,
 * high-level metrics, recent orders, and recent ledger transactions.
 */
export async function getOverviewData(): Promise<OverviewData> {
  const response = await api.get<ApiResponse<OverviewData>>("/api/v1/overview");
  return unwrapApiResponse(response);
}

// ---------------------------------------------------------------------------
// Realistic Mock Fixtures for Storybook / Development / Tests
// ---------------------------------------------------------------------------

export const MOCK_OVERVIEW_DATA: OverviewData = {
  wallet: {
    balance: 4525000, // ₦45,250.00
    currency: "NGN",
    ledger_count: 24,
    updated_at: "2026-11-14T10:15:00Z",
    total_deposited: 12000000, // ₦120,000.00
    total_spent: 7475000, // ₦74,750.00
  },
  metrics: {
    active_services_count: 2,
    completed_orders_count: 18,
    pending_orders_count: 1,
  },
  recent_orders: [
    {
      id: "ord_01",
      reference: "ORD-2026-0042",
      service_type: "data",
      service_label: "Airtel 5GB Monthly",
      amount: 150000, // ₦1,500.00
      currency: "NGN",
      status: "completed",
      recipient: "08021234567",
      created_at: "2026-11-14T09:30:00Z",
    },
    {
      id: "ord_02",
      reference: "ORD-2026-0041",
      service_type: "airtime",
      service_label: "MTN Airtime Top-Up",
      amount: 200000, // ₦2,000.00
      currency: "NGN",
      status: "completed",
      recipient: "08039876543",
      created_at: "2026-11-13T16:45:00Z",
    },
    {
      id: "ord_03",
      reference: "ORD-2026-0040",
      service_type: "vpn",
      service_label: "WireGuard Fast Tunnel (1 Month)",
      amount: 350000, // ₦3,500.00
      currency: "NGN",
      status: "processing",
      recipient: "vpn-node-lagos-01",
      created_at: "2026-11-13T14:10:00Z",
    },
    {
      id: "ord_04",
      reference: "ORD-2026-0039",
      service_type: "social",
      service_label: "Instagram Engagement Boost",
      amount: 450000, // ₦4,500.00
      currency: "NGN",
      status: "pending",
      recipient: "@korakdigital",
      created_at: "2026-11-12T11:20:00Z",
    },
    {
      id: "ord_05",
      reference: "ORD-2026-0038",
      service_type: "airtime",
      service_label: "Glo Airtime Top-Up",
      amount: 50000, // ₦500.00
      currency: "NGN",
      status: "failed",
      recipient: "08051112233",
      created_at: "2026-11-11T08:05:00Z",
    },
  ],
  recent_transactions: [
    {
      id: "tx_01",
      reference: "TXN-2026-0199",
      direction: "credit",
      type: "wallet_funding",
      description: "Wallet Funding via Card (Paystack)",
      amount: 5000000, // +₦50,000.00
      currency: "NGN",
      balance_after: 4525000,
      created_at: "2026-11-14T09:15:00Z",
    },
    {
      id: "tx_02",
      reference: "TXN-2026-0198",
      direction: "debit",
      type: "order_payment",
      description: "Payment for Order #ORD-2026-0042",
      amount: 150000, // -₦1,500.00
      currency: "NGN",
      balance_after: 4375000,
      created_at: "2026-11-14T09:30:00Z",
    },
    {
      id: "tx_03",
      reference: "TXN-2026-0197",
      direction: "debit",
      type: "order_payment",
      description: "Payment for Order #ORD-2026-0041",
      amount: 200000, // -₦2,000.00
      currency: "NGN",
      balance_after: 4175000,
      created_at: "2026-11-13T16:45:00Z",
    },
    {
      id: "tx_04",
      reference: "TXN-2026-0196",
      direction: "credit",
      type: "order_refund",
      description: "Refund for Failed Order #ORD-2026-0038",
      amount: 50000, // +₦500.00
      currency: "NGN",
      balance_after: 4225000,
      created_at: "2026-11-11T08:10:00Z",
    },
    {
      id: "tx_05",
      reference: "TXN-2026-0195",
      direction: "debit",
      type: "order_payment",
      description: "Payment for Order #ORD-2026-0040",
      amount: 350000, // -₦3,500.00
      currency: "NGN",
      balance_after: 3875000,
      created_at: "2026-11-13T14:10:00Z",
    },
  ],
};

export const MOCK_EMPTY_OVERVIEW_DATA: OverviewData = {
  wallet: {
    balance: 0,
    currency: "NGN",
    ledger_count: 0,
    updated_at: new Date().toISOString(),
  },
  metrics: {
    active_services_count: 0,
    completed_orders_count: 0,
    pending_orders_count: 0,
  },
  recent_orders: [],
  recent_transactions: [],
};
