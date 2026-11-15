# 15 — Provider Integrations

## 1. Status
OPEN: the actual providers for airtime, data, VPN, social media accounts, social media boosting, SMS, and payments have not been named. This document defines how any provider is integrated; each provider then gets its own short document from the template in §8.

## 2. Structure — keep it simple
- One class per provider (e.g. in `app/Services/Providers/`) that is the **only** place that knows that provider's API.
- No shared interface or abstraction layer until a second provider for the same service exists. When it does, extract the interface from the two real implementations.
- Controllers and Actions depend on the provider class via constructor injection.

## 3. Configuration and secrets
- Base URLs, keys, and timeouts come from `config/` backed by environment variables.
- Secrets are never committed, never logged, and never sent to the frontend.
- Provider credentials are separate per environment (local/staging/production), using the provider's sandbox where one exists.

## 4. Calling providers
- Explicit connect and request **timeouts** on every call.
- Calls that change state run in queued jobs, not in the HTTP request.
- Retries with backoff are allowed only for safe, idempotent calls. Money-moving calls are retried only with a provider-side idempotency key or reference (Doc 14).
- Provider responses are validated before use; unexpected shapes are treated as failures.

## 5. Failure handling
- Provider errors are mapped to our own internal outcomes (success, failed, unknown) and a stable error code.
- Customers see generic, safe messages. Provider names, raw error bodies, and internal details are never shown.
- Raw provider responses are stored only if needed for dispute resolution, with secrets stripped and access restricted.
- Repeated failures raise an alert (Doc 19). Whether to automatically disable a failing service is OPEN.

## 6. Delivered secrets
Credentials returned by a provider (VPN accounts, social account logins) are encrypted at rest, masked by default, and revealed only through an explicit, audited action (Docs 08 and 12).

## 7. Testing
Providers are always faked in tests (HTTP fakes or a fake provider class). No test calls a real provider. Contract details from the provider docs are captured as fixtures.

## 8. Per-provider document template
Provider name and purpose · service(s) covered · environments and base URLs · authentication method · endpoints used · idempotency/reference support · webhook events and signature method · error codes and how each maps · rate limits · timeouts/retry policy · pricing source · who owns the account · terms or compliance notes.

## 9. Compliance note
Selling or boosting social media accounts, and VPN delivery, can be restricted by the platforms' or providers' terms and by local regulations. Reviewing this is a business/legal task outside these technical documents, but each provider document should record the relevant terms.
