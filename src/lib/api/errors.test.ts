import { describe, expect, it } from "vitest";
import { ApiClientError } from "./client";
import {
  getFieldErrors,
  getFirstFieldError,
  getSafeErrorMessage,
  isApiErrorResponse,
  isApiResponseEnvelope,
  unwrapApiResponse,
} from "./errors";

describe("API Error Mapping & Envelope Parsing (lib/api/errors)", () => {
  describe("getSafeErrorMessage", () => {
    it("returns default fallback when error is null or undefined", () => {
      expect(getSafeErrorMessage(null)).toBe(
        "An unexpected error occurred. Please try again."
      );
      expect(getSafeErrorMessage(undefined, "Custom fallback")).toBe(
        "Custom fallback"
      );
    });

    it("maps known error codes to friendly messages", () => {
      const err = new ApiClientError("Raw message", 401, "invalid_credentials");
      expect(getSafeErrorMessage(err)).toBe(
        "The email or password you entered is incorrect."
      );

      const errExpired = new ApiClientError(
        "Token expired",
        401,
        "session_expired"
      );
      expect(getSafeErrorMessage(errExpired)).toBe(
        "Your session has expired. Please sign in again."
      );

      const errThrottled = new ApiClientError(
        "Too Many Attempts.",
        429,
        "throttled"
      );
      expect(getSafeErrorMessage(errThrottled)).toBe(
        "Too many requests. Please wait a moment and try again."
      );

      const errLocked = new ApiClientError("Locked out", 423, "account_locked");
      expect(getSafeErrorMessage(errLocked)).toBe(
        "Your account is temporarily locked. Please contact support."
      );

      const errCsrf = new ApiClientError("CSRF error", 500, "csrf_handshake_failed");
      expect(getSafeErrorMessage(errCsrf)).toBe(
        "Could not connect to the authentication server. Please try again later."
      );
    });

    it("never exposes internal SQL errors or stack traces for 500 status", () => {
      const sqlError = new ApiClientError(
        "SQLSTATE[HY000]: General error: 1364 Field 'user_id' doesn't have a default value",
        500,
        "server_error"
      );
      const safeMsg = getSafeErrorMessage(sqlError);
      expect(safeMsg).not.toContain("SQLSTATE");
      expect(safeMsg).not.toContain("user_id");
      expect(safeMsg).toBe(
        "An unexpected error occurred on our servers. Please try again later."
      );
    });

    it("includes request reference ID on 500 errors when available", () => {
      const serverError = new ApiClientError(
        "SQLSTATE[HY000]: Error",
        500,
        "server_error",
        undefined,
        "req-trace-999"
      );
      const safeMsg = getSafeErrorMessage(serverError);
      expect(safeMsg).toBe(
        "An unexpected error occurred on our servers. Please try again later. (Reference: req-trace-999)"
      );
    });

    it("masks internal code leaks in non-500 error messages", () => {
      const leakedError = new ApiClientError(
        "Fatal error in /app/Http/Controllers/OrderController.php on line 42",
        400,
        "bad_request"
      );
      const safeMsg = getSafeErrorMessage(leakedError);
      expect(safeMsg).not.toContain(".php");
      expect(safeMsg).not.toContain("OrderController");
      expect(safeMsg).toBe("The request was invalid. Please check your input.");

      const curlError = new ApiClientError(
        "Could not connect to payment provider: cURL error 6: Could not resolve host: api.cofinance.ng (see https://curl.se/libcurl/c/libcurl-errors.html) for https://api.cofinance.ng/v1/customers",
        400,
        "dedicated_account_generation_failed"
      );
      const safeCurlMsg = getSafeErrorMessage(curlError);
      expect(safeCurlMsg).not.toContain("cURL");
      expect(safeCurlMsg).not.toContain("api.cofinance.ng");
      expect(safeCurlMsg).toBe("Could not connect to payment provider. Please try again later.");
    });

    it("allows safe, non-leaking custom error messages through", () => {
      const safeCustomError = new ApiClientError(
        "Insufficient wallet balance for this purchase.",
        400,
        "insufficient_balance"
      );
      expect(getSafeErrorMessage(safeCustomError)).toBe(
        "Insufficient wallet balance for this purchase."
      );
    });

    it("handles standard network fetch failure (TypeError: Failed to fetch)", () => {
      const networkError = new TypeError("Failed to fetch");
      expect(getSafeErrorMessage(networkError)).toBe(
        "Unable to connect to the server. Please check your internet connection."
      );
    });
  });

  describe("Validation error helpers", () => {
    it("getFirstFieldError returns first message of first field", () => {
      expect(getFirstFieldError()).toBeNull();
      expect(getFirstFieldError({})).toBeNull();

      const errors = {
        email: ["The email address is required.", "Must be valid email"],
        password: ["Password must be at least 8 characters."],
      };
      expect(getFirstFieldError(errors)).toBe("The email address is required.");
    });

    it("getFieldErrors flattens field error arrays into key-value map", () => {
      expect(getFieldErrors(new Error("Generic"))).toBeUndefined();

      const apiErrorWithValidation = new ApiClientError(
        "The given data was invalid.",
        422,
        "validation_failed",
        {
          phone: ["The phone field is required."],
          amount: ["Must be greater than 0."],
        }
      );

      const fieldErrors = getFieldErrors(apiErrorWithValidation);
      expect(fieldErrors).toEqual({
        phone: "The phone field is required.",
        amount: "Must be greater than 0.",
      });
    });
  });

  describe("Response envelope helpers", () => {
    it("isApiErrorResponse validates error structure", () => {
      expect(isApiErrorResponse(null)).toBe(false);
      expect(isApiErrorResponse("error")).toBe(false);
      expect(isApiErrorResponse({ message: "Fail" })).toBe(false);
      expect(
        isApiErrorResponse({ message: "Invalid", code: "invalid_input" })
      ).toBe(true);
    });

    it("isApiResponseEnvelope identifies envelope with data key", () => {
      expect(isApiResponseEnvelope(null)).toBe(false);
      expect(isApiResponseEnvelope([1, 2, 3])).toBe(false);
      expect(isApiResponseEnvelope({ data: { id: "1" } })).toBe(true);
      expect(isApiResponseEnvelope({ data: [1, 2], meta: {} })).toBe(true);
      expect(isApiResponseEnvelope({ result: "ok" })).toBe(false);
    });

    it("unwrapApiResponse unwraps data property or returns raw data", () => {
      const enveloped = {
        data: { id: "ord_100", amount: 5000 },
        meta: { timestamp: 123456 },
      };
      expect(unwrapApiResponse(enveloped)).toEqual({
        id: "ord_100",
        amount: 5000,
      });

      const paginated = {
        data: [{ id: "1" }, { id: "2" }],
        meta: { current_page: 1, per_page: 15, total: 2, last_page: 1 },
      };
      expect(unwrapApiResponse(paginated)).toEqual([{ id: "1" }, { id: "2" }]);

      const rawList = ["mtn", "airtel", "glo"];
      expect(unwrapApiResponse(rawList)).toEqual(rawList);
    });
  });
});
