/**
 * Dedicated Wallet Feature API service & types.
 * Follows docs/14-wallet-and-payments.md and docs/25-frontend-customer-endpoints-handoff.md.
 */
import { customerApi } from "@/lib/api/customer";
import type { WalletSummary } from "@/features/overview/api";
import type {
  FeeTier,
  DepositFeeContext,
  DepositBreakdown,
} from "@/lib/api/types";
import {
  type TransactionRecord,
  type TransactionDirection,
  MOCK_TRANSACTION_RECORDS,
} from "@/features/transactions/api";

export type {
  FeeTier,
  DepositFeeContext,
  DedicatedAccountSummary,
  DepositTiersResponse,
  DepositBreakdown,
  DepositInitiateResponse,
  DepositCalculatePayload,
  DepositInitiatePayload,
} from "@/lib/api/types";

export const PRESET_DEPOSIT_AMOUNTS = [1000, 5000, 10000, 20000, 50000];

export const DEFAULT_FEE_TIERS: FeeTier[] = [
  {
    id: 1,
    name: "Below ₦1,000",
    min_amount_kobo: 0,
    min_amount_ngn: 0,
    max_amount_kobo: 99999,
    max_amount_ngn: 999.99,
    fee_kobo: 2000,
    fee_ngn: 20,
    fee_formatted: "₦20.00",
    range_formatted: "₦0.00 – ₦999.99",
    description: "Transactions ₦0.00 – ₦999.99 incur a fee of ₦20.00.",
  },
  {
    id: 2,
    name: "₦1,000 to ₦10,000",
    min_amount_kobo: 100000,
    min_amount_ngn: 1000,
    max_amount_kobo: 1000000,
    max_amount_ngn: 10000,
    fee_kobo: 7500,
    fee_ngn: 75,
    fee_formatted: "₦75.00",
    range_formatted: "₦1,000.00 – ₦10,000.00",
    description: "Transactions ₦1,000.00 – ₦10,000.00 incur a fee of ₦75.00.",
  },
  {
    id: 3,
    name: "₦10,001 to ₦50,000",
    min_amount_kobo: 1000001,
    min_amount_ngn: 10000.01,
    max_amount_kobo: 5000000,
    max_amount_ngn: 50000,
    fee_kobo: 15500,
    fee_ngn: 155,
    fee_formatted: "₦155.00",
    range_formatted: "₦10,000.01 – ₦50,000.00",
    description: "Transactions ₦10,000.01 – ₦50,000.00 incur a fee of ₦155.00.",
  },
  {
    id: 4,
    name: "₦50,001 to ₦100,000",
    min_amount_kobo: 5000001,
    min_amount_ngn: 50000.01,
    max_amount_kobo: 10000000,
    max_amount_ngn: 100000,
    fee_kobo: 35000,
    fee_ngn: 350,
    fee_formatted: "₦350.00",
    range_formatted: "₦50,000.01 – ₦100,000.00",
    description: "Transactions ₦50,000.01 – ₦100,000.00 incur a fee of ₦350.00.",
  },
  {
    id: 5,
    name: "Above ₦100,000",
    min_amount_kobo: 10000001,
    min_amount_ngn: 100000.01,
    max_amount_kobo: null,
    max_amount_ngn: null,
    fee_kobo: 50000,
    fee_ngn: 500,
    fee_formatted: "₦500.00",
    range_formatted: "Above ₦100,000.01",
    description: "Transactions Above ₦100,000.01 incur a fee of ₦500.00.",
  },
];

export const DEFAULT_FEE_CONTEXT: DepositFeeContext = {
  title: "Deposit Processing Fees",
  below_1000: "₦0 – ₦999: ₦20 fee",
  tier_1000_10000: "₦1,000 – ₦10,000: ₦75 fee",
  tier_10000_50000: "₦10,001 – ₦50,000: ₦155 fee",
  tier_50000_100000: "₦50,001 – ₦100,000: ₦350 fee",
  above_100000: "Above ₦100,000: ₦500 flat fee",
  notice:
    "Processing fees are charged per transaction tier. When using this form, the fee is added to your transfer total so your wallet receives the full requested amount. For direct transfers sent straight to your virtual account, the fee is deducted from the gross incoming amount.",
};

export function formatNaira(amountNgn: number): string {
  return `₦${amountNgn.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function calculateDepositBreakdown(
  amountNgn: number,
  tiers: FeeTier[] = DEFAULT_FEE_TIERS
): DepositBreakdown {
  const safeAmount = Math.max(0, isNaN(amountNgn) ? 0 : amountNgn);
  const amountKobo = Math.round(safeAmount * 100);

  let matchedTier: FeeTier = tiers[0] ?? DEFAULT_FEE_TIERS[0];
  for (const tier of tiers) {
    const minKobo = tier.min_amount_kobo;
    const maxKobo = tier.max_amount_kobo;
    if (amountKobo >= minKobo && (maxKobo === null || amountKobo <= maxKobo)) {
      matchedTier = tier;
      break;
    }
  }

  const feeNgn = safeAmount > 0 ? matchedTier.fee_ngn : 0;
  const feeKobo = safeAmount > 0 ? matchedTier.fee_kobo : 0;
  const totalPayableNgn = safeAmount + feeNgn;
  const totalPayableKobo = amountKobo + feeKobo;

  return {
    requested_amount_kobo: amountKobo,
    requested_amount_ngn: safeAmount,
    requested_amount_formatted: formatNaira(safeAmount),
    fee_kobo: feeKobo,
    fee_ngn: feeNgn,
    fee_formatted: formatNaira(feeNgn),
    total_payable_kobo: totalPayableKobo,
    total_payable_ngn: totalPayableNgn,
    total_payable_formatted: formatNaira(totalPayableNgn),
    tier_name: matchedTier.name,
    summary: `Deposit ${formatNaira(safeAmount)} + Fee ${formatNaira(
      feeNgn
    )} = Total Payable ${formatNaira(totalPayableNgn)}.`,
  };
}

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
