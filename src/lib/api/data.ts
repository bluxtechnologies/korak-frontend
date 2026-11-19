import { apiClient } from "./client";
import type { ApiResponse, ApiPaginatedResponse, DataBundlePackage } from "./types";

export interface DataService {
  service_code: string; // e.g. "MTN_DATA"
  name: string; // e.g. "MTN Data"
  category: "data";
}

export interface PurchaseDataPayload {
  service_code: string;
  service_name: string;
  category: "data";
  package_code: string;
  customer_identifier: string; // Recipient phone number (e.g. "08060671945")
  amount: number; // in KOBO (integer kobo, e.g. ₦320 = 32000)
  face_amount?: number;
}

export interface DataOrder {
  id: string;
  reference: string;
  provider_reference: string | null;
  category: "data";
  service_code: string;
  service_name: string;
  package_code: string | null;
  customer_identifier: string;
  customer_name?: string | null;
  amount: number; // in kobo
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

export const dataApi = {
  // 1. Get active data network services (MTN Data, Airtel Data, Glo Data, 9mobile Data)
  getNetworks: async (): Promise<DataService[]> => {
    const res = await apiClient.get<ApiResponse<DataService[]>>(
      "/api/v1/bills/services?category=data"
    );
    return res.data.data;
  },

  // 2. Fetch data bundle plans for a carrier using /api/v1/bills/data-bundles
  getDataBundles: async (serviceCode: string): Promise<DataBundlePackage[]> => {
    const res = await apiClient.get<ApiResponse<DataBundlePackage[]>>(
      "/api/v1/bills/data-bundles",
      {
        params: { service_code: serviceCode },
      }
    );
    return res.data.data;
  },

  // 3. Purchase Data Bundle (with Idempotency Key)
  purchaseData: async (
    payload: PurchaseDataPayload,
    idempotencyKey?: string
  ): Promise<DataOrder> => {
    const key =
      idempotencyKey ||
      (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `idem_data_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);

    const res = await apiClient.post<ApiResponse<DataOrder>>(
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

  // 4. Get Data History
  getHistory: async (
    page = 1,
    perPage = 15
  ): Promise<ApiPaginatedResponse<DataOrder>> => {
    const res = await apiClient.get<ApiPaginatedResponse<DataOrder>>(
      "/api/v1/bills/history",
      {
        params: {
          category: "data",
          page,
          per_page: perPage,
        },
      }
    );
    return res.data;
  },
};
