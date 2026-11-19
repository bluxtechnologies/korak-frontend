/**
 * Auth feature API service (F8/F9/F10).
 * All API calls go through lib/api per Doc 09 §4 — no direct fetch().
 */
import { api, fetchCsrfCookie } from "@/lib/api";
import { unwrapApiResponse } from "@/lib/api/errors";
import type { ApiResponse } from "@/lib/api/types";

// ---------------------------------------------------------------------------
// API Shapes (types live next to the feature's api.ts per Doc 09 §5)
// ---------------------------------------------------------------------------

export interface LoginPayload {
  /** Username or email (backend accepts both) */
  login: string;
  password: string;
  remember_me?: boolean;
}

export interface RegisterPayload {
  name: string;
  phone_number?: string;
  username?: string;
  email: string;
  password: string;
  password_confirmation: string;
  terms: boolean;
}

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
}

/**
 * Resolves the customer's actual display name (real user name, NOT username).
 *
 * Checks in order:
 * 1. full_name (if not identical to username)
 * 2. Combined [first_name, last_name] (if not identical to username)
 * 3. first_name (if not identical to username)
 * 4. name (if not identical to username)
 * 5. fallbackName (if provided and not identical to username)
 * 6. Only if no actual name exists anywhere does it return username or fallback
 */
export function resolveRealName(
  user?: {
    name?: string | null;
    username?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    full_name?: string | null;
  } | null,
  fallbackName?: string
): string {
  if (!user) return fallbackName || "";

  const username = user.username?.trim();

  // 1. full_name
  if (user.full_name?.trim()) {
    const fullName = user.full_name.trim();
    if (!username || fullName.toLowerCase() !== username.toLowerCase()) {
      return fullName;
    }
  }

  // 2. Combined first_name and last_name
  const first = user.first_name?.trim();
  const last = user.last_name?.trim();
  const combined = [first, last].filter(Boolean).join(" ");
  if (combined) {
    if (!username || combined.toLowerCase() !== username.toLowerCase()) {
      return combined;
    }
  }

  // 3. first_name
  if (first && (!username || first.toLowerCase() !== username.toLowerCase())) {
    return first;
  }

  // 4. name
  if (user.name?.trim()) {
    const name = user.name.trim();
    if (!username || name.toLowerCase() !== username.toLowerCase()) {
      return name;
    }
  }

  // 5. fallbackName if provided and distinct from username
  if (fallbackName?.trim()) {
    const fallback = fallbackName.trim();
    if (!username || fallback.toLowerCase() !== username.toLowerCase()) {
      return fallback;
    }
  }

  // 6. Last resort
  return fallbackName || user.name || username || "";
}

export const MOCK_AUTH_USER: AuthUser = {
  id: "usr_korak_091",
  name: "Amara Nwosu",
  username: "amaranwosu",
  email: "amara.nwosu@example.com",
  email_verified_at: "2026-10-15T08:00:00Z",
  created_at: "2026-10-15T08:00:00Z",
};

export type CustomerResource = AuthUser;

