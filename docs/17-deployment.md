# 17 — Deployment

## 1. Status
OPEN: hosting provider(s). This document defines requirements so any suitable host works.

## 2. Environments
`local` → `staging` → `production`. Staging mirrors production (same versions, HTTPS, domain structure) with separate databases, secrets, and provider sandbox credentials. Nothing reaches production without passing through staging.

## 3. Topology
- `korak-web` (Next.js) served at `app.<domain>`
- `korak-api` (Laravel) served at `api.<domain>`
- Shared parent domain for Sanctum cookies (Doc 04)
- MySQL accessible only from the API, never publicly
- A supervised **queue worker** and a **scheduler** (cron) for the API

## 4. Requirements
- HTTPS everywhere with HSTS; HTTP redirects to HTTPS.
- Secrets provided by environment variables or a secrets manager; `.env` is never committed.
- `APP_DEBUG=false`, `APP_ENV=production` in production.
- PHP 8.4 runtime for the API; a supported Node LTS for the web app.
- Health endpoint for uptime checks (Laravel's built-in `/up`).

## 5. Release steps
**API:** install dependencies without dev packages → run `php artisan migrate --force` → cache config, routes, and events → restart queue workers (so they load new code) → verify health.

**Web:** install dependencies → `next build` → start/restart the production server → verify the login page and one authenticated page.

## 6. Order and compatibility
- Deploy the **API first**, then the web app. API changes must stay backward compatible with the currently deployed frontend (add before you remove).
- Database migrations use expand/contract: add columns/tables first, switch code, remove old structures in a later release.
- Never edit a migration that has been deployed.

## 7. Backups and recovery
- Automated MySQL backups with a stated retention period (OPEN: period), stored separately from the database host.
- Restores are **tested** on a schedule, not assumed to work.
- Recovery objectives (how much data loss and downtime are acceptable) are OPEN and should be set before launch.

## 8. Rollback
Application code can be rolled back to the previous release. Database rollbacks are avoided in production; because of expand/contract, the previous code remains compatible with the new schema.

## 9. CI/CD (proposed)
Each repo: CI on every pull request (Doc 16 gates); automatic deploy to staging on merge to `main`; production deploy by a tagged release with manual approval.

## 10. Operational checklist before launch
Backups verified · queue worker supervised and restarting on failure · scheduler running · email delivery verified · provider/gateway credentials set to production · error tracking and alerts live (Doc 19) · rate limits enabled · security headers verified.
