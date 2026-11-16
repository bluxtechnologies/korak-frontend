# 25 — Frontend Customer Endpoints Handoff (`korak-api` ➔ `korak-web`)

Comprehensive API specification and TypeScript contracts for the Next.js frontend (`korak-web`) to integrate all customer-facing endpoints in `korak-api`: **Bills & VTU**, **Wallet & Funding**, **Notifications**, **Profile & Security**, and **Trusted Devices**.

---

## 1. Network & Protocol Conventions

* **Backend Base URL (Local):** `http://localhost:8070`
* **API Prefix:** `/api/v1`
* **Authentication Model:** Laravel Sanctum **Stateful SPA Session Cookie** (Doc 04 §2).
  * Cookie: `korak-api-session` (or `korak_session`).
  * CSRF Protection: `XSRF-TOKEN` cookie submitted via `X-XSRF-TOKEN` header on all non-GET requests (`POST`, `PATCH`, `PUT`, `DELETE`).
  * Request Config: Always include `withCredentials: true` (Axios) or `credentials: 'include'` (Fetch).
* **Currency Minor Units (Kobo):** All monetary figures in request and response bodies use **integer kobo** (1 NGN = 100 kobo). Formatted string counterparts (e.g. `amount_formatted: "750.00"`) are provided for direct UI rendering.

### Standard Response Envelopes (Doc 06 §3)

#### A. Single Item Success (`200 OK`, `201 Created`)
```typescript
export interface ApiResponse<T, M = Record<string, unknown>> {
  data: T;
  meta: M;
}
```

#### B. Paginated Collection Success (`200 OK`)
```typescript
export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface ApiPaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
```

#### C. Error Envelope (`400`, `401`, `403`, `404`, `422`, `429`, `500`)
```typescript
export interface ApiErrorResponse {
  message: string;
  code: string;
  errors?: Record<string, string[]>; // Present on 422 Unprocessable Content
  reference_id?: string;             // Present on 500 Server Errors
}
```

---

## 2. TypeScript Data Contracts

```typescript
// ==========================================
// Wallet & Funding
// ==========================================
export interface Wallet {
  id: string; // ULID
  currency: 'NGN';
  balance: number; // in kobo (e.g. 500000 = ₦5,000.00)
  balance_formatted: string; // "5000.00"
  created_at: string;
  updated_at: string;
}

export type LedgerDirection = 'credit' | 'debit';
export type LedgerEntryType = 'funding' | 'order_debit' | 'refund' | 'manual_adjustment';

export interface LedgerEntry {
  id: string; // ULID
  direction: LedgerDirection;
  type: LedgerEntryType;
  amount: number; // in kobo
  amount_formatted: string;
  balance_after: number; // in kobo
  balance_after_formatted: string;
  currency: 'NGN';
  reference: string;
  description: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export type FundingStatus = 'pending' | 'success' | 'failed' | 'reversed';

export interface FundingRecord {
  id: string; // ULID
  reference: string;
  provider: string; // e.g. "finitypay"
  amount: number; // in kobo
  amount_formatted: string;
  currency: 'NGN';
  status: FundingStatus;
  checkout_url: string | null;
  processed_at: string | null;
  created_at: string;
}

// ==========================================
// Bills & VTU
// ==========================================
export interface BillCategory {
  code: string; // "airtime" | "data" | "cable_tv" | "electricity" | "solar" | ...
  name: string;
}

export interface BillPackage {
  code: string; // e.g. "112381"
  name: string; // e.g. "MTN 1GB Data Plan (30 Days)"
  amount: number; // In Naira (provider nominal amount)
}

export interface BillServiceItem {
  service_code: string; // e.g. "MTN_DATA", "AIRTEL_AIRTIME", "IKEDC", "DSTV"
  name: string;
  category: string;
  packages?: BillPackage[];
}

export interface DataBundlePackage {
  code: string; // e.g. "112381"
  name: string; // e.g. "MTN 1GB Data Plan (30 Days)"
  amount: number; // In Naira
}

export interface CustomerValidationResult {
  customer_name: string;
  customer_identifier: string;
  address?: string | null;
  outstanding_balance?: number | null;
}

export type BillOrderStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface BillOrder {
  id: string; // ULID
  reference: string; // e.g. "BIL-8F92A0E31C"
  provider_reference: string | null;
  category: string; // "airtime" | "data" | "cable_tv" | "electricity"
  service_code: string; // "MTN_DATA"
  service_name: string; // "MTN Mobile Data"
  package_code: string | null;
  customer_identifier: string; // Phone number, Smartcard number, or Meter number
  customer_name: string | null;
  amount: number; // Debited amount in kobo
  amount_formatted: string;
  face_amount: number; // Nominal package amount in kobo
  face_amount_formatted: string;
  discount_amount: number; // In kobo
  currency: 'NGN';
  status: BillOrderStatus;
  token: string | null; // Prepaid electricity token / pin (null for airtime/data)
  metadata: Record<string, unknown> | null;
  processed_at: string | null;
  created_at: string;
}

// ==========================================
// Notifications
// ==========================================
export interface CustomerNotification {
  id: string; // UUID
  type: string; // e.g. "WalletFundedNotification", "DeviceVerificationOtpNotification"
  title: string | null;
  message: string | null;
  category: string; // "general", "wallet", "security", etc.
  data: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

// ==========================================
// Profile & Security
// ==========================================
export interface CustomerProfile {
  id: string; // ULID
  username: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
}

export interface CustomerSession {
  id: string; // SHA-256 hashed safe identifier
  ip_address: string | null;
  user_agent: string | null;
  is_current: boolean;
  last_activity: string;
}

export interface SecurityActivity {
  id: string;
  event: string; // e.g. "auth.login_success", "auth.password_changed"
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown> | null;
  occurred_at: string;
  created_at: string | null;
}

export interface TrustedDevice {
  id: string; // ULID
  device_name: string;
  ip_address: string | null;
  last_used_at: string | null;
  created_at: string;
}
```

