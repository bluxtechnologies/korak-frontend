/**
 * API Standards response envelopes per docs/06-api-standards.md
 */

export interface ApiResponse<T, M = Record<string, unknown>> {
  data: T;
  meta: M;
}

export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface ApiPaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiErrorResponse {
  message: string;
  code: string;
  errors?: Record<string, string[]>;
  reference_id?: string;
}

export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  params?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  headers?: HeadersInit;
  skipCsrf?: boolean;
  skipSessionEvent?: boolean;
  _isRetry?: boolean;
}
