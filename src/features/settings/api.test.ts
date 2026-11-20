import { describe, expect, it, vi, beforeEach } from "vitest";
import { api } from "@/lib/api";
import {
  getProfile,
  updateProfile,
  toggleDeviceVerification,
  changePassword,
  getActiveSessions,
  revokeOtherSessions,
  getTrustedDevices,
  revokeTrustedDevice,
  getSecurityActivity,
  MOCK_PROFILE,
  MOCK_SESSIONS,
  MOCK_TRUSTED_DEVICES,
  MOCK_SECURITY_ACTIVITY,
} from "./api";

vi.mock("@/lib/api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("settings api (F13)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches user profile", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: MOCK_PROFILE });
    const profile = await getProfile();
    expect(api.get).toHaveBeenCalledWith("/api/v1/profile");
    expect(profile.email).toBe("amara.nwosu@example.com");
  });

  it("updates user profile", async () => {
    const updated = { ...MOCK_PROFILE, name: "Amara Okonkwo" };
    vi.mocked(api.patch).mockResolvedValueOnce({ data: updated });
    const payload = {
      name: "Amara Okonkwo",
      username: "amaranwosu",
      email: "amara.nwosu@example.com",
    };
    const res = await updateProfile(payload);
    expect(api.patch).toHaveBeenCalledWith(
      "/api/v1/profile",
      expect.objectContaining({
        first_name: "Amara",
        last_name: "Okonkwo",
        username: "amaranwosu",
        email: "amara.nwosu@example.com",
      })
    );
    expect(res.name).toBe("Amara Okonkwo");
  });

  it("submits change password with re-authentication payload", async () => {
    vi.mocked(api.put).mockResolvedValueOnce({
      data: { message: "Password updated successfully" },
    });
    const payload = {
      current_password: "OldPassword123!",
      password: "NewPassword123!",
      password_confirmation: "NewPassword123!",
    };
    const res = await changePassword(payload);
    expect(api.put).toHaveBeenCalledWith(
      "/api/v1/profile/password",
      payload
    );
    expect(res.message).toBe("Password updated successfully");
  });

  it("fetches active sessions", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: MOCK_SESSIONS });
    const sessions = await getActiveSessions();
    expect(api.get).toHaveBeenCalledWith("/api/v1/profile/sessions");
    expect(sessions).toHaveLength(3);
    expect(sessions[0].is_current).toBe(true);
  });

  it("revokes other active sessions", async () => {
    vi.mocked(api.delete).mockResolvedValueOnce({
      data: { message: "All other sessions signed out" },
    });
    const res = await revokeOtherSessions();
    expect(api.delete).toHaveBeenCalledWith(
      "/api/v1/profile/sessions/other",
      undefined
    );
    expect(res.message).toBe("All other sessions signed out");
  });

  it("fetches trusted devices and revokes a device", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: MOCK_TRUSTED_DEVICES });
    const devices = await getTrustedDevices();
    expect(api.get).toHaveBeenCalledWith("/api/v1/auth/devices");
    expect(devices).toHaveLength(2);

    vi.mocked(api.delete).mockResolvedValueOnce({
      data: { message: "Device revoked" },
    });
    const revokeRes = await revokeTrustedDevice("dev_02");
    expect(api.delete).toHaveBeenCalledWith("/api/v1/auth/devices/dev_02");
    expect(revokeRes.message).toBe("Device revoked");
  });

  it("fetches security activity audit log", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: MOCK_SECURITY_ACTIVITY,
    });
    const activity = await getSecurityActivity();
    expect(api.get).toHaveBeenCalledWith(
      "/api/v1/profile/security-activity"
    );
    expect(activity).toHaveLength(4);
  });

  describe("toggleDeviceVerification (opt-in OTP)", () => {
    it("sends device_verification_enabled: true to PATCH /api/v1/profile", async () => {
      vi.mocked(api.patch).mockResolvedValueOnce({
        data: {
          ...MOCK_PROFILE,
          device_verification_enabled: true,
        },
      });

      const res = await toggleDeviceVerification(true);
      expect(api.patch).toHaveBeenCalledWith("/api/v1/profile", {
        device_verification_enabled: true,
      });
      expect(res.device_verification_enabled).toBe(true);
    });

    it("sends device_verification_enabled: false to PATCH /api/v1/profile", async () => {
      vi.mocked(api.patch).mockResolvedValueOnce({
        data: {
          ...MOCK_PROFILE,
          device_verification_enabled: false,
        },
      });

      const res = await toggleDeviceVerification(false);
      expect(api.patch).toHaveBeenCalledWith("/api/v1/profile", {
        device_verification_enabled: false,
      });
      expect(res.device_verification_enabled).toBe(false);
    });
  });
});
