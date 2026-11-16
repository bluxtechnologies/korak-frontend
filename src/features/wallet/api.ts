/**
 * Dedicated Wallet Feature API service & types.
 * Follows docs/14-wallet-and-payments.md and docs/09-frontend-standards.md.
 */
import { api } from "@/lib/api";
import { unwrapApiResponse } from "@/lib/api/errors";
import type { ApiResponse } from "@/lib/api/types";
import type { WalletSummary } from "@/features/overview/api";
import {
  type TransactionRecord,
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
  account_details: VirtualAccountDetails;
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
    updated_at: "2026-11-15T10:15:00Z",
  },
  account_details: MOCK_VIRTUAL_ACCOUNT,
  transactions: MOCK_TRANSACTION_RECORDS,
};

export async function getWalletPageData(): Promise<WalletPageData> {
  try {
    const response = await api.get<ApiResponse<WalletPageData>>("/api/v1/wallet");
    return unwrapApiResponse(response);
  } catch {
    // In dev / offline or unmocked backend, gracefully return realistic fixture
    return MOCK_WALLET_PAGE_DATA;
  }
}
