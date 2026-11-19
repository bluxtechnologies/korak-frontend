# 27 — Backend Diagnosis & Handoff: Dedicated Virtual Account Generation Error

**Date:** 2026-11-18  
**Priority:** 🔴 High (Blocks automated wallet funding)  
**Error Encountered:**
```json
{
  "code": "dedicated_account_generation_failed",
  "message": "Could not connect to payment provider."
}
```
**Affected Endpoint:** `POST /api/v1/wallet/dedicated-account`  
**Frontend Trigger:** "Generate Account Details" button on `http://localhost:3000/wallet`  
**Reference Docs:** `docs/14-wallet-and-payments.md`, `docs/15-provider-integrations.md`, `docs/25-frontend-customer-endpoints-handoff.md`

---

## 1. Executive Summary

When a customer clicks **"Generate Account Details"** on the Wallet page, the frontend calls `POST /api/v1/wallet/dedicated-account`. The backend catches an upstream error when attempting to communicate with the payment provider (Monnify / Paystack / Providus / Wema / FinityPay) and returns `code: "dedicated_account_generation_failed"`, `message: "Could not connect to payment provider."`.

This document provides a root cause analysis, diagnostic commands, and concrete steps to resolve the issue.

---

## 2. Root Cause Analysis

The error string `"Could not connect to payment provider."` indicates that an exception occurred in the backend's provider service layer (e.g. `DedicatedVirtualAccountService` or `PaymentProviderClient`). The top 5 reasons for this error are:

### Cause 1: Missing or Invalid Provider Credentials in Backend `.env`
- If using **Monnify**:
  - `MONNIFY_API_KEY`, `MONNIFY_SECRET_KEY`, `MONNIFY_CONTRACT_CODE`, or `MONNIFY_BASE_URL` is either missing, empty, or contains test keys pointing to the live URL (or vice-versa).
  - Monnify requires an initial OAuth handshake (`POST /api/v1/auth/login`) with basic auth. If keys are invalid, this throws a `401 Unauthorized` or connection error.
- If using **Paystack**:
  - `PAYSTACK_SECRET_KEY` is missing or invalid for dedicated account generation (`POST /dedicated_account`).
- If using **FinityPay / Providus Direct**:
  - Client ID or Signature secret is unset.

### Cause 2: Server IP Not Whitelisted on Provider Dashboard
- **Monnify and Providus Bank require IP whitelisting.**
- If requests are sent from a local machine, Docker container, or new staging server whose public IP is not added to the provider's dashboard allow-list, the gateway resets the connection or responds with `403 Forbidden`.

### Cause 3: Outbound Network, DNS, or cURL SSL Failure
- The backend server cannot reach the payment provider's API host over HTTPS (port 443).
- In local environments (Docker/Herd/Valet/XAMPP), missing CA certificates cause `cURL error 60: SSL certificate problem: unable to get local issuer certificate`.
- Outbound firewall or proxy blocking the connection.
- Guzzle / HTTP client connection timeout (e.g. timeout set to 5s while the provider takes 8s).

### Cause 4: Missing Required Customer KYC (BVN / NIN / Phone)
- Central Bank of Nigeria (CBN) regulations mandate that dedicated virtual account generation must submit a valid customer name, phone number, and in some gateways a BVN or NIN.
- If the authenticated customer on the backend has a missing or unformatted phone number (e.g. not E.164 `+234...` or standard 11 digits), the provider rejects the payload.
- If the backend catches provider `400/422` error in a generic catch block, it may mislabel it as `"Could not connect to payment provider."`.

### Cause 5: Catch-all Error Masking the True Exception
- The backend code likely has:
  ```php
  try {
      $account = $this->provider->createDedicatedAccount($user);
  } catch (\Exception $e) {
      Log::error('Dedicated account generation failed: ' . $e->getMessage());
      return response()->json([
          'code' => 'dedicated_account_generation_failed',
          'message' => 'Could not connect to payment provider.',
      ], 502);
  }
  ```
  If `$e->getMessage()` is not inspected, the actual underlying issue (e.g. `cURL error 28: Operation timed out`, `Invalid contract code`, or `Unauthorized`) is hidden.

---

## 3. Step-by-Step Diagnostic Guide for Backend Dev

### Step 1: Check Backend Logs Immediately
Open your backend log file (e.g. `storage/logs/laravel.log` or console output):
```bash
tail -n 100 storage/logs/laravel.log | grep -E "dedicated|Monnify|Paystack|provider|cURL"
```
Look for:
- The exact HTTP status code returned by the provider (`401`, `403`, `404`, `500`).
- The provider's response body.
- Any cURL error number (`cURL error 6`, `cURL error 7`, `cURL error 28`, `cURL error 60`).

