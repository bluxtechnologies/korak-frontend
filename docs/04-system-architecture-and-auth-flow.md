# 04 — System Architecture & Auth Flow

## 1. Overview
```text
Browser ──► korak-web (Next.js) ──► korak-api (Laravel) ──► MySQL
   │                                      ▲
   └──────── direct XHR/fetch (cookies) ──┘
```
Both the browser and Next.js server code call the same versioned API (`/api/v1`). Laravel is the only source of truth for data and authorization.

## 2. Authentication model — Locked
Sanctum **session-based SPA authentication**. No tokens in JavaScript; the session lives in an HttpOnly cookie.

### Domain requirement
Cookie sessions need both apps on the same registrable domain:
- Production: `app.<domain>` (web) and `api.<domain>` (API), cookie domain `.<domain>`
- Local: `localhost:3000` and `localhost:8000` (same host, different ports works)

### Required API configuration
- `SANCTUM_STATEFUL_DOMAINS` lists the frontend host(s)
- `SESSION_DOMAIN` set to the shared parent domain
- CORS: `supports_credentials = true`, explicit allowed origin (never `*`)
- Session cookie: `HttpOnly`, `Secure` (production), `SameSite=Lax`

## 3. Login flow
1. Frontend calls `GET /sanctum/csrf-cookie` (sets `XSRF-TOKEN`).
2. Frontend calls `POST /api/v1/auth/login` with credentials (username **or** email, plus password), sending `X-XSRF-TOKEN` and `credentials: include`.
3. API throttles, authenticates, and regenerates the session ID.
4. If the device is unrecognised: API responds that device verification is required; the session is **not** granted full access until the emailed OTP is verified (see §5).
5. Frontend loads the current customer via `GET /api/v1/auth/me`.

## 4. Handling session states
| API response | Frontend behaviour |
|--------------|--------------------|
| `401` | Session missing or expired → Session Expired page, preserving the intended destination |
| `419` | CSRF token mismatch → refetch CSRF cookie and retry **once**, then treat as `401` |
| `403` | Permission denied → show a clear "no access" state; never a redirect loop |
| `423` / `429` | Locked out / throttled → generic message with retry timing; no detail about which rule fired |

## 5. Verify device
- A device is **recognised** if the request carries a valid trusted-device token for that customer (stored hashed server-side).
- Unrecognised device → OTP emailed → customer enters code on the Verify Device screen → on success the device may be marked trusted ("Remember device", optional checkbox).
- Trusted devices are revocable from Settings.
- OTPs are single-use, short-lived, hashed at rest, and rate-limited.

## 6. Next.js specifics
- **Middleware** may only check that a session cookie exists, to avoid flashing protected pages. It is a convenience, never a security control.
- **Server Components** that call the API must forward the incoming `Cookie` header and set an `Origin`/`Referer` matching a stateful domain, otherwise Sanctum treats the request as unauthenticated.
- The `(dashboard)` layout verifies the session via `auth/me` before rendering.
- API errors are mapped to safe UI messages in `lib/api`; raw API messages are never rendered blindly.

## 7. Customers and admins
- Customers authenticate against `customers`; admins against `admins` (separate table and guard). Locked.
- **OPEN:** where the admin UI is hosted. If admin and customer UIs share the same cookie domain, the two guards must not share a session in a way that lets one browser hold both identities. Options: (a) separate subdomain and session cookie name for admin (recommended), (b) same app with strict guard separation. Decide before the roles document.

## 8. Future: Two-Factor Authentication
Not built now. The users schema and login flow reserve a place for a second step so adding TOTP/passkeys later is an addition, not a rewrite (see Doc 08).
