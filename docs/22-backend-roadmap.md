# 22 — Backend Roadmap (`korak-api`)

20 phases, each split into sub-phases that can be built and reviewed independently. IDs are `B<phase>.<sub>`.

**Legend:** ⛔ blocked until the named OPEN decision is resolved (see `00-README.md`). "Done when" is the acceptance check for the phase.

---

## B1 — Foundation
- B1.1 Create `korak-api` repo; scaffold Laravel 13 on PHP 8.4; MySQL connection
- B1.2 Remove web-oriented defaults not needed for an API-only app
- B1.3 Install and configure Pest, Pint, Larastan
- B1.4 `.env.example`, `docs/versions.md` with pinned versions
- B1.5 CI pipeline: lint → static analysis → tests → dependency audit

**Done when:** a fresh clone installs, migrates, and passes CI.

## B2 — API core
- B2.1 `/api/v1` route structure and versioning
- B2.2 Response envelope helpers and base API Resources
- B2.3 Centralized exception handler (safe JSON, reference ID, no internals)
- B2.4 Request ID middleware (accepts `X-Request-ID`, returns it)
- B2.5 CORS and Sanctum stateful configuration (Doc 04)
- B2.6 Health endpoint check and baseline rate limiters

**Done when:** every error path returns the standard envelope and leaks nothing.

## B3 — Identity data layer
- B3.1 `customers` migration (public ID, username, email, password, timestamps)
- B3.2 `admins` migration (separate table)
- B3.3 Models, factories, seeders (no real credentials)
- B3.4 Guards and providers: `customer` and `admin`

**Done when:** both identities exist independently with factories and tests.

## B4 — Customer authentication
- B4.1 CSRF cookie endpoint and session configuration (HttpOnly, Secure, SameSite)
- B4.2 Register endpoint with Form Request and bcrypt hashing
- B4.3 Login by username **or** email; session regeneration
- B4.4 Logout (full session invalidation)
- B4.5 `auth/me` endpoint via a Resource

**Done when:** register → login → me → logout works with generic error messages.

## B5 — Password reset
- B5.1 Forgot-password endpoint (identical response whether or not the account exists)
- B5.2 Reset-password endpoint (single-use, expiring token)
- B5.3 Reset email notification; sessions invalidated after reset

**Done when:** the reset flow works and cannot be used to discover accounts.

## B6 — Login protection
- B6.1 Per-identifier + IP throttling
- B6.2 Temporary lockout after repeated failures (numbers per Doc 08, confirm)
- B6.3 Lockout notice email to the account owner
- B6.4 Identical error messages for wrong password, unknown user, locked account

**Done when:** brute-force attempts are throttled and locked without revealing which rule fired.

## B7 — Device verification
- B7.1 Trusted-devices table and token hashing
- B7.2 Unrecognised device detection on login
- B7.3 Emailed OTP (hashed, single-use, expiring, attempt-limited)
- B7.4 Verify-device endpoint and "remember device" option
- B7.5 List and revoke trusted devices

**Done when:** an unrecognised device cannot reach protected endpoints until verified.

## B8 — Admin authentication foundation
- B8.1 Admin login/logout/me on the `admin` guard under `/api/v1/admin`
- B8.2 Guard separation tests (customer session cannot reach admin routes and vice versa)
- B8.3 Admin session cookie separation ⛔ *admin hosting decision*

**Done when:** the two identities can never satisfy each other's routes.

## B9 — Audit logging
- B9.1 `audit_events` table and `AuditLogger` service; event-name enum
- B9.2 Instrument authentication and device events
- B9.3 Instrument sensitive reveals and (later) money/order/admin events
- B9.4 Append-only enforcement and tests that metadata holds no secrets

**Done when:** audited actions always produce a record and none can be edited.

## B10 — Notifications
- B10.1 Notifications table and base notification classes (`database` + `mail`)
- B10.2 Queued email delivery; queue worker configured
- B10.3 Endpoints: list, unread count, mark read, read all
- B10.4 Security notifications wired (new device, password change, lockout)

**Done when:** a customer sees only their own notifications and security emails are sent.

## B11 — Profile & settings
- B11.1 View and update profile
- B11.2 Change password (re-authentication required)
- B11.3 Active sessions list and sign out other sessions
- B11.4 Recent security activity view for the customer

**Done when:** all account self-service actions are audited and ownership-scoped.

