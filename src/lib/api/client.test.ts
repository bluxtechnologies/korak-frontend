import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  api,
  apiClient,
  ApiClientError,
  buildApiUrl,
  checkBackendHealth,
  fetchCsrfCookie,
  getBaseApiUrl,
  getBackendRootUrl,
  getXsrfCookie,
} from "./client";
import {
  clearApiEventListeners,
  onPermissionDenied,
  onSessionExpired,
} from "./events";

describe("API Client Layer (lib/api)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    clearApiEventListeners();
    // Clear cookies in jsdom environment
    if (typeof document !== "undefined") {
      document.cookie =
        "XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
  });

  describe("URL construction", () => {
    it("returns default base API URL", () => {
      expect(getBaseApiUrl()).toBe("http://localhost:8070");
    });

    it("builds correct URL with endpoint", () => {
      expect(buildApiUrl("/api/v1/orders")).toBe(
        "http://localhost:8070/api/v1/orders"
      );
      expect(buildApiUrl("api/v1/orders")).toBe(
        "http://localhost:8070/api/v1/orders"
      );
    });

    it("appends query parameters ignoring null and undefined", () => {
      const url = buildApiUrl("/api/v1/orders", {
        page: 2,
        status: "completed",
        search: undefined,
        filter: null,
      });
      expect(url).toBe(
        "http://localhost:8070/api/v1/orders?page=2&status=completed"
      );
    });

    it("resolves /sanctum/csrf-cookie against the backend root URL", () => {
      expect(buildApiUrl("/sanctum/csrf-cookie")).toBe(
        `${getBackendRootUrl()}/sanctum/csrf-cookie`
      );
    });
  });

  describe("CSRF cookie handling (F4.2)", () => {
    it("extracts and decodes XSRF-TOKEN from document.cookie", () => {
      document.cookie = "other=value";
      document.cookie = "XSRF-TOKEN=secret%2Btoken%3D";
      document.cookie = "foo=bar";
      expect(getXsrfCookie()).toBe("secret+token=");
    });

    it("returns null if XSRF-TOKEN is missing", () => {
      document.cookie = "session=xyz123";
      expect(getXsrfCookie()).toBeNull();
    });

    it("fetchCsrfCookie calls /sanctum/csrf-cookie with credentials include", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        headers: new Headers(),
      });
      vi.stubGlobal("fetch", mockFetch);

      await fetchCsrfCookie();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, init] = mockFetch.mock.calls[0];
      expect(url).toBe("http://localhost:8070/sanctum/csrf-cookie");
      expect(init.method).toBe("GET");
      expect(init.credentials).toBe("include");
    });

    it("injects X-XSRF-TOKEN header on state-changing methods when cookie exists", async () => {
      document.cookie = "XSRF-TOKEN=active-csrf-token";

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ data: { success: true } }),
      });
      vi.stubGlobal("fetch", mockFetch);

      await api.post("/api/v1/orders", { amount: 100 });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [, init] = mockFetch.mock.calls[0];
      expect(init.headers.get("X-XSRF-TOKEN")).toBe("active-csrf-token");
    });

    it("fetches CSRF cookie before POST if token is not yet in cookies", async () => {
      // No cookie set initially
      const mockFetch = vi
        .fn()
        .mockImplementationOnce(async (url: string) => {
          expect(url).toBe("http://localhost:8070/sanctum/csrf-cookie");
          // Simulate Sanctum setting cookie
          document.cookie = "XSRF-TOKEN=newly-set-token";
          return {
            ok: true,
            status: 204,
            headers: new Headers(),
          };
        })
        .mockImplementationOnce(async (url: string) => {
          expect(url).toBe("http://localhost:8070/api/v1/orders");
          return {
            ok: true,
            status: 201,
            headers: new Headers({ "content-type": "application/json" }),
            json: async () => ({ data: { id: "ord_1" } }),
          };
        });
      vi.stubGlobal("fetch", mockFetch);

      const result = await api.post("/api/v1/orders", { amount: 50 });

      expect(mockFetch).toHaveBeenCalledTimes(2);
      const secondCallInit = mockFetch.mock.calls[1][1];
      expect(secondCallInit.headers.get("X-XSRF-TOKEN")).toBe(
        "newly-set-token"
      );
      expect(result).toEqual({ data: { id: "ord_1" } });
    });

    it("retries once when receiving 419 CSRF mismatch response", async () => {
      document.cookie = "XSRF-TOKEN=stale-token";

      let postAttempts = 0;
      const mockFetch = vi.fn().mockImplementation(async (url: string) => {
        if (url.includes("/sanctum/csrf-cookie")) {
          document.cookie = "XSRF-TOKEN=fresh-refetched-token";
          return { ok: true, status: 204, headers: new Headers() };
        }

        if (url.includes("/api/v1/orders")) {
          postAttempts++;
          if (postAttempts === 1) {
            return {
              ok: false,
              status: 419,
              headers: new Headers({ "content-type": "application/json" }),
              json: async () => ({ message: "CSRF token mismatch." }),
            };
          }
          return {
            ok: true,
            status: 200,
            headers: new Headers({ "content-type": "application/json" }),
            json: async () => ({ data: { id: "ord_retried" } }),
          };
        }

        throw new Error(`Unexpected url: ${url}`);
      });
      vi.stubGlobal("fetch", mockFetch);

      const result = await api.post("/api/v1/orders", { amount: 200 });

      // First POST (fails 419) -> fetchCsrfCookie -> Second POST (succeeds)
      expect(postAttempts).toBe(2);
      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(result).toEqual({ data: { id: "ord_retried" } });
    });

    it("converts persistent 419 to 401 session_expired without infinite retry loop", async () => {
      document.cookie = "XSRF-TOKEN=stale-token";

      const mockFetch = vi.fn().mockImplementation(async (url: string) => {
        if (url.includes("/sanctum/csrf-cookie")) {
          return { ok: true, status: 204, headers: new Headers() };
        }
        return {
          ok: false,
          status: 419,
          headers: new Headers({ "content-type": "application/json" }),
          json: async () => ({ message: "CSRF token mismatch." }),
        };
      });
      vi.stubGlobal("fetch", mockFetch);

      try {
        await api.post("/api/v1/orders", { amount: 200 });
        expect.unreachable("Should have thrown ApiClientError");
      } catch (err) {
        expect(err).toBeInstanceOf(ApiClientError);
        const apiError = err as ApiClientError;
        expect(apiError.status).toBe(401);
        expect(apiError.code).toBe("session_expired");
        expect(apiError.message).toContain("session has expired");
      }

      // Initial POST + 1 csrf-cookie fetch + 1 retry POST = 3 calls total
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it("respects skipCsrf option", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ ok: true }),
      });
      vi.stubGlobal("fetch", mockFetch);

      await api.post("/api/v1/ping", {}, { skipCsrf: true });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [, init] = mockFetch.mock.calls[0];
      expect(init.headers.get("X-XSRF-TOKEN")).toBeNull();
    });
  });

  describe("apiClient requests", () => {
    it("performs direct call via apiClient with custom method", async () => {
      const mockData = { ok: true };
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => mockData,
      });
      vi.stubGlobal("fetch", mockFetch);

      const result = await apiClient<{ ok: boolean }>("/api/v1/health", {
        method: "HEAD",
      });
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockData);
    });

    it("performs successful GET request with credentials and headers", async () => {
      const mockData = { data: { id: "ord_123", amount: 1000 } };

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => mockData,
      });
      vi.stubGlobal("fetch", mockFetch);

      const result = await api.get<{ data: { id: string; amount: number } }>(
        "/api/v1/orders/ord_123"
      );

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [calledUrl, calledInit] = mockFetch.mock.calls[0];
      expect(calledUrl).toBe("http://localhost:8070/api/v1/orders/ord_123");
      expect(calledInit.method).toBe("GET");
      expect(calledInit.credentials).toBe("include");
      expect(calledInit.headers.get("Accept")).toBe("application/json");
      expect(result).toEqual(mockData);
    });

    it("performs POST request serializing JSON body", async () => {
      document.cookie = "XSRF-TOKEN=valid-token";
      const payload = { network: "mtn", amount: 500, phone: "08012345678" };
      const responsePayload = {
        data: { order_id: "ord_999", status: "pending" },
      };

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => responsePayload,
      });
      vi.stubGlobal("fetch", mockFetch);

      const result = await api.post("/api/v1/airtime", payload);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [, calledInit] = mockFetch.mock.calls[0];
      expect(calledInit.method).toBe("POST");
      expect(calledInit.headers.get("Content-Type")).toBe("application/json");
      expect(calledInit.headers.get("X-XSRF-TOKEN")).toBe("valid-token");
      expect(calledInit.body).toBe(JSON.stringify(payload));
      expect(result).toEqual(responsePayload);
    });

    it("handles 204 No Content without attempting to parse JSON", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        headers: new Headers(),
      });
      vi.stubGlobal("fetch", mockFetch);

      const result = await api.delete("/api/v1/sessions/current");
      expect(result).toEqual({});
    });

    it("throws ApiClientError with code and message on error response", async () => {
      document.cookie = "XSRF-TOKEN=valid-token";
      const errorBody = {
        message: "Invalid credentials.",
        code: "invalid_credentials",
      };

      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => errorBody,
      });
      vi.stubGlobal("fetch", mockFetch);

      await expect(
        api.post("/api/v1/auth/login", {
          login: "user@example.com",
          password: "wrong",
        })
      ).rejects.toThrowError(ApiClientError);

      try {
        await api.post("/api/v1/auth/login", {
          login: "user@example.com",
          password: "wrong",
        });
      } catch (err) {
        expect(err).toBeInstanceOf(ApiClientError);
        const apiError = err as ApiClientError;
        expect(apiError.status).toBe(401);
        expect(apiError.code).toBe("invalid_credentials");
        expect(apiError.message).toBe("Invalid credentials.");
      }
    });

    it("handles 422 validation failure with field errors", async () => {
      document.cookie = "XSRF-TOKEN=valid-token";
      const errorBody = {
        message: "The given data was invalid.",
        code: "validation_failed",
        errors: {
          phone: ["The phone number is required."],
          amount: ["The amount must be at least 50."],
        },
      };

      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => errorBody,
      });
      vi.stubGlobal("fetch", mockFetch);

      try {
        await api.post("/api/v1/airtime", {});
      } catch (err) {
        expect(err).toBeInstanceOf(ApiClientError);
        const apiError = err as ApiClientError;
        expect(apiError.status).toBe(422);
        expect(apiError.code).toBe("validation_failed");
        expect(apiError.errors?.phone).toContain(
          "The phone number is required."
        );
        expect(apiError.errors?.amount).toContain(
          "The amount must be at least 50."
        );
      }
    });
  });

  describe("Request ID header (F4.4)", () => {
    it("automatically injects an X-Request-ID header when not supplied", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ ok: true }),
      });
      vi.stubGlobal("fetch", mockFetch);

      await api.get("/api/v1/health");

      const [, init] = mockFetch.mock.calls[0];
      const reqId = init.headers.get("X-Request-ID");
      expect(reqId).toBeTruthy();
      expect(typeof reqId).toBe("string");
    });

    it("preserves a caller-supplied X-Request-ID header", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ ok: true }),
      });
      vi.stubGlobal("fetch", mockFetch);

      await api.get("/api/v1/health", {
        headers: { "X-Request-ID": "custom-trace-123" },
      });

      const [, init] = mockFetch.mock.calls[0];
      expect(init.headers.get("X-Request-ID")).toBe("custom-trace-123");
    });

    it("captures response x-request-id on ApiClientError", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        headers: new Headers({
          "content-type": "application/json",
          "x-request-id": "srv-req-789",
        }),
        json: async () => ({
          message: "Internal error",
          code: "server_error",
        }),
      });
      vi.stubGlobal("fetch", mockFetch);

      try {
        await api.get("/api/v1/orders");
        expect.unreachable("Expected ApiClientError");
      } catch (err) {
        expect(err).toBeInstanceOf(ApiClientError);
        expect((err as ApiClientError).requestId).toBe("srv-req-789");
      }
    });
  });

  describe("Session-state events (F4.5)", () => {
    it("emits session expired event on 401 for protected API requests", async () => {
      const listener = vi.fn();
      onSessionExpired(listener);

      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({
          message: "Unauthenticated.",
          code: "unauthenticated",
        }),
      });
      vi.stubGlobal("fetch", mockFetch);

      await expect(api.get("/api/v1/wallet")).rejects.toThrowError(
        ApiClientError
      );

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          endpoint: "/api/v1/wallet",
          status: 401,
          code: "unauthenticated",
        })
      );
    });

    it("emits session expired event when persistent 419 falls back to 401", async () => {
      document.cookie = "XSRF-TOKEN=stale-token";
      const listener = vi.fn();
      onSessionExpired(listener);

      const mockFetch = vi.fn().mockImplementation(async (url: string) => {
        if (url.includes("/sanctum/csrf-cookie")) {
          return { ok: true, status: 204, headers: new Headers() };
        }
        return {
          ok: false,
          status: 419,
          headers: new Headers({ "content-type": "application/json" }),
          json: async () => ({ message: "CSRF mismatch." }),
        };
      });
      vi.stubGlobal("fetch", mockFetch);

      await expect(
        api.post("/api/v1/orders", { amount: 100 })
      ).rejects.toThrowError(ApiClientError);

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          endpoint: "/api/v1/orders",
          status: 401,
          code: "session_expired",
        })
      );
    });

    it("does NOT emit session expired on 401 from login/register or invalid_credentials", async () => {
      document.cookie = "XSRF-TOKEN=valid-token";
      const listener = vi.fn();
      onSessionExpired(listener);

      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({
          message: "Invalid credentials.",
          code: "invalid_credentials",
        }),
      });
      vi.stubGlobal("fetch", mockFetch);

      await expect(
        api.post("/api/v1/auth/login", { login: "test", password: "bad" })
      ).rejects.toThrowError(ApiClientError);

      expect(listener).not.toHaveBeenCalled();
    });

    it("respects skipSessionEvent option on 401 responses", async () => {
      const listener = vi.fn();
      onSessionExpired(listener);

      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({
          message: "Unauthenticated.",
          code: "unauthenticated",
        }),
      });
      vi.stubGlobal("fetch", mockFetch);

      await expect(
        api.get("/api/v1/auth/me", { skipSessionEvent: true })
      ).rejects.toThrowError(ApiClientError);

      expect(listener).not.toHaveBeenCalled();
    });

    it("emits permission denied event on 403 responses", async () => {
      const deniedListener = vi.fn();
      onPermissionDenied(deniedListener);

      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({
          message: "Forbidden.",
          code: "forbidden",
        }),
      });
      vi.stubGlobal("fetch", mockFetch);

      await expect(api.get("/api/v1/admin/settings")).rejects.toThrowError(
        ApiClientError
      );

      expect(deniedListener).toHaveBeenCalledTimes(1);
      expect(deniedListener).toHaveBeenCalledWith(
        expect.objectContaining({
          endpoint: "/api/v1/admin/settings",
          status: 403,
          code: "forbidden",
        })
      );
    });
  });

  describe("Backend Handoff Compatibility (initCsrf & apiClient methods)", () => {
    it("initCsrf initializes CSRF cookie", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        headers: new Headers(),
      });
      vi.stubGlobal("fetch", mockFetch);

      const { initCsrf } = await import("./client");
      await initCsrf();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, init] = mockFetch.mock.calls[0];
      expect(url).toBe("http://localhost:8070/sanctum/csrf-cookie");
      expect(init.method).toBe("GET");
      expect(init.credentials).toBe("include");
    });

    it("apiClient.get returns { data: responsePayload } matching Axios signature", async () => {
      const mockData = {
        data: {
          id: "01JMCZ77D34R33E893P14D8W4B",
          username: "alice",
          email: "alice@example.com",
        },
        meta: {},
      };

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => mockData,
      });
      vi.stubGlobal("fetch", mockFetch);

      const res = await apiClient.get<typeof mockData>("/api/v1/auth/me");
      expect(res.data).toEqual(mockData);
      expect(res.data.data.username).toBe("alice");
    });

    it("apiClient.post sends state-changing request and returns { data }", async () => {
      document.cookie = "XSRF-TOKEN=cookie-token";
      const mockData = {
        data: {
          id: "01JMCZ77D34R33E893P14D8W4B",
          username: "alice",
        },
        meta: {},
      };

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => mockData,
      });
      vi.stubGlobal("fetch", mockFetch);

      const res = await apiClient.post<typeof mockData>("/api/v1/auth/login", {
        login: "alice@example.com",
        password: "Password123!",
      });

      expect(res.data.data.username).toBe("alice");
      const [, init] = mockFetch.mock.calls[0];
      expect(init.headers.get("X-XSRF-TOKEN")).toBe("cookie-token");
    });

    it("parses 429 retry-after header onto ApiClientError", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        headers: new Headers({
          "content-type": "application/json",
          "retry-after": "45",
        }),
        json: async () => ({
          message: "Too many requests. Please try again later.",
          code: "too_many_requests",
        }),
      });
      vi.stubGlobal("fetch", mockFetch);

      try {
        await apiClient.post("/api/v1/auth/login", { login: "a", password: "b" });
        expect.fail("Should have thrown");
      } catch (err) {
        expect(err).toBeInstanceOf(ApiClientError);
        const apiErr = err as ApiClientError;
        expect(apiErr.status).toBe(429);
        expect(apiErr.retryAfter).toBe(45);
      }
    });

    it("preserves reference_id on 500 server error", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        headers: new Headers({
          "content-type": "application/json",
        }),
        json: async () => ({
          message: "Internal Server Error.",
          code: "server_error",
          reference_id: "err_ref_999",
        }),
      });
      vi.stubGlobal("fetch", mockFetch);

      try {
        await apiClient.get("/api/v1/failing-endpoint");
        expect.fail("Should have thrown");
      } catch (err) {
        expect(err).toBeInstanceOf(ApiClientError);
        const apiErr = err as ApiClientError;
        expect(apiErr.status).toBe(500);
        expect(apiErr.reference_id).toBe("err_ref_999");
      }
    });

    it("handles fetch network failure gracefully and throws ApiClientError with network_error code", async () => {
      const mockFetch = vi.fn().mockRejectedValue(new TypeError("fetch failed"));
      vi.stubGlobal("fetch", mockFetch);

      try {
        await apiClient.get("/api/v1/health");
        expect.fail("Should have thrown ApiClientError");
      } catch (err) {
        expect(err).toBeInstanceOf(ApiClientError);
        const apiErr = err as ApiClientError;
        expect(apiErr.status).toBe(0);
        expect(apiErr.code).toBe("network_error");
        expect(apiErr.message).toContain("Unable to connect to the server");
      }
    });

    it("handles fetchCsrfCookie network failure gracefully", async () => {
      const mockFetch = vi.fn().mockRejectedValue(new TypeError("fetch failed"));
      vi.stubGlobal("fetch", mockFetch);

      try {
        await fetchCsrfCookie();
        expect.fail("Should have thrown ApiClientError");
      } catch (err) {
        expect(err).toBeInstanceOf(ApiClientError);
        const apiErr = err as ApiClientError;
        expect(apiErr.status).toBe(0);
        expect(apiErr.code).toBe("network_error");
      }
    });

    it("checkBackendHealth calls GET /api/v1/health successfully", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ status: "ok", service: "korak-backend" }),
      });
      vi.stubGlobal("fetch", mockFetch);

      const health = await checkBackendHealth();
      expect(health).toEqual({ status: "ok", service: "korak-backend" });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/health"),
        expect.objectContaining({
          method: "GET",
          credentials: "include",
        })
      );
    });
  });
});
