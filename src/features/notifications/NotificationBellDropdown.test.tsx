import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { NotificationBellDropdown } from "./NotificationBellDropdown";
import * as notifApi from "./api";

vi.mock("./api", async (importOriginal) => {
  const actual = await importOriginal<typeof notifApi>();
  return {
    ...actual,
    getNotifications: vi.fn(),
    getUnreadCount: vi.fn(),
    markNotificationAsRead: vi.fn(),
    markAllNotificationsAsRead: vi.fn(),
  };
});

describe("NotificationBellDropdown (F14.1 & F14.2)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(notifApi.getUnreadCount).mockResolvedValue(2);
    vi.mocked(notifApi.getNotifications).mockResolvedValue({
      data: notifApi.MOCK_NOTIFICATIONS,
      meta: { current_page: 1, per_page: 5, total: 5, last_page: 1 },
    });
  });

  it("renders notification bell with unread count badge", async () => {
    render(<NotificationBellDropdown initialUnreadCount={2} />);

    await waitFor(() => {
      expect(screen.getByTestId("notification-badge-count")).toHaveTextContent(
        "2"
      );
    });

    const trigger = screen.getByTestId("notification-bell-trigger");
    expect(trigger).toHaveAttribute(
      "aria-label",
      "Notifications (2 unread)"
    );
  });

  it("opens dropdown preview and lists recent notifications", async () => {
    const user = userEvent.setup();
    render(<NotificationBellDropdown initialUnreadCount={2} />);

    const trigger = screen.getByTestId("notification-bell-trigger");
    await user.click(trigger);

    expect(
      await screen.findByTestId("notification-dropdown-content")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Data Top-Up Successful")
    ).toBeInTheDocument();
    expect(
      screen.getByText("New Device Verified")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /view all notifications/i })
    ).toBeInTheDocument();
  });

  it("marks a notification as read and decrements unread count", async () => {
    const user = userEvent.setup();
    vi.mocked(notifApi.markNotificationAsRead).mockResolvedValueOnce({
      ...notifApi.MOCK_NOTIFICATIONS[0],
      read_at: new Date().toISOString(),
    });

    render(
      <NotificationBellDropdown
        initialNotifications={notifApi.MOCK_NOTIFICATIONS}
        initialUnreadCount={2}
      />
    );

    await user.click(screen.getByTestId("notification-bell-trigger"));

    const markReadBtn = await screen.findByRole("button", {
      name: /mark "data top-up successful" as read/i,
    });
    await user.click(markReadBtn);

    await waitFor(() => {
      expect(notifApi.markNotificationAsRead).toHaveBeenCalledWith("notif_01");
      expect(screen.getByTestId("notification-badge-count")).toHaveTextContent(
        "1"
      );
    });
  });

  it("marks all notifications as read", async () => {
    const user = userEvent.setup();
    vi.mocked(notifApi.markAllNotificationsAsRead).mockResolvedValueOnce({
      message: "All notifications marked as read",
      marked_count: 2,
    });

    render(
      <NotificationBellDropdown
        initialNotifications={notifApi.MOCK_NOTIFICATIONS}
        initialUnreadCount={2}
      />
    );

    await user.click(screen.getByTestId("notification-bell-trigger"));

    const markAllBtn = await screen.findByTestId("mark-all-read-btn");
    await user.click(markAllBtn);

    await waitFor(() => {
      expect(notifApi.markAllNotificationsAsRead).toHaveBeenCalledTimes(1);
      expect(
        screen.queryByTestId("notification-badge-count")
      ).not.toBeInTheDocument();
    });
  });
});