### Step 2: Verify Outbound Connectivity & DNS
From the backend server terminal, test if the provider API is reachable:
```bash
# If using Monnify Sandbox:
curl -v https://sandbox.monnify.com/api/v1/auth/login

# If using Monnify Live:
curl -v https://api.monnify.com/api/v1/auth/login

# If using Paystack:
curl -v https://api.paystack.co
```
- If the command hangs or says `Failed to connect`, your server has a network/DNS or firewall issue.
- If it connects and returns a JSON error (e.g. `{"responseMessage":"Bad credentials"}`), your network is fine, but credentials or IP whitelisting need attention.

### Step 3: Check Environment Variables
Verify your backend `.env` contains valid credentials for the provider:

```dotenv
# Monnify Example
MONNIFY_BASE_URL=https://sandbox.monnify.com
MONNIFY_API_KEY=MK_TEST_...
MONNIFY_SECRET_KEY=...
MONNIFY_CONTRACT_CODE=...

# Paystack Example
PAYSTACK_BASE_URL=https://api.paystack.co
PAYSTACK_SECRET_KEY=sk_test_...
```

Run config cache clear after editing `.env`:
```bash
php artisan config:clear
php artisan cache:clear
```

### Step 4: Ensure Proper Exception Logging in Backend Controller
Update your catch block to log the full stack trace and provider response:
```php
try {
    $account = $this->virtualAccountService->generateForCustomer($customer, $request->input('phone'));
    
    return response()->json([
        'data' => $account,
        'meta' => ['has_account' => true, 'created' => true],
    ], 200);
} catch (\GuzzleHttp\Exception\ClientException $e) {
    $responseBody = $e->getResponse() ? (string) $e->getResponse()->getBody() : '';
    Log::error('Provider ClientException: ' . $responseBody, ['status' => $e->getResponse()?->getStatusCode()]);
    
    return response()->json([
        'code' => 'dedicated_account_generation_failed',
        'message' => 'Provider rejected request: ' . $responseBody,
    ], 422);
} catch (\GuzzleHttp\Exception\ConnectException $e) {
    Log::critical('Provider ConnectException (Network/Timeout): ' . $e->getMessage());
    
    return response()->json([
        'code' => 'dedicated_account_generation_failed',
        'message' => 'Could not connect to payment provider. Connection timed out.',
    ], 502);
} catch (\Throwable $e) {
    Log::error('Unexpected Virtual Account Error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
    
    return response()->json([
        'code' => 'dedicated_account_generation_failed',
        'message' => $e->getMessage(),
    ], 500);
}
```

---

## 4. Local Development Fallback (Mock Mode)

To allow frontend and local integration testing without depending on external sandbox uptime or IP whitelisting, implement a fallback driver in the backend:

```php
// In config/services.php or DedicatedVirtualAccountService:
if (config('services.payment_provider.mock', false) || app()->environment('local')) {
    return [
        'id' => (string) Str::ulid(),
        'provider' => 'mock_provider',
        'account_reference' => 'va_' . Str::random(10),
        'bank_name' => 'Wema Bank',
        'bank_code' => '035',
        'account_number' => '99' . str_pad((string) $customer->id, 8, '0', STR_PAD_LEFT),
        'account_name' => 'KORAK / ' . strtoupper($customer->name),
        'status' => 'active',
        'created_at' => now()->toIso8601String(),
    ];
}
```

When `MOCK_PAYMENT_PROVIDER=true` in `.env`, the endpoint returns a valid mock Wema Bank account so developers can test the complete wallet funding and UI flow locally.

---

## 5. Expected Frontend Contract

Upon successful generation, the frontend expects:
**`POST /api/v1/wallet/dedicated-account`**
**Success `200 OK` Response:**
```json
{
  "data": {
    "id": "01JCMOCKACC01",
    "provider": "monnify",
    "account_reference": "va_ref_12345",
    "bank_name": "Wema Bank",
    "bank_code": "035",
    "account_number": "7892341201",
    "account_name": "KORAK / John Doe",
    "status": "active",
    "created_at": "2026-11-18T14:30:00Z"
  },
  "meta": {
    "has_account": true,
    "created": true
  }
}
```

---

## 6. Frontend Change Notice
- The CTA button icon on the **"Generate Account Details"** card has been updated from `Sparkles` to the official banking `Landmark` icon with locked `NAV_ICON_STROKE_WIDTH = 1.75`.
