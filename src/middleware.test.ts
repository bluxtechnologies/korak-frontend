import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import {
  middleware,
  hasSessionCookie,
  isSafeRedirectPath,
} from "./middleware";
import { ROUTES } from "@/config/navigation";

function createMockRequest(url: string, cookies: Record<string, string> = {}) {
  const req = new NextRequest(new URL(url, "http://localhost:3000"));
  Object.entries(cookies).forEach(([key, val]) => {
    req.cookies.set(key, val);
  });
  return req;
}

describe("Middleware & Session Checking (F11.1)", () => {
  describe("hasSessionCookie", () => {
    it("returns true when laravel_session is present", () => {
      const req = createMockRequest("/overview", { laravel_session: "sess_123" });
      expect(hasSessionCookie(req)).toBe(true);
    });

    it("returns true when korak_session is present", () => {
      const req = createMockRequest("/overview", { korak_session: "sess_456" });
      expect(hasSessionCookie(req)).toBe(true);
    });

    it("returns true when XSRF-TOKEN is present", () => {
      const req = createMockRequest("/overview", { "XSRF-TOKEN": "xsrf_token" });
      expect(hasSessionCookie(req)).toBe(true);
    });

    it("returns false when no session cookies are present", () => {
      const req = createMockRequest("/overview", { theme: "dark" });
      expect(hasSessionCookie(req)).toBe(false);
    });

    it("returns false when cookies are completely empty", () => {
      const req = createMockRequest("/overview");
      expect(hasSessionCookie(req)).toBe(false);
    });
  });

  describe("isSafeRedirectPath", () => {
    it("accepts valid relative paths", () => {
      expect(isSafeRedirectPath("/overview")).toBe(true);
      expect(isSafeRedirectPath("/orders?status=active")).toBe(true);
      expect(isSafeRedirectPath("/settings/profile")).toBe(true);
    });

    it("rejects open-redirect malicious URLs", () => {
      expect(isSafeRedirectPath(null)).toBe(false);
      expect(isSafeRedirectPath("")).toBe(false);
      expect(isSafeRedirectPath("https://evil.com")).toBe(false);
      expect(isSafeRedirectPath("//evil.com")).toBe(false);
      expect(isSafeRedirectPath("/\\evil.com")).toBe(false);
      expect(isSafeRedirectPath("javascript:alert(1)")).toBe(false);
    });
  });

  describe("middleware routing", () => {
    it("allows public guest landing page '/' without redirecting to login", () => {
      const req = createMockRequest("/");
      const res = middleware(req);

      expect(res.status).toBe(200);
    });

    it("allows public guest legal routes '/privacy' and '/terms' without session cookie", () => {
      const privacyReq = createMockRequest(ROUTES.PRIVACY);
      const privacyRes = middleware(privacyReq);
      expect(privacyRes.status).toBe(200);

      const termsReq = createMockRequest(ROUTES.TERMS);
      const termsRes = middleware(termsReq);
      expect(termsRes.status).toBe(200);
    });

    it("allows public auth routes to pass through without session cookie", () => {
      const loginReq = createMockRequest(ROUTES.LOGIN);
      const loginRes = middleware(loginReq);
      expect(loginRes.status).toBe(200);

      const regReq = createMockRequest(ROUTES.REGISTER);
      const regRes = middleware(regReq);
      expect(regRes.status).toBe(200);

      const forgotReq = createMockRequest(ROUTES.FORGOT_PASSWORD);
      const forgotRes = middleware(forgotReq);
      expect(forgotRes.status).toBe(200);
    });

    it("redirects protected route to '/login?intended=...' when no session cookie exists", () => {
      const req = createMockRequest("/orders?page=2");
      const res = middleware(req);

      expect(res.status).toBe(307);
      const location = res.headers.get("location");
      expect(location).toBe(
        "http://localhost:3000/login?intended=%2Forders%3Fpage%3D2"
      );
    });

    it("allows protected route to pass through when session cookie exists", () => {
      const req = createMockRequest("/orders", { laravel_session: "valid_session" });
      const res = middleware(req);

      expect(res.status).toBe(200);
    });
  });
});
