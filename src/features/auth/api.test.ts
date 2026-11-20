import { beforeEach, describe, expect, it, vi } from "vitest";
import { login, register, resendVerificationCode, resendDeviceCode, resolveRealName } from "./api";
import { api, ApiClientError, fetchCsrfCookie } from "@/lib/api";

vi.mock("@/lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api")>();
  return {
    ...actual,
    fetchCsrfCookie: vi.fn(),
    api: {
      ...actual.api,
      post: vi.fn(),
      get: vi.fn(),
    },
  };
});

describe("resolveRealName", () => {
  it("prioritizes full_name over username", () => {
    const user = {
      username: "victoriousking35",
      full_name: "Obaseki Collins",
      name: "victoriousking35",
    };
    expect(resolveRealName(user)).toBe("Obaseki Collins");
  });

  it("combines first_name and last_name when full_name is absent", () => {
    const user = {
      username: "victoriousking35",
      first_name: "Obaseki",
      last_name: "Collins",
      name: "victoriousking35",
    };
    expect(resolveRealName(user)).toBe("Obaseki Collins");
  });

  it("returns first_name if last_name is null/empty", () => {
    const user = {
      username: "victoriousking35",
      first_name: "Obaseki",
      last_name: null,
      name: "victoriousking35",
    };
    expect(resolveRealName(user)).toBe("Obaseki");
  });

  it("returns name if distinct from username", () => {
    const user = {
      username: "victoriousking35",
      name: "Obaseki Collins",
    };
    expect(resolveRealName(user)).toBe("Obaseki Collins");
  });

  it("does not return username if name equals username and fallbackName is given", () => {
    const user = {
      username: "victoriousking35",
      name: "victoriousking35",
    };
    expect(resolveRealName(user, "Valued Customer")).toBe("Valued Customer");
  });

  it("handles null or undefined input gracefully", () => {
    expect(resolveRealName(null)).toBe("");
    expect(resolveRealName(undefined, "there")).toBe("there");
  });
});

describe("Auth API CSRF and Payload Handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("login()", () => {
    it("aborts and does not fire POST /api/v1/auth/login if CSRF initialization fails", async () => {
      vi.mocked(fetchCsrfCookie).mockRejectedValueOnce(
        new ApiClientError(
          "Unable to initialize security session (HTTP 500). The authentication server returned an error. Please try again later.",
          500,
          "csrf_handshake_failed"
        )
      );

      await expect(
        login({ login: "user@example.com", password: "SecretPassword1" })
      ).rejects.toThrow("Unable to initialize security session");

      expect(fetchCsrfCookie).toHaveBeenCalledTimes(1);
      expect(api.post).not.toHaveBeenCalled();
    });

    it("sends identifier, login, username, email, remember and skipCsrf on successful login", async () => {
      vi.mocked(fetchCsrfCookie).mockResolvedValueOnce();
      vi.mocked(api.post).mockResolvedValueOnce({
        data: {
          id: "usr_01",
          name: "Amara Nwosu",
          username: "amaranwosu",
          email: "amara@example.com",
          email_verified_at: null,
          created_at: "2026-01-01T00:00:00Z",
        },
      });

      const result = await login({
        login: "amara@example.com",
        password: "SecretPassword1",
        remember_me: true,
      });

      expect(fetchCsrfCookie).toHaveBeenCalledTimes(1);
      expect(api.post).toHaveBeenCalledWith(
        "/api/v1/auth/login",
        {
          identifier: "amara@example.com",
          login: "amara@example.com",
          username: "amara@example.com",
          email: "amara@example.com",
          password: "SecretPassword1",
          remember: true,
        },
        { skipCsrf: true }
      );
      expect(result.user.name).toBe("Amara Nwosu");
    });
  });

  describe("register()", () => {
    it("aborts and does not fire POST /api/v1/auth/register if CSRF initialization fails", async () => {
      vi.mocked(fetchCsrfCookie).mockRejectedValueOnce(
        new ApiClientError(
          "Unable to initialize security session (HTTP 500)",
          500,
          "csrf_handshake_failed"
        )
      );

      await expect(
        register({
          name: "Test User",
          phone_number: "08012345678",
          email: "test@example.com",
          password: "SecretPassword1",
          password_confirmation: "SecretPassword1",
          terms: true,
        })
      ).rejects.toThrow("Unable to initialize security session");

      expect(fetchCsrfCookie).toHaveBeenCalledTimes(1);
      expect(api.post).not.toHaveBeenCalled();
    });
  });

  describe("resendVerificationCode() & resendDeviceCode()", () => {
    it("posts challenge_token to /api/v1/auth/verify-device/resend after CSRF fetch", async () => {
      vi.mocked(api.post).mockResolvedValueOnce({
        data: {
          status: "device_verification_required",
          requires_device_verification: true,
          message: "Verification code resent successfully.",
          challenge_token: "new_challenge_tok_123",
          expires_at: "2026-11-20T10:15:00.000000Z",
        },
        meta: {},
      });

      const res = await resendVerificationCode({
        challenge_token: "old_challenge_tok_000",
      });

      expect(fetchCsrfCookie).toHaveBeenCalled();
      expect(api.post).toHaveBeenCalledWith(
        "/api/v1/auth/verify-device/resend",
        { challenge_token: "old_challenge_tok_000" }
      );
      expect(res.message).toBe("Verification code resent successfully.");
      expect(res.challenge_token).toBe("new_challenge_tok_123");
    });

    it("resendDeviceCode alias delegates correctly with string challenge_token", async () => {
      vi.mocked(api.post).mockResolvedValueOnce({
        data: {
          status: "device_verification_required",
          requires_device_verification: true,
          message: "Verification code resent successfully.",
          challenge_token: "string_challenge_tok",
          expires_at: "2026-11-20T10:15:00.000000Z",
        },
        meta: {},
      });

      const res = await resendDeviceCode("string_challenge_tok");

      expect(api.post).toHaveBeenCalledWith(
        "/api/v1/auth/verify-device/resend",
        { challenge_token: "string_challenge_tok" }
      );
      expect(res.challenge_token).toBe("string_challenge_tok");
    });
  });
});
