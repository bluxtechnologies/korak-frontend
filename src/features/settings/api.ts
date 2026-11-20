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
  first_name?: string | null;
  last_name?: string | null;
  email_verified_at: string | null;
  created_at: string;
  device_verification_enabled?: boolean;
  has_virtual_account?: boolean;
}

export interface UpdateProfilePayload {
  name?: string;
  username?: string;
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  device_verification_enabled?: boolean;
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

function parseUserAgent(ua?: string | null): {
  device_type: "desktop" | "mobile" | "tablet";
  browser: string;
} {
  if (!ua) return { device_type: "desktop", browser: "Web Browser" };
  const lower = ua.toLowerCase();
  let device_type: "desktop" | "mobile" | "tablet" = "desktop";
  if (
    lower.includes("mobile") ||
    lower.includes("android") ||
    lower.includes("iphone")
  ) {
    device_type = "mobile";
  } else if (lower.includes("ipad") || lower.includes("tablet")) {
    device_type = "tablet";
  }

  let browser = "Web Browser";
  if (lower.includes("chrome") && !lower.includes("edg")) browser = "Chrome";
  else if (lower.includes("safari") && !lower.includes("chrome")) browser = "Safari";
  else if (lower.includes("edg")) browser = "Edge";
  else if (lower.includes("firefox")) browser = "Firefox";

  if (lower.includes("windows")) browser += " on Windows";
  else if (lower.includes("macintosh") || lower.includes("mac os")) browser += " on macOS";
  else if (lower.includes("android")) browser += " on Android";
  else if (lower.includes("iphone") || lower.includes("ios")) browser += " on iOS";
  else if (lower.includes("linux")) browser += " on Linux";

  return { device_type, browser };
}

function normalizeSecurityEvent(event: string): {
  normalizedEvent: SecurityActivity["event"];
  description: string;
  status: "success" | "warning" | "info";
} {
  const e = (event || "").replace(/^auth\./, "").toLowerCase();
  switch (e) {
    case "login_success":
    case "login":
      return {
        normalizedEvent: "login_success",
        description: "Successful login from recognized device",
        status: "success",
      };
    case "login_failed":
      return {
        normalizedEvent: "login_failed",
        description: "Failed login attempt",
        status: "warning",
      };
    case "password_changed":
      return {
        normalizedEvent: "password_changed",
        description: "Account password changed successfully",
        status: "info",
      };
    case "device_verified":
      return {
        normalizedEvent: "device_verified",
        description: "Device verified via security verification",
        status: "info",
      };
    case "session_revoked":
    case "session_revoked_other":
      return {
        normalizedEvent: "session_revoked",
        description: "Active session signed out",
        status: "warning",
      };
    case "device_revoked":
    case "device_revoked_all":
      return {
        normalizedEvent: "device_revoked",
        description: "Trusted device revoked",
        status: "warning",
      };
    default:
      return {
        normalizedEvent: "login_success",
        description: event ? event.replace(/[._]/g, " ") : "Security Event",
        status: "info",
      };
  }
}

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
    phone_number?: string | null;
    device_verification_enabled?: boolean;
    has_virtual_account?: boolean;
  };

  const resolvedName =
    rawProfile?.name ||
    rawProfile?.full_name ||
    [rawProfile?.first_name, rawProfile?.last_name].filter(Boolean).join(" ") ||
    resolveRealName(rawProfile) ||
    rawProfile?.username ||
    "";

  return {
    id: String(rawProfile?.id ?? ""),
    name: resolvedName,
    first_name: rawProfile?.first_name ?? null,
    last_name: rawProfile?.last_name ?? null,
    username: rawProfile?.username || "",
    email: rawProfile?.email || "",
    phone: rawProfile?.phone ?? rawProfile?.phone_number ?? "",
    email_verified_at: rawProfile?.email_verified_at ?? null,
    created_at: rawProfile?.created_at ?? new Date().toISOString(),
    device_verification_enabled: Boolean(rawProfile?.device_verification_enabled),
    has_virtual_account: Boolean(rawProfile?.has_virtual_account),
  };
}

