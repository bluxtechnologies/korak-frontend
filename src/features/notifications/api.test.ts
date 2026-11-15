import { describe, expect, it, vi, beforeEach } from "vitest";
import { api } from "@/lib/api";
import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  MOCK_NOTIFICATIONS,
} from "./api";

vi.mock("@/lib/api", () => ({
  api: {
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
  },
}));

describe("notifications api (F14)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches paginated notifications with optional read filter", async () => {
    const mockResponse = {
      data: MOCK_NOTIFICATIONS,
      meta: {
        current_page: 1,
        per_page: 15,
        total: 5,
        last_page: 1,
      },
    };
    vi.mocked(api.get).mockResolvedValueOnce(mockResponse);

    const result = await getNotifications({ page: 1, read: false });

    expect(api.get).toHaveBeenCalledWith("/api/v1/notifications", {
      params: { page: 1, "filter[read]": false },
    });
    expect(result.data).toHaveLength(5);
  });

  it("fetches unread notification count", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: { unread_count: 3 },
    });

    const count = await getUnreadCount();

    expect(api.get).toHaveBeenCalledWith("/api/v1/notifications/unread-count");
    expect(count).toBe(3);
  });

  it("marks a notification as read", async () => {
    const updated = {
      ...MOCK_NOTIFICATIONS[0],
      read_at: new Date().toISOString(),
    };
    vi.mocked(api.patch).mockResolvedValueOnce({
      data: updated,
    });

    const result = await markNotificationAsRead("notif_01");

    expect(api.patch).toHaveBeenCalledWith("/api/v1/notifications/notif_01");
    expect(result.read_at).toBeTruthy();
  });

  it("marks all notifications as read", async () => {
    vi.mocked(api.post).mockResolvedValueOnce({
      data: { message: "All notifications marked as read", marked_count: 3 },
    });

    const result = await markAllNotificationsAsRead();

    expect(api.post).toHaveBeenCalledWith("/api/v1/notifications/read-all");
    expect(result.marked_count).toBe(3);
  });
});
