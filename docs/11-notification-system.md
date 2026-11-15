# 11 — Notification System

## 1. Scope
Customer-facing notifications through three outputs:
- **In-app notifications** (bell in the top bar, a notifications list)
- **Dashboard alerts** (persistent page-level banners)
- **Email**

Designed so future channels (SMS, push) are added without changing the code that raises notifications.

## 2. Mechanism — Locked principles
Laravel's built-in notification system with channels `database` and `mail`. A notification class declares its channels; callers only say *what happened*, never *how it is delivered*. Adding a channel later means adding a channel to the notification class, not editing callers.

- The default Laravel `notifications` table is used (polymorphic `notifiable`, so it works for both `customers` and `admins`).
- Email notifications are **queued** (queue driver `database` to start).

## 3. In-app notifications vs. dashboard alerts
| | In-app notification | Dashboard alert |
|---|---|---|
| Nature | Event that happened to the customer | Condition that currently applies |
| Lifetime | Stored, read/unread, history | Shown while the condition is true, dismissible only where safe |
| Example | "Your order was completed" | "Please verify your email" |

OPEN: whether system-wide alerts (e.g. maintenance notices) are needed and who creates them. Nothing is built for this until confirmed.

## 4. Candidate events (confirm before building)
Security: new-device login (OTP issued), device verified, password changed, account locked. Commerce: order status changes, wallet funded or debited. Each event is added to this list only when approved.

## 5. API (proposed)
- `GET /api/v1/notifications` — paginated, filterable by read state
- `GET /api/v1/notifications/unread-count`
- `PATCH /api/v1/notifications/{id}` — mark read
- `POST /api/v1/notifications/read-all`

All endpoints are scoped to the authenticated user; a customer can never read another user's notification.

## 6. Email rules
- Never include passwords, OTPs beyond the OTP email itself, full credentials, or full card/account numbers.
- Transactional emails only; plain, consistent template with Korak Digitals branding.
- Links that perform actions are single-use and expiring.
- Security emails (new device, password change, lockout) cannot be disabled by the customer. Whether other categories can be opted out is OPEN.

## 7. Frontend behaviour
- Bell shows an unread count and a short list; "View all" opens the full list.
- Unread count refreshes on window focus and on a modest interval (proposed). Realtime delivery is a later enhancement, not a requirement.
- Notification text is plain and never exposes internals.
- Toasts are for immediate feedback to an action the user just took, not for stored notifications.

## 8. Retention
OPEN: how long read notifications are kept. Proposal: prune read notifications after a fixed period via a scheduled job.

## 9. Testing
Each notification class has a test asserting its channels and that it is queued where email is used; endpoint tests assert ownership scoping.
