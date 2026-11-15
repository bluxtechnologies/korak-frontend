# 09 — Frontend Standards

## 1. Principles
Simple, consistent, accessible, fast. No feature that wasn't requested. No abstraction without a second use.

## 2. Structure
Follows Doc 03: **Page → Feature → Service (`api.ts`) → API**.
- Pages in `app/` compose features; they hold no business logic.
- Features are self-contained and do not import from one another. Shared pieces move to `components/shared` or `lib`.
- Files stay small; split when a file mixes concerns or becomes hard to scan.

## 3. Rendering
- Server Components by default; add `'use client'` only for interactivity (forms, menus, dialogs, tables with client state).
- Authenticated pages are not statically cached; pass the session cookie on server fetches (Doc 04).
- Lazy-load heavy, below-the-fold, or rarely used components (`next/dynamic`). Use `next/image` and `next/font`.
- Avoid unnecessary DOM manipulation and unnecessary client state.

## 4. Data fetching
- All API calls go through the wrapper in `lib/api` (base URL, credentials, CSRF handling, error mapping).
- Components never call `fetch` directly.
- OPEN: whether to add TanStack Query. Default is Server Components + the wrapper; add the library only if client-side caching/refetching needs appear.

## 5. TypeScript — avoid redundant code
- `strict: true`; no `any` (use `unknown` and narrow).
- **Infer, don't restate.** Let TypeScript infer return types and local variables. Annotate exported function parameters and boundaries only.
- Zod schemas are the single source of truth: `type X = z.infer<typeof schema>`. No parallel hand-written interfaces for the same shape.
- No type gymnastics (deep conditional/mapped types) without a clear payoff.
- No wrapper types, enums, or generics added "just in case".
- API response types live next to the feature's `api.ts`.

## 6. Forms — every form
- Client-side validation (Zod) with helpful, non-technical messages.
- Accessible labels, `aria-describedby` for errors, correct input types and `autocomplete`.
- On submit: button disabled with a spinner icon and text; double submit prevented.
- On failure: focus moves to the first invalid field; server field errors are mapped to fields; unknown errors show a generic message.
- Password inputs hidden by default with a reveal toggle.
- Client validation is a usability aid only; the server always re-validates.

## 7. Tables — every table
Search · sorting · pagination · filters · bulk selection · empty state · loading state · error state.
- Server-side pagination, sorting, and filtering for anything that can grow.
- One shared `DataTable` built on shadcn/TanStack; features supply columns.
- No clutter: default columns only, secondary details in a row detail view.

## 8. UI states
Every data view handles four states: loading (skeleton), empty (explanation + next action), error (safe message + retry), success. Use `loading.tsx` and `error.tsx` per route group.

## 9. Feedback
- Toasts for transient confirmations and non-blocking errors.
- Inline Alerts for persistent or page-level conditions.
- Confirm dialogs for destructive actions.

## 10. Accessibility and responsiveness
Follow Doc 05: keyboard navigation, visible focus, AA contrast, semantic HTML, minimal ARIA. Desktop first; tablet and mobile supported without degrading desktop.

## 11. Naming and conventions
`PascalCase` components · `camelCase` functions/variables · `kebab-case` file names (non-component) and route segments. One component per file. No default exports except where Next.js requires them.

## 12. Testing
Unit/component tests (Vitest + Testing Library) for logic and shared components; Playwright for critical flows (login, device verification, placing an order).

## 13. Forbidden
Raw palette classes, inline styles for design values, duplicated components, copy-pasted forms, `console.log` in committed code, secrets in client code.

## 14. SEO and search indexing (F7A.4)
- **Public indexable pages:** Only the guest pages (`/`, `/privacy`, `/terms`) are indexed by search engines. Each must declare unique metadata, canonical URLs, and Open Graph/Twitter fields using neutral copy from `src/config/guest-content.ts`.
- **Authenticated and auth-flow `noindex` rule:** All authenticated routes (`(dashboard)/*`) and authentication flow pages (`(auth)/*` covering login, register, password reset, device verification, session expired, and forbidden) must set `robots: { index: false, follow: false }` (`noindex, nofollow`). Search engines must never index private user panels, customer orders, or authentication challenge screens.
- **Sitemap & Robots:** `robots.ts` allows guest pages, disallows `/api/` and all authenticated/auth routes, and references the generated `sitemap.xml`. `sitemap.ts` includes only `/`, `/privacy`, and `/terms`.
- **Site URL & Domain:** The production domain is OPEN (see Doc 00); canonical URLs resolve dynamically via the `NEXT_PUBLIC_SITE_URL` environment variable.
- **Open Graph images:** Sourced locally from `public/`; if none has been supplied, omit the image. Never hotlink or generate an unverified placeholder image.
