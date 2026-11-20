import { emitPermissionDenied, emitSessionExpired } from "./events";
import { ApiErrorResponse, ApiRequestOptions } from "./types";

export class ApiClientError extends Error {
  public status: number;
  public code: string;
  public errors?: Record<string, string[]>;
  public requestId?: string;
  public reference_id?: string;
  public retryAfter?: number;
  public response?: Response;

  constructor(
    message: string,
    status: number,
    code: string = "api_error",
    errors?: Record<string, string[]>,
    requestId?: string,
    response?: Response,
    retryAfter?: number,
    referenceId?: string
  ) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.errors = errors;
    this.requestId = requestId;
    this.reference_id = referenceId || requestId;
    this.response = response;
    this.retryAfter = retryAfter;
  }
}

const DEFAULT_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
  (process.env.NODE_ENV === "production"
    ? "https://backend.korakdigital.com/api/v1"
    : "http://localhost:8070");

const BACKEND_ROOT_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/+$/, "") ||
  DEFAULT_BASE_URL.replace(/\/api(\/v1)?\/?$/, "");

export function getBaseApiUrl(): string {
  return DEFAULT_BASE_URL;
}

export function getBackendRootUrl(): string {
  return BACKEND_ROOT_URL;
}

export function buildApiUrl(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined | null>
): string {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  let fullUrlString: string;
  if (cleanEndpoint.startsWith("/sanctum/")) {
    fullUrlString = `${BACKEND_ROOT_URL}${cleanEndpoint}`;
  } else if (cleanEndpoint.startsWith("/api/")) {
    fullUrlString = `${BACKEND_ROOT_URL}${cleanEndpoint}`;
  } else {
    const base = DEFAULT_BASE_URL.endsWith("/api/v1")
      ? DEFAULT_BASE_URL
      : `${DEFAULT_BASE_URL}/api/v1`;
    fullUrlString = `${base}${cleanEndpoint}`;
  }

  const url = new URL(fullUrlString);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  return url.toString();
}

/**
 * Generates a unique correlation ID for the request.
 */
export function generateRequestId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    try {
      return crypto.randomUUID();
    } catch {
      // In case Next.js intercepts during prerender
    }
  }
  try {
    return "req_" + Math.random().toString(36).substring(2, 15);
  } catch {
    return "req_prerender_static";
  }
}

/**
 * Extracts and decodes the XSRF-TOKEN cookie from document.cookie in browser environments.
 */
export function getXsrfCookie(): string | null {
  if (typeof document === "undefined") {
    return null;
  }
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

let csrfPromise: Promise<void> | null = null;

/**
 * Fetches CSRF cookie from Laravel Sanctum (/sanctum/csrf-cookie).
 * Coalesces concurrent calls so only one request is in-flight.
 * Verifies response status and aborts on errors (e.g. 500) per Doc 04 §3.
 */
export async function fetchCsrfCookie(): Promise<void> {
  if (csrfPromise) {
    return csrfPromise;
  }

  csrfPromise = (async () => {
    try {
      const url = buildApiUrl("/sanctum/csrf-cookie");
      const res = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        let errorData: ApiErrorResponse | null = null;
        try {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            errorData = (await res.json()) as ApiErrorResponse;
          }
        } catch {
          // Ignore JSON parse error on non-json responses
        }

        const retryAfterHeader = res.headers.get("retry-after");
        const retryAfter = retryAfterHeader ? parseInt(retryAfterHeader, 10) : undefined;
        const code = errorData?.code || (res.status === 429 ? "too_many_requests" : "csrf_handshake_failed");
        const message =
          errorData?.message ||
          (res.status === 429
            ? "Too many requests. Please wait a moment and try again."
            : `Unable to initialize security session (HTTP ${res.status}). The authentication server returned an error. Please try again later.`);

        throw new ApiClientError(
          message,
          res.status,
          code,
          errorData?.errors,
          res.headers.get("x-request-id") || undefined,
          res,
          Number.isNaN(retryAfter) ? undefined : retryAfter,
          errorData?.reference_id
        );
      }
    } catch (networkError: unknown) {
      if (networkError instanceof ApiClientError) {
        throw networkError;
      }
      const message =
        networkError instanceof Error
          ? networkError.message
          : "Failed to connect to authentication server";

      throw new ApiClientError(
        `Unable to reach the server to initialize security cookie (${message}). Please verify the backend API server is running.`,
        0,
        "network_error"
      );
    } finally {
      csrfPromise = null;
    }
  })();

  return csrfPromise;
}

