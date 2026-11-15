/**
 * Notifications API service and data models (F14).
 * Follows docs/11-notification-system.md §5 and docs/06-api-standards.md.
 */
import { api } from "@/lib/api";
import { unwrapApiResponse } from "@/lib/api/errors";
import type {
  ApiPaginatedResponse,
  ApiResponse,
} from "@/lib/api/types";

// ---------------------------------------------------------------------------
// Types & Models (F14)
// ---------------------------------------------------------------------------

export type NotificationCategory = "security" | "commerce" | "system";

export interface AppNotification {
  id: string;
  type: string;
  category: NotificationCategory;
  title: string;
  message: string;
  action_url?: string;
  read_at: string | null;
  created_at: string;
}

export interface UnreadCountData {
  unread_count: number;
}

export interface NotificationsQueryParams {
  page?: number;
  per_page?: number;
  read?: boolean;
}

// ---------------------------------------------------------------------------
// API Methods
// ---------------------------------------------------------------------------

/**
 * Fetches paginated in-app notifications, optionally filtered by read status.
 */
export async function getNotifications(
  params?: NotificationsQueryParams
): Promise<ApiPaginatedResponse<AppNotification>> {
  const queryParams: Record<string, string | number | boolean | undefined> = {};

  if (params?.page) queryParams.page = params.page;
  if (params?.per_page) queryParams.per_page = params.per_page;
  if (params?.read !== undefined) queryParams["filter[read]"] = params.read;

  const response = await api.get<ApiPaginatedResponse<AppNotification>>(
    "/api/v1/notifications",
    { params: queryParams }
  );

  return response;
}

/**
 * Fetches the current user's unread notification count.
 */
export async function getUnreadCount(): Promise<number> {
  const response = await api.get<ApiResponse<UnreadCountData>>(
    "/api/v1/notifications/unread-count"
  );
  const data = unwrapApiResponse(response);
  return data.unread_count;
}

/**
 * Marks a specific notification as read.
 */
export async function markNotificationAsRead(
  notificationId: string
): Promise<AppNotification> {
  const response = await api.patch<ApiResponse<AppNotification>>(
    `/api/v1/notifications/${encodeURIComponent(notificationId)}`
  );
  return unwrapApiResponse(response);
}

/**
 * Marks all notifications for the current customer as read.
 */
export async function markAllNotificationsAsRead(): Promise<{
  message: string;
  marked_count: number;
}> {
  const response = await api.post<
    ApiResponse<{ message: string; marked_count: number }>
  >("/api/v1/notifications/read-all");
  return unwrapApiResponse(response);
}

// ---------------------------------------------------------------------------
// Realistic Mock Fixtures
// ---------------------------------------------------------------------------

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif_01",
    type: "order.completed",
    category: "commerce",
    title: "Data Top-Up Successful",
    message: "Your Airtel 5GB Monthly bundle has been credited to 08021234567.",
    action_url: "/orders",
    read_at: null,
    created_at: "2026-11-14T10:15:00Z",
  },
  {
    id: "notif_02",
    type: "device.verified",
    category: "security",
    title: "New Device Verified",
    message: "A new login from Chrome on Windows was successfully verified via OTP.",
    action_url: "/settings",
    read_at: null,
    created_at: "2026-11-14T09:12:00Z",
  },
  {
    id: "notif_03",
    type: "wallet.funded",
    category: "commerce",
    title: "Wallet Credited",
    message: "Your wallet was credited with ₦50,000.00 via Card funding.",
    action_url: "/transactions",
    read_at: null,
    created_at: "2026-11-14T08:30:00Z",
  },
  {
    id: "notif_04",
    type: "password.changed",
    category: "security",
    title: "Password Updated",
    message: "Your account password was updated successfully from your profile settings.",
    action_url: "/settings",
    read_at: "2026-11-13T18:00:00Z",
    created_at: "2026-11-13T17:55:00Z",
  },
  {
    id: "notif_05",
    type: "order.failed",
    category: "commerce",
    title: "Order Refund Processed",
    message: "Glo Airtime top-up failed. ₦500.00 has been refunded to your wallet.",
    action_url: "/orders",
    read_at: "2026-11-12T14:00:00Z",
    created_at: "2026-11-12T13:45:00Z",
  },
];
