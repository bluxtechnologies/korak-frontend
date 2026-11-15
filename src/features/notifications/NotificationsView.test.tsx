import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { NotificationsView } from "./NotificationsView";
import * as notifApi from "./api";

vi.mock("./api", async (importOriginal) => {
  const actual = await importOriginal<typeof notifApi>();
  return {
    ...actual,
    getNotifications: vi.fn(),
    markNotificationAsRead: vi.fn(),
    markAllNotificationsAsRead: vi.fn(),
  };
});

describe("NotificationsView (F14.3)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with initial notifications without loading state", () => {
    render(
      <NotificationsView initialNotifications={notifApi.MOCK_NOTIFICATIONS} />
    );

    expect(screen.getByTestId("notifications-view")).toBeInTheDocument();
    expect(screen.getByText("Data Top-Up Successful")).toBeInTheDocument();
    expect(screen.getByText("New Device Verified")).toBeInTheDocument();
  });

  it("filters unread notifications when clicking Unread tab", async () => {
    const user = userEvent.setup();
    render(
      <NotificationsView initialNotifications={notifApi.MOCK_NOTIFICATIONS} />
    );

    const unreadTab = screen.getByTestId("filter-unread-tab");
    await user.click(unreadTab);

    // Unread items should be visible
    expect(screen.getByText("Data Top-Up Successful")).toBeInTheDocument();
    expect(screen.getByText("New Device Verified")).toBeInTheDocument();

    // Read item should not be shown
    expect(screen.queryByText("Password Updated")).not.toBeInTheDocument();
  });

  it("marks an unread notification as read on the full page", async () => {
    const user = userEvent.setup();
    vi.mocked(notifApi.markNotificationAsRead).mockResolvedValueOnce({
      ...notifApi.MOCK_NOTIFICATIONS[0],
      read_at: new Date().toISOString(),
    });

    render(
      <NotificationsView initialNotifications={notifApi.MOCK_NOTIFICATIONS} />
    );

    const markReadBtn = screen.getByRole("button", {
      name: /mark "data top-up successful" as read/i,
    });
    await user.click(markReadBtn);

    await waitFor(() => {
      expect(notifApi.markNotificationAsRead).toHaveBeenCalledWith("notif_01");
    });
  });

  it("renders empty state when there are no notifications", () => {
    render(<NotificationsView initialNotifications={[]} />);

    expect(screen.getByText("No notifications")).toBeInTheDocument();
  });
});
