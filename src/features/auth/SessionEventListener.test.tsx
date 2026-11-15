import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { SessionEventListener } from "./SessionEventListener";
import { emitSessionExpired, clearApiEventListeners } from "@/lib/api/events";

const mockPush = vi.fn();
let mockPathname = "/orders";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => mockPathname,
}));

describe("SessionEventListener (F4.5 / F9.3)", () => {
  beforeEach(() => {
    mockPush.mockClear();
    clearApiEventListeners();
    mockPathname = "/orders";
  });

  it("redirects to /session-expired with intended parameter when session expires", () => {
    render(<SessionEventListener />);

    emitSessionExpired({
      endpoint: "/api/v1/orders",
      status: 401,
      code: "session_expired",
      intendedPath: "/orders",
    });

    expect(mockPush).toHaveBeenCalledWith("/session-expired?intended=%2Forders");
  });

  it("does not redirect when already on an auth screen (/login)", () => {
    mockPathname = "/login";
    render(<SessionEventListener />);

    emitSessionExpired({
      endpoint: "/api/v1/auth/login",
      status: 401,
      code: "invalid_credentials",
      intendedPath: "/login",
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("does not redirect when already on /session-expired", () => {
    mockPathname = "/session-expired";
    render(<SessionEventListener />);

    emitSessionExpired({
      endpoint: "/api/v1/auth/me",
      status: 401,
      code: "session_expired",
      intendedPath: "/session-expired",
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("unsubscribes from events when unmounted", () => {
    const { unmount } = render(<SessionEventListener />);
    unmount();

    emitSessionExpired({
      endpoint: "/api/v1/orders",
      status: 401,
      code: "session_expired",
      intendedPath: "/orders",
    });

    expect(mockPush).not.toHaveBeenCalled();
  });
});
