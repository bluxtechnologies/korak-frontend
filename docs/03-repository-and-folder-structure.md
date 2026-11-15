# 03 — Repository & Folder Structure

Two separate repositories with independent workflows, CI, and releases. They communicate only through the HTTP API.

```text
korak-api     Laravel 13, API only
korak-web     Next.js, standalone frontend
```

## 1. Backend layout (`korak-api`)
```text
app/
  Actions/                 only for multi-step or independently testable logic
  Enums/
  Exceptions/
  Http/
    Controllers/Api/V1/    thin controllers
      Admin/
    Middleware/
    Requests/              Form Requests (validation)
    Resources/             API Resources (response shaping)
  Models/
  Notifications/
  Policies/
  Services/                only where an external system or a cross-cutting concern needs it
bootstrap/app.php          routing, middleware, centralized exception handling
config/
database/
  factories/
  migrations/
  seeders/
docs/                      module, API, entity, and security-decision docs
routes/
  api.php                  /api/v1 routes
tests/
  Feature/
  Unit/
```
Rules:
- No `app/Modules` or package-per-feature layout.
- `Actions/` and `Services/` are created per need, not up front.
- No `Helpers` or `Utils` classes that mix unrelated methods.

## 2. Frontend layout (`korak-web`)
```text
src/
  app/
    (auth)/                login, register, forgot/reset password, verify device, session expired
    (dashboard)/           authenticated customer pages
    layout.tsx
    error.tsx
    not-found.tsx
  components/
    ui/                    shadcn primitives (do not hand-edit casually)
    layout/                Sidebar, Topbar, PageContainer
    shared/                DataTable, EmptyState, ErrorState, ConfirmDialog, ...
  features/
    <feature>/             e.g. airtime, orders, transactions
      components/
      api.ts               calls to the API (the Service/Data layer)
      schemas.ts           Zod schemas; types inferred from them
  lib/
    api/                   fetch wrapper, CSRF handling, error mapping
    utils.ts
  hooks/
  config/                  navigation definition, constants
```
Dependency flow: **Page → Feature → Service (`api.ts`) → API**. Pages stay thin; business logic lives in features; features never import from other features.

## 3. Shared rules
- Files stay small and single-purpose; split before a file becomes hard to scan.
- Consistent naming: `PascalCase` components, `camelCase` functions, `kebab-case` route segments and file names for non-components.
- Each repo has its own `README.md` (setup, scripts, env vars) and `docs/`.
- Environment variables are documented in `.env.example`. No secrets are committed.
