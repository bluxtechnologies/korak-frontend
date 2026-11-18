/**
 * Profile & Settings API service and data models (F13).
 * Follows Doc 06 response envelopes, Doc 08 security rules, and Doc 09 standards.
 */
import { api } from "@/lib/api";
import { unwrapApiResponse } from "@/lib/api/errors";
import type { ApiResponse } from "@/lib/api/types";
import { resolveRealName } from "@/features/auth/api";

// ---------------------------------------------------------------------------
// Types & Interfaces (F13)
// ---------------------------------------------------------------------------

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  username: string;
  phone?: string;
  email_verified_at: string | null;
  created_at: string;
}

export interface UpdateProfilePayload {
  name: string;
  username: string;
  email: string;
  phone?: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface ActiveSession {
  id: string;
  is_current: boolean;
  device_type: "desktop" | "mobile" | "tablet";
  browser: string;
  ip_address: string;
  location?: string;
  last_active_at: string;
}

export interface TrustedDevice {
  id: string;
  device_name: string;
  ip_address: string;
  trusted_at: string;
  last_used_at: string;
}

export interface SecurityActivity {
  id: string;
  event:
    | "login_success"
    | "login_failed"
    | "password_changed"
    | "device_verified"
    | "session_revoked"
    | "device_revoked";
  description: string;
  ip_address: string;
  user_agent?: string;
  created_at: string;
  status: "success" | "warning" | "info";
}

// ---------------------------------------------------------------------------
// API Methods
// ---------------------------------------------------------------------------

/**
 * Fetches current customer profile.
 */
export async function getProfile(): Promise<UserProfile> {
  const response = await api.get<ApiResponse<UserProfile> | UserProfile>(
    "/api/v1/profile"
  );
  const unwrapped = unwrapApiResponse(response) as unknown as Record<
    string,
    unknown
  >;
  const rawProfile = (
    unwrapped?.user && typeof unwrapped.user === "object"
      ? unwrapped.user
      : unwrapped
  ) as unknown as Partial<UserProfile> & {
    first_name?: string | null;
    last_name?: string | null;
    full_name?: string | null;
  };

  const resolvedName = resolveRealName(rawProfile);

  return {
    id: String(rawProfile?.id ?? ""),
    name: resolvedName || rawProfile?.name || rawProfile?.username || "",
    username: rawProfile?.username || "",
    email: rawProfile?.email || "",
    phone: rawProfile?.phone ?? "",
    email_verified_at: rawProfile?.email_verified_at ?? null,
    created_at: rawProfile?.created_at ?? new Date().toISOString(),
  };
}

/**
 * Updates editable profile information (name, username, email, phone).
 */
export async function updateProfile(
  payload: UpdateProfilePayload
): Promise<UserProfile> {
  const response = await api.patch<ApiResponse<UserProfile> | UserProfile>(
    "/api/v1/profile",
    payload
  );
  const unwrapped = unwrapApiResponse(response) as unknown as Record<
    string,
    unknown
  >;
  const rawProfile = (
    unwrapped?.user && typeof unwrapped.user === "object"
      ? unwrapped.user
      : unwrapped
  ) as unknown as Partial<UserProfile>;

  return {
    id: String(rawProfile?.id ?? ""),
    name: rawProfile?.name || payload.name || rawProfile?.username || "",
    username: rawProfile?.username || payload.username || "",
    email: rawProfile?.email || payload.email || "",
    phone: rawProfile?.phone ?? payload.phone ?? "",
    email_verified_at: rawProfile?.email_verified_at ?? null,
    created_at: rawProfile?.created_at ?? new Date().toISOString(),
  };
}

/**
 * Changes customer password. Requires current password for re-authentication (B11.2).
 */
export async function changePassword(
  payload: ChangePasswordPayload
): Promise<{ message: string }> {
  const response = await api.post<ApiResponse<{ message: string }>>(
    "/api/v1/profile/password",
    payload
  );
  return unwrapApiResponse(response);
}

/**
 * Fetches all currently active sessions for the customer.
 */
export async function getActiveSessions(): Promise<ActiveSession[]> {
  const response = await api.get<ApiResponse<ActiveSession[]>>(
    "/api/v1/profile/sessions"
  );
  return unwrapApiResponse(response);
}

/**
 * Revokes all active sessions except the current session.
 */
export async function revokeOtherSessions(): Promise<{ message: string }> {
  const response = await api.post<ApiResponse<{ message: string }>>(
    "/api/v1/profile/sessions/revoke-others"
  );
  return unwrapApiResponse(response);
}

/**
 * Fetches all remembered/trusted devices for the customer.
 */
export async function getTrustedDevices(): Promise<TrustedDevice[]> {
  const response = await api.get<ApiResponse<TrustedDevice[]>>(
    "/api/v1/profile/devices"
  );
  return unwrapApiResponse(response);
}

/**
 * Revokes a specific trusted device by ID.
 */
export async function revokeTrustedDevice(
  deviceId: string
): Promise<{ message: string }> {
  const response = await api.delete<ApiResponse<{ message: string }>>(
    `/api/v1/profile/devices/${encodeURIComponent(deviceId)}`
  );
  return unwrapApiResponse(response);
}

/**
 * Fetches recent security and authentication activity audit log.
 */
export async function getSecurityActivity(): Promise<SecurityActivity[]> {
  const response = await api.get<ApiResponse<SecurityActivity[]>>(
    "/api/v1/profile/security-activity"
  );
  return unwrapApiResponse(response);
}

// ---------------------------------------------------------------------------
// Realistic Mock Fixtures (for fallback and test isolation)
// ---------------------------------------------------------------------------

export const MOCK_PROFILE: UserProfile = {
  id: "usr_korak_091",
  name: "Amara Nwosu",
  email: "amara.nwosu@example.com",
  username: "amaranwosu",
  phone: "08023456789",
  email_verified_at: "2026-10-15T08:00:00Z",
  created_at: "2026-10-15T08:00:00Z",
};

export const MOCK_SESSIONS: ActiveSession[] = [
  {
    id: "sess_curr_01",
    is_current: true,
    device_type: "desktop",
    browser: "Chrome 130 on Windows 11",
    ip_address: "102.89.41.22",
    location: "Lagos, Nigeria",
    last_active_at: new Date().toISOString(),
  },
  {
    id: "sess_other_02",
    is_current: false,
    device_type: "mobile",
    browser: "Safari on iPhone 15 Pro",
    ip_address: "102.89.41.85",
    location: "Lagos, Nigeria",
    last_active_at: "2026-11-13T21:40:00Z",
  },
  {
    id: "sess_other_03",
    is_current: false,
    device_type: "desktop",
    browser: "Firefox on macOS",
    ip_address: "197.210.54.12",
    location: "Abuja, Nigeria",
    last_active_at: "2026-11-12T14:15:00Z",
  },
];

export const MOCK_TRUSTED_DEVICES: TrustedDevice[] = [
  {
    id: "dev_01",
    device_name: "Work PC (Chrome on Windows)",
    ip_address: "102.89.41.22",
    trusted_at: "2026-10-20T10:00:00Z",
    last_used_at: "2026-11-14T10:00:00Z",
  },
  {
    id: "dev_02",
    device_name: "Personal iPhone (Safari on iOS)",
    ip_address: "102.89.41.85",
    trusted_at: "2026-10-25T15:30:00Z",
    last_used_at: "2026-11-13T21:40:00Z",
  },
];

export const MOCK_SECURITY_ACTIVITY: SecurityActivity[] = [
  {
    id: "sec_act_01",
    event: "login_success",
    description: "Successful login from recognized device",
    ip_address: "102.89.41.22",
    user_agent: "Chrome 130 on Windows 11",
    created_at: "2026-11-14T09:15:00Z",
    status: "success",
  },
  {
    id: "sec_act_02",
    event: "device_verified",
    description: "New device verified via emailed OTP code",
    ip_address: "102.89.41.85",
    user_agent: "Safari on iPhone 15 Pro",
    created_at: "2026-11-13T21:38:00Z",
    status: "info",
  },
  {
    id: "sec_act_03",
    event: "password_changed",
    description: "Account password changed successfully",
    ip_address: "102.89.41.22",
    user_agent: "Chrome 130 on Windows 11",
    created_at: "2026-11-10T12:00:00Z",
    status: "info",
  },
  {
    id: "sec_act_04",
    event: "login_failed",
    description: "Failed login attempt (invalid credentials)",
    ip_address: "197.210.88.14",
    user_agent: "Chrome 129 on Android",
    created_at: "2026-11-08T18:22:00Z",
    status: "warning",
  },
];
