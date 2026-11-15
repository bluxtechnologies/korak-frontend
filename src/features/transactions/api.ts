/**
 * Wallet & Transaction History API service and types (F15).
 * Follows docs/14-wallet-and-payments.md, docs/06-api-standards.md,
 * and docs/09-frontend-standards.md §2 & §5.
 */
import { api } from "@/lib/api";
import { unwrapApiResponse } from "@/lib/api/errors";
import type {
  ApiPaginatedResponse,
  ApiResponse,
  PaginationMeta,
} from "@/lib/api/types";

// ---------------------------------------------------------------------------
// Types & Models (F15)
// ---------------------------------------------------------------------------

export type TransactionDirection = "credit" | "debit";

export type TransactionType =
  | "wallet_funding"
  | "order_payment"
  | "order_refund"
  | "manual_adjustment";

export interface TransactionRecord {
  id: string;
  reference: string;
  wallet_id: string;
  direction: TransactionDirection;
  type: TransactionType;
  description: string;
  amount: number; // integer minor units (e.g. kobo for NGN)
  currency: string;
  balance_after: number; // integer minor units
  originating_reference?: string;
  originating_order_id?: string;
  idempotency_key?: string;
  created_at: string; // ISO 8601 string
}

export interface TransactionQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  sort?: string; // e.g. "-created_at" or "amount"
  direction?: TransactionDirection | string;
  type?: TransactionType | string;
  date_from?: string;
  date_to?: string;
}

// ---------------------------------------------------------------------------
// Realistic Mock Ledger Fixtures (docs/14-wallet-and-payments.md §2)
// ---------------------------------------------------------------------------

export const MOCK_TRANSACTION_RECORDS: TransactionRecord[] = [
  {
    id: "txn_01",
    reference: "TXN-20261114-0012",
    wallet_id: "wal_customer_01",
    direction: "debit",
    type: "order_payment",
    description: "Data Bundle 5GB Monthly (08031234567)",
    amount: 150000, // ₦1,500.00
    currency: "NGN",
    balance_after: 4525000, // ₦45,250.00
    originating_reference: "ORD-2026-0042",
    originating_order_id: "ord_01",
    idempotency_key: "idem_ord_20261114_0012",
    created_at: "2026-11-14T10:14:00Z",
  },
  {
    id: "txn_02",
    reference: "TXN-20261113-0098",
    wallet_id: "wal_customer_01",
    direction: "credit",
    type: "wallet_funding",
    description: "Direct Bank Transfer Settlement",
    amount: 2500000, // ₦25,000.00
    currency: "NGN",
    balance_after: 4675000, // ₦46,750.00
    originating_reference: "FND-20261113-0098",
    idempotency_key: "idem_fnd_20261113_0098",
    created_at: "2026-11-13T16:30:00Z",
  },
  {
    id: "txn_03",
    reference: "TXN-20261113-0041",
    wallet_id: "wal_customer_01",
    direction: "debit",
    type: "order_payment",
    description: "Airtime Top-up ₦2,000 (09029876543)",
    amount: 200000, // ₦2,000.00
    currency: "NGN",
    balance_after: 2175000, // ₦21,750.00
    originating_reference: "ORD-2026-0040",
    originating_order_id: "ord_02",
    idempotency_key: "idem_ord_20261113_0041",
    created_at: "2026-11-13T11:05:00Z",
  },
  {
    id: "txn_04",
    reference: "TXN-20261112-0089",
    wallet_id: "wal_customer_01",
    direction: "credit",
    type: "order_refund",
    description: "Refund for failed Airtime Top-up (Network timeout)",
    amount: 100000, // ₦1,000.00
    currency: "NGN",
    balance_after: 2375000, // ₦23,750.00
    originating_reference: "ORD-2026-0038",
    originating_order_id: "ord_03",
    idempotency_key: "idem_ref_20261112_0089",
    created_at: "2026-11-12T14:22:00Z",
  },
  {
    id: "txn_05",
    reference: "TXN-20261111-0023",
    wallet_id: "wal_customer_01",
    direction: "debit",
    type: "order_payment",
    description: "Premium WireGuard VPN Config (30 Days)",
    amount: 350000, // ₦3,500.00
    currency: "NGN",
    balance_after: 2275000, // ₦22,750.00
    originating_reference: "ORD-2026-0035",
    originating_order_id: "ord_04",
    idempotency_key: "idem_ord_20261111_0023",
    created_at: "2026-11-11T09:40:00Z",
  },
  {
    id: "txn_06",
    reference: "TXN-20261110-0077",
    wallet_id: "wal_customer_01",
    direction: "credit",
    type: "wallet_funding",
    description: "Instant Online Card Funding",
    amount: 1500000, // ₦15,000.00
    currency: "NGN",
    balance_after: 2625000, // ₦26,250.00
    originating_reference: "FND-20261110-0077",
    idempotency_key: "idem_fnd_20261110_0077",
    created_at: "2026-11-10T19:15:00Z",
  },
  {
    id: "txn_07",
    reference: "TXN-20261109-0015",
    wallet_id: "wal_customer_01",
    direction: "debit",
    type: "order_payment",
    description: "MTN SME Data 10GB (07030001122)",
    amount: 280000, // ₦2,800.00
    currency: "NGN",
    balance_after: 1125000, // ₦11,250.00
    originating_reference: "ORD-2026-0031",
    originating_order_id: "ord_05",
    idempotency_key: "idem_ord_20261109_0015",
    created_at: "2026-11-09T08:50:00Z",
  },
  {
    id: "txn_08",
    reference: "TXN-20261108-0054",
    wallet_id: "wal_customer_01",
    direction: "credit",
    type: "manual_adjustment",
    description: "Promotional Sign-up Wallet Credit",
    amount: 50000, // ₦500.00
    currency: "NGN",
    balance_after: 1405000, // ₦14,050.00
    originating_reference: "ADJ-20261108-0054",
    idempotency_key: "idem_adj_20261108_0054",
    created_at: "2026-11-08T12:00:00Z",
  },
];

