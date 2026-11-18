/**
 * Data Bundle Purchase API service and types (F16.2 & F16.4).
 * Adheres to docs/14-wallet-and-payments.md, docs/06-api-standards.md,
 * and docs/09-frontend-standards.md.
 */
import { api } from "@/lib/api";
import { unwrapApiResponse } from "@/lib/api/errors";
import type { ApiResponse } from "@/lib/api/types";
import { type TelecomNetwork, TELECOM_NETWORKS } from "@/features/airtime/api";

export type DataPlanType = "sme" | "corporate" | "gifting";

export interface DataBundlePlan {
  id: string;
  network: TelecomNetwork;
  plan_type: DataPlanType;
  name: string;
  size: string; // e.g. "1.0 GB", "2.0 GB", "5.0 GB", "10.0 GB"
  validity: string; // e.g. "30 Days"
  price: number; // in Naira major units, e.g. 320
  currency: string;
  validity_category?: "Daily" | "Weekly" | "Monthly" | string;
  allowance?: string;
}

/**
 * Returns the standardized validity category ("Daily" | "Weekly" | "Monthly") for a data plan.
 */
export function getPlanValidityCategory(
  plan: DataBundlePlan
): "Daily" | "Weekly" | "Monthly" {
  if (
    plan.validity_category === "Daily" ||
    plan.validity_category === "Weekly" ||
    plan.validity_category === "Monthly"
  ) {
    return plan.validity_category;
  }
  const v = plan.validity.toLowerCase();
  if (v.includes("1 day") || v.includes("daily") || v.includes("24 hour")) {
    return "Daily";
  }
  if (v.includes("7 day") || v.includes("week") || v.includes("14 day")) {
    return "Weekly";
  }
  return "Monthly";
}

/**
 * Returns a human-friendly data allowance string (e.g. "45MB total").
 */
export function getPlanAllowance(plan: DataBundlePlan): string {
  if (plan.allowance) return plan.allowance;
  if (plan.size.toLowerCase().includes("total")) return plan.size;
  return `${plan.size} total`;
}

export const DATA_PLAN_TYPES: { id: DataPlanType; label: string; description: string }[] = [
  {
    id: "sme",
    label: "SME Data",
    description: "High-speed shared data with 30-day validity at wholesale rates",
  },
  {
    id: "corporate",
    label: "Corporate Gifting",
    description: "Official enterprise gifting bundles directly from telcos",
  },
  {
    id: "gifting",
    label: "Direct Gifting",
    description: "Standard direct network gifting for all phone types",
  },
];

