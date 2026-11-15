import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { connection } from "next/server";
import { serverApi } from "@/lib/api/server";
import { unwrapApiResponse } from "@/lib/api/errors";
import { ApiClientError } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/types";
import type { AuthUser } from "./api";
import { ROUTES } from "@/config/navigation";

function isPublicAuthPath(pathname: string): boolean {
  return (
    pathname.startsWith(ROUTES.LOGIN) ||
    pathname.startsWith(ROUTES.REGISTER) ||
    pathname.startsWith(ROUTES.SESSION_EXPIRED) ||
    pathname.startsWith(ROUTES.FORGOT_PASSWORD) ||
    pathname.startsWith(ROUTES.RESET_PASSWORD) ||
    pathname.startsWith(ROUTES.VERIFY_DEVICE)
  );
}

export function isNextRedirectError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    ((error as { digest: string }).digest.startsWith("NEXT_REDIRECT") ||
      (error as { digest: string }).digest.startsWith("NEXT_NOT_FOUND"))
  );
}

/**
 * Verifies the customer session on the server via GET /api/v1/auth/me per Doc 04 §6.
 * Called in Server Components (e.g. (dashboard)/layout.tsx) before rendering protected pages.
 *
 * Handling per Doc 04 §4:
 * - 401: Session missing or expired -> redirects to Session Expired page preserving intended path
 * - 423: Account locked -> redirects to login with locked notice
 * - Valid: Returns verified AuthUser
 */
export async function requireAuthUser(intendedPath?: string): Promise<AuthUser> {
  try {
    await connection();
  } catch {
    // headers()/connection() might throw in test or non-request environments
  }

  let resolvedIntended = intendedPath || ROUTES.OVERVIEW;

  try {
    const incomingHeaders = await headers();
    const referer = incomingHeaders.get("referer");
    if (!intendedPath && referer) {
      try {
        const url = new URL(referer);
        if (
          url.pathname &&
          url.pathname.startsWith("/") &&
          !isPublicAuthPath(url.pathname)
        ) {
          resolvedIntended = `${url.pathname}${url.search}`;
        }
      } catch {
        // Ignore invalid referer URLs
      }
    }
  } catch {
    // headers() might throw in environments without request context (e.g., unit test mocks)
  }

  try {
    const raw = await serverApi.get<ApiResponse<AuthUser>>("/api/v1/auth/me");
    return unwrapApiResponse(raw);
  } catch (error) {
    if (isNextRedirectError(error)) {
      throw error;
    }

    if (error instanceof ApiClientError) {
      const status = error.status ?? (error as { statusCode?: number }).statusCode;
      if (status === 401) {
        // Session missing or expired (Doc 04 §4)
        const intendedParam = encodeURIComponent(resolvedIntended);
        redirect(`${ROUTES.SESSION_EXPIRED}?intended=${intendedParam}`);
      }

      if (status === 423) {
        // Account locked (Doc 04 §4)
        redirect(`${ROUTES.LOGIN}?locked=true`);
      }
    }

    // Rethrow to let error boundary handle 500 or unexpected exceptions
    throw error;
  }
}