/**
 * Helper to initialize CSRF cookie before authentication calls per Backend Handoff.
 */
export async function initCsrf(): Promise<void> {
  return fetchCsrfCookie();
}

/**
 * Checks backend health per Frontend Integration Guide (GET /api/v1/health).
 */
export async function checkBackendHealth(): Promise<{ status: string; [key: string]: unknown }> {
  return baseApiClient<{ status: string; [key: string]: unknown }>("/api/v1/health", {
    method: "GET",
    skipCsrf: true,
  });
}

const STATE_CHANGING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

const AUTH_CREDENTIAL_ENDPOINTS = [
  "/api/v1/auth/login",
  "/api/v1/auth/register",
  "/api/v1/auth/verify-device",
];

function isCredentialSubmissionEndpoint(endpoint: string): boolean {
  const clean = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return AUTH_CREDENTIAL_ENDPOINTS.some((path) => clean.startsWith(path));
}

function dispatchSessionStateEvent(
  endpoint: string,
  status: number,
  code: string,
  skipSessionEvent: boolean
): void {
  if (skipSessionEvent || typeof window === "undefined") {
    return;
  }

  if (
    status === 401 &&
    code !== "invalid_credentials" &&
    !isCredentialSubmissionEndpoint(endpoint)
  ) {
    emitSessionExpired({ endpoint, status: 401, code });
  } else if (status === 403) {
    emitPermissionDenied({ endpoint, status: 403, code });
  }
}

async function baseApiClient<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const {
    params,
    body,
    headers: customHeaders,
    skipCsrf = false,
    skipSessionEvent = false,
    _isRetry = false,
    ...customOptions
  } = options;

  const method = (customOptions.method || "GET").toUpperCase();
  const url = buildApiUrl(endpoint, params);
  const headers = new Headers(customHeaders);

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  // Ensure an X-Request-ID correlation header is always present
  const requestId = headers.get("X-Request-ID") || generateRequestId();
  if (!headers.has("X-Request-ID")) {
    headers.set("X-Request-ID", requestId);
  }

  // Inject CSRF header for state-changing methods in browser environments
  if (
    !skipCsrf &&
    STATE_CHANGING_METHODS.has(method) &&
    typeof document !== "undefined"
  ) {
    let token = getXsrfCookie();
    if (!token && !_isRetry) {
      await fetchCsrfCookie();
      token = getXsrfCookie();
    }
    if (token && !headers.has("X-XSRF-TOKEN")) {
      headers.set("X-XSRF-TOKEN", token);
    }
  } else if (typeof document !== "undefined" && STATE_CHANGING_METHODS.has(method)) {
    // If CSRF fetch was already performed externally (skipCsrf), attach cookie if available
    const token = getXsrfCookie();
    if (token && !headers.has("X-XSRF-TOKEN")) {
      headers.set("X-XSRF-TOKEN", token);
    }
  }

  let processedBody: BodyInit | null | undefined = undefined;

  if (body !== undefined && body !== null) {
    if (body instanceof FormData) {
      processedBody = body;
    } else if (typeof body === "string") {
      processedBody = body;
      if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }
    } else {
      processedBody = JSON.stringify(body);
      if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }
    }
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...customOptions,
      headers,
      credentials: customOptions.credentials || "include",
      body: processedBody,
    });
  } catch (networkError: unknown) {
    if (networkError instanceof ApiClientError) {
      throw networkError;
    }
    const message =
      networkError instanceof Error
        ? networkError.message
        : "Failed to connect to server";

    throw new ApiClientError(
      `Unable to connect to the server (${message}). Please verify the backend API server is running and accessible.`,
      0,
      "network_error",
      undefined,
      requestId
    );
  }

  const responseRequestId =
    response.headers.get("x-request-id") ||
    response.headers.get("X-Request-ID") ||
    requestId;

  // Handle 419 CSRF token mismatch: refetch CSRF cookie and retry once (Doc 04 §4)
  if (response.status === 419) {
    if (!_isRetry) {
      await fetchCsrfCookie();
      const updatedHeaders = new Headers(customHeaders);
      const newToken = getXsrfCookie();
      if (newToken) {
        updatedHeaders.set("X-XSRF-TOKEN", newToken);
      }
      return baseApiClient<T>(endpoint, {
        ...options,
        headers: updatedHeaders,
        _isRetry: true,
      });
    }

    // Retried once and still 419: treat as 401 per Doc 04 §4
    dispatchSessionStateEvent(
      endpoint,
      401,
      "session_expired",
      skipSessionEvent
    );

    throw new ApiClientError(
      "Your session has expired. Please log in again.",
      401,
      "session_expired",
      undefined,
      responseRequestId,
      response
    );
  }

  if (response.status === 204) {
    return {} as T;
  }

  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");

  let responseData: unknown = null;
  if (isJson) {
    try {
      responseData = await response.json();
    } catch {
      responseData = null;
    }
  } else {
    responseData = await response.text();
  }

  if (!response.ok) {
    const errorData = responseData as ApiErrorResponse | null;
    const message =
      errorData?.message || `Request failed with status ${response.status}`;
    const code = errorData?.code || `http_${response.status}`;
    const fieldErrors = errorData?.errors;
    const retryAfterHeader = response.headers.get("retry-after");
    const retryAfter = retryAfterHeader ? parseInt(retryAfterHeader, 10) : undefined;
    const referenceId = errorData?.reference_id || responseRequestId;

    dispatchSessionStateEvent(
      endpoint,
      response.status,
      code,
      skipSessionEvent
    );

    throw new ApiClientError(
      message,
      response.status,
      code,
      fieldErrors,
      responseRequestId,
      response,
      retryAfter,
      referenceId
    );
  }

  return responseData as T;
}

