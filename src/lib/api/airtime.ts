import { apiClient } from "./client";
import type { ApiResponse, ApiPaginatedResponse } from "./types";

export interface AirtimeService {
  service_code: string; // e.g. "MTN_AIRTIME"
  name: string; // e.g. "MTN Airtime"
  category: "airtime";
}

export interface PurchaseAirtimePayload {
  service_code: string;
  service_name: string;
  category: "airtime";
  customer_identifier: string; // Recipient phone number (e.g. "08060671945")
  amount: number; // In KOBO (e.g. 500 NGN = 50000)
  face_amount?: number; // Nominal price in kobo (if omitted, defaults to amount)
}

export interface AirtimeOrder {
  id: string;
  reference: string;
  provider_reference: string | null;
  category: "airtime";
  service_code: string;
  service_name: string;
  package_code?: string | null;
  customer_identifier: string;
  customer_name?: string | null;
  amount: number; // In KOBO
  amount_formatted: string;
  face_amount?: number;
  face_amount_formatted?: string;
  discount_amount?: number;
  currency?: string;
  status: "completed" | "processing" | "failed" | "pending";
  token?: string | null;
  metadata?: Record<string, unknown>;
  processed_at?: string | null;
  created_at: string;
}

export const airtimeApi = {
  // 1. Get active networks (MTN, Airtel, Glo, 9mobile)
  getNetworks: async (): Promise<AirtimeService[]> => {
    const res = await apiClient.get<ApiResponse<AirtimeService[]>>(
      "/api/v1/bills/services?category=airtime"
    );
    return res.data.data;
  },

  // 2. Buy Airtime (with Idempotency Key)
  purchaseAirtime: async (
    payload: PurchaseAirtimePayload,
    idempotencyKey?: string
  ): Promise<AirtimeOrder> => {
    // Generate UUIDv4 to protect against rapid double-clicks
    const key =
      idempotencyKey ||
      (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `idem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);

    const res = await apiClient.post<ApiResponse<AirtimeOrder>>(
      "/api/v1/bills/pay",
      payload,
      {
        headers: {
          "Idempotency-Key": key,
        },
      }
    );
    return res.data.data;
  },

  // 3. Get Airtime History
  getHistory: async (
    page = 1,
    perPage = 15
  ): Promise<ApiPaginatedResponse<AirtimeOrder>> => {
    const res = await apiClient.get<ApiPaginatedResponse<AirtimeOrder>>(
      "/api/v1/bills/history",
      {
        params: {
          category: "airtime",
          page,
          per_page: perPage,
        },
      }
    );
    return res.data;
  },
};
