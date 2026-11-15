# 10 — Backend Standards

## 1. Principles
Plain Laravel, used well. The framework's own structure (Form Requests, Resources, Policies, Eloquent) is the architecture. No modular packages, no domain-driven folders, no abstraction before it is needed.

## 2. Request lifecycle
```text
Route → Middleware → Controller → Form Request (validation)
      → Policy (authorization) → Action/Service (only if needed)
      → Model → API Resource → JSON envelope
```

## 3. Layer responsibilities
| Layer | Responsibility | Must not |
|-------|----------------|----------|
| Controller | Receive request, call logic, return Resource | Contain business rules or queries beyond trivial reads |
| Form Request | Validation and input normalisation | Authorize by guessing; contain business logic |
| Policy | Who may act on what | Query unrelated data |
| Action | One multi-step operation (e.g. place an order) | Do more than one job |
| Service | Wrap an external system or cross-cutting concern (provider API, OTP) | Become a grab-bag |
| Model | Data, relationships, casts, scopes | Hold workflows |
| Resource | Shape output; the only way data leaves | Expose hidden/sensitive fields |

Create an Action or Service only when logic is multi-step, reused, or must be unit-tested in isolation.

## 4. Code quality rules
- SOLID where practical; single responsibility; constructor injection only.
- No God classes, no static state, no `Helper`/`Util` classes mixing unrelated methods, no duplicated logic.
- Keep nesting shallow (early returns); keep methods and files short.
- Enums for fixed states; no magic strings.
- Pint for style, Larastan for static analysis (proposed), both enforced in CI.

## 5. Centralized exception handling — Locked
Configured in `bootstrap/app.php` (`withExceptions`). For all `api/*` requests it returns the error envelope from Doc 06:
- Validation → `422` with field errors
- Unauthenticated → `401`; unauthorized → `403`; not found → `404`; throttled → `429`
- Everything else → generic `500` plus a reference ID

It never returns SQL, file paths, stack traces, exception class names, or framework details. Full details go to logs only. `APP_DEBUG=false` outside local.

## 6. Authentication code
- Two guards: `customer` (table `customers`) and `admin` (table `admins`).
- Login throttling, lockout, device verification, and bcrypt hashing as specified in Doc 08.
- Sessions via Sanctum SPA mode as in Doc 04.

## 7. Notifications
Use Laravel's notification system with channels `database` (in-app / dashboard alerts) and `mail`. Notifications that send email are queued. New channels later mean adding a channel, not changing callers. Queue driver starts as `database`.

## 8. Database access
- Eloquent with relationships; eager-load to avoid N+1.
- Transactions for any multi-write operation; row locking for balance changes.
- No raw SQL with interpolated input.

## 9. Testing
- Pest: unit tests for isolated business logic; feature tests for every endpoint covering success, validation failure, unauthenticated, unauthorized, and throttling.
- Critical logic (balance changes, order placement, lockout) must be testable without HTTP.
- Factories for all models; tests run on a clean database and never touch real providers (fake external services).
- A change is not done until tests pass.

## 10. Documentation
Document every module, service, endpoint, entity, and security decision in `docs/`. Code should read clearly without heavy commenting; comments explain *why*, not *what*.

## 11. Definition of done (backend)
Route + Form Request + Policy + Resource + tests + endpoint documentation, with no stack traces or internals leakable from any error path.
