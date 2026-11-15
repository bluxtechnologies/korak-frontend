# 07 — Database Standards

MySQL. Data integrity is never sacrificed for convenience.

## 1. Naming
- Tables: plural `snake_case` (`customers`, `admins`)
- Columns: `snake_case`
- Foreign keys: `<singular>_id`
- Pivot tables: alphabetical singulars, e.g. `order_tag`

## 2. Keys and identifiers
- Primary key: auto-incrementing `bigint unsigned`, never exposed.
- Resources shown in URLs/JSON carry a **public ID** column (ULID proposed; OPEN: ULID vs. UUID) with a unique index, so identifiers cannot be enumerated.

## 3. Integrity
- Every relationship has a foreign key with an explicit `ON DELETE` rule (default `RESTRICT`).
- Indexes on foreign keys and on every column used for lookup, filtering, or sorting.
- `NOT NULL` by default; nullable only when absence is meaningful.
- Enumerated states use a string column backed by a PHP enum, validated in the app.
- Normalized: no duplicated facts; derived values are computed, not stored, unless there is a documented performance need.

## 4. Money — Locked principles
- Amounts stored as **integer minor units** (or `DECIMAL` with a documented scale), never floats.
- Each wallet holds one real balance in its native currency (ISO currency code `CHAR(3)`).
- Converted equivalents are display-only and computed at read time.
- Balance changes are recorded in an **append-only ledger**; ledger rows are never updated or deleted. Balances change only through one code path that writes the ledger row and updates the balance in a single database transaction with row locking.
- Orders and funding carry an idempotency key with a unique index.

## 5. Audit fields
Every table has `created_at` and `updated_at`. Tables that records human action add who did it (`created_by` / `updated_by` as appropriate). Security-relevant events (logins, lockouts, device trust changes, admin actions) go to an audit log (Doc 12, planned).

## 6. Soft deletes
Only where recovery or history is a business need and referential history must survive (to be decided per entity). **Never** on ledger/transaction rows, which are never deleted. Default is hard delete subject to FK rules.

## 7. Separate identity tables
`customers` and `admins` are separate tables with separate guards (Locked). Neither references the other.

## 8. Entities implied by requirements (schemas to be designed per module)
Customers, admins, orders, transactions/ledger, notifications, trusted devices, login attempts / audit events. Columns and relationships are defined in each module document; none are final here.

## 9. Migrations
- One concern per migration; never edit a migration that has been merged/deployed.
- Migrations must be reversible where practical and run cleanly on an empty database.
- Seeders contain no real credentials or production data.

## 10. Documentation
Every entity is documented: purpose, columns, relationships, indexes, and security classification of each sensitive column.