/**
 * Toggles opt-in device verification (OTP) on or off for the customer account.
 * PATCH /api/v1/profile { device_verification_enabled: boolean }
 */
export async function toggleDeviceVerification(
  enabled: boolean
): Promise<UserProfile> {
  const response = await api.patch<ApiResponse<UserProfile> | UserProfile>(
    "/api/v1/profile",
    {
      device_verification_enabled: enabled,
    }
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
    phone_number?: string | null;
    device_verification_enabled?: boolean;
    has_virtual_account?: boolean;
  };

  const resolvedName =
    rawProfile?.name ||
    rawProfile?.full_name ||
    [rawProfile?.first_name, rawProfile?.last_name].filter(Boolean).join(" ") ||
    resolveRealName(rawProfile) ||
    rawProfile?.username ||
    "";

  return {
    id: String(rawProfile?.id ?? ""),
    name: resolvedName,
    first_name: rawProfile?.first_name ?? null,
    last_name: rawProfile?.last_name ?? null,
    username: rawProfile?.username || "",
    email: rawProfile?.email || "",
    phone: rawProfile?.phone ?? rawProfile?.phone_number ?? "",
    email_verified_at: rawProfile?.email_verified_at ?? null,
    created_at: rawProfile?.created_at ?? new Date().toISOString(),
    device_verification_enabled:
      rawProfile?.device_verification_enabled !== undefined
        ? Boolean(rawProfile.device_verification_enabled)
        : enabled,
    has_virtual_account: Boolean(rawProfile?.has_virtual_account),
  };
}

/**
 * Updates editable profile information (name, username, email, phone, security toggles).
 * Splits composite full name into first_name and last_name for backend Laravel compatibility.
 */