export const MOCK_PAGINATION_META: PaginationMeta = {
  current_page: 1,
  per_page: 15,
  total: MOCK_TRANSACTION_RECORDS.length,
  last_page: 1,
};

// ---------------------------------------------------------------------------
// API Methods (F15)
// ---------------------------------------------------------------------------

/**
 * Builds standard query parameter object following docs/06-api-standards.md §6.
 */
export function buildTransactionQueryParams(
  params?: TransactionQueryParams
): Record<string, string | number | boolean | undefined> {
  const queryParams: Record<string, string | number | boolean | undefined> = {};

  if (!params) return queryParams;

  if (params.page !== undefined) queryParams.page = params.page;
  if (params.per_page !== undefined) queryParams.per_page = params.per_page;
  if (params.search && params.search.trim() !== "") {
    queryParams.search = params.search.trim();
  }
  if (params.sort && params.sort.trim() !== "") {
    queryParams.sort = params.sort.trim();
  }
  if (params.direction && params.direction.trim() !== "") {
    queryParams["filter[direction]"] = params.direction.trim();
  }
  if (params.type && params.type.trim() !== "") {
    queryParams["filter[type]"] = params.type.trim();
  }
  if (params.date_from && params.date_from.trim() !== "") {
    queryParams["filter[date_from]"] = params.date_from.trim();
  }
  if (params.date_to && params.date_to.trim() !== "") {
    queryParams["filter[date_to]"] = params.date_to.trim();
  }

  return queryParams;
}

/**
 * Filters and paginates mock data locally if the backend endpoint is not yet connected.
 */
export function filterMockTransactions(
  params?: TransactionQueryParams
): ApiPaginatedResponse<TransactionRecord> {
  let list = [...MOCK_TRANSACTION_RECORDS];

  if (params?.search) {
    const q = params.search.toLowerCase().trim();
    list = list.filter(
      (tx) =>
        tx.reference.toLowerCase().includes(q) ||
        tx.description.toLowerCase().includes(q) ||
        (tx.originating_reference &&
          tx.originating_reference.toLowerCase().includes(q))
    );
  }

  if (params?.direction) {
    list = list.filter((tx) => tx.direction === params.direction);
  }

  if (params?.type) {
    list = list.filter((tx) => tx.type === params.type);
  }

  // Sorting
  if (params?.sort) {
    const isDesc = params.sort.startsWith("-");
    const field = isDesc ? params.sort.slice(1) : params.sort;

    list.sort((a, b) => {
      let valA: string | number = 0;
      let valB: string | number = 0;

      if (field === "created_at") {
        valA = new Date(a.created_at).getTime();
        valB = new Date(b.created_at).getTime();
      } else if (field === "amount") {
        valA = a.amount;
        valB = b.amount;
      } else if (field === "balance_after") {
        valA = a.balance_after;
        valB = b.balance_after;
      } else if (field === "reference") {
        valA = a.reference;
        valB = b.reference;
      }

      if (valA < valB) return isDesc ? 1 : -1;
      if (valA > valB) return isDesc ? -1 : 1;
      return 0;
    });
  }

  const page = Math.max(1, params?.page ?? 1);
  const perPage = Math.max(1, params?.per_page ?? 15);
  const total = list.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const startIndex = (page - 1) * perPage;
  const paginatedData = list.slice(startIndex, startIndex + perPage);

  return {
    data: paginatedData,
    meta: {
      current_page: page,
      per_page: perPage,
      total,
      last_page: lastPage,
    },
  };
}

/**
 * Fetches paginated transaction ledger history (F15.1).
 */
export async function getTransactions(
  params?: TransactionQueryParams
): Promise<ApiPaginatedResponse<TransactionRecord>> {
  const queryParams = buildTransactionQueryParams(params);

  try {
    const response = await api.get<ApiPaginatedResponse<TransactionRecord>>(
      "/api/v1/transactions",
      { params: queryParams }
    );
    return response;
  } catch (err) {
    // If backend is not yet running or returns 404 in development, fall back gracefully to mock ledger
    if (process.env.NODE_ENV !== "production") {
      return filterMockTransactions(params);
    }
    throw err;
  }
}

/**
 * Fetches an individual transaction ledger entry by ID or Reference (F15.2).
 */
export async function getTransactionById(id: string): Promise<TransactionRecord> {
  try {
    const response = await api.get<ApiResponse<TransactionRecord>>(
      `/api/v1/transactions/${encodeURIComponent(id)}`
    );
    return unwrapApiResponse(response);
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      const match = MOCK_TRANSACTION_RECORDS.find(
        (t) => t.id === id || t.reference.toLowerCase() === id.toLowerCase()
      );
      if (match) return match;
    }
    throw err;
  }
}