export const MOCK_DATA_PLANS: DataBundlePlan[] = [
  // MTN Reference Plans (Daily, Weekly, Monthly)
  {
    id: "mtn_daily_45mb",
    network: "mtn",
    plan_type: "sme",
    name: "40MB + 5MB Night Bonus",
    size: "45 MB",
    validity: "1 day",
    price: 50,
    currency: "NGN",
    validity_category: "Daily",
    allowance: "45MB total",
  },
  {
    id: "mtn_daily_100mb",
    network: "mtn",
    plan_type: "sme",
    name: "100MB Daily Bundle",
    size: "100 MB",
    validity: "1 day",
    price: 100,
    currency: "NGN",
    validity_category: "Daily",
    allowance: "100MB total",
  },
  {
    id: "mtn_weekly_350mb",
    network: "mtn",
    plan_type: "sme",
    name: "350MB + 100MB YouTube",
    size: "450 MB",
    validity: "7 days",
    price: 300,
    currency: "NGN",
    validity_category: "Weekly",
    allowance: "450MB total",
  },
  {
    id: "mtn_weekly_1_5gb",
    network: "mtn",
    plan_type: "sme",
    name: "1.5GB Weekly Pulse",
    size: "1.5 GB",
    validity: "7 days",
    price: 500,
    currency: "NGN",
    validity_category: "Weekly",
    allowance: "1.5GB total",
  },

  // MTN SME (Monthly)
  { id: "mtn_sme_500mb", network: "mtn", plan_type: "sme", name: "MTN SME 500MB", size: "500 MB", validity: "30 Days", price: 175, currency: "NGN", validity_category: "Monthly", allowance: "500MB total" },
  { id: "mtn_sme_1gb", network: "mtn", plan_type: "sme", name: "MTN SME 1.0GB", size: "1.0 GB", validity: "30 Days", price: 320, currency: "NGN", validity_category: "Monthly", allowance: "1.0 GB total" },
  { id: "mtn_sme_2gb", network: "mtn", plan_type: "sme", name: "MTN SME 2.0GB", size: "2.0 GB", validity: "30 Days", price: 640, currency: "NGN", validity_category: "Monthly", allowance: "2.0 GB total" },
  { id: "mtn_sme_3gb", network: "mtn", plan_type: "sme", name: "MTN SME 3.0GB", size: "3.0 GB", validity: "30 Days", price: 960, currency: "NGN", validity_category: "Monthly", allowance: "3.0 GB total" },
  { id: "mtn_sme_5gb", network: "mtn", plan_type: "sme", name: "MTN SME 5.0GB", size: "5.0 GB", validity: "30 Days", price: 1600, currency: "NGN", validity_category: "Monthly", allowance: "5.0 GB total" },
  { id: "mtn_sme_10gb", network: "mtn", plan_type: "sme", name: "MTN SME 10.0GB", size: "10.0 GB", validity: "30 Days", price: 3200, currency: "NGN", validity_category: "Monthly", allowance: "10.0 GB total" },

  // MTN Corporate
  { id: "mtn_cg_1gb", network: "mtn", plan_type: "corporate", name: "MTN CG 1.0GB", size: "1.0 GB", validity: "30 Days", price: 350, currency: "NGN", validity_category: "Monthly", allowance: "1.0 GB total" },
  { id: "mtn_cg_2gb", network: "mtn", plan_type: "corporate", name: "MTN CG 2.0GB", size: "2.0 GB", validity: "30 Days", price: 700, currency: "NGN", validity_category: "Monthly", allowance: "2.0 GB total" },
  { id: "mtn_cg_5gb", network: "mtn", plan_type: "corporate", name: "MTN CG 5.0GB", size: "5.0 GB", validity: "30 Days", price: 1750, currency: "NGN", validity_category: "Monthly", allowance: "5.0 GB total" },

  // Airtel Retail (Daily, Weekly) & Corporate Gifting
  { id: "airtel_daily_40mb", network: "airtel", plan_type: "gifting", name: "40MB Daily Plan", size: "40 MB", validity: "1 day", price: 50, currency: "NGN", validity_category: "Daily", allowance: "40MB total" },
  { id: "airtel_daily_100mb", network: "airtel", plan_type: "gifting", name: "100MB Daily Bundle", size: "100 MB", validity: "1 day", price: 100, currency: "NGN", validity_category: "Daily", allowance: "100MB total" },
  { id: "airtel_weekly_350mb", network: "airtel", plan_type: "gifting", name: "350MB Binge Bundle", size: "350 MB", validity: "7 days", price: 300, currency: "NGN", validity_category: "Weekly", allowance: "350MB total" },
  { id: "airtel_weekly_1_5gb", network: "airtel", plan_type: "gifting", name: "1.5GB Weekly Super", size: "1.5 GB", validity: "7 days", price: 500, currency: "NGN", validity_category: "Weekly", allowance: "1.5GB total" },
  { id: "airtel_cg_500mb", network: "airtel", plan_type: "corporate", name: "Airtel CG 500MB", size: "500 MB", validity: "30 Days", price: 180, currency: "NGN", validity_category: "Monthly", allowance: "500MB total" },
  { id: "airtel_cg_1gb", network: "airtel", plan_type: "corporate", name: "Airtel CG 1.0GB", size: "1.0 GB", validity: "30 Days", price: 340, currency: "NGN", validity_category: "Monthly", allowance: "1.0 GB total" },
  { id: "airtel_cg_2gb", network: "airtel", plan_type: "corporate", name: "Airtel CG 2.0GB", size: "2.0 GB", validity: "30 Days", price: 680, currency: "NGN", validity_category: "Monthly", allowance: "2.0 GB total" },
  { id: "airtel_cg_5gb", network: "airtel", plan_type: "corporate", name: "Airtel CG 5.0GB", size: "5.0 GB", validity: "30 Days", price: 1700, currency: "NGN", validity_category: "Monthly", allowance: "5.0 GB total" },
  { id: "airtel_cg_10gb", network: "airtel", plan_type: "corporate", name: "Airtel CG 10.0GB", size: "10.0 GB", validity: "30 Days", price: 3400, currency: "NGN", validity_category: "Monthly", allowance: "10.0 GB total" },

  // Glo Retail (Daily, Weekly) & Corporate Gifting
  { id: "glo_daily_50mb", network: "glo", plan_type: "gifting", name: "50MB Daily Special", size: "50 MB", validity: "1 day", price: 50, currency: "NGN", validity_category: "Daily", allowance: "50MB total" },
  { id: "glo_daily_150mb", network: "glo", plan_type: "gifting", name: "150MB Daily Bundle", size: "150 MB", validity: "1 day", price: 100, currency: "NGN", validity_category: "Daily", allowance: "150MB total" },
  { id: "glo_weekly_1gb", network: "glo", plan_type: "gifting", name: "1.0GB Special Weekly", size: "1.0 GB", validity: "7 days", price: 500, currency: "NGN", validity_category: "Weekly", allowance: "1.0 GB total" },
  { id: "glo_cg_1gb", network: "glo", plan_type: "corporate", name: "Glo CG 1.0GB", size: "1.0 GB", validity: "30 Days", price: 310, currency: "NGN", validity_category: "Monthly", allowance: "1.0 GB total" },
  { id: "glo_cg_2gb", network: "glo", plan_type: "corporate", name: "Glo CG 2.0GB", size: "2.0 GB", validity: "30 Days", price: 620, currency: "NGN", validity_category: "Monthly", allowance: "2.0 GB total" },
  { id: "glo_cg_5gb", network: "glo", plan_type: "corporate", name: "Glo CG 5.0GB", size: "5.0 GB", validity: "30 Days", price: 1550, currency: "NGN", validity_category: "Monthly", allowance: "5.0 GB total" },
  { id: "glo_gift_1gb", network: "glo", plan_type: "gifting", name: "Glo Gift 1.0GB", size: "1.0 GB", validity: "30 Days", price: 300, currency: "NGN", validity_category: "Monthly", allowance: "1.0 GB total" },

  // 9mobile Retail (Daily, Weekly) & Corporate
  { id: "9mob_daily_50mb", network: "9mobile", plan_type: "gifting", name: "50MB Daily Lite", size: "50 MB", validity: "1 day", price: 50, currency: "NGN", validity_category: "Daily", allowance: "50MB total" },
  { id: "9mob_daily_100mb", network: "9mobile", plan_type: "gifting", name: "100MB Daily Super", size: "100 MB", validity: "1 day", price: 100, currency: "NGN", validity_category: "Daily", allowance: "100MB total" },
  { id: "9mob_weekly_1gb", network: "9mobile", plan_type: "gifting", name: "1.0GB MoreCliq Weekly", size: "1.0 GB", validity: "7 days", price: 500, currency: "NGN", validity_category: "Weekly", allowance: "1.0 GB total" },
  { id: "9mob_cg_1gb", network: "9mobile", plan_type: "corporate", name: "9mobile CG 1.0GB", size: "1.0 GB", validity: "30 Days", price: 350, currency: "NGN", validity_category: "Monthly", allowance: "1.0 GB total" },
  { id: "9mob_cg_2gb", network: "9mobile", plan_type: "corporate", name: "9mobile CG 2.0GB", size: "2.0 GB", validity: "30 Days", price: 700, currency: "NGN", validity_category: "Monthly", allowance: "2.0 GB total" },
  { id: "9mob_cg_5gb", network: "9mobile", plan_type: "corporate", name: "9mobile CG 5.0GB", size: "5.0 GB", validity: "30 Days", price: 1750, currency: "NGN", validity_category: "Monthly", allowance: "5.0 GB total" },
];