## B12 — Admin permissions ⛔ *admin roles decision (Doc 13)*
- B12.1 Implement the chosen model (single level / fixed roles / configurable)
- B12.2 Gates/Policies; deny-by-default; abilities returned from `auth/me`
- B12.3 Re-authentication requirement for high-impact actions
- B12.4 Admin-side operations: scope to be defined by Collins; nothing built until listed

**Done when:** every admin endpoint has an explicit authorization rule and tests.

## B13 — Wallet & ledger core
- B13.1 Wallet and append-only ledger migrations (integer minor units, currency)
- B13.2 Single balance-change code path (transaction + row lock)
- B13.3 Concurrency and consistency tests (no overdraw; ledger sum = balance)
- B13.4 Transaction history endpoint (search, sort, filter, pagination)

**Done when:** balances change only through the ledger path and cannot go negative.

## B14 — Funding & payments ⛔ *payment gateway decision*
- B14.1 Funding record model and pending state
- B14.2 Gateway client behind one class; sandbox configuration
- B14.3 Webhook endpoint (signature verification, replay protection, idempotent)
- B14.4 Credit wallet only after server-side confirmation
- B14.5 Reconciliation job and mismatch alert

**Done when:** a wallet is credited exactly once per confirmed payment.

## B15 — Pricing & catalog ⛔ *price source decision*
- B15.1 Catalog entities as defined once services and plans are specified
- B15.2 Server-side price calculation; price stored on each order
- B15.3 Price change rules and auditing

**Done when:** clients can never influence the price charged.

## B16 — Provider framework ⛔ *provider names*
- B16.1 Provider config and secrets handling
- B16.2 First provider class with timeouts and outcome mapping (success/failed/unknown)
- B16.3 Fake provider for tests; HTTP fakes and fixtures
- B16.4 Queued execution and "unknown outcome" reconciliation job

**Done when:** provider failures never reach customers as raw errors and tests never hit real providers.

## B17 — Orders, airtime and data
- B17.1 Orders table, state machine, idempotency keys (Doc 14)
- B17.2 Order placement Action: debit → create order → dispatch job
- B17.3 Airtime endpoints
- B17.4 Data endpoints
- B17.5 Failure path: automatic refund entry and notification
- B17.6 Orders list and detail endpoints

**Done when:** an airtime or data order completes or refunds correctly under concurrent and failure tests.

## B17A — Numbers Activation ⛔ *blocked by Numbers Activation OPEN items (provider, pricing, delivery, refund/expiry, compliance)*
- B17A.1 Provider integration
- B17A.2 Number request and order
- B17A.3 Code delivery to the customer
- B17A.4 Expiry, cancellation and refund

**Done when:** virtual number orders allocate numbers, deliver incoming verification codes to the customer reliably without claims of instant delivery, and cleanly cancel and refund on expiry.

## B18 — VPN and VPN logs
- B18.1 VPN purchase flow reusing the order engine
- B18.2 Encrypted storage of delivered credentials; masked responses
- B18.3 Audited reveal endpoint
- B18.4 VPN logs endpoint (contents defined with Collins before building)

**Done when:** VPN credentials are never returned unmasked except through the audited reveal.

## B19 — Social media accounts and boosting
- B19.1 Buy social account flow with encrypted deliverables and audited reveal
- B19.2 Boost flow (target inputs validated and sanitized)
- B19.3 Service-specific states and failure handling
- B19.4 Provider terms/compliance notes recorded in provider docs

**Done when:** both flows complete or refund through the shared order engine.

## B20 — Hardening and launch readiness
- B20.1 Security review against Doc 08; dependency audit; headers and cookie checks
- B20.2 Full authorization and enumeration test sweep
- B20.3 Observability: structured logs, alerts, error tracking ⛔ *tool decision*
- B20.4 Staging deployment, backups with a tested restore ⛔ *hosting decision*
- B20.5 Endpoint, entity, module, and security-decision documentation complete
- B20.6 Production runbook and go-live checklist (Doc 17)

**Done when:** the pre-launch checklist in Doc 17 is fully satisfied.

---

## Notes
- Phases B1–B11 contain no OPEN dependencies except where marked, so work can start immediately.
- Phases B13 onward assume admin and money decisions are made before their ⛔ sub-phases begin.
- Each sub-phase delivers code, tests, and documentation together (Docs 16 and 20).
