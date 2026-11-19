# 26 — Backend Handoff: Customer Support Tickets API Contract

**Date:** 2026-11-18  
**Scope:** Customer Help Desk & Support Ticket System (F13 / Customer Portal)  
**Standard Compliance:** [06-api-standards.md](file:///c:/startupp/korakdigital-frontend/docs/06-api-standards.md), [08-security-standards.md](file:///c:/startupp/korakdigital-frontend/docs/08-security-standards.md)  
**Frontend Implementation:** `src/features/support/`, `src/app/(dashboard)/support/`

---

## 1. Overview & Business Rules

Customers can raise support tickets across digital services (airtime, mobile data, virtual numbers, VPN, orders, billing), track their status, and engage in threaded two-way conversations with Korak support administrators.

### Core Rules
1. **Ownership Isolation:** Customers can only query, view, and reply to their own tickets. All queries must automatically scope to the authenticated user ID (`customer_id`).
2. **Ticket Statuses:**
   - `open`: Newly created by the customer, waiting for admin action.
   - `in_progress`: Admin has reviewed or replied and is working on resolution.
   - `resolved`: Issue has been addressed. Customer cannot send further replies unless reopened by admin or automated workflow.
   - `closed`: Final resolution. Read-only.
3. **Public Identifiers:**
   - Ticket public IDs start with `tkt_` (e.g. `tkt_01h8q7v9...`).
   - Human-readable audit references formatted as `TKT-XXXXX` (e.g. `TKT-00142`).
   - Message public IDs start with `msg_` (e.g. `msg_01h8q80a...`).
4. **Unread Indicator:** `has_unread_reply` is `true` if there are any admin messages with `read_at IS NULL` for this ticket. When the customer views `GET /api/v1/support/tickets/{id}`, mark admin messages as read.

---

## 2. Database Schema Recommendations

### `support_tickets`
| Column | Type | Constraints / Description |
|---|---|---|
| `id` | `uuid` or string | Primary key (`tkt_...`) |
| `reference` | `varchar(32)` | Unique, human-readable index (e.g. `TKT-00142`) |
| `customer_id` | `uuid` / foreign key | References `users(id)` |
| `subject` | `varchar(150)` | Min 5, Max 120 chars |
| `category` | `enum` | `'billing'`, `'order'`, `'vpn'`, `'airtime_data'`, `'account'`, `'general'` |
| `status` | `enum` | `'open'`, `'in_progress'`, `'resolved'`, `'closed'` (default `'open'`) |
| `has_unread_reply`| `boolean` | Default `false`. Set `true` when admin messages; set `false` when customer visits ticket. |
| `created_at` | `timestamp` | UTC |
| `updated_at` | `timestamp` | UTC (updated on new message or status change) |

### `support_ticket_messages`
| Column | Type | Constraints / Description |
|---|---|---|
| `id` | `uuid` or string | Primary key (`msg_...`) |
| `ticket_id` | `uuid` / foreign key | References `support_tickets(id)` ON DELETE CASCADE |
| `author_type` | `enum` | `'customer'`, `'admin'` |
| `author_id` | `uuid` / foreign key | References `users(id)` |
| `author_name` | `varchar(100)` | Snapshot name for display (e.g. customer name or "Support Team") |
| `body` | `text` | Min 1, Max 2000 chars |
| `read_at` | `timestamp` nullable | Null until recipient views the message |
| `created_at` | `timestamp` | UTC |

---

## 3. Endpoints Specification

### 3.1. List Customer Tickets
- **Endpoint:** `GET /api/v1/support/tickets`
- **Auth:** Sanctum customer session (`auth:sanctum`)
- **Query Parameters:**
  - `page` (integer, default `1`)
  - `per_page` (integer, default `15`, capped at `50`)
  - `filter[status]` (optional: `'open'`, `'in_progress'`, `'resolved'`, `'closed'`)
  - `search` (optional string: matches `reference` or `subject`)
  - `sort` (default `-updated_at`)

**Success Response (`200 OK`):**
```json
{
  "data": [
    {
      "id": "tkt_01h8q7v9",
      "reference": "TKT-00142",
      "subject": "Wallet not credited after transfer",
      "category": "billing",
      "status": "in_progress",
      "message_count": 4,
      "has_unread_reply": true,
      "latest_message_preview": "We have escalated this to our payments team.",
      "created_at": "2026-11-17T09:12:00Z",
      "updated_at": "2026-11-17T14:30:00Z"
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

### 3.2. Create Support Ticket
- **Endpoint:** `POST /api/v1/support/tickets`
- **Auth:** Sanctum customer session
- **Header:** `Content-Type: application/json`

**Request Body:**
```json
{
  "subject": "VPN connection drops frequently",
  "category": "vpn",
  "message": "My connection on the Lagos node disconnects every 10 minutes. Please investigate."
}
```

**Validation Rules:**
- `subject`: `required|string|min:5|max:120`
- `category`: `required|in:billing,order,vpn,airtime_data,account,general`
- `message`: `required|string|min:20|max:2000`

**Success Response (`201 Created` or `200 OK`):**
```json
{
  "data": {
    "id": "tkt_01h8q90b",
    "reference": "TKT-00143",
    "subject": "VPN connection drops frequently",
    "category": "vpn",
    "status": "open",
    "message_count": 1,
    "has_unread_reply": false,
    "latest_message_preview": "My connection on the Lagos node disconnects every 10 minutes...",
    "created_at": "2026-11-18T13:40:00Z",
    "updated_at": "2026-11-18T13:40:00Z"
  }
}
```

**Validation Error (`422 Unprocessable Entity`):**
```json
{
  "message": "The given data was invalid.",
  "code": "validation_failed",
  "errors": {
    "subject": ["Subject must be at least 5 characters."],
    "message": ["Please describe your issue in at least 20 characters."]
  }
}
```

---

### 3.3. Get Ticket Detail with Message Thread
- **Endpoint:** `GET /api/v1/support/tickets/{id}`
- **Auth:** Sanctum customer session
- **Side Effect:** Marks all unread admin messages in this ticket as read (`read_at = now()`), and resets `has_unread_reply = false`.

**Success Response (`200 OK`):**
```json
{
  "data": {
    "id": "tkt_01h8q7v9",
    "reference": "TKT-00142",
    "subject": "Wallet not credited after transfer",
    "category": "billing",
    "status": "in_progress",
    "message_count": 2,
    "has_unread_reply": false,
    "created_at": "2026-11-17T09:12:00Z",
    "updated_at": "2026-11-17T14:30:00Z",
    "messages": [
      {
        "id": "msg_01h8q7v9a",
        "ticket_id": "tkt_01h8q7v9",
        "author": "customer",
        "author_name": "Amara Nwosu",
        "body": "I made a transfer of ₦5,000 to my Korak wallet over 2 hours ago and it has still not been credited.",
        "created_at": "2026-11-17T09:12:00Z"
      },
      {
        "id": "msg_01h8q7v9b",
        "ticket_id": "tkt_01h8q7v9",
        "author": "admin",
        "author_name": "Support Team",
        "body": "Thank you for reaching out, Amara. Could you please share your bank transaction reference number?",
        "created_at": "2026-11-17T10:45:00Z"
      }
    ]
  }
}
```

---

### 3.4. Customer Reply to Ticket
- **Endpoint:** `POST /api/v1/support/tickets/{id}/messages`
- **Auth:** Sanctum customer session
- **Restriction:** Reject with `422` or `400` if the ticket is `resolved` or `closed`.

**Request Body:**
```json
{
  "message": "Here is the transaction reference: TXN20261117KOK48219."
}
```

**Validation Rules:**
- `message`: `required|string|min:1|max:2000`

**Success Response (`201 Created` or `200 OK`):**
```json
{
  "data": {
    "id": "msg_01h8q7v9c",
    "ticket_id": "tkt_01h8q7v9",
    "author": "customer",
    "author_name": "Amara Nwosu",
    "body": "Here is the transaction reference: TXN20261117KOK48219.",
    "created_at": "2026-11-18T13:45:00Z"
  }
}
```

---

## 4. Admin API Requirements (Summary for Admin Portal)

For the admin portal, the following corresponding endpoints are required:
1. `GET /api/v1/admin/support/tickets` (with filter by customer, category, status, priority, unassigned)
2. `PATCH /api/v1/admin/support/tickets/{id}/status` (`status: in_progress | resolved | closed`)
3. `POST /api/v1/admin/support/tickets/{id}/messages` (sends admin reply; sets `author: admin`, `has_unread_reply: true` on ticket, and dispatches in-app / push notification to customer)

---

## 5. Integration Checklist

- [ ] Create `support_tickets` table & migration
- [ ] Create `support_ticket_messages` table & migration
- [ ] Implement `SupportTicketController` with route group under `/api/v1/support`
- [ ] Add FormRequest validators for `CreateTicketRequest` and `ReplyTicketRequest`
- [ ] Trigger notification to support admin on new ticket creation
- [ ] Trigger customer in-app notification when admin sends a reply
