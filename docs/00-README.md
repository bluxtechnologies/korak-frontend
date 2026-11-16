# Korak Digitals — Technical Documentation

Status: Draft v0.3 · Documents 01–23 drafted.

Korak Digitals is a customer marketplace for airtime, data, VPN, and social media accounts/boosting. The frontend (Next.js) and backend (Laravel API) are separate projects with separate repositories and workflows.

## Index

| # | Document | Purpose |
|---|----------|---------|
| 01 | Project Overview & Scope | What we build, for whom, and what we do not build |
| 02 | Tech Stack & Versions | Locked technologies and the version-pinning rule |
| 03 | Repository & Folder Structure | Both repos and their layouts |
| 04 | System Architecture & Auth Flow | Sanctum session auth between Next.js and Laravel |
| 05 | Design System | Tokens, components, forbidden styles |
| 06 | API Standards | REST conventions, envelope, errors, pagination |
| 07 | Database Standards | Schema conventions, money, audit, integrity |
| 08 | Security Standards | Auth, lockout, throttling, sessions, 2FA readiness |
| 09 | Frontend Standards | Next.js structure, forms, tables, TypeScript rules |
| 10 | Backend Standards | Laravel structure, exceptions, testing, DI |
| 11 | Notification System | In-app, dashboard alerts, email; future channels |
| 12 | Audit Logging | Append-only record of security and business events |
| 13 | Roles & Permissions | Ownership rules for customers; admin model options |
| 14 | Wallet & Payments | Ledger, order flow, funding, reconciliation |
| 15 | Provider Integrations | How any provider is integrated; per-provider template |
| 16 | Testing Strategy | Layers, must-have tests, CI gates |
| 17 | Deployment | Environments, release steps, backups, rollback |
| 18 | Git Workflow | Branching, commits, pull requests, releases |
| 19 | Observability | Logging, correlation IDs, alerts, error tracking |
| 20 | Documentation Standards | What to document, templates, definition of done |
| 21 | Communication Rules | How Collins and Claude work, decide, and report |
| 22 | Backend Roadmap | 20 phases (B1–B20) with sub-phases |
| 23 | Frontend Roadmap | 20 phases (F1–F20) with sub-phases |
| 25 | Frontend Customer Endpoints Handoff | TypeScript contracts, client methods, and integration guide for customer APIs |

## Conventions used in these documents

- **Locked** = agreed by Collins and Claude.
- **(proposed)** = Claude's recommendation, awaiting confirmation.
- **OPEN** = a decision that is not made. Nothing marked OPEN may be implemented until resolved.

## Open decisions (consolidated)

### Carried over from 01–10
1. ~~**Burgundy hex value.**~~ **Locked:** `#7A1F3D` (confirmed by Collins).
2. **Admin frontend hosting.** Same Next.js app under `/admin`, or a separate subdomain/app with its own session cookie (recommended). Docs 04, 13.
3. **Data-fetching library.** Server Components plus a fetch wrapper by default; TanStack Query only if needed (Doc 09).
4. **Lockout and password numbers.** Thresholds in Doc 08 are proposed.
5. **Public identifier format** (ULID vs. UUID) (Doc 07).
6. **Academic demonstrability.** Dropped from the success criteria unless you say otherwise.

### From 11–20
7. **Admin roles/permissions model.** Option A (single level), B (fixed roles), or C (configurable). Please list the admin types you need (Doc 13).
8. **Provider names** for airtime, data, VPN, social accounts, boosting, SMS, and payments; one provider document each (Doc 15).
9. **Payment gateway(s) and funding methods** (Doc 14).
10. **Price source and who may change prices** (Doc 14).
11. **Refund policy, limits, and manual-adjustment rules** (Doc 14).
12. **System-wide dashboard alerts** needed or not, and who creates them (Doc 11).
13. **Notification opt-outs** for non-security emails (Doc 11).
14. **Retention periods** for notifications, audit events, logs, and backups (Docs 11, 12, 17, 19).
15. **Hosting provider**, recovery objectives, and backup retention (Doc 17).
16. **Error-tracking tool** (Doc 19).
17. **API documentation tooling** and whether to generate TypeScript types from it (Docs 06, 16).
18. **Where the shared standards documents live** (dedicated docs repo vs. copied into each repo) (Doc 20).
19. **Compliance review** of social-account sales/boosting and VPN delivery under provider and platform terms (Doc 15).

### From F7A (Guest & Legal Pages)
20. **Legal text review.** Privacy Policy and Terms of Service drafts require legal counsel review and sign-off before `legalReviewed` is enabled (Doc 23 F7A.3).
21. **Contact & corporate identity details.** Formal company registration entity, legal jurisdiction, and official support contact email are unconfirmed (Doc 23 F7A.3).
22. **Production site domain URL.** The official production domain is OPEN (documented via `NEXT_PUBLIC_SITE_URL` in `.env.example`).

### From F5 / Numbers Activation
23. **Numbers Activation provider.** Provider selection and API credentials for virtual number procurement and verification code reception (Doc 15, B17A.1, F16A.1).
24. **Numbers Activation pricing.** Price source and margin rules for virtual numbers across countries and service targets (Doc 14, B17A.2).
25. **Code delivery mechanism.** Method for delivering verification codes to the customer (polling vs. push). Do not make claims of instant delivery anywhere.
26. **Refund and expiry rules.** Expiry duration, auto-cancellation, and automated wallet refund rules when no code arrives before expiration (Doc 14, B17A.4, F16A.4).
27. **Compliance review.** Review of provider and platform terms for temporary virtual numbers used for verification codes (Doc 15).

## Changelog
- v0.3: Added communication rules and the backend and frontend roadmaps (21–23).
- v0.2: Added documents 11–20; consolidated open decisions.
- v0.1: Documents 01–10.
