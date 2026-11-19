/**
 * Dedicated Wallet Feature API service & types.
 * Follows docs/14-wallet-and-payments.md and docs/25-frontend-customer-endpoints-handoff.md.
 */
import { customerApi } from "@/lib/api/customer";
import type { WalletSummary } from "@/features/overview/api";
import {
  type TransactionRecord,
  type TransactionDirection,
  MOCK_TRANSACTION_RECORDS,
} from "@/features/transactions/api";

export interface VirtualAccountDetails {
  account_name: string;
  account_number: string;
  bank_name: string;
  currency: string;
  assigned_at: string;
}

export interface WalletPageData {
  wallet: WalletSummary;
  account_details: VirtualAccountDetails | null;
  transactions: TransactionRecord[];
}

export const MOCK_VIRTUAL_ACCOUNT: VirtualAccountDetails = {
  account_name: "CLIQ / Obaseki Collins",
  account_number: "2603521256",
  bank_name: "Paga",
  currency: "NGN",
  assigned_at: "2026-10-15T08:00:00Z",
};

export const MOCK_WALLET_PAGE_DATA: WalletPageData = {
  wallet: {
    balance: 4525000, // ₦45,250.00
    currency: "NGN",
    ledger_count: 24,
    updated_at: new Date().toISOString(),
  },
  account_details: MOCK_VIRTUAL_ACCOUNT,
  transactions: MOCK_TRANSACTION_RECORDS,
};

/**
 * Fetches real wallet page data from live customer API endpoints:
 * - Wallet balance via customerApi.getWallet()
 * - Dedicated virtual account via customerApi.getDedicatedAccount()
 * - Recent transaction ledger entries via customerApi.getTransactions()
 *
 * For new accounts or zero balances, cleanly returns 0 / null / empty arrays
 * without falling back to mock fixtures.
 */
export async function getWalletPageData(): Promise<WalletPageData> {
  try {
    const [walletRes, accountRes, txRes] = await Promise.allSettled([
      customerApi.getWallet(),
      customerApi.getDedicatedAccount(),
      customerApi.getTransactions({ per_page: 15 }),
    ]);

    const walletData = walletRes.status === "fulfilled" ? walletRes.value : null;
    const accountData = accountRes.status === "fulfilled" ? accountRes.value.account : null;
    const txData = txRes.status === "fulfilled" ? txRes.value.data : [];

    const account_details: VirtualAccountDetails | null = accountData
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
        ledger_count: txRes.status === "fulfilled" ? txRes.value.meta.total : 0,
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
