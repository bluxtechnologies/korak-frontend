# 29 — Backend Diagnosis & Handoff: Dedicated Virtual Account cURL Error 6 (DNS Resolution Failure)

**Date:** 2026-11-20  
**Priority:** 🔴 Critical (Blocks dedicated virtual account generation and wallet funding)  
**Endpoint:** `POST /api/v1/wallet/dedicated-account`  
**Observed Error in UI:**
```json
{
  "code": "dedicated_account_generation_failed",
  "message": "Could not connect to payment provider: cURL error 6: Could not resolve host: api.cofinance.ng (see https://curl.se/libcurl/c/libcurl-errors.html) for https://api.cofinance.ng/v1/customers"
}
```
**Affected Flow:** Customer clicks **"Generate Account Details"** on `https://korakdigital.com/wallet`

---

## 1. Executive Summary & Root Cause Analysis

When a customer initiates dedicated virtual account generation, the backend dispatches an outbound HTTP request (via Guzzle / PHP cURL) to register the customer with the FinityPay / CoFinance banking gateway at:
`POST https://api.cofinance.ng/v1/customers`

The request failed immediately with:
> **`cURL error 6: CURLE_COULDNT_RESOLVE_HOST`**  
> *"Couldn't resolve host. The given remote host was not resolved."*

### Why Did This Happen?

There are 4 potential causes on the backend server:

1. **Incorrect or Misspelled Provider Domain in `.env`:**
   - The environment variable specifying the FinityPay / CoFinance API host (e.g. `FINITYPAY_BASE_URL` or `COFINANCE_BASE_URL`) may be pointing to an invalid, outdated, or misspelled domain.
   - For example:
     - Is the domain supposed to be `https://api.co-finance.ng`, `https://api.finitypay.com`, `https://api.finitypay.ng`, or `https://sandbox.cofinance.ng`?
     - Has FinityPay updated their API gateway domain?

2. **Server-Side DNS Resolver Failure (VPS / Docker / Container / Host):**
   - The server hosting the Laravel backend (`backend.korakdigital.com`) has a failing or misconfigured DNS resolver (`/etc/resolv.conf`).
   - If running inside Docker, Docker containers often fail to resolve external domains if no nameserver (like `8.8.8.8` or `1.1.1.1`) is configured in `/etc/docker/daemon.json` or `docker-compose.yml`.

3. **External Provider DNS Outage or Expired Domain:**
   - The provider `cofinance.ng` may have experienced a DNS misconfiguration, nameserver propagation issue, or domain registration lapse.

4. **Security Vulnerability: Leaking Raw cURL Traces to Frontend API Consumers:**
   - The backend caught the `GuzzleHttp\Exception\ConnectException` or `RequestException` and concatenated `$e->getMessage()` directly into the JSON response:
     ```php
     // VULNERABLE CODE IN BACKEND:
     return response()->json([
         'code' => 'dedicated_account_generation_failed',
         'message' => 'Could not connect to payment provider: ' . $e->getMessage(),
     ], 502);
     ```
   - This violates `docs/06-api-standards.md §5` (Information Leakage). Internal upstream URLs, cURL error codes, and server network details must **never** be exposed in public API response payloads.

---

## 2. Immediate Step-by-Step Fixes for Backend Dev

### Step 1: Test DNS Resolution Directly on the Backend Server
SSH into the server hosting `backend.korakdigital.com` and run:

```bash
# Test DNS lookup
nslookup api.cofinance.ng
# OR
dig api.cofinance.ng +short
# OR
host api.cofinance.ng
```

- **If it returns `NXDOMAIN` or `Host api.cofinance.ng not found`:**
  - The domain `api.cofinance.ng` does not exist or has no active DNS A/AAAA records.
  - Check your FinityPay / CoFinance integration documentation for the **exact live/sandbox API host**.
- **If `nslookup` hangs or fails for ALL domains (e.g. `google.com` also fails):**
  - Your server's DNS resolvers are broken. Update `/etc/resolv.conf`:
    ```bash
    nameserver 8.8.8.8
    nameserver 1.1.1.1
    ```

### Step 2: Verify and Correct Environment Variables in `.env`
Inspect your backend `.env` on production/staging:

```env
# Verify your FinityPay / CoFinance settings:
FINITYPAY_BASE_URL=https://<correct-provider-api-host>
FINITYPAY_CLIENT_ID=your_client_id
FINITYPAY_SECRET=your_secret_key

# Optional: Enable Mocking in Staging / Local to unblock QA:
MOCK_PAYMENT_PROVIDER=true
```

### Step 3: Implement Provider Sandbox / Mock Fallback
To ensure account generation works during development, staging, or provider maintenance, implement an environment toggle:

```php
// In DedicatedVirtualAccountService.php
if (config('services.payment_provider.mock', false) || app()->environment('local')) {
    return [
        'account_number' => '99' . str_pad((string) $user->id, 8, '0', STR_PAD_LEFT),
        'account_name' => 'KORAK / ' . strtoupper($user->name),
        'bank_name' => 'Wema Bank',
        'bank_code' => '035',
        'account_reference' => 'mock_dva_' . uniqid(),
        'status' => 'active',
    ];
}
```

### Step 4: Sanitize API Error Responses (Never Expose cURL Traces)
Update the error handling in `DedicatedVirtualAccountController` / `WalletController`:

```php
try {
    $account = $this->virtualAccountService->generateForCustomer($customer, $request->validated());
    
    return response()->json([
        'status' => 'success',
        'data' => [
            'account' => $account,
        ],
        'meta' => [
            'has_account' => true,
            'created' => true,
        ],
    ], 201);
} catch (\GuzzleHttp\Exception\ConnectException $e) {
    // Log the full technical cURL error internally with context
    Log::error('Dedicated account upstream network failure: ' . $e->getMessage(), [
        'customer_id' => $customer->id,
        'upstream_url' => $e->getRequest()?->getUri(),
    ]);

    // Return a clean, user-safe error without raw cURL strings
    return response()->json([
        'code' => 'dedicated_account_generation_failed',
        'message' => 'Could not connect to payment provider. Please try again later.',
    ], 502);
} catch (\Exception $e) {
    Log::error('Dedicated account generation failed: ' . $e->getMessage(), [
        'customer_id' => $customer->id,
        'trace' => $e->getTraceAsString(),
    ]);

    return response()->json([
        'code' => 'dedicated_account_generation_failed',
        'message' => 'Unable to generate virtual account details at this time. Please try again shortly.',
    ], 500);
}
```

---

## 3. Verification Checklist for Backend Dev
- [ ] Confirmed the correct API host URL with FinityPay / CoFinance.
- [ ] Verified `curl -Iv https://<correct-provider-api-host>` returns HTTP 200/401/403 from the backend server (not cURL error 6).
- [ ] Updated `FINITYPAY_BASE_URL` in `.env`.
- [ ] Cached config updated: `php artisan config:cache`.
- [ ] Tested `POST /api/v1/wallet/dedicated-account` returns `201 Created` with valid account payload.
- [ ] Verified error catch blocks log raw cURL errors internally to `laravel.log` and return sanitized messages to the API.
