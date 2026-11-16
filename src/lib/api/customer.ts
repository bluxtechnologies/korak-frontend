import { apiClient } from "./client";
import type {
  ApiResponse,
  ApiPaginatedResponse,
  Wallet,
  LedgerEntry,
  FundingRecord,
  BillCategory,
  BillServiceItem,
  DataBundlePackage,
  CustomerValidationResult,
  BillOrder,
  CustomerNotification,
  CustomerProfile,
  CustomerSession,
  SecurityActivity,
  TrustedDevice,
} from "./types";

export const customerApi = {
  // ==========================================
  // Bills & VTU
  // ==========================================
  getBillCategories: async (): Promise<BillCategory[]> => {
    const res = await apiClient.get<ApiResponse<BillCategory[]>>("/api/v1/bills/categories");
    return res.data.data;
  },

  getBillServices: async (category?: string): Promise<BillServiceItem[]> => {
    const res = await apiClient.get<ApiResponse<BillServiceItem[]>>("/api/v1/bills/services", {
      params: category ? { category } : undefined,
    });
    return res.data.data;
  },

  getDataBundles: async (serviceCode: string): Promise<DataBundlePackage[]> => {
    const res = await apiClient.get<ApiResponse<DataBundlePackage[]>>("/api/v1/bills/data-bundles", {
      params: { service_code: serviceCode },
    });
    return res.data.data;
  },

  validateCustomerIdentifier: async (payload: {
    service_code: string;
    customer_identifier: string;
  }): Promise<CustomerValidationResult> => {
    const res = await apiClient.post<ApiResponse<CustomerValidationResult>>("/api/v1/bills/validate", payload);
    return res.data.data;
  },

  payBill: async (
    payload: {
      service_code: string;
      service_name: string;
      category: string;
      customer_identifier: string;
      customer_name?: string;
      package_code?: string;
      amount: number; // in kobo
      face_amount?: number; // in kobo
    },
    idempotencyKey?: string
  ): Promise<BillOrder> => {
    const headers = idempotencyKey ? { "Idempotency-Key": idempotencyKey } : undefined;
    const res = await apiClient.post<ApiResponse<BillOrder>>("/api/v1/bills/pay", payload, { headers });
    return res.data.data;
  },

  getBillHistory: async (params?: {
    category?: string;
    status?: string;
    per_page?: number;
    page?: number;
  }): Promise<ApiPaginatedResponse<BillOrder>> => {
    const res = await apiClient.get<ApiPaginatedResponse<BillOrder>>("/api/v1/bills/history", { params });
    return res.data;
  },

  getBillOrder: async (referenceOrUlid: string): Promise<BillOrder> => {
    const res = await apiClient.get<ApiResponse<BillOrder>>(`/api/v1/bills/${referenceOrUlid}`);
    return res.data.data;
  },

  // ==========================================
  // Wallet
  // ==========================================
  getWallet: async (): Promise<Wallet> => {
    const res = await apiClient.get<ApiResponse<Wallet>>("/api/v1/wallet");
    return res.data.data;
  },

  initiateFunding: async (payload: {
    amount: number; // in kobo
    redirect_url?: string;
  }): Promise<FundingRecord> => {
    const res = await apiClient.post<ApiResponse<FundingRecord>>("/api/v1/wallet/fund", payload);
    return res.data.data;
  },

  getFundingStatus: async (referenceOrUlid: string): Promise<FundingRecord> => {
    const res = await apiClient.get<ApiResponse<FundingRecord>>(`/api/v1/wallet/fund/${referenceOrUlid}`);
    return res.data.data;
  },

  getTransactions: async (params?: {
    direction?: "credit" | "debit";
    type?: string;
    search?: string;
    per_page?: number;
    page?: number;
  }): Promise<ApiPaginatedResponse<LedgerEntry>> => {
    const res = await apiClient.get<ApiPaginatedResponse<LedgerEntry>>("/api/v1/wallet/transactions", { params });
    return res.data;
  },

  // ==========================================
  // Notifications
  // ==========================================
  getNotifications: async (params?: {
    unread?: boolean;
    per_page?: number;
    page?: number;
  }): Promise<ApiPaginatedResponse<CustomerNotification>> => {
    const res = await apiClient.get<ApiPaginatedResponse<CustomerNotification>>("/api/v1/notifications", { params });
    return res.data;
  },

  getUnreadNotificationsCount: async (): Promise<number> => {
    const res = await apiClient.get<ApiResponse<{ unread_count: number }>>("/api/v1/notifications/unread-count");
    return res.data.data.unread_count;
  },

  markNotificationAsRead: async (id: string, read = true): Promise<CustomerNotification> => {
    const res = await apiClient.patch<ApiResponse<CustomerNotification>>(`/api/v1/notifications/${id}`, { read });
    return res.data.data;
  },

  markAllNotificationsAsRead: async (): Promise<void> => {
    await apiClient.post("/api/v1/notifications/read-all");
  },

  // ==========================================
  // Profile & Security
  // ==========================================
  getProfile: async (): Promise<CustomerProfile> => {
    const res = await apiClient.get<ApiResponse<CustomerProfile>>("/api/v1/profile");
    return res.data.data;
  },

  updateProfile: async (payload: { username?: string; email?: string }): Promise<CustomerProfile> => {
    const res = await apiClient.patch<ApiResponse<CustomerProfile>>("/api/v1/profile", payload);
    return res.data.data;
  },

  changePassword: async (payload: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }): Promise<void> => {
    await apiClient.put("/api/v1/profile/password", payload);
  },

  getSessions: async (): Promise<CustomerSession[]> => {
    const res = await apiClient.get<ApiResponse<CustomerSession[]>>("/api/v1/profile/sessions");
    return res.data.data;
  },

  revokeSession: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/profile/sessions/${id}`);
  },

  revokeOtherSessions: async (): Promise<void> => {
    await apiClient.delete("/api/v1/profile/sessions/other");
  },

  getSecurityActivity: async (): Promise<SecurityActivity[]> => {
    const res = await apiClient.get<ApiResponse<SecurityActivity[]>>("/api/v1/profile/security-activity");
    return res.data.data;
  },

  getTrustedDevices: async (): Promise<TrustedDevice[]> => {
    const res = await apiClient.get<ApiResponse<TrustedDevice[]>>("/api/v1/auth/devices");
    return res.data.data;
  },

  revokeTrustedDevice: async (ulid: string): Promise<void> => {
    await apiClient.delete(`/api/v1/auth/devices/${ulid}`);
  },

  revokeAllTrustedDevices: async (): Promise<void> => {
    await apiClient.delete("/api/v1/auth/devices");
  },
};