---

## 3. Bills & VTU Endpoints Specification

### 3.1 Get Bill Categories
Fetch all available bill service categories.

* **Method:** `GET`
* **Path:** `/api/v1/bills/categories`
* **Auth Required:** No
* **Response `200 OK`:**
```json
{
  "data": [
    { "code": "airtime", "name": "Airtime Topup" },
    { "code": "data", "name": "Mobile Data" },
    { "code": "cable_tv", "name": "Cable TV" },
    { "code": "electricity", "name": "Electricity Utility" },
    { "code": "solar", "name": "Solar & Alternative Energy" },
    { "code": "transportation", "name": "Transportation & Logistics" },
    { "code": "insurance", "name": "Insurance & Health" },
    { "code": "betting", "name": "Betting & Lottery" },
    { "code": "education", "name": "Examinations & Education" },
    { "code": "internet", "name": "Internet Services" }
  ],
  "meta": {}
}
```

---

### 3.2 Get Bill Services
Fetch services/billers, optionally filtered by category.

* **Method:** `GET`
* **Path:** `/api/v1/bills/services?category={category_code}`
* **Auth Required:** No
* **Query Parameters:**
  * `category` (optional, string): Filter by code, e.g. `data`, `airtime`, `cable_tv`, `electricity`.
* **Response `200 OK`:**
```json
{
  "data": [
    {
      "service_code": "MTN_DATA",
      "name": "MTN Mobile Data",
      "category": "data",
      "packages": [
        { "code": "112381", "name": "MTN 1GB Data Plan (30 Days)", "amount": 750.0 }
      ]
    },
    {
      "service_code": "AIRTEL_DATA",
      "name": "Airtel Mobile Data",
      "category": "data"
    }
  ],
  "meta": {}
}
```

---

### 3.3 Get Data Bundles
Fetch live data bundles for a specific network service code.

* **Method:** `GET`
* **Path:** `/api/v1/bills/data-bundles?service_code={service_code}`
* **Auth Required:** No
* **Query Parameters:**
  * `service_code` (required, string): e.g. `MTN_DATA`, `AIRTEL_DATA`, `GLO_DATA`, `9MOBILE_DATA`.