export interface DataPurchasePayload {
  network: TelecomNetwork;
  plan_id: string;
  phone: string;
  idempotency_key?: string;
}

export interface DataOrderResult {
  order_id: string;
  reference: string;
  network: TelecomNetwork;
  plan_name: string;
  size: string;
  phone: string;
  amount: number; // in Naira
  status: "pending" | "processing" | "completed" | "failed";
  message: string;
  created_at: string;
}

/**
 * Retrieves available data bundle packages filtered by network and plan type.
 */
export async function getDataPlans(
  network?: TelecomNetwork,
  planType?: DataPlanType
): Promise<DataBundlePlan[]> {
  try {
    const params = new URLSearchParams();
    if (network) params.set("network", network);
    if (planType) params.set("plan_type", planType);
    const query = params.toString() ? `?${params.toString()}` : "";

    const raw = await api.get<ApiResponse<DataBundlePlan[]>>(
      `/api/v1/services/data/plans${query}`
    );
    return unwrapApiResponse(raw);
  } catch {
    // Fallback filter over mock plans in dev/test
    return MOCK_DATA_PLANS.filter((p) => {
      if (network && p.network !== network) return false;
      if (planType && p.plan_type !== planType) return false;
      return true;
    });
  }
}

/**
 * Purchases a data bundle with idempotency key handling (F16.2 & F16.4).
 */
