/**
 * Orders & Digital Service Deliveries API service & models.
 * Follows docs/14-wallet-and-payments.md and docs/09-frontend-standards.md.
 */
import { api } from "@/lib/api";
import { unwrapApiResponse } from "@/lib/api/errors";
import { customerApi } from "@/lib/api/customer";
import type { ApiResponse } from "@/lib/api/types";

export type OrderStatus =
  | "active"
  | "processing"
  | "completed"
  | "refunded"
  | "cancelled"
  | "failed"
  | "pending";

export type OrderCategory =
  | "data"
  | "airtime"
  | "numbers_otp"
  | "numbers_rent"
  | "vpn"
  | "social";

export interface OrderCredentials {
  code?: string;
  telecom_reference?: string;
  server_endpoint?: string;
  account_handle?: string;
  login_username?: string;
  login_password?: string;
  recovery_email?: string;
  target_link?: string;
  notes?: string;
}

export interface OrderRecord {
  id: string;
  reference: string;
  category: OrderCategory;
  service_name: string;
  beneficiary: string;
  amount: number; // integer minor units (e.g. kobo for NGN)
  currency: string;
  status: OrderStatus;
  created_at: string;
  fee?: number; // minor units (0 by default)
  payment_method?: string; // "KORAK Wallet" by default
  provider?: string;
  package_details?: string;
  completed_at?: string;
  failure_reason?: string;
  credentials?: OrderCredentials;
}

export interface OrderStats {
  total: number;
  completed: number;
  processing: number;
  failed: number;
}

export function calculateOrderStats(orders: OrderRecord[]): OrderStats {
  const safe = orders || [];
  return {
    total: safe.length,
    completed: safe.filter((o) => o.status === "completed").length,
    processing: safe.filter(
      (o) => o.status === "processing" || o.status === "active" || o.status === "pending"
    ).length,
    failed: safe.filter(
      (o) => o.status === "failed" || o.status === "cancelled" || o.status === "refunded"
    ).length,
  };
}

export interface OrdersQueryParams {
  status?: string;
  category?: string;
  search?: string;
  page?: number;
}