* **Response `200 OK`:**
```json
{
  "data": [
    { "code": "112381", "name": "MTN 1GB Data Plan (30 Days)", "amount": 750.0 },
    { "code": "112382", "name": "MTN 2GB Data Plan (30 Days)", "amount": 1200.0 },
    { "code": "112383", "name": "MTN 5GB Data Plan (30 Days)", "amount": 2500.0 }
  ],
  "meta": {}
}
```
* **Error Response `422 Unprocessable Content` (missing query parameter):**
```json
{
  "message": "The service_code query parameter is required.",
  "code": "validation_failed"
}
```

---

### 3.4 Validate Customer Meter / Smartcard
Verify an electricity meter number or Cable TV smartcard before debiting the customer.

* **Method:** `POST`
* **Path:** `/api/v1/bills/validate`
* **Auth Required:** Yes (`auth:customer`)
* **Request Body:**
```json
{
  "service_code": "IKEDC",
  "customer_identifier": "0100234567"
}
```
* **Response `200 OK`:**
```json
{
  "data": {
    "customer_name": "JOHN DOE",
    "customer_identifier": "0100234567"
  },
  "meta": {}
}
```
* **Error Response `422 Unprocessable Content` (Invalid meter / smartcard):**
```json
{
  "message": "Invalid customer identifier or meter number not found.",
  "code": "customer_validation_failed"
}
```

---

### 3.5 Purchase Bill / VTU (`POST /api/v1/bills/pay`)
Executes an atomic purchase of airtime, data, utility, or subscription.

* **Method:** `POST`
* **Path:** `/api/v1/bills/pay`
* **Auth Required:** Yes (`auth:customer`)
* **Headers (Recommended):**
  * `Idempotency-Key: <unique-uuid>`: Ensures payment is not double-charged on network retry.
* **Request Body:**
```json
{
  "service_code": "MTN_DATA",
  "service_name": "MTN Mobile Data",
  "category": "data",
  "customer_identifier": "08060671945",
  "customer_name": "John Doe",
  "package_code": "112381",
  "amount": 75000,
  "face_amount": 75000
}
```
> **Note on amounts:**
> * `amount` (integer, in kobo): Required. What the customer is charged (75000 = ₦750.00).
> * `face_amount` (integer, in kobo): Optional nominal plan price. If omitted, matches `amount`.
> * Minimum amount: `1000` (₦10.00).

* **Response `201 Created` (Success):**
```json
{
  "data": {
    "id": "01JCEXAMPLEBILLORDERULID01",
    "reference": "BIL-8F92A0E31C",
    "provider_reference": "X8BSN",
    "category": "data",
    "service_code": "MTN_DATA",
    "service_name": "MTN Mobile Data",
    "package_code": "112381",
    "customer_identifier": "08060671945",
    "customer_name": "John Doe",
    "amount": 75000,
    "amount_formatted": "750.00",
    "face_amount": 75000,
    "face_amount_formatted": "750.00",
    "discount_amount": 0,
    "currency": "NGN",
    "status": "completed",
    "token": null,
    "metadata": {},
    "processed_at": "2026-11-16T18:30:00.000000Z",
    "created_at": "2026-11-16T18:29:58.000000Z"
  },
  "meta": {}
}
```
> For electricity tokens, `token` contains the 20-digit recharge token string (e.g. `"1234-5678-9012-3456-7890"`).

* **Response `201 Created` (Immediate Provider Failure with Auto-Refund):**
```json
{
  "data": {
    "id": "01JCEXAMPLEBILLORDERULID02",
    "reference": "BIL-FAILED1234",
    "status": "failed",
    "metadata": {
      "error": "Provider network downtime."
    }
  },
  "meta": {}
}
```
> **Frontend Auto-Refund Notice:** When `status === "failed"`, the backend has **already credited the customer's wallet back**. The UI should display a polite alert: *"Payment failed at provider. Your wallet has been automatically refunded."*

