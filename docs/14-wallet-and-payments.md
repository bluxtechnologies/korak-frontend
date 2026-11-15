# 14 — Wallet & Payments

Builds on the money rules in Docs 06, 07, and 08. Anything not decided is OPEN.

## 1. Principles — Locked
- Amounts are integer minor units (or `DECIMAL` with a documented scale), never floats.
- Each wallet holds one real balance in its own currency (ISO code). Converted equivalents are display-only, computed at read time.
- Every balance change is a row in an **append-only ledger**. Balances change through **one code path** that, in a single database transaction with a row lock, writes the ledger row and updates the balance.
- Prices are calculated on the server. The client never supplies a price.
- Money-moving requests require an `Idempotency-Key`.

## 2. Ledger entry (shape, finalized with entity docs)
Wallet, direction (credit/debit), amount, currency, balance after, reason/type, reference to the originating order or funding record, idempotency key, created_at. Never updated or deleted; corrections are new entries.

## 3. Order flow (proposed)
1. Validate request, authorize, check idempotency key.
2. In one transaction: lock the wallet, verify sufficient balance, write a debit ledger entry, create the order in `pending`.
3. Dispatch a queued job to call the provider (Doc 15). The HTTP request does not wait on the provider.
4. Provider success → order `completed` (credentials/delivery stored encrypted where applicable).
5. Provider failure → order `failed` and a **credit (refund) ledger entry** in a transaction; customer notified.
6. Provider outcome unknown (timeout) → order stays `processing`; a reconciliation job resolves it. **Never auto-retry a money-moving provider call without a provider-side idempotency reference.**

Order states (proposed): `pending`, `processing`, `completed`, `failed`, `refunded`. State transitions are enforced in one place and audited.

## 4. Wallet funding
OPEN: payment gateway(s) and methods. General rules regardless of provider:
- Funding is recorded as a pending funding record first; the wallet is credited **only** after server-side confirmation (webhook or verified API call), never on the browser's say-so.
- Webhooks: verify signature, reject replays, process idempotently, respond quickly and do heavy work in a queue.
- The amount credited comes from the verified provider data, not from the client.
- Raw card data never touches our servers.

## 5. Pricing
OPEN: where prices come from (provider cost plus margin, fixed price list, or other) and who can change them. Whatever the source, price changes must not alter existing orders, so an order stores the price it was charged.

## 6. Refunds and limits
OPEN: refund policy by service type, minimum/maximum amounts, daily limits, and manual adjustment rules. Manual adjustments are admin-only, require a reason, and are audited.

## 7. Reconciliation
Scheduled jobs compare: sum of ledger entries vs. wallet balance, and provider/gateway records vs. our records. Any mismatch raises an alert (Doc 19) and is never silently corrected.

## 8. Customer-facing pages
- **Transaction History** is a read-only view of ledger entries with search, sort, filters, and pagination.
- **Orders** shows order state and delivery details; sensitive deliverables are masked until explicitly revealed.

## 9. Testing
Concurrency tests (two simultaneous debits cannot overdraw), idempotency tests (same key twice → one order), failure-path tests (provider failure → refund), and ledger-vs-balance consistency tests.
