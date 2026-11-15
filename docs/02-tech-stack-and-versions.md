# 02 — Tech Stack & Versions

## 1. Frontend (`korak-web`) — Locked
| Concern | Choice |
|---------|--------|
| Framework | Next.js (latest stable at scaffold time), App Router |
| Language | TypeScript, strict mode |
| Styling | Tailwind CSS v4 (CSS-driven config, no `tailwind.config`) |
| Components | shadcn/ui |
| Icons | Lucide, exclusively |
| Font | Plus Jakarta Sans via `next/font/google` |
| Toasts | A React toast library. shadcn's Sonner integration (proposed) |

### Proposed supporting libraries
- Forms: React Hook Form + Zod (schemas double as the source of types, which avoids redundant TypeScript)
- Tables: TanStack Table through shadcn's data-table pattern
- Linting/formatting: ESLint + Prettier
- Tests: Vitest + Testing Library (unit/component), Playwright (end-to-end)

## 2. Backend (`korak-api`) — Locked
| Concern | Choice |
|---------|--------|
| Framework | Laravel 13 |
| Language | PHP 8.4 (Laravel 13 requires 8.3 minimum) |
| Database | MySQL |
| Authentication | Laravel Sanctum, session-based (SPA mode) |
| Password hashing | bcrypt |

### Proposed supporting tooling
- Tests: Pest
- Code style: Laravel Pint
- Static analysis: Larastan
- API docs generated from code (tool OPEN)

## 3. Explicitly not used
Inertia, Blade pages, a Laravel-bundled React/Vite frontend, modular package systems, GraphQL.

## 4. Version-pinning rule
Marketing names like "latest" are not versions. At scaffold time, record exact versions in each repo (`composer.lock`, `package-lock.json`) and list them in a `docs/versions.md` file. Upgrades are deliberate, one dependency group at a time, with tests passing before and after.

## 5. Dependency policy
- Add a dependency only when it removes more complexity than it adds.
- Prefer maintained packages with recent releases and no open security advisories.
- Every added dependency is justified in its pull request.
