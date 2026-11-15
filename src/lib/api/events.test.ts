import { afterEach, describe, expect, it, vi } from "vitest";
import {
  clearApiEventListeners,
  emitPermissionDenied,
  emitSessionExpired,
  onPermissionDenied,
  onSessionExpired,
} from "./events";

describe("API Session-State Events (lib/api/events)", () => {
  afterEach(() => {
    clearApiEventListeners();
  });

  it("notifies session expired subscribers and supports unsubscribe", () => {
    const listener = vi.fn();
    const unsubscribe = onSessionExpired(listener);

    emitSessionExpired({
      endpoint: "/api/v1/wallet",
      status: 401,
      code: "unauthenticated",
    });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        endpoint: "/api/v1/wallet",
        status: 401,
        code: "unauthenticated",
        intendedPath: expect.any(String),
      })
    );

    unsubscribe();

    emitSessionExpired({
      endpoint: "/api/v1/orders",
      status: 401,
      code: "unauthenticated",
    });

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("notifies permission denied subscribers on 403 events", () => {
    const listener = vi.fn();
    onPermissionDenied(listener);

    emitPermissionDenied({
      endpoint: "/api/v1/admin/users",
      status: 403,
      code: "forbidden",
      intendedPath: "/admin/users",
    });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({
      endpoint: "/api/v1/admin/users",
      status: 403,
      code: "forbidden",
      intendedPath: "/admin/users",
    });
  });

  it("isolates failing listeners so remaining subscribers still execute", () => {
    const failingListener = vi.fn(() => {
      throw new Error("Listener crash");
    });
    const healthyListener = vi.fn();

    onSessionExpired(failingListener);
    onSessionExpired(healthyListener);

    expect(() =>
      emitSessionExpired({
        endpoint: "/api/v1/profile",
        status: 401,
        code: "session_expired",
      })
    ).not.toThrow();

    expect(failingListener).toHaveBeenCalledTimes(1);
    expect(healthyListener).toHaveBeenCalledTimes(1);
  });
});