* **Error Response `422 Unprocessable Content` (Insufficient Balance):**
```json
{
  "message": "Insufficient wallet balance for this purchase.",
  "code": "insufficient_balance"
}
```

---

### 3.6 Bill Purchase History
Retrieve paginated purchase transactions for the authenticated customer.

* **Method:** `GET`
* **Path:** `/api/v1/bills/history`
* **Auth Required:** Yes (`auth:customer`)
* **Query Parameters:**
  * `category` (optional, string): Filter by `data`, `airtime`, `cable_tv`, `electricity`.
  * `status` (optional, string): Filter by `completed`, `processing`, `failed`, `pending`.
  * `per_page` (optional, integer): Default `15`, max `100`.
  * `page` (optional, integer): Pagination page number.
* **Response `200 OK`:**
```json
{
  "data": [
    {
      "id": "01JCEXAMPLEBILLORDERULID01",
      "reference": "BIL-8F92A0E31C",
      "service_code": "MTN_DATA",
      "service_name": "MTN Mobile Data",
      "category": "data",
      "customer_identifier": "08060671945",
      "amount": 75000,
      "amount_formatted": "750.00",
      "status": "completed",
      "token": null,
      "created_at": "2026-11-16T18:29:58.000000Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 1,
    "last_page": 1
  }
}
```

---

### 3.7 Single Bill Lookup (`GET /api/v1/bills/{reference}`)
Fetch real-time status and details of a single bill order by reference or ULID.

* **Method:** `GET`
* **Path:** `/api/v1/bills/{reference_or_ulid}`
* **Auth Required:** Yes (`auth:customer`)
* **Automatic Status Synchronization:** If the transaction was previously `processing`, this call checks live status with the provider and updates `status` to `completed` and fills `token` when confirmed.
* **Response `200 OK`:** Returns the `BillOrder` object in `data`.
* **Error `404 Not Found`:**
```json
{
  "message": "Bill transaction not found.",
  "code": "bill_not_found"
}
```

---

## 4. Wallet & Funding Endpoints Specification

### 4.1 Get Customer Wallet
Returns current balance and currency. If no wallet exists for a registered customer, the backend auto-provisions one automatically.

* **Method:** `GET`
* **Path:** `/api/v1/wallet`
* **Auth Required:** Yes (`auth:customer`)
* **Response `200 OK`:**
```json
{
  "data": {
    "id": "01JCEXAMPLEWALLETULID01",
    "currency": "NGN",
    "balance": 250000,
    "balance_formatted": "2500.00",
    "created_at": "2026-11-14T12:00:00.000Z",
    "updated_at": "2026-11-16T18:30:00.000Z"
  },
  "meta": {}
}
```

---

### 4.2 Initiate Wallet Funding
Initiates a payment gateway checkout session to fund the customer wallet.

* **Method:** `POST`
* **Path:** `/api/v1/wallet/fund`
* **Auth Required:** Yes (`auth:customer`)
* **Request Body:**
```json
{
  "amount": 500000,
  "redirect_url": "http://localhost:3000/wallet?status=callback"
}
```
> * `amount` (integer, in kobo): Required. Minimum `10000` (₦100.00), maximum `500000000` (₦5,000,000.00).
> * `redirect_url` (optional, string URL): Where the payment gateway should return the user after payment.

* **Response `201 Created`:**
```json
{
  "data": {
    "id": "01JCEXAMPLEFUNDINGULID01",
    "reference": "KORAK-FUND-8A9B1C2D3E4F",
    "provider": "finitypay",
    "amount": 500000,
    "amount_formatted": "5000.00",
    "currency": "NGN",
    "status": "pending",
    "checkout_url": "https://checkout.cofinance.ng/pay/pay_01JX...",
    "processed_at": null,
    "created_at": "2026-11-16T18:35:00.000Z"
  },
  "meta": {}
}
```
* **Frontend Action:** Redirect user to `checkout_url` or open the gateway modal. When payment completes, FinityPay hits the backend webhook (`wallet.funded`) to credit the wallet and notify the user.

---

### 4.3 Check Funding Status
Check status of a funding reference after callback.

