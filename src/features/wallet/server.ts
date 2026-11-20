import { serverApi } from "@/lib/api/server";
import type {
  ApiResponse,
  ApiPaginatedResponse,
  DedicatedVirtualAccount,
  DedicatedAccountMeta,
  Wallet,
  LedgerEntry,
} from "@/lib/api/types";
import type { WalletPageData, VirtualAccountDetails } from "./api";
import type { TransactionRecord, TransactionDirection } from "@/features/transactions/api";

/**
 * Server-authenticated data loader for the Wallet Page (Next.js Server Component).
 * Uses serverApi to automatically forward the session Cookie, Origin, and Referer
 * from next/headers to Laravel Sanctum so that server-side requests are recognized
 * as stateful and authenticated per Doc 04 §6.
 */
export async function getWalletPageDataServer(): Promise<WalletPageData> {
  try {
    const [walletRes, accountRes, txRes] = await Promise.allSettled([
      serverApi.get<ApiResponse<Wallet>>("/api/v1/wallet"),
      serverApi.get<ApiResponse<DedicatedVirtualAccount | null, DedicatedAccountMeta>>(
        "/api/v1/wallet/dedicated-account"
      ),
      serverApi.get<ApiPaginatedResponse<LedgerEntry>>(
        "/api/v1/wallet/transactions?per_page=15"
      ),
    ]);

    const walletData =
      walletRes.status === "fulfilled" && walletRes.value?.data
        ? walletRes.value.data
        : null;

    const accountData =
      accountRes.status === "fulfilled" && accountRes.value?.data
        ? accountRes.value.data
        : null;

    const txData =
      txRes.status === "fulfilled" && Array.isArray(txRes.value?.data)
        ? txRes.value.data
        : [];

    const account_details: VirtualAccountDetails | null =
      accountData && accountData.account_number?.trim()
        ? {
            account_name: accountData.account_name,
            account_number: accountData.account_number,
            bank_name: accountData.bank_name,
            currency: "NGN",
            assigned_at: accountData.created_at,
          }
        : null;

    const transactions: TransactionRecord[] = txData.map((t) => ({
      id: t.id,
      reference: t.reference,
      wallet_id: walletData?.id ?? "",
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

    return {
      wallet: {
        balance: walletData?.balance ?? 0,
        currency: walletData?.currency ?? "NGN",
        ledger_count:
          txRes.status === "fulfilled" && txRes.value?.meta?.total
            ? txRes.value.meta.total
            : transactions.length,
        updated_at: walletData?.updated_at ?? new Date().toISOString(),
      },
      account_details,
      transactions,
    };
  } catch {
    return {
      wallet: {
        balance: 0,
        currency: "NGN",
        ledger_count: 0,
        updated_at: new Date().toISOString(),
      },
      account_details: null,
      transactions: [],
    };
  }
}
