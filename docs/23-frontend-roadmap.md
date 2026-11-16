# 23 — Frontend Roadmap (`korak-web`)

20 phases, each split into sub-phases that can be built and reviewed independently. IDs are `F<phase>.<sub>`.

**Legend:** ⛔ blocked by an OPEN decision. "Needs" names the backend phase whose endpoints must exist (or be mocked at the API boundary) first.

Admin UI is not scheduled: its scope and hosting are OPEN (Docs 04 and 13). It will get its own phases once decided.

---

## F1 — Foundation
- F1.1 Create `korak-web` repo; scaffold Next.js (latest stable), App Router, strict TypeScript
- F1.2 Tailwind v4 and shadcn/ui initialization
- F1.3 Plus Jakarta Sans via `next/font`; Lucide installed
- F1.4 ESLint, Prettier, Vitest + Testing Library
- F1.5 `.env.example`, `docs/versions.md`, CI (lint, type check, tests, audit)

**Done when:** a fresh clone installs, builds, and passes CI. *Needs:* none.

## F2 — Design tokens and theming
- F2.1 Burgundy and neutral semantic tokens in `globals.css`
- F2.2 Status colors (info, success, warning, error) distinct from burgundy
- F2.3 8px global radius token; borders and near-zero shadow rules
- F2.4 Dark mode tokens and theme switching; contrast check in both modes

**Done when:** no component needs a raw palette class. *Needs:* none.

## F3 — Base UI components
- F3.1 Button (variants, disabled + spinner state)
- F3.2 Input, textarea, select, checkbox, radio, switch, labels
- F3.3 Card and Badge (text only; no icons or dots)
- F3.4 Alert (four levels) and toast provider
- F3.5 Dialog/modal and dropdown menu

**Done when:** all components follow Doc 05 and have component tests. *Needs:* F2.

## F4 — API client layer
- F4.1 Fetch wrapper in `lib/api` (base URL, credentials, JSON handling)
- F4.2 CSRF cookie handling and single retry on `419`
- F4.3 Error mapping to safe UI messages; response envelope parsing
- F4.4 Request ID header; server-side cookie forwarding for Server Components
- F4.5 Session-state events (`401` → session expired flow)

**Done when:** no component calls `fetch` directly. *Needs:* B2, B4.1.

## F5 — App shell and layouts
- F5.1 Navigation config (single source for sidebar and breadcrumbs)
- F5.2 Sidebar: collapse, active states, nested items
- F5.3 Top bar: notifications slot, user menu, profile, logout
- F5.4 Page container, page header, dashboard grid
- F5.5 Responsive mobile navigation: app-like Menu page (/menu) replacing modal drawer/bottom sheet on small screens

**Done when:** one consistent layout wraps every dashboard page. *Needs:* F3.

## F6 — Shared data components
- F6.1 DataTable: columns, sorting, pagination
- F6.2 Search bar and filter panel
- F6.3 Bulk selection
- F6.4 Empty, loading (skeleton), and error states
- F6.5 ConfirmDialog for destructive actions
- F6.6 Breadcrumb and page-level state components

**Done when:** a table gains all required features by supplying columns only. *Needs:* F3.

## F7 — Forms foundation
- F7.1 React Hook Form + Zod pattern; shared form field components
- F7.2 Submit state: disabled with spinner, double-submit prevention
- F7.3 Focus management (first invalid field) and accessible error wiring
- F7.4 Server field-error mapping
- F7.5 Password field with reveal toggle

**Done when:** a new form needs minimal code and meets Doc 09 rules. *Needs:* F3, F4.

## F8 — Auth screens I: Login and Register
- F8.1 Auth layout (trustworthy, not a landing page)
- F8.2 Login (username or email, password)
- F8.3 Register
- F8.4 Throttle/lockout messages handled generically

**Done when:** a user can register and log in against the API. *Needs:* F7, B4, B6.

## F9 — Auth screens II: Password reset and Session Expired
- F9.1 Forgot Password
- F9.2 Reset Password
- F9.3 Session Expired page preserving the intended destination

**Done when:** all three screens work end to end. *Needs:* F8, B5.

## F10 — Verify Device
- F10.1 OTP entry screen (accessible, keyboard friendly)
- F10.2 "Remember this device" option
- F10.3 Resend and attempt-limit messaging

**Done when:** login from an unrecognised device completes through verification. *Needs:* F8, B7.