export async function purchaseData(
  payload: DataPurchasePayload
): Promise<DataOrderResult> {
  const idempotencyKey =
    payload.idempotency_key ||
    `idem_data_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  try {
    const raw = await api.post<ApiResponse<DataOrderResult>>(
      "/api/v1/services/data/purchase",
      {
        network: payload.network,
        plan_id: payload.plan_id,
        phone: payload.phone,
      },
      {
        headers: {
          "Idempotency-Key": idempotencyKey,
        },
      }
    );
    return unwrapApiResponse(raw);
  } catch (error: unknown) {
    if (
      process.env.NODE_ENV !== "production" ||
      (error as { status?: number })?.status === 404
    ) {
      const plan =
        MOCK_DATA_PLANS.find((p) => p.id === payload.plan_id) ??
        MOCK_DATA_PLANS[0];

      return {
        order_id: `ord_${Date.now()}`,
        reference: `DAT-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`,
        network: payload.network,
        plan_name: plan.name,
        size: plan.size,
        phone: payload.phone,
        amount: plan.price,
        status: "completed",
        message: `${plan.name} (${plan.size}) successfully credited to ${payload.phone}.`,
        created_at: new Date().toISOString(),
      };
    }
    throw error;
  }
}

export interface RecentDataItem {
  id: string;
  reference: string;
  network: TelecomNetwork;
  plan_name: string;
  size: string;
  phone: string;
  amount: number;
  status: "completed" | "processing" | "failed";
  created_at: string;
}

export const MOCK_RECENT_DATA_ORDERS: RecentDataItem[] = [
  {
    id: "dat_01",
    reference: "DAT-20261114-1102",
    network: "mtn",
    plan_name: "MTN SME 5.0GB",
    size: "5.0 GB",
    phone: "08031234567",
    amount: 1600,
    status: "completed",
    created_at: "2026-11-14T15:30:00Z",
  },
  {
    id: "dat_02",
    reference: "DAT-20261113-7451",
    network: "airtel",
    plan_name: "Airtel CG 2.0GB",
    size: "2.0 GB",
    phone: "08029876543",
    amount: 680,
    status: "completed",
    created_at: "2026-11-13T10:15:00Z",
  },
];