* **Method:** `GET`
* **Path:** `/api/v1/wallet/fund/{reference_or_ulid}`
* **Auth Required:** Yes (`auth:customer`)
* **Response `200 OK`:** Returns `FundingRecord` with `status: "success" | "pending" | "failed"`.

---

### 4.4 Get Wallet Transaction History (Ledger)
Paginated list of all debits and credits on the wallet with running balances.

* **Method:** `GET`
* **Path:** `/api/v1/wallet/transactions`
* **Auth Required:** Yes (`auth:customer`)
* **Query Parameters:**
  * `direction` (optional): `credit` or `debit`.
  * `type` (optional): `funding`, `order_debit`, `refund`, `manual_adjustment`.
  * `search` (optional): Search by reference or description keyword.
  * `per_page` (optional): 1 to 50 (default 15).
  * `page` (optional): Page number.
* **Response `200 OK`:**
```json
{
  "data": [
    {
      "id": "01JCLEDGERENTRYULID01",
      "direction": "debit",
      "type": "order_debit",
      "amount": 75000,
      "amount_formatted": "750.00",
      "balance_after": 250000,
      "balance_after_formatted": "2500.00",
      "currency": "NGN",
      "reference": "BIL-8F92A0E31C",
      "description": "VTU/Bill Purchase: MTN Mobile Data [08060671945]",
      "metadata": {
        "service_code": "MTN_DATA",
        "customer_identifier": "08060671945",
        "package_code": "112381"
      },
      "created_at": "2026-11-16T18:29:58.000Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 1,
    "last_page": 1
  }
}
```

---

## 5. Notifications Endpoints Specification

### 5.1 List Notifications
* **Method:** `GET`
* **Path:** `/api/v1/notifications`
* **Auth Required:** Yes (`auth:customer`)
* **Query Parameters:**
  * `unread` (optional, boolean): Set `unread=true` to retrieve only unread notifications.
  * `per_page` (optional, integer): Default 15 (max 50).
  * `page` (optional, integer): Page number.
* **Response `200 OK`:**
```json
{
  "data": [
    {
      "id": "9d8e7f6a-5b4c-3a2b-1a0f-9e8d7c6b5a4f",
      "type": "WalletFundedNotification",
      "title": "Wallet Funded",
      "message": "Your wallet has been credited with ₦5,000.00 via bank transfer.",
      "category": "wallet",
      "data": {
        "amount": 500000,
        "amount_formatted": "5000.00",
        "reference": "TXN-8F1E..."
      },
      "read_at": null,
      "created_at": "2026-11-16T17:45:00.000Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 1,
    "last_page": 1
  }
}
```

---

### 5.2 Get Unread Count
Quick polling or header badge counter.

* **Method:** `GET`
* **Path:** `/api/v1/notifications/unread-count`
* **Auth Required:** Yes (`auth:customer`)
* **Response `200 OK`:**
```json
{
  "data": {
    "unread_count": 3
  },
  "meta": {}
}
```

---

### 5.3 Mark Notification as Read
* **Method:** `PATCH`
* **Path:** `/api/v1/notifications/{id}`
* **Auth Required:** Yes (`auth:customer`)
* **Request Body (Optional):**
  * `{"read": true}` (default: true).
* **Response `200 OK`:** Returns updated `Notification` with non-null `read_at`.

---

### 5.4 Mark All Notifications as Read
* **Method:** `POST`
* **Path:** `/api/v1/notifications/read-all`
* **Auth Required:** Yes (`auth:customer`)
* **Response `200 OK`:**
```json
{
  "data": {
    "message": "All notifications marked as read."
  },
  "meta": {}
}
```

---

## 6. Profile, Security & Trusted Devices Endpoints

### 6.1 Profile Management

#### View Profile
* **Method:** `GET`
* **Path:** `/api/v1/profile`
* **Auth Required:** Yes (`auth:customer`)
* **Response `200 OK`:**
```json
{
  "data": {
    "id": "01JCCUSTOMERULID01",
    "username": "johndoe",
    "email": "johndoe@example.com",
    "email_verified_at": "2026-11-14T10:00:00Z",
    "created_at": "2026-11-14T09:30:00Z"
  },
  "meta": {}
}
```