## F11 — Route protection and session handling
- F11.1 Middleware: cookie-presence redirect (convenience only)
- F11.2 `(dashboard)` layout verifying the session via `auth/me`
- F11.3 Logout flow and cleanup
- F11.4 Handling `401`, `403`, `423`, `429` across the app

**Done when:** protected pages never render without a verified session. *Needs:* F4, B4.

## F12 — Account Overview
- F12.1 Overview page layout and summary cards
- F12.2 Wallet balance display (read-only)
- F12.3 Recent orders and recent transactions panels
- F12.4 Loading, empty, and error states

**Done when:** the overview reflects real data with all states handled. *Needs:* F5, F6, B13, B17.6.

## F13 — Profile and Settings
- F13.1 Profile view and edit
- F13.2 Change password
- F13.3 Active sessions: list and sign out others
- F13.4 Trusted devices: list and revoke
- F13.5 Recent security activity

**Done when:** all self-service actions work with confirmations where destructive. *Needs:* F7, B7.5, B11.

## F14 — Notifications UI
- F14.1 Bell with unread count (refresh on focus and interval)
- F14.2 Dropdown preview list and mark-as-read
- F14.3 Full notifications page
- F14.4 Dashboard alert banners ⛔ *system-alert decision*

**Done when:** notifications are readable, marked read, and scoped to the user. *Needs:* F5, B10.

## F15 — Wallet and Transaction History
- F15.1 Transaction History page (search, sort, filter, pagination)
- F15.2 Transaction detail view
- F15.3 Wallet funding UI ⛔ *payment gateway decision*

**Done when:** history is complete and read-only. *Needs:* F6, B13.4; F15.3 needs B14.

## F16 — Airtime and Data
- F16.1 Airtime purchase form with validation and confirmation step
- F16.2 Data purchase form
- F16.3 Order result states (pending, processing, completed, failed)
- F16.4 Idempotent submit handling (no double orders)

**Done when:** purchases complete and failures show safe messages. *Needs:* F7, B17.

## F16A — Numbers Activation ⛔ *blocked by Numbers Activation OPEN items*
- F16A.1 Provider integration & service selection UI
- F16A.2 Number request and order flow
- F16A.3 Code delivery to the customer (polling or push display; no claims of instant delivery)
- F16A.4 Expiry countdown, cancellation, and refund state handling

**Done when:** customers can order virtual numbers, view delivered verification codes, and observe cancellation and refund state on timeout. *Needs:* F7, B17A.

## F17 — Orders
- F17.1 Orders list (table features from F6)
- F17.2 Order detail with status timeline
- F17.3 Masked deliverables with explicit reveal
- F17.4 Status refresh while an order is processing

**Done when:** every service's orders appear here consistently. *Needs:* F6, B17.6.

## F18 — VPN and VPN Logs
- F18.1 VPN purchase flow
- F18.2 Credentials hidden by default; reveal with confirmation
- F18.3 VPN Logs page (content defined with Collins first)

**Done when:** VPN credentials are never visible unless explicitly revealed. *Needs:* F17, B18.

## F19 — Buy and Boost Social Media Accounts
- F19.1 Buy Social Media Account page and flow
- F19.2 Boost Social Media Account page and flow with input validation
- F19.3 Deliverables handled with masked reveal
- F19.4 Error and failure states

**Done when:** both flows run through the shared order UI. *Needs:* F17, B19.

## F20 — Quality, performance, and launch
- F20.1 Accessibility audit: keyboard runs, automated checks, contrast, focus
- F20.2 Responsive QA on tablet and mobile without regressing desktop
- F20.3 Performance pass: lazy loading, bundle review, image/font checks
- F20.4 Playwright journeys for critical flows (Doc 16)
- F20.5 Security headers (CSP etc.) and error reporting ⛔ *tool decision*
- F20.6 Production build and deployment to staging, then launch checklist (Docs 17, 19)

**Done when:** the launch checklist in Doc 17 is satisfied. *Needs:* all earlier phases.

---

## Parallel work with the backend
| Frontend | Can start when |
|----------|----------------|
| F1–F3, F5–F7 | Immediately (no backend needed) |
| F4, F8, F11 | B2 and B4 are available |
| F9, F10 | B5 and B7 are available |
| F12 onward | The matching backend phase is available |

Each sub-phase delivers code, tests, and documentation together (Docs 16 and 20).
