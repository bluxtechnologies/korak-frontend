import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useNotificationCount } from "./useNotificationCount";
import * as notifApi from "./api";

vi.mock("./api", async (importOriginal) => {
  const actual = await importOriginal<typeof notifApi>();
  return {
    ...actual,
    getUnreadCount: vi.fn(),
  };
});

describe("useNotificationCount (F14.1)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches initial unread count on mount", async () => {
    vi.mocked(notifApi.getUnreadCount).mockResolvedValueOnce(4);

    const { result } = renderHook(() =>
      useNotificationCount({ initialCount: 0 })
    );

    await waitFor(() => {
      expect(result.current.unreadCount).toBe(4);
    });
    expect(notifApi.getUnreadCount).toHaveBeenCalledTimes(1);
  });

  it("decrements and resets unread count optimistically", async () => {
    vi.mocked(notifApi.getUnreadCount).mockResolvedValue(3);

    const { result } = renderHook(() =>
      useNotificationCount({ initialCount: 3 })
    );

    await waitFor(() => {
      expect(result.current.unreadCount).toBe(3);
    });

    act(() => {
      result.current.decrementCount(1);
    });
    expect(result.current.unreadCount).toBe(2);

    act(() => {
      result.current.resetCount();
    });
    expect(result.current.unreadCount).toBe(0);
  });

  it("refreshes count on window focus", async () => {
    vi.mocked(notifApi.getUnreadCount)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(5);

    const { result } = renderHook(() =>
      useNotificationCount({ refreshOnFocus: true })
    );

    await waitFor(() => {
      expect(result.current.unreadCount).toBe(2);
    });

    // Simulate window focus event
    act(() => {
      window.dispatchEvent(new Event("focus"));
    });

    await waitFor(() => {
      expect(result.current.unreadCount).toBe(5);
    });
  });
});