#### Update Profile
* **Method:** `PATCH`
* **Path:** `/api/v1/profile`
* **Auth Required:** Yes (`auth:customer`)
* **Request Body:**
```json
{
  "username": "newusername",
  "email": "newemail@example.com"
}
```
* **Response `200 OK`:** Returns updated `CustomerProfile`.

#### Change Password
* **Method:** `PUT` (or `POST`)
* **Path:** `/api/v1/profile/password`
* **Auth Required:** Yes (`auth:customer`)
* **Request Body:**
```json
{
  "current_password": "OldPassword123!",
  "password": "NewSecurePassword456!",
  "password_confirmation": "NewSecurePassword456!"
}
```
* **Response `200 OK`:**
```json
{
  "data": {
    "message": "Password changed successfully."
  },
  "meta": {}
}
```

---

### 6.2 Session Management & Security Audit

#### List Active Sessions
* **Method:** `GET`
* **Path:** `/api/v1/profile/sessions`
* **Auth Required:** Yes (`auth:customer`)
* **Response `200 OK`:**
```json
{
  "data": [
    {
      "id": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "ip_address": "127.0.0.1",
      "user_agent": "Mozilla/5.0 ... Chrome/130.0",
      "is_current": true,
      "last_activity": "2026-11-16T18:40:00.000Z"
    }
  ],
  "meta": {}
}
```

#### Revoke Other Sessions
Terminates all sessions except the current browser session.
* **Method:** `DELETE`
* **Path:** `/api/v1/profile/sessions/other`
* **Auth Required:** Yes (`auth:customer`)
* **Response `200 OK`:** `{"data": {"message": "Other sessions revoked successfully."}, "meta": {}}`

#### Revoke Specific Session
* **Method:** `DELETE`
* **Path:** `/api/v1/profile/sessions/{hashed_id}`
* **Auth Required:** Yes (`auth:customer`)
* **Response `200 OK`:** `{"data": {"message": "Session revoked successfully."}, "meta": {}}`

#### Security Activity Log
* **Method:** `GET`
* **Path:** `/api/v1/profile/security-activity`
* **Auth Required:** Yes (`auth:customer`)
* **Response `200 OK`:**
```json
{
  "data": [
    {
      "id": "104",
      "event": "auth.password_changed",
      "ip_address": "127.0.0.1",
      "user_agent": "Mozilla/5.0 ...",
      "metadata": {},
      "occurred_at": "2026-11-16T18:32:00.000Z"
    }
  ],
  "meta": {}
}
```

---

### 6.3 Trusted Devices (Doc 04 §4.5)

#### List Trusted Devices
* **Method:** `GET`
* **Path:** `/api/v1/auth/devices`
* **Auth Required:** Yes (`auth:customer`)
* **Response `200 OK`:**
```json
{
  "data": [
    {
      "id": "01JCTRUSTEDDEVICEULID01",
      "device_name": "Chrome on Windows",
      "ip_address": "102.89.44.12",
      "last_used_at": "2026-11-16T18:00:00Z",
      "created_at": "2026-11-10T14:20:00Z"
    }
  ],
  "meta": {}
}
```

#### Remove a Trusted Device
* **Method:** `DELETE`
* **Path:** `/api/v1/auth/devices/{ulid}`
* **Auth Required:** Yes (`auth:customer`)
* **Response `200 OK`:** `{"data": {"message": "Trusted device revoked."}, "meta": {}}`

#### Remove All Trusted Devices
* **Method:** `DELETE`
* **Path:** `/api/v1/auth/devices`
* **Auth Required:** Yes (`auth:customer`)
* **Response `200 OK`:** `{"data": {"message": "All trusted devices revoked."}, "meta": {}}`

---

## 7. Ready-to-Drop Frontend Client Module (`lib/api/customer.ts`)

Add this module directly to `korak-web` at `src/lib/api/customer.ts`:

