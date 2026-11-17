import { describe, expect, it } from "vitest";
import {
  formatNotificationMessage,
  formatNotificationTime,
} from "./formatters";

describe("Notification Formatters (formatNotificationMessage)", () => {
  it("formats raw Windows Chrome user-agent into clean readable sentence", () => {
    const raw =
      "A new device (Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36) was added.";
    const result = formatNotificationMessage(raw);
    expect(result).toBe("A new sign-in from Chrome on Windows was verified.");
  });

  it("formats macOS Safari user-agent cleanly", () => {
    const raw =
      "A new device (Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15)";
    const result = formatNotificationMessage(raw);
    expect(result).toBe("A new sign-in from Safari on macOS was verified.");
  });

  it("formats iPhone Safari user-agent cleanly", () => {
    const raw =
      "Login from Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15";
    const result = formatNotificationMessage(raw);
    expect(result).toBe("A new sign-in from Safari on iPhone was verified.");
  });

  it("leaves normal business messages unchanged", () => {
    const msg =
      "Your Airtel 5GB Monthly bundle has been credited to 08021234567.";
    expect(formatNotificationMessage(msg)).toBe(msg);
  });
});

describe("Notification Formatters (formatNotificationTime)", () => {
  it("returns 'Just now' for very recent dates", () => {
    const recent = new Date().toISOString();
    expect(formatNotificationTime(recent)).toBe("Just now");
  });

  it("returns relative minutes for dates within an hour", () => {
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    expect(formatNotificationTime(tenMinAgo)).toBe("10m ago");
  });
});
