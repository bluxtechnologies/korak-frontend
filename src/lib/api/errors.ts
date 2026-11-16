import { ApiClientError } from "./client";
import { ApiErrorResponse, ApiResponse } from "./types";

/**
 * Patterns that indicate internal leaks (SQL, PHP/Node traces, file paths, exceptions)
 * which must NEVER be exposed to the UI per docs/06-api-standards.md §5.
 */
const INTERNAL_LEAK_PATTERNS = [
  /SQLSTATE/i,
  /PDOException/i,
  /syntax error/i,
  /stack trace/i,
  /\b(vendor|node_modules|app\/|src\/)\b/i,
  /\.php\b/i,
  /\.tsx?\b/i,
  /[a-z0-9_\\]+Exception/i,
  /SELECT\s+.+\s+FROM/i,
  /INSERT\s+INTO/i,
  /UPDATE\s+.+\s+SET/i,
  /DELETE\s+FROM/i,
];

function containsInternalLeak(message: string): boolean {
  return INTERNAL_LEAK_PATTERNS.some((pattern) => pattern.test(message));
}

/**
 * Standard user-facing messages for known error codes / status codes.
 */
const CODE_MESSAGE_MAP: Record<string, string> = {
  unauthenticated: "Your session has expired. Please sign in again.",
  session_expired: "Your session has expired. Please sign in again.",
  invalid_credentials: "The email or password you entered is incorrect.",
  forbidden: "You do not have permission to perform this action.",
  not_found: "The requested item could not be found.",
  rate_limited: "Too many requests. Please wait a moment and try again.",
  throttled: "Too many requests. Please wait a moment and try again.",
  account_locked: "Your account is temporarily locked. Please contact support.",
  conflict:
    "The resource has been updated elsewhere. Please refresh and try again.",
  validation_failed: "Please check the information you entered and try again.",
  server_error: "An unexpected error occurred. Please try again later.",
  network_error:
    "Unable to connect to the server. Please check your network connection or ensure the API server is running.",
};

const STATUS_MESSAGE_MAP: Record<number, string> = {
  400: "The request was invalid. Please check your input.",
  401: "Your session has expired. Please sign in again.",
  403: "You do not have permission to perform this action.",
  404: "The requested item could not be found.",
  409: "A conflict occurred. Please refresh and try again.",
  419: "Your session has expired. Please sign in again.",
  422: "Please check the information you entered and try again.",
  423: "Your account is temporarily locked. Please contact support.",
  429: "Too many requests. Please wait a moment and try again.",
  500: "An unexpected error occurred on our servers. Please try again later.",
  502: "The server is temporarily unavailable. Please try again in a few moments.",
  503: "Service is temporarily unavailable for maintenance. Please try again shortly.",
  504: "The server took too long to respond. Please try again.",
};

const DEFAULT_ERROR_MESSAGE = "An unexpected error occurred. Please try again.";

/**
 * Maps any caught error or ApiClientError to a safe, user-friendly UI message.
 * Strictly guarantees that internal server details, SQL, or stack traces are never shown.
 */
export function getSafeErrorMessage(
  error: unknown,
  fallback: string = DEFAULT_ERROR_MESSAGE
): string {
  if (!error) {
    return fallback;
  }

  if (error instanceof ApiClientError) {
    // 429 rate limit error with retry-after header handling (Key Security Rule §6)
    if (error.status === 429) {
      if (typeof error.retryAfter === "number" && error.retryAfter > 0) {
        return `Too many requests. Please wait ${error.retryAfter} seconds.`;
      }
      return CODE_MESSAGE_MAP.rate_limited || STATUS_MESSAGE_MAP[429];
    }

    // 5xx errors should never expose raw messages to the user per docs/06-api-standards.md §5
    if (error.status >= 500) {
      const baseMessage =
        STATUS_MESSAGE_MAP[error.status] ||
        CODE_MESSAGE_MAP.server_error ||
        fallback;
      const refId = error.reference_id || error.requestId;
      if (refId) {
        return `${baseMessage} (Reference: ${refId})`;
      }
      return baseMessage;
    }

    // Check code map for recognized error codes
    if (error.code && CODE_MESSAGE_MAP[error.code]) {
      return CODE_MESSAGE_MAP[error.code];
    }

    // If a non-500 message is present, ensure it does not leak internal details
    if (error.message && typeof error.message === "string") {
      const trimmed = error.message.trim();
      if (trimmed.length > 0 && !containsInternalLeak(trimmed)) {
        return trimmed;
      }
    }

    // Check status map
    if (error.status && STATUS_MESSAGE_MAP[error.status]) {
      return STATUS_MESSAGE_MAP[error.status];
    }

    return fallback;
  }

  if (error instanceof Error) {
    // Handle standard network failures
    if (
      error.name === "TypeError" &&
      error.message.toLowerCase().includes("fetch")
    ) {
      return "Unable to connect to the server. Please check your internet connection.";
    }

    if (error.message && !containsInternalLeak(error.message)) {
      return error.message;
    }
  }

  return fallback;
}

/**
 * Type guard for ApiErrorResponse envelope.
 */
export function isApiErrorResponse(data: unknown): data is ApiErrorResponse {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const candidate = data as Record<string, unknown>;
  return (
    typeof candidate.message === "string" && typeof candidate.code === "string"
  );
}

/**
 * Returns the first field error string from a validation errors map.
 */
export function getFirstFieldError(
  errors?: Record<string, string[]>
): string | null {
  if (!errors) return null;
  const keys = Object.keys(errors);
  if (keys.length === 0) return null;
  const firstFieldMessages = errors[keys[0]];
  if (!Array.isArray(firstFieldMessages) || firstFieldMessages.length === 0) {
    return null;
  }
  return firstFieldMessages[0];
}

/**
 * Extracts a flattened key-value mapping of field errors { [field]: firstErrorMessage }
 * suitable for form state / React Hook Form integration.
 */
export function getFieldErrors(
  error: unknown
): Record<string, string> | undefined {
  if (error instanceof ApiClientError && error.errors) {
    const result: Record<string, string> = {};
    for (const [key, messages] of Object.entries(error.errors)) {
      if (Array.isArray(messages) && messages.length > 0) {
        result[key] = messages[0];
      }
    }
    return Object.keys(result).length > 0 ? result : undefined;
  }

  return undefined;
}

/**
 * Type guard checking if a response is wrapped in an ApiResponse envelope.
 */
export function isApiResponseEnvelope<T>(
  response: unknown
): response is ApiResponse<T> {
  return (
    typeof response === "object" &&
    response !== null &&
    "data" in response &&
    !Array.isArray(response)
  );
}

/**
 * Unwraps data from an API response envelope { data: T, meta?: ... }.
 * If the response is already unwrapped or an array, returns it directly.
 */
export function unwrapApiResponse<T>(response: ApiResponse<T> | T): T {
  if (isApiResponseEnvelope<T>(response)) {
    return response.data;
  }
  return response as T;
}
