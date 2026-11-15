import { describe, it, expect, vi, beforeEach } from "vitest";
import { requireAuthUser } from "./server-session";
import { ApiClientError } from "@/lib/api/client";

// Mock next/navigation redirect
const mockRedirect = vi.fn();
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    mockRedirect(url);
    const err = new Error("NEXT_REDIRECT");
    (err as unknown as { digest: string }).digest = `NEXT_REDIRECT;replace;${url};307;`;
    throw err;
  },
}));

// Mock next/headers
let mockHeaderStore = new Map<string, string>();
vi.mock("next/headers", () => ({
  headers: async () => ({
    get: (key: string) => mockHeaderStore.get(key.toLowerCase()) ?? null,
  }),
}));

// Mock serverApi
vi.mock("@/lib/api/server", () => ({
  serverApi: {
    get: vi.fn(),
  },
}));
import { serverApi } from "@/lib/api/server";
const mockServerGet = vi.mocked(serverApi.get);

describe("requireAuthUser (F11.2)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHeaderStore = new Map();
  });

  it("returns verified AuthUser when GET /api/v1/auth/me succeeds", async () => {
    mockServerGet.mockResolvedValueOnce({
      data: {
        id: "usr_100",
        name: "Collins Okeke",
        email: "collins@example.com",
        username: "collins",
        email_verified_at: "2026-01-01T00:00:00Z",
        created_at: "2026-01-01T00:00:00Z",
      },
    });

    const user = await requireAuthUser();

    expect(user.id).toBe("usr_100");
    expect(user.name).toBe("Collins Okeke");
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("redirects to /session-expired?intended=... on 401 unauthenticated response", async () => {
    mockHeaderStore.set("referer", "http://localhost:3000/orders?status=active");

    mockServerGet.mockRejectedValueOnce(
      new ApiClientError("Unauthenticated.", 401, "unauthenticated")
    );

    await expect(requireAuthUser()).rejects.toThrow("NEXT_REDIRECT");

    expect(mockRedirect).toHaveBeenCalledWith(
      "/session-expired?intended=%2Forders%3Fstatus%3Dactive"
    );
  });

  it("does not preserve auth pages (like /register) in intended on 401 redirect", async () => {
    mockHeaderStore.set("referer", "http://localhost:3000/register");

    mockServerGet.mockRejectedValueOnce(
      new ApiClientError("Unauthenticated.", 401, "unauthenticated")
    );

    await expect(requireAuthUser()).rejects.toThrow("NEXT_REDIRECT");

    expect(mockRedirect).toHaveBeenCalledWith(
      "/session-expired?intended=%2Foverview"
    );
  });

  it("redirects to /login?locked=true on 423 account locked response", async () => {
    mockServerGet.mockRejectedValueOnce(
      new ApiClientError("Account locked.", 423, "account_locked")
    );

    await expect(requireAuthUser()).rejects.toThrow("NEXT_REDIRECT");

    expect(mockRedirect).toHaveBeenCalledWith("/login?locked=true");
  });

  it("rethrows unexpected server errors (500) for error boundary to handle", async () => {
    mockServerGet.mockRejectedValueOnce(
      new ApiClientError("Internal server error.", 500, "server_error")
    );

    await expect(requireAuthUser()).rejects.toThrow(ApiClientError);
    expect(mockRedirect).not.toHaveBeenCalled();
  });
});