export const MOCK_ORDER_RECORDS: OrderRecord[] = [
  {
    id: "ord_01",
    reference: "ORD-84920412",
    category: "data",
    service_name: "MTN 2.5GB SME Data (30 Days)",
    beneficiary: "08031234567",
    amount: 75000, // ₦750.00
    currency: "NGN",
    status: "completed",
    created_at: "2026-11-15T09:42:00Z",
    credentials: {
      telecom_reference: "MTN-SME-9021841",
      notes: "Direct SME data bundle loaded successfully to beneficiary.",
    },
  },
  {
    id: "ord_02",
    reference: "ORD-84920398",
    category: "numbers_otp",
    service_name: "WhatsApp SMS Verification (USA)",
    beneficiary: "+1 (205) 555-0192",
    amount: 120000, // ₦1,200.00
    currency: "NGN",
    status: "completed",
    created_at: "2026-11-15T08:15:00Z",
    credentials: {
      code: "492-019",
      notes: "Received verification SMS code for WhatsApp registration.",
    },
  },
  {
    id: "ord_03",
    reference: "ORD-84920350",
    category: "numbers_rent",
    service_name: "Telegram Rental Number (UK 24h)",
    beneficiary: "+44 7700 900142",
    amount: 250000, // ₦2,500.00
    currency: "NGN",
    status: "active",
    created_at: "2026-11-15T07:30:00Z",
    credentials: {
      notes: "Rental line is online and actively receiving incoming SMS verification codes.",
    },
  },
  {
    id: "ord_04",
    reference: "ORD-84920288",
    category: "airtime",
    service_name: "Airtel ₦2,000 Airtime VTU",
    beneficiary: "08029876543",
    amount: 196000, // ₦1,960.00 (2% discount)
    currency: "NGN",
    status: "completed",
    created_at: "2026-11-14T18:20:00Z",
    credentials: {
      telecom_reference: "AIRTEL-VTU-8812903",
      notes: "Recharge confirmed by carrier network gateway.",
    },
  },
  {
    id: "ord_05",
    reference: "ORD-84920194",
    category: "numbers_otp",
    service_name: "OpenAI / ChatGPT SMS Verification",
    beneficiary: "+1 (312) 555-0144",
    amount: 150000, // ₦1,500.00
    currency: "NGN",
    status: "completed",
    created_at: "2026-11-14T14:10:00Z",
    credentials: {
      code: "810-394",
      notes: "Received verification code from OpenAI.",
    },
  },
  {
    id: "ord_06",
    reference: "ORD-84920110",
    category: "vpn",
    service_name: "WireGuard Fast Tunnel (30 Days)",
    beneficiary: "vpn-gw-01.korak.net",
    amount: 350000, // ₦3,500.00
    currency: "NGN",
    status: "completed",
    created_at: "2026-11-13T12:00:00Z",
    credentials: {
      server_endpoint: "lon01.korakvpn.net:51820",
      notes: "Configuration active. High-bandwidth dedicated egress IP assigned.",
    },
  },
  {
    id: "ord_07",
    reference: "ORD-84920045",
    category: "data",
    service_name: "Glo 10GB Corporate Gifting",
    beneficiary: "08051112233",
    amount: 280000, // ₦2,800.00
    currency: "NGN",
    status: "processing",
    created_at: "2026-11-15T10:05:00Z",
    credentials: {
      notes: "Order dispatched to telecom gateway. Waiting for network confirmation.",
    },
  },
  {
    id: "ord_08",
    reference: "ORD-84919920",
    category: "social",
    service_name: "Verified X (Twitter) Creator Account",
    beneficiary: "@techpulse_hub",
    amount: 5200000, // ₦52,000.00
    currency: "NGN",
    status: "completed",
    created_at: "2026-11-15T11:20:00Z",
    credentials: {
      account_handle: "techpulse_hub",
      login_username: "techpulse_hub",
      login_password: "••••••••••••",
      recovery_email: "kor••••@proton.me",
      notes: "Account handed over under escrow guarantee. Master credentials delivered.",
    },
  },
  {
    id: "ord_09",
    reference: "ORD-84919850",
    category: "social",
    service_name: "Instagram Post Likes (Instant Delivery)",
    beneficiary: "https://www.instagram.com/p/C091bA8xYz/",
    amount: 190000, // ₦1,900.00 (2,000 likes)
    currency: "NGN",
    status: "completed",
    created_at: "2026-11-15T10:45:00Z",
    credentials: {
      target_link: "https://www.instagram.com/p/C091bA8xYz/",
      notes: "2,000 post likes delivered within 25 minutes.",
    },
  },
  {
    id: "ord_10",
    reference: "ORD-84919712",
    category: "airtime",
    service_name: "9mobile ₦1,000 Airtime VTU",
    beneficiary: "08091234567",
    amount: 100000, // ₦1,000.00
    currency: "NGN",
    status: "failed",
    created_at: "2026-11-14T09:12:00Z",
    failure_reason: "Telecom network gateway timed out. Debited amount refunded to wallet.",
    credentials: {
      notes: "Failed during carrier handoff. Automatic refund completed.",
    },
  },
];

/**
 * Fetches user orders from `/api/v1/orders` or Doc 25 `/api/v1/bills/history`.
 * Cleanly returns empty list when no orders exist without falling back to mock fixtures.
 */
export async function getOrders(params?: OrdersQueryParams): Promise<OrderRecord[]> {
  try {
    const response = await api.get<ApiResponse<OrderRecord[]> | { data: OrderRecord[] }>("/api/v1/orders", {
      params: params as Record<string, string | number | boolean>,
    });
    if ("data" in response && Array.isArray((response as { data: OrderRecord[] }).data)) {
      return (response as { data: OrderRecord[] }).data;
    }
    return unwrapApiResponse(response as ApiResponse<OrderRecord[]>);
  } catch {
    try {
      // Connect to Doc 25 bills history endpoint (/api/v1/bills/history)
      const history = await customerApi.getBillHistory({
        status: params?.status,
        category: params?.category,
        page: params?.page,
      });

      return (history.data || []).map((bill) => ({
        id: bill.id,
        reference: bill.reference,
        category: (bill.category as OrderCategory) || "data",
        service_name: bill.service_name,
        beneficiary: bill.customer_identifier,
        amount: bill.amount,
        currency: "NGN",
        status:
          bill.status === "completed"
            ? "completed"
            : bill.status === "failed"
            ? "cancelled"
            : "processing",
        created_at: bill.created_at,
      }));
    } catch {
      // Return empty list for accounts with no orders — NEVER mock fixtures
      return [];
    }
  }
}

export const MOCK_ORDERS = MOCK_ORDER_RECORDS;