export interface ApiClientResponse<T> {
  data: T;
  status: number;
  headers: Headers;
}

export interface ApiClientInstance {
  <T>(endpoint: string, options?: ApiRequestOptions): Promise<T>;
  get<T = unknown>(endpoint: string, options?: ApiRequestOptions): Promise<ApiClientResponse<T>>;
  post<T = unknown>(endpoint: string, body?: unknown, options?: ApiRequestOptions): Promise<ApiClientResponse<T>>;
  put<T = unknown>(endpoint: string, body?: unknown, options?: ApiRequestOptions): Promise<ApiClientResponse<T>>;
  patch<T = unknown>(endpoint: string, body?: unknown, options?: ApiRequestOptions): Promise<ApiClientResponse<T>>;
  delete<T = unknown>(endpoint: string, options?: ApiRequestOptions): Promise<ApiClientResponse<T>>;
}

export const apiClient: ApiClientInstance = Object.assign(
  async <T>(endpoint: string, options?: ApiRequestOptions): Promise<T> => {
    return baseApiClient<T>(endpoint, options);
  },
  {
    get: async <T = unknown>(endpoint: string, options?: ApiRequestOptions): Promise<ApiClientResponse<T>> => {
      const data = await baseApiClient<T>(endpoint, { ...options, method: "GET" });
      return { data, status: 200, headers: new Headers() };
    },
    post: async <T = unknown>(endpoint: string, body?: unknown, options?: ApiRequestOptions): Promise<ApiClientResponse<T>> => {
      const data = await baseApiClient<T>(endpoint, { ...options, method: "POST", body });
      return { data, status: 200, headers: new Headers() };
    },
    put: async <T = unknown>(endpoint: string, body?: unknown, options?: ApiRequestOptions): Promise<ApiClientResponse<T>> => {
      const data = await baseApiClient<T>(endpoint, { ...options, method: "PUT", body });
      return { data, status: 200, headers: new Headers() };
    },
    patch: async <T = unknown>(endpoint: string, body?: unknown, options?: ApiRequestOptions): Promise<ApiClientResponse<T>> => {
      const data = await baseApiClient<T>(endpoint, { ...options, method: "PATCH", body });
      return { data, status: 200, headers: new Headers() };
    },
    delete: async <T = unknown>(endpoint: string, options?: ApiRequestOptions): Promise<ApiClientResponse<T>> => {
      const data = await baseApiClient<T>(endpoint, { ...options, method: "DELETE" });
      return { data, status: 200, headers: new Headers() };
    },
  }
);

export const api = {
  get: <T>(endpoint: string, options?: ApiRequestOptions) =>
    baseApiClient<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: unknown, options?: ApiRequestOptions) =>
    baseApiClient<T>(endpoint, { ...options, method: "POST", body }),

  put: <T>(endpoint: string, body?: unknown, options?: ApiRequestOptions) =>
    baseApiClient<T>(endpoint, { ...options, method: "PUT", body }),

  patch: <T>(endpoint: string, body?: unknown, options?: ApiRequestOptions) =>
    baseApiClient<T>(endpoint, { ...options, method: "PATCH", body }),

  delete: <T>(endpoint: string, options?: ApiRequestOptions) =>
    baseApiClient<T>(endpoint, { ...options, method: "DELETE" }),
};
