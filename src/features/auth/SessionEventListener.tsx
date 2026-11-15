"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { onSessionExpired } from "@/lib/api/events";
import { ROUTES } from "@/config/navigation";

/**
 * Listens for session expiration events (HTTP 401 or CSRF mismatch 419)
 * emitted by the API client layer (F4.5 / Doc 04 §4).
 * Redirects the user to the Session Expired screen while preserving their intended URL.
 */
export function SessionEventListener() {
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    const unsubscribe = onSessionExpired((payload) => {
      const current =
        payload.intendedPath ||
        (typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`
          : pathname);

      if (
        !current ||
        current.startsWith(ROUTES.LOGIN) ||
        current.startsWith(ROUTES.REGISTER) ||
        current.startsWith(ROUTES.SESSION_EXPIRED) ||
        current.startsWith(ROUTES.FORGOT_PASSWORD) ||
        current.startsWith(ROUTES.RESET_PASSWORD) ||
        current.startsWith(ROUTES.VERIFY_DEVICE)
      ) {
        return;
      }

      const intendedParam = encodeURIComponent(current);
      router.push(`${ROUTES.SESSION_EXPIRED}?intended=${intendedParam}`);
    });

    return () => {
      unsubscribe();
    };
  }, [router, pathname]);

  return null;
}
