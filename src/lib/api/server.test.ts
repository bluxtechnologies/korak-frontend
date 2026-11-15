import { headers } from "next/headers";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getServerForwardHeaders, serverApi } from "./server";

vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

describe("Server Component API Client (lib/api/server)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("forwards Cookie, Origin, Referer, X-Request-ID, and X-XSRF-TOKEN from incoming headers", async () => {
    const mockIncoming = new Headers({
      cookie: "korak_session=abc123; XSRF-TOKEN=xsrf%2Bval%3D",
      origin: "https://app.korakdigital.com",
      referer: "https://app.korakdigital.com/dashboard",
      "x-request-id": "req-incoming-555",
    });

    vi.mocked(headers).mockResolvedValue(mockIncoming);

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ data: { id: "usr_1" } }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const result = await serverApi.get<{ data: { id: string } }>(
      "/api/v1/auth/me"
    );

    expect(result).toEqual({ data: { id: "usr_1" } });
    expect(mockFetch).toHaveBeenCalledTimes(1);

    const [, init] = mockFetch.mock.calls[0];
    expect(init.headers.get("Cookie")).toBe(
      "korak_session=abc123; XSRF-TOKEN=xsrf%2Bval%3D"
    );
    expect(init.headers.get("Origin")).toBe("https://app.korakdigital.com");
    expect(init.headers.get("Referer")).toBe(
      "https://app.korakdigital.com/dashboard"
    );
    expect(init.headers.get("X-Request-ID")).toBe("req-incoming-555");
    expect(init.headers.get("X-XSRF-TOKEN")).toBe("xsrf+val=");
  });

  it("derives Origin and Referer from forwarded host/proto when missing", async () => {
    const mockIncoming = new Headers({
      cookie: "korak_session=xyz",
      "x-forwarded-host": "app.korakdigital.com",
      "x-forwarded-proto": "https",
    });

    vi.mocked(headers).mockResolvedValue(mockIncoming);

    const forwarded = await getServerForwardHeaders();
    expect(forwarded.get("Origin")).toBe("https://app.korakdigital.com");
    expect(forwarded.get("Referer")).toBe("https://app.korakdigital.com/");
    expect(forwarded.get("Cookie")).toBe("korak_session=xyz");
  });

  it("falls back safely when headers() throws outside a request context", async () => {
    vi.mocked(headers).mockRejectedValue(
      new Error("headers() called outside request scope")
    );

    const forwarded = await getServerForwardHeaders();
    expect(forwarded.get("Origin")).toBe("http://localhost:3000");
    expect(forwarded.get("Referer")).toBe("http://localhost:3000/");
  });

  it("allows caller options headers to take precedence over forwarded headers", async () => {
    const mockIncoming = new Headers({
      cookie: "korak_session=abc",
      "x-request-id": "incoming-id",
    });

    vi.mocked(headers).mockResolvedValue(mockIncoming);

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ ok: true }),
    });
    vi.stubGlobal("fetch", mockFetch);

    await serverApi.post(
      "/api/v1/orders",
      { amount: 500 },
      {
        headers: {
          "X-Request-ID": "override-id",
        },
      }
    );

    const [, init] = mockFetch.mock.calls[0];
    expect(init.headers.get("X-Request-ID")).toBe("override-id");
    expect(init.headers.get("Cookie")).toBe("korak_session=abc");
  });
});