```typescript
import { apiClient } from './client';
import type {
  ApiResponse,
  ApiPaginatedResponse,
  Wallet,
  LedgerEntry,
  FundingRecord,
  BillCategory,
  BillServiceItem,
  DataBundlePackage,
  CustomerValidationResult,
  BillOrder,
  CustomerNotification,
  CustomerProfile,
  CustomerSession,
  SecurityActivity,
  TrustedDevice,
} from './types';

export const customerApi = {
  // ==========================================
  // Bills & VTU
  // ==========================================
  getBillCategories: async (): Promise<BillCategory[]> => {
    const res = await apiClient.get<ApiResponse<BillCategory[]>>('/api/v1/bills/categories');
    return res.data.data;
  },

  getBillServices: async (category?: string): Promise<BillServiceItem[]> => {
    const res = await apiClient.get<ApiResponse<BillServiceItem[]>>('/api/v1/bills/services', {
      params: category ? { category } : undefined,
    });
    return res.data.data;
  },

  getDataBundles: async (serviceCode: string): Promise<DataBundlePackage[]> => {
    const res = await apiClient.get<ApiResponse<DataBundlePackage[]>>('/api/v1/bills/data-bundles', {
      params: { service_code: serviceCode },
    });
    return res.data.data;
  },

  validateCustomerIdentifier: async (payload: {
    service_code: string;
    customer_identifier: string;
  }): Promise<CustomerValidationResult> => {
    const res = await apiClient.post<ApiResponse<CustomerValidationResult>>('/api/v1/bills/validate', payload);
    return res.data.data;
  },

  payBill: async (
    payload: {
      service_code: string;
      service_name: string;
      category: string;
      customer_identifier: string;
      customer_name?: string;
      package_code?: string;
      amount: number; // in kobo
      face_amount?: number; // in kobo
    },
    idempotencyKey?: string
  ): Promise<BillOrder> => {
    const headers = idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined;
    const res = await apiClient.post<ApiResponse<BillOrder>>('/api/v1/bills/pay', payload, { headers });
    return res.data.data;
  },

  getBillHistory: async (params?: {
    category?: string;
    status?: string;
    per_page?: number;
    page?: number;
  }): Promise<ApiPaginatedResponse<BillOrder>> => {
    const res = await apiClient.get<ApiPaginatedResponse<BillOrder>>('/api/v1/bills/history', { params });
    return res.data;
  },

  getBillOrder: async (referenceOrUlid: string): Promise<BillOrder> => {
    const res = await apiClient.get<ApiResponse<BillOrder>>(`/api/v1/bills/${referenceOrUlid}`);
    return res.data.data;
  },

  // ==========================================
  // Wallet
  // ==========================================
  getWallet: async (): Promise<Wallet> => {
    const res = await apiClient.get<ApiResponse<Wallet>>('/api/v1/wallet');
    return res.data.data;
  },

  initiateFunding: async (payload: {
    amount: number; // in kobo
    redirect_url?: string;
  }): Promise<FundingRecord> => {
    const res = await apiClient.post<ApiResponse<FundingRecord>>('/api/v1/wallet/fund', payload);
    return res.data.data;
  },

  getFundingStatus: async (referenceOrUlid: string): Promise<FundingRecord> => {
    const res = await apiClient.get<ApiResponse<FundingRecord>>(`/api/v1/wallet/fund/${referenceOrUlid}`);
    return res.data.data;
  },

  getTransactions: async (params?: {
    direction?: 'credit' | 'debit';
    type?: string;
    search?: string;
    per_page?: number;
    page?: number;
  }): Promise<ApiPaginatedResponse<LedgerEntry>> => {
    const res = await apiClient.get<ApiPaginatedResponse<LedgerEntry>>('/api/v1/wallet/transactions', { params });
    return res.data;
  },

  // ==========================================
  // Notifications
  // ==========================================
  getNotifications: async (params?: {
    unread?: boolean;
    per_page?: number;
    page?: number;
  }): Promise<ApiPaginatedResponse<CustomerNotification>> => {
    const res = await apiClient.get<ApiPaginatedResponse<CustomerNotification>>('/api/v1/notifications', { params });
    return res.data;
  },

  getUnreadNotificationsCount: async (): Promise<number> => {
    const res = await apiClient.get<ApiResponse<{ unread_count: number }>>('/api/v1/notifications/unread-count');
    return res.data.data.unread_count;
  },

  markNotificationAsRead: async (id: string, read = true): Promise<CustomerNotification> => {
    const res = await apiClient.patch<ApiResponse<CustomerNotification>>(`/api/v1/notifications/${id}`, { read });
    return res.data.data;
  },

  markAllNotificationsAsRead: async (): Promise<void> => {
    await apiClient.post('/api/v1/notifications/read-all');
  },

  // ==========================================
  // Profile & Security
  // ==========================================
  getProfile: async (): Promise<CustomerProfile> => {
    const res = await apiClient.get<ApiResponse<CustomerProfile>>('/api/v1/profile');
    return res.data.data;
  },

  updateProfile: async (payload: { username?: string; email?: string }): Promise<CustomerProfile> => {
    const res = await apiClient.patch<ApiResponse<CustomerProfile>>('/api/v1/profile', payload);
    return res.data.data;
  },

  changePassword: async (payload: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }): Promise<void> => {
    await apiClient.put('/api/v1/profile/password', payload);
  },

  getSessions: async (): Promise<CustomerSession[]> => {
    const res = await apiClient.get<ApiResponse<CustomerSession[]>>('/api/v1/profile/sessions');
    return res.data.data;
  },

  revokeSession: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/profile/sessions/${id}`);
  },

  revokeOtherSessions: async (): Promise<void> => {
    await apiClient.delete('/api/v1/profile/sessions/other');
  },

  getSecurityActivity: async (): Promise<SecurityActivity[]> => {
    const res = await apiClient.get<ApiResponse<SecurityActivity[]>>('/api/v1/profile/security-activity');
    return res.data.data;
  },

  getTrustedDevices: async (): Promise<TrustedDevice[]> => {
    const res = await apiClient.get<ApiResponse<TrustedDevice[]>>('/api/v1/auth/devices');
    return res.data.data;
  },

  revokeTrustedDevice: async (ulid: string): Promise<void> => {
    await apiClient.delete(`/api/v1/auth/devices/${ulid}`);
  },

  revokeAllTrustedDevices: async (): Promise<void> => {
    await apiClient.delete('/api/v1/auth/devices');
  },
};
```

---

## 8. Frontend UI / UX Integration Guidelines

### 8.1 Bill Purchase Flow
1. **Network Selection / Package Picker**:
   - Fetch services via `customerApi.getBillServices('data')`.
   - When the customer selects a network (e.g. `MTN_DATA`), fetch bundle plans with `customerApi.getDataBundles('MTN_DATA')`.
2. **Customer Meter / Smartcard Validation**:
   - If purchasing `electricity` or `cable_tv`, trigger `customerApi.validateCustomerIdentifier(...)` on blur / step-continue.
   - Display the validated customer name (e.g. *"Name: John Doe"*) to prevent customers from recharging wrong meters.
3. **Wallet Balance Check**:
   - Query `customerApi.getWallet()` before payment. If `wallet.balance < package.amount * 100`, disable the "Pay" button and prompt the user to fund their wallet.
4. **Auto-Refund Handling**:
   - If the backend returns status `failed` (HTTP 201 with `data.status: "failed"`), show a friendly modal explaining that provider downtime occurred and their wallet was **instantly refunded**.
   - If status is `completed`, show the transaction receipt. If electricity token exists, display a large copyable token pill.
   - Invalidate TanStack query cache for `['wallet']`, `['bills-history']`, and `['wallet-transactions']`.

### 8.2 Wallet Funding Flow
1. Customer enters amount in Naira (e.g. ₦1,000.00). Convert to kobo: `1000 * 100 = 100000`.
2. Call `customerApi.initiateFunding({ amount: 100000, redirect_url: window.location.origin + '/wallet' })`.
3. Open `checkout_url` in a popup or redirect.
4. When user returns, poll `customerApi.getWallet()` or listen for notifications to refresh balance.
