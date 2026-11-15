# 16 — Testing Strategy

## 1. Goals
Prove that security rules, money handling, and core flows keep working as the system grows. Critical business logic must be testable on its own, without HTTP or a browser.

## 2. Layers
| Layer | Backend (`korak-api`) | Frontend (`korak-web`) |
|-------|----------------------|------------------------|
| Unit | Pest: Actions, services, enums, ledger logic | Vitest: utilities, Zod schemas, hooks |
| Integration | Pest feature tests: every endpoint through HTTP with a real test database | Vitest + Testing Library: components, forms, tables |
| End-to-end | — | Playwright against a running API in a test environment |

Most tests are fast unit/integration tests; end-to-end tests are few and cover only critical journeys.

## 3. Must-have backend tests
- Every endpoint: success, validation failure (`422`), unauthenticated (`401`), unauthorized (`403`/`404`), throttled (`429`) where applicable.
- Ownership: a customer cannot read or change another customer's data. A customer session cannot reach admin routes, and the reverse.
- Auth: lockout after repeated failures, generic errors (no account enumeration), device verification flow, session invalidation on logout.
- Money: concurrent debits cannot overdraw, idempotency key replay creates one order, provider failure produces a refund, ledger sum equals balance.
- Error responses never contain SQL, paths, stack traces, or framework details.
- Audit events exist for audited actions and contain no secrets.

## 4. Must-have frontend tests
- Forms: validation messages, disabled submit with spinner while processing, focus on first error, server errors mapped to fields.
- Shared components: DataTable states (loading, empty, error, populated), ConfirmDialog, toasts.
- Playwright journeys: register → verify device → log in; session expiry handling; place an order; view transaction history; log out.
- Accessibility: automated checks (axe) on key pages; keyboard-only run of login and one dashboard page.

## 5. Rules
- No test calls a real provider, gateway, or email service; use fakes.
- Tests are independent, deterministic, and run on a clean database; use factories, not shared fixtures.
- Time and randomness are controlled in tests (frozen clock, seeded values).
- A bug fix starts with a failing test that reproduces it.
- Do not test framework internals; test our behavior.

## 6. Coverage
No blanket percentage target at first. Critical logic (authentication, lockout, ledger, order placement, authorization policies) must be fully covered, branch by branch. Revisit a numeric gate once the suite is mature.

## 7. CI gates (each repo)
Lint and format check → static analysis/type check → unit and integration tests → dependency audit. A pull request cannot merge unless all pass. Playwright runs on pull requests that touch critical journeys and before release.

## 8. Contract between API and web
OPEN: whether to generate TypeScript types from the API documentation or keep hand-written Zod schemas verified by Playwright. Default is Zod schemas per feature (Doc 09).
