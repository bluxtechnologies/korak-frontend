# 12 — Audit Logging

## 1. Purpose
A tamper-resistant record of who did what, to what, and when. It is separate from application logs (Doc 19): audit events are business/security records meant to be queried; logs are diagnostics.

## 2. What is recorded (proposed, confirm)
- **Authentication:** login success/failure, lockout, logout, password reset requested/completed, password changed
- **Devices:** device verification issued/passed/failed, device trusted/revoked
- **Sessions:** other sessions terminated
- **Sensitive data:** any reveal of VPN or social-account credentials
- **Money:** wallet credits/debits, refunds, manual adjustments
- **Orders:** state changes
- **Admin actions:** every state-changing admin action, with the admin identity

Read-only browsing is not audited unless it reveals sensitive data.

## 3. Event structure
| Field | Notes |
|-------|-------|
| `id` | Primary key |
| `occurred_at` | UTC timestamp |
| `actor_type` / `actor_id` | `customer`, `admin`, or `system` |
| `event` | Stable dotted name, e.g. `auth.login_failed` |
| `subject_type` / `subject_id` | Entity affected, if any |
| `ip_address` | Request IP |
| `user_agent` | Truncated |
| `request_id` | Correlates with logs (Doc 19) |
| `metadata` | JSON, **never** secrets (no passwords, OTPs, tokens, credentials) |

Exact schema is finalized with the entity documentation.

## 4. Integrity rules — Locked principles
- **Append-only.** No update or delete code paths exist for audit rows.
- Written inside the same database transaction as the action they describe where the action changes data, so a change cannot exist without its record.
- The application's database user is not granted `UPDATE`/`DELETE` on the audit table where the hosting setup allows it.
- Failed attempts are recorded too, not only successes.

## 5. Access
Reading audit events is restricted to admins with an explicit permission (Doc 13). Customers can see only a limited view of their own security activity (e.g. recent logins and devices) in Settings; they cannot see admin metadata.

## 6. Implementation shape
One small `AuditLogger` service injected where needed. Callers pass an event name and context; they do not build rows themselves. Event names live in a PHP enum so they are consistent and searchable.

## 7. Retention
OPEN. Proposal: keep security and money events for a fixed long period decided with business/legal input, and archive rather than delete.

## 8. Testing
Each audited action has a test asserting the event exists with the right actor and subject, and that no sensitive value appears in `metadata`.
