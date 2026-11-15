# 08 — Security Standards

Security is the first success criterion. When it conflicts with convenience, security wins.

## 1. Authentication
- Login by **username or email**, plus password.
- Passwords hashed with **bcrypt** (Laravel `bcrypt` driver, cost 12 proposed). Plaintext is never stored, logged, or returned.
- Password policy (proposed): minimum 12 characters, checked against a common-password list, no forced periodic rotation.
- Forgot/reset password: single-use, short-lived tokens; the response is identical whether or not the account exists.
- Registration and login errors are generic and never reveal whether a username/email exists.

## 2. Throttling and lockout (proposed numbers, confirm)
- **Throttle:** login limited per identifier + IP (e.g. 5 attempts per minute).
- **Lockout:** after repeated failures (e.g. 5 consecutive) the account is temporarily locked (e.g. 15 minutes), with an email notice to the owner.
- Same generic message for wrong password, unknown user, and locked account.
- OTP and password-reset endpoints have their own stricter limiters.

## 3. Sessions
- Session ID regenerated on login and on privilege change; fully invalidated on logout.
- Cookie: `HttpOnly`, `Secure` (production), `SameSite=Lax`.
- Idle timeout and absolute lifetime defined in config; expiry leads to the Session Expired screen.
- Customers can view active sessions and sign out other devices (Settings).

## 4. Device verification
- Unrecognised device → emailed OTP before access is granted.
- OTPs: random, single-use, short-lived, hashed at rest, attempt-limited.
- "Remember device" is optional and stored as a hashed token bound to the customer; revocable by the customer.

## 5. Two-Factor Authentication — design only
Not implemented now. Reserved so it can be added without breaking changes:
- Login flow supports an intermediate "second factor required" state.
- A dedicated table (to be designed later) holds factors; nothing is added to `customers` speculatively.

## 6. Authorization
- Every endpoint requires authentication unless explicitly public.
- Access to a customer's data is enforced by Laravel **Policies**; queries are scoped to the owner. Never rely on the frontend to hide things.
- Admin and customer guards are separate (Locked). Admin permissions are OPEN and not invented here.

## 7. Input and output
- Validation occurs on both client and server; the server is authoritative.
- All input is untrusted: validated, typed, and used only via parameter binding/Eloquent.
- API Resources define exactly which fields leave the server; models are never returned directly.
- Sensitive values (VPN credentials, account credentials, API keys) are encrypted at rest, masked by default in responses, and revealed only through an explicit, logged action.

## 8. Error handling
Centralized handler (Doc 10). Responses never contain SQL, file paths, stack traces, framework details, or validation-rule internals. Logs hold details; users get a generic message and a reference ID.

## 9. Transport and browser hardening
- HTTPS only in production, HSTS enabled.
- Next.js security headers: Content-Security-Policy, `X-Content-Type-Options`, `Referrer-Policy`, `frame-ancestors` restriction.
- CORS: explicit origin allow-list.
- No secrets in the frontend bundle; only non-sensitive values use `NEXT_PUBLIC_`.

## 10. Money and orders
Idempotency keys, ledger transactions with row locking, and server-side price calculation (the client never supplies a price). Details in Docs 06 and 07.

## 11. UI behaviours that encourage secure use
Hide passwords by default, confirm destructive actions, prevent double-submit, show permission state clearly, distinguish warning/error/critical visually.

## 12. Dependencies and operations
- Dependency audit (`composer audit`, `npm audit`) runs in CI.
- Secrets live in environment variables or a secrets manager, never in the repository.
- `APP_DEBUG=false` in every non-local environment.
- Log redaction: passwords, OTPs, tokens, and credentials are never written to logs.

## 13. Decision log
Each security decision made later is recorded in `docs/security-decisions.md` with date, decision, and reason.