export interface LoginResponse {
  user: AuthUser;
  /** Present when device is unrecognised; triggers Verify Device flow (F10) */
  requires_device_verification?: boolean;
  challenge_token?: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordPayload {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface VerifyDevicePayload {
  challenge_token: string;
  /** 6-digit or formatted verification code */
  code: string;
  /** Whether to store a trusted-device token for this customer */
  remember_device?: boolean;
  device_name?: string;
}

export interface VerifyDeviceResponse {
  user: AuthUser;
  device_token?: string;
  message?: string;
}

export interface ResendOtpResponse {
  message: string;
}

// ---------------------------------------------------------------------------
// Auth API calls
// ---------------------------------------------------------------------------

/**
 * Logs the user in via Sanctum SPA authentication.
 * Pre-fetches CSRF cookie per Doc 04 §3 before POSTing credentials.
 * Supports both object payload and (loginIdentifier, password) call signatures.
 */
export async function login(
  payloadOrLogin: LoginPayload | string,
  maybePassword?: string
): Promise<LoginResponse> {
  await fetchCsrfCookie();
  const payload: LoginPayload =
    typeof payloadOrLogin === "string"
      ? { login: payloadOrLogin, password: maybePassword ?? "" }
      : payloadOrLogin;

  const raw = await api.post<ApiResponse<AuthUser | LoginResponse>>(
    "/api/v1/auth/login",
    {
      login: payload.login,
      password: payload.password,
    }
  );
  const unwrapped = unwrapApiResponse(raw) as unknown as Record<string, unknown>;
  const isDeviceVerification =
    unwrapped?.status === "device_verification_required" ||
    Boolean(unwrapped?.requires_device_verification);

  const rawUser = unwrapped?.user;
  const user: AuthUser = (rawUser && typeof rawUser === "object" ? rawUser : unwrapped) as unknown as AuthUser;
  if (user) {
    const resolved = resolveRealName(user);
    user.name = resolved || user.name || user.username;
  }

  return {
    user,
    requires_device_verification: isDeviceVerification,
    challenge_token: (unwrapped?.challenge_token as string) || undefined,
  };
}

/**
 * Registers a new customer account.
 * Pre-fetches CSRF cookie before POSTing registration data.
 * Upon successful creation, logs the user in to establish an active session per Doc 04 §3.
 */
export async function register(
  payload: RegisterPayload
): Promise<LoginResponse> {
  await fetchCsrfCookie();
  const fallbackUsername =
    payload.username ||
    (payload.email ? payload.email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "") : "");

  const raw = await api.post<ApiResponse<AuthUser | LoginResponse>>(
    "/api/v1/auth/register",
    {
      name: payload.name,
      username: fallbackUsername,
      phone_number: payload.phone_number,
      phone: payload.phone_number,
      email: payload.email,
      password: payload.password,
      password_confirmation: payload.password_confirmation,
      terms: payload.terms,
    }
  );
  const unwrapped = unwrapApiResponse(raw) as unknown as Record<string, unknown>;

  try {
    // Automatically log in to establish the session cookie and handle device verification
    return await login({
      login: payload.phone_number || payload.email,
      password: payload.password,
    });
  } catch {
    const isDeviceVerification =
      unwrapped?.status === "device_verification_required" ||
      Boolean(unwrapped?.requires_device_verification);

    const rawUser = unwrapped?.user;
    const user: AuthUser = (rawUser && typeof rawUser === "object" ? rawUser : unwrapped) as unknown as AuthUser;
    if (user && !user.name) {
      user.name = payload.name || user.username;
    }

    return {
      user,
      requires_device_verification: isDeviceVerification,
      challenge_token: (unwrapped?.challenge_token as string) || undefined,
    };
  }
}

/**
 * Returns the currently authenticated customer.
 * Used by the dashboard layout to verify the session (Doc 04 §6).
 */
export async function getMe(): Promise<AuthUser> {
  const raw = await api.get<ApiResponse<AuthUser>>("/api/v1/auth/me");
  const user = unwrapApiResponse(raw);
  const resolved = resolveRealName(user);
  if (resolved) {
    user.name = resolved;
  } else if (!user.name) {
    user.name = user.username;
  }
  return user;
}

/**
 * Checks if the current session is authenticated (Workflow 1).
 * Returns the Authenticated user or null if unauthenticated.
 */
export async function checkSession(): Promise<AuthUser | null> {
  try {
    return await getMe();
  } catch {
    // 401 unauthenticated - user is a guest, clear client auth state
    return null;
  }
}

/**
 * Logs the user out, invalidating the Sanctum session.
 */
export async function logout(): Promise<{ message: string }> {
  const raw = await api.post<ApiResponse<{ message: string }>>(
    "/api/v1/auth/logout",
    {}
  );
  return unwrapApiResponse(raw);
}

/**
 * Requests a password reset link.
 * Pre-fetches CSRF cookie before POSTing.
 * Response is identical whether or not the account exists (Doc 08 §2 / B5.1).
 */
export async function forgotPassword(
  payload: ForgotPasswordPayload
): Promise<ForgotPasswordResponse> {
  await fetchCsrfCookie();
  const raw = await api.post<ApiResponse<ForgotPasswordResponse> | ForgotPasswordResponse>(
    "/api/v1/auth/forgot-password",
    payload
  );
  return unwrapApiResponse(raw);
}

/**
 * Resets the customer's password using the single-use token from the reset email.
 * Pre-fetches CSRF cookie before POSTing.
 */
export async function resetPassword(
  payload: ResetPasswordPayload
): Promise<ResetPasswordResponse> {
  await fetchCsrfCookie();
  const raw = await api.post<ApiResponse<ResetPasswordResponse> | ResetPasswordResponse>(
    "/api/v1/auth/reset-password",
    payload
  );
  return unwrapApiResponse(raw);
}

/**
 * Verifies the emailed OTP code for an unrecognised device (F10 / B7).
 * Pre-fetches CSRF cookie before POSTing.
 */
export async function verifyDevice(
  payload: VerifyDevicePayload
): Promise<VerifyDeviceResponse> {
  await fetchCsrfCookie();
  const raw = await api.post<ApiResponse<VerifyDeviceResponse> | VerifyDeviceResponse>(
    "/api/v1/auth/verify-device",
    {
      challenge_token: payload.challenge_token,
      code: payload.code,
      remember_device: payload.remember_device,
      ...(payload.device_name ? { device_name: payload.device_name } : {}),
    }
  );
  return unwrapApiResponse(raw);
}

/**
 * Resends the verification OTP code to the customer's email (F10.3).
 * Pre-fetches CSRF cookie before POSTing.
 */
export async function resendVerificationCode(): Promise<ResendOtpResponse> {
  await fetchCsrfCookie();
  const raw = await api.post<ApiResponse<ResendOtpResponse> | ResendOtpResponse>(
    "/api/v1/auth/verify-device/resend"
  );
  return unwrapApiResponse(raw);
}
