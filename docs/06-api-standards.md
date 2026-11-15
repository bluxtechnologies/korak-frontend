# 06 — API Standards

## 1. Basics
- RESTful, JSON only, versioned: `/api/v1/...`
- Resource names are plural, kebab-case: `/api/v1/orders`, `/api/v1/vpn-logs`
- JSON field names: `snake_case`
- Authentication: Sanctum session (Doc 04). Admin endpoints live under `/api/v1/admin/...` and use the admin guard.

## 2. Methods
| Method | Use |
|--------|-----|
| GET | Read; never changes state |
| POST | Create or perform an action |
| PUT | Full replacement |
| PATCH | Partial update |
| DELETE | Remove |

Actions that are not CRUD use a noun sub-resource where possible (`POST /orders/{id}/cancellations`), not verbs in the URL.

## 3. Response envelope — Locked
**Success**
```json
{ "data": { }, "meta": { } }
```
**Paginated**
```json
{
  "data": [ ],
  "meta": { "current_page": 1, "per_page": 15, "total": 120, "last_page": 8 }
}
```
**Error**
```json
{
  "message": "Safe, human-readable message.",
  "code": "validation_failed",
  "errors": { "field": ["Message."] }
}
```
`errors` appears only for validation failures. `code` is a stable machine-readable string.

## 4. Status codes
`200` OK · `201` Created (with resource) · `204` No content · `400` Malformed request · `401` Unauthenticated · `403` Forbidden · `404` Not found · `409` Conflict · `419` CSRF/session token mismatch · `422` Validation failed · `423` Locked · `429` Throttled · `500` Generic server error.

## 5. Never exposed
SQL, file paths, stack traces, exception class names, framework or version details, internal IDs of other tenants, validation rule internals. A 500 returns only a generic message and a request reference ID that support can search in logs.

## 6. Pagination, search, sort, filter
Query parameters: `page`, `per_page` (capped server-side), `search`, `sort` (e.g. `-created_at`), `filter[status]=...`. Sortable and filterable fields are an allow-list per endpoint.

## 7. Idempotency
Every POST that moves money or places an order requires an `Idempotency-Key` header. Repeating a key returns the original result and never creates a second order or charge.

## 8. Identifiers
Resources are exposed by public ID (Doc 07), not sequential integers.

## 9. Rate limiting
Named limiters per endpoint group (login, OTP, general API, money-moving). Responses use `429` with a `Retry-After` header.

## 10. Documentation
Every endpoint is documented: purpose, auth requirement, request, response, errors, and security notes. Docs are generated from code where practical (tool OPEN) and reviewed in pull requests.
