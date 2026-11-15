import { headers } from "next/headers";
import { connection } from "next/server";
import { apiClient } from "./client";
import { ApiRequestOptions } from "./types";

function extractXsrfFromCookieString(cookieStr: string): string | null {
  const match = cookieStr.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

/**
 * Resolves incoming headers from Next.js Server Components / Server Actions.
 * Safely forwards Cookie, Origin, and Referer to Laravel Sanctum so that
 * requests from Server Components are recognized as stateful and authenticated
 * per docs/04-system-architecture-and-auth-flow.md §6.
 */
export async function getServerForwardHeaders(): Promise<Headers> {
  const forwarded = new Headers();

  try {
    await connection();
  } catch {
    // inside tests or non-request contexts
  }

  try {
    const incomingHeaders = await headers();

    const cookie = incomingHeaders.get("cookie");
    if (cookie) {
      forwarded.set("Cookie", cookie);
      const xsrf = extractXsrfFromCookieString(cookie);
      if (xsrf) {
        forwarded.set("X-XSRF-TOKEN", xsrf);
      }
    }

    const host = incomingHeaders.get("host");
    const forwardedHost = incomingHeaders.get("x-forwarded-host") || host;
    const proto = incomingHeaders.get("x-forwarded-proto") || "http";

    const defaultOrigin = forwardedHost
      ? `${proto}://${forwardedHost}`
      : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const origin = incomingHeaders.get("origin") || defaultOrigin;
    const referer = incomingHeaders.get("referer") || `${origin}/`;

    forwarded.set("Origin", origin);
    forwarded.set("Referer", referer);

    const requestId =
      incomingHeaders.get("x-request-id") ||
      incomingHeaders.get("X-Request-ID");
    if (requestId) {
      forwarded.set("X-Request-ID", requestId);
    }
  } catch {
    // If called outside of an active HTTP request context (e.g., static generation or tests),
    // fallback to default frontend origin
    const defaultOrigin =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    forwarded.set("Origin", defaultOrigin);
    forwarded.set("Referer", `${defaultOrigin}/`);
  }

  return forwarded;
}

/**
 * Server Component / Server Action API client.
 * Forwards Cookie, Origin, Referer, X-XSRF-TOKEN, and X-Request-ID headers so
 * Sanctum recognizes the server-side session without failing CORS or stateful checks.
 */
export async function serverApiClient<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const forwardedHeaders = await getServerForwardHeaders();

  // Merge forwarded headers with any custom headers passed in options
  const customHeaders = new Headers(options.headers);
  forwardedHeaders.forEach((value, key) => {
    if (!customHeaders.has(key)) {
      customHeaders.set(key, value);
    }
  });

  return apiClient<T>(endpoint, {
    ...options,
    headers: customHeaders,
    skipCsrf: options.skipCsrf ?? true,
    skipSessionEvent: options.skipSessionEvent ?? true,
  });
}

export const serverApi = {
  get: <T>(endpoint: string, options?: ApiRequestOptions) =>
    serverApiClient<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: unknown, options?: ApiRequestOptions) =>
    serverApiClient<T>(endpoint, { ...options, method: "POST", body }),

  put: <T>(endpoint: string, body?: unknown, options?: ApiRequestOptions) =>
    serverApiClient<T>(endpoint, { ...options, method: "PUT", body }),

  patch: <T>(endpoint: string, body?: unknown, options?: ApiRequestOptions) =>
    serverApiClient<T>(endpoint, { ...options, method: "PATCH", body }),

  delete: <T>(endpoint: string, options?: ApiRequestOptions) =>
    serverApiClient<T>(endpoint, { ...options, method: "DELETE" }),
};