export async function updateProfile(
  payload: UpdateProfilePayload
): Promise<UserProfile> {
  const trimmedName = (payload.name ?? "").trim();
  const nameParts = trimmedName ? trimmedName.split(/\s+/) : [];
  const firstName = payload.first_name || (nameParts[0] ?? "");
  const lastName = payload.last_name || (nameParts.slice(1).join(" ") ?? "");

  const body: Record<string, unknown> = {};

  if (payload.username !== undefined) body.username = payload.username;
  if (payload.email !== undefined) body.email = payload.email;
  if (firstName) body.first_name = firstName;
  if (lastName) body.last_name = lastName;
  if (trimmedName) body.name = trimmedName;
  if (payload.phone !== undefined) {
    body.phone = payload.phone;
    body.phone_number = payload.phone;
  }
  if (payload.device_verification_enabled !== undefined) {
    body.device_verification_enabled = payload.device_verification_enabled;
  }

  const response = await api.patch<ApiResponse<UserProfile> | UserProfile>(
    "/api/v1/profile",
    body
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
    phone_number?: string | null;
  };

  const resolvedName =
    rawProfile?.name ||
    rawProfile?.full_name ||
    [rawProfile?.first_name, rawProfile?.last_name].filter(Boolean).join(" ") ||
    payload.name ||
    rawProfile?.username ||
    "";

  return {
    id: String(rawProfile?.id ?? ""),
    name: resolvedName,
    first_name: rawProfile?.first_name ?? (firstName || null),
    last_name: rawProfile?.last_name ?? (lastName || null),
    username: rawProfile?.username || payload.username || "",
    email: rawProfile?.email || payload.email || "",
    phone: rawProfile?.phone ?? rawProfile?.phone_number ?? payload.phone ?? "",
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
  const response = await api.put<ApiResponse<{ message: string }>>(
    "/api/v1/profile/password",
    payload
  );
  return unwrapApiResponse(response);
}

/**
 * Fetches all currently active sessions for the customer.
 */
export async function getActiveSessions(): Promise<ActiveSession[]> {
  const response = await api.get<ApiResponse<Array<Record<string, unknown>>>>(
    "/api/v1/profile/sessions"
  );
  const items = unwrapApiResponse(response);
  const list = Array.isArray(items) ? items : [];

  return list.map((raw) => {
    const ua = typeof raw.user_agent === "string" ? raw.user_agent : "";
    const parsed = parseUserAgent(ua);
    return {
      id: String(raw.id ?? ""),
      is_current: Boolean(raw.is_current),
      device_type: (raw.device_type as ActiveSession["device_type"]) || parsed.device_type,
      browser: typeof raw.browser === "string" ? raw.browser : parsed.browser,
      ip_address: String(raw.ip_address ?? "Unknown IP"),
      location: typeof raw.location === "string" ? raw.location : undefined,
      last_active_at: String(raw.last_active_at || raw.last_activity || new Date().toISOString()),
    };
  });
}

/**
 * Revokes all active sessions except the current session.
 */
export async function revokeOtherSessions(
  currentPassword?: string
): Promise<{ message: string }> {
  const response = await api.delete<ApiResponse<{ message: string }>>(
    "/api/v1/profile/sessions/other",
    currentPassword ? { body: { current_password: currentPassword } } : undefined
  );
  return unwrapApiResponse(response);
}

/**
 * Revokes a specific session by its opaque identifier.
 */
export async function revokeSession(
  sessionId: string
): Promise<{ message: string }> {
  const response = await api.delete<ApiResponse<{ message: string }>>(
    `/api/v1/profile/sessions/${encodeURIComponent(sessionId)}`
  );
  return unwrapApiResponse(response);
}

/**
 * Fetches all remembered/trusted devices for the customer (Doc 04 §4.5).
 */
export async function getTrustedDevices(): Promise<TrustedDevice[]> {
  const response = await api.get<ApiResponse<Array<Record<string, unknown>>>>(
    "/api/v1/auth/devices"
  );
  const items = unwrapApiResponse(response);
  const list = Array.isArray(items) ? items : [];

  return list.map((raw) => ({
    id: String(raw.id ?? ""),
    device_name: String(raw.device_name ?? "Recognized Device"),
    ip_address: String(raw.ip_address ?? "Unknown IP"),
    trusted_at: String(raw.trusted_at || raw.created_at || new Date().toISOString()),
    last_used_at: String(raw.last_used_at || raw.created_at || new Date().toISOString()),
  }));
}

/**
 * Revokes a specific trusted device by ULID.
 */
export async function revokeTrustedDevice(
  deviceId: string
): Promise<{ message: string }> {
  const response = await api.delete<ApiResponse<{ message: string }>>(
    `/api/v1/auth/devices/${encodeURIComponent(deviceId)}`
  );
  return unwrapApiResponse(response);
}

/**
 * Fetches recent security and authentication activity audit log.
 */
export async function getSecurityActivity(): Promise<SecurityActivity[]> {
  const response = await api.get<ApiResponse<Array<Record<string, unknown>>>>(
    "/api/v1/profile/security-activity"
  );
  const items = unwrapApiResponse(response);
  const list = Array.isArray(items) ? items : [];

  return list.map((raw) => {
    const rawEvent = String(raw.event ?? "");
    const normalized = normalizeSecurityEvent(rawEvent);
    return {
      id: String(raw.id ?? ""),
      event: (raw.event as SecurityActivity["event"]) || normalized.normalizedEvent,
      description: typeof raw.description === "string" ? raw.description : normalized.description,
      ip_address: String(raw.ip_address ?? "Unknown IP"),
      user_agent: typeof raw.user_agent === "string" ? raw.user_agent : undefined,
      created_at: String(raw.created_at || raw.occurred_at || new Date().toISOString()),
      status: (raw.status as SecurityActivity["status"]) || normalized.status,
    };
  });
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
  device_verification_enabled: false,
  has_virtual_account: true,
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
