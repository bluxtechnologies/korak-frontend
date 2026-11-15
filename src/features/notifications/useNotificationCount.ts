"use client";

import * as React from "react";
import { getUnreadCount } from "./api";

export interface UseNotificationCountOptions {
  /** Initial count to avoid layout shift (defaults to 0) */
  initialCount?: number;
  /** Polling interval in ms (defaults to 60000ms / 60 seconds) */
  pollIntervalMs?: number;
  /** Whether to enable automatic window focus refresh per Doc 11 §7 */
  refreshOnFocus?: boolean;
}

/**
 * useNotificationCount (F14.1).
 * Tracks customer unread notification count, refreshing on window focus
 * and on a background polling interval per docs/11-notification-system.md §7.
 */
export function useNotificationCount({
  initialCount = 0,
  pollIntervalMs = 60000,
  refreshOnFocus = true,
}: UseNotificationCountOptions = {}) {
  const [unreadCount, setUnreadCount] = React.useState<number>(initialCount);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const refreshCount = React.useCallback(() => {
    setIsLoading(true);
    return getUnreadCount()
      .then((count) => {
        setUnreadCount(count);
      })
      .catch(() => {})
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  React.useEffect(() => {
    let ignore = false;

    // Initial fetch without synchronous setState
    getUnreadCount()
      .then((count) => {
        if (!ignore) setUnreadCount(count);
      })
      .catch(() => {});

    // Window focus refresh per Doc 11 §7
    const handleFocus = () => {
      getUnreadCount()
        .then((count) => {
          if (!ignore) setUnreadCount(count);
        })
        .catch(() => {});
    };

    if (refreshOnFocus && typeof window !== "undefined") {
      window.addEventListener("focus", handleFocus);
    }

    // Polling interval per Doc 11 §7
    let intervalId: NodeJS.Timeout | null = null;
    if (pollIntervalMs > 0) {
      intervalId = setInterval(() => {
        getUnreadCount()
          .then((count) => {
            if (!ignore) setUnreadCount(count);
          })
          .catch(() => {});
      }, pollIntervalMs);
    }

    return () => {
      ignore = true;
      if (refreshOnFocus && typeof window !== "undefined") {
        window.removeEventListener("focus", handleFocus);
      }
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [refreshOnFocus, pollIntervalMs]);

  const decrementCount = React.useCallback((by: number = 1) => {
    setUnreadCount((prev) => Math.max(0, prev - by));
  }, []);

  const resetCount = React.useCallback(() => {
    setUnreadCount(0);
  }, []);

  return {
    unreadCount,
    isLoading,
    refreshCount,
    decrementCount,
    resetCount,
    setUnreadCount,
  };
}
