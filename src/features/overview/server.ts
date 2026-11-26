import { serverApi } from "@/lib/api/server";
import type {
  ApiResponse,
  ApiPaginatedResponse,
  Wallet,
  LedgerEntry,
  BillOrder,
} from "@/lib/api/types";
import type {
  OverviewData,
  OverviewTransaction,
  OverviewOrder,
  WalletSummary,
  OverviewMetrics,
  ServiceType,
} from "./api";
import type { TransactionDirection } from "@/features/transactions/api";

/**
 * Server-authenticated data loader for the Overview Dashboard (Next.js Server Component).
 * Uses serverApi to automatically forward the session Cookie to Laravel Sanctum so that
 * requests from Server Components are recognized as stateful and authenticated per Doc 04 §6.
 */
export async function getOverviewPageDataServer(): Promise<OverviewData> {
  try {
    const [walletRes, txRes, billRes] = await Promise.allSettled([
      serverApi.get<ApiResponse<Wallet>>("/api/v1/wallet"),
      serverApi.get<ApiPaginatedResponse<LedgerEntry>>(
        "/api/v1/wallet/transactions?per_page=5"
      ),
      serverApi.get<ApiPaginatedResponse<BillOrder>>(
        "/api/v1/bills/history?per_page=5"
      ),
    ]);

    const walletData =
      walletRes.status === "fulfilled" && walletRes.value?.data
        ? walletRes.value.data
        : null;

    const txData =
      txRes.status === "fulfilled" && Array.isArray(txRes.value?.data)
        ? txRes.value.data
        : [];

    const billData =
      billRes.status === "fulfilled" && Array.isArray(billRes.value?.data)
        ? billRes.value.data
        : [];

    const wallet: WalletSummary = {
      balance: walletData?.balance ?? 0,
      currency: walletData?.currency ?? "NGN",
      ledger_count:
        txRes.status === "fulfilled" && txRes.value?.meta?.total
          ? txRes.value.meta.total
          : txData.length,
      updated_at: walletData?.updated_at ?? new Date().toISOString(),
    };

    const recent_transactions: OverviewTransaction[] = txData.map((t) => ({
      id: t.id,
      reference: t.reference,
      direction: t.direction as TransactionDirection,
      type:
        t.type === "funding"
          ? "wallet_funding"
          : t.type === "refund"
          ? "order_refund"
          : "order_payment",
      description: t.description,
      amount: t.amount,
      currency: t.currency,
      balance_after: t.balance_after,
      created_at: t.created_at,
    }));

    const recent_orders: OverviewOrder[] = billData.map((b) => ({
      id: b.id,
      reference: b.reference,
      service_type: (b.category as ServiceType) || "data",
      service_label: b.service_name,
      amount: b.amount,
      currency: b.currency || "NGN",
      status: b.status,
      recipient: b.customer_identifier,
      created_at: b.created_at,
    }));

    const metrics: OverviewMetrics = {
      active_services_count: 0,
      completed_orders_count:
        billRes.status === "fulfilled" && billRes.value?.meta?.total
          ? billRes.value.meta.total
          : billData.filter((b) => b.status === "completed").length,
      pending_orders_count: billData.filter(
        (b) => b.status === "pending" || b.status === "processing"
      ).length,
    };

    return {
      wallet,
      metrics,
      recent_orders,
      recent_transactions,
    };
  } catch {
    return {
      wallet: {
        balance: 0,
        currency: "NGN",
        ledger_count: 0,
        updated_at: new Date().toISOString(),
      },
      metrics: {
        active_services_count: 0,
        completed_orders_count: 0,
        pending_orders_count: 0,
      },
      recent_orders: [],
      recent_transactions: [],
    };
  }
}
