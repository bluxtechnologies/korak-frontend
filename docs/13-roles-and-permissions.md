# 13 — Roles & Permissions

## 1. What is decided
- Customers and admins are separate identities: separate tables (`customers`, `admins`) and separate guards. Locked.
- **No admin roles or permissions are defined yet.** None are invented here.

## 2. Customers
Customers have no roles. Authorization is **ownership**: a customer may access only their own resources. Enforced by Laravel Policies and by scoping every query to the authenticated customer. A resource owned by someone else returns `404` (not `403`) so existence is not revealed.

## 3. Admins — decision needed
The right model depends on how many kinds of admin exist. Options:

| Option | Description | Trade-off |
|--------|-------------|-----------|
| A. Single admin level | Every admin can do everything admin-side | Simplest; no separation of duties |
| B. Fixed roles | A small enum of roles (e.g. defined by you) mapped to abilities in code | Simple and testable; changes need a deploy |
| C. Configurable permissions | Roles/permissions stored in the database and editable in the UI | Flexible; more code, more to secure and test |

Recommendation: start with **A or B**, and move to C only when a real requirement appears. Please tell me which admin types you actually need; roles will be taken from your list.

## 4. Enforcement rules (apply to any option)
- **Deny by default.** An endpoint with no explicit authorization is a bug.
- Authorization is enforced on the server in Policies/Gates; the frontend only *reflects* it by hiding or disabling controls.
- Admin routes live under `/api/v1/admin/...` and require the `admin` guard.
- Customer tokens/sessions can never satisfy an admin route and vice versa.
- Every state-changing admin action is written to the audit log (Doc 12).
- High-impact admin actions (manual balance adjustment, credential reveal, admin management) should require recent re-authentication (proposed).

## 5. Frontend
- The user's abilities are returned by the API (`auth/me`) and used to build navigation and show/hide actions.
- The UI clearly indicates when something is unavailable due to permissions, rather than silently omitting it where that would confuse.
- UI checks are never trusted as security.

## 6. Admin UI hosting
OPEN (see Doc 04): same Next.js app under `/admin` vs. a separate subdomain/app with its own session cookie. Recommended: separate subdomain and cookie name.

## 7. Testing
For every protected endpoint: tests for unauthenticated, wrong guard, and (for customers) another customer's resource.
