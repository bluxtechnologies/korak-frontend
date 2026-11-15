# 19 — Observability

## 1. Purpose
Be able to see what the system is doing, find the cause of a failure quickly, and be alerted before customers notice, without leaking sensitive data.

## 2. Logging
- **Structured (JSON) logs** with consistent fields: timestamp, level, message, `request_id`, user type/ID (when authenticated), route.
- Levels used meaningfully: `error` for failures needing attention, `warning` for suspicious or degraded conditions, `info` for key events, `debug` only locally.
- **Never logged:** passwords, OTPs, session IDs, tokens, API keys, provider credentials, delivered account credentials, full payment data.
- Log retention period is OPEN.
- Audit events (Doc 12) are a separate, durable record; logs are for diagnostics.

## 3. Request correlation
Every request gets a `request_id`. Next.js forwards it to the API in a header; the API includes it in logs, audit events, and error responses (the reference ID in a generic `500`). Support can then trace one customer problem across both apps.

## 4. Error tracking
OPEN: tooling. Requirements: captures unhandled exceptions in both apps, groups duplicates, strips sensitive data before sending, and notifies the team. The frontend reports unexpected errors from error boundaries without including user input.

## 5. Health and metrics
- Uptime checks on `app.<domain>` and the API health endpoint.
- Tracked: error rate, response times, queue depth and queue latency, failed jobs, scheduler last-run, database connectivity.

## 6. Alerts (proposed starting set)
- API or web unreachable
- Elevated error rate
- Failed jobs, or queue backlog above a threshold
- Provider or gateway failures above a threshold (Doc 15)
- Reconciliation mismatch between ledger and wallet balance or provider records (Doc 14)
- Unusual authentication activity, such as a spike in failed logins or lockouts
- Backup failure

Each alert names an owner and a first action. Alerts that fire often without needing action are tuned or removed.

## 7. Dashboards (admin-facing, later)
Operational views of orders by state, failed provider calls, and queue health. Any admin-facing view follows the permission rules in Doc 13.

## 8. Privacy
Collect only what is needed to operate and secure the service. Observability data is access-controlled; production data is never copied to local machines for debugging.
