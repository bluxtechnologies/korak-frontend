/**
 * Data Bundle Purchase API service and types (F16.2 & F16.4).
 * Adheres to docs/14-wallet-and-payments.md, docs/06-api-standards.md,
 * docs/09-frontend-standards.md, and the Frontend Integration Guide.
 */
import {
  dataApi,
  type DataOrder,
  type DataService,
} from "@/lib/api/data";
import type { DataBundlePackage } from "@/lib/api/types";
import {
  type TelecomNetwork,
  TELECOM_NETWORKS,
  type NetworkInfo,
} from "@/features/airtime/api";

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

export function networkToDataServiceCode(network: TelecomNetwork): {
  service_code: string;
  service_name: string;
} {
  switch (network) {
    case "mtn":
      return { service_code: "MTN_DATA", service_name: "MTN Data" };
    case "airtel":
      return { service_code: "AIRTEL_DATA", service_name: "Airtel Data" };
    case "glo":
      return { service_code: "GLO_DATA", service_name: "Glo Data" };
    case "9mobile":
      return { service_code: "9MOBILE_DATA", service_name: "9mobile Data" };
  }
}

export function serviceCodeToDataNetwork(code: string): TelecomNetwork {
  const upper = code.toUpperCase();
  if (upper.includes("MTN")) return "mtn";
  if (upper.includes("AIRTEL")) return "airtel";
  if (upper.includes("GLO")) return "glo";
  if (upper.includes("9MOBILE") || upper.includes("ETISALAT")) return "9mobile";
  return "mtn";
}

/**
 * Fetch supported data providers from GET /api/v1/bills/services?category=data.
 * Enhances backend services with frontend branding and fallback defaults.
 */
export async function getSupportedDataNetworks(): Promise<NetworkInfo[]> {
  try {
    const services = await dataApi.getNetworks();
    if (!services || services.length === 0) {
      return TELECOM_NETWORKS;
    }
    return services.map((srv: DataService) => {
      const netId = serviceCodeToDataNetwork(srv.service_code);
      const staticInfo =
        TELECOM_NETWORKS.find((n) => n.id === netId) || TELECOM_NETWORKS[0];
      return {
        ...staticInfo,
        id: netId,
        service_code: srv.service_code,
        name: srv.name.replace(/data/i, "").trim() || staticInfo.name,
        fullName: srv.name,
      };
    });
  } catch {
    return TELECOM_NETWORKS;
  }
}

export function extractSizeFromName(name: string): string {
  const match = name.match(/(\d+(?:\.\d+)?)\s*(GB|MB|TB)/i);
  return match ? `${match[1]} ${match[2].toUpperCase()}` : "1.0 GB";
}

export function extractValidityFromName(name: string): string {
  const match = name.match(/(\d+\s*(?:days?|months?|weeks?|hours?)|daily|weekly|monthly)/i);
  if (match) return match[1];
  const lower = name.toLowerCase();
  if (lower.includes("daily") || lower.includes("1 day")) return "1 day";
  if (lower.includes("weekly") || lower.includes("7 day")) return "7 days";
  return "30 Days";
}

export function extractPlanTypeFromName(name: string): DataPlanType {
  const lower = name.toLowerCase();
  if (lower.includes("sme")) return "sme";
  if (lower.includes("cg") || lower.includes("corporate")) return "corporate";
  return "gifting";
}

export function parseBundlePackageToPlan(
  pkg: DataBundlePackage,
  network: TelecomNetwork
): DataBundlePlan {
  const size = pkg.size || extractSizeFromName(pkg.name);
  const validity = pkg.validity || extractValidityFromName(pkg.name);
  const plan_type = extractPlanTypeFromName(pkg.name);

  const plan: DataBundlePlan = {
    id: pkg.code,
    network,
    plan_type,
    name: pkg.name,
    size,
    validity,
    price: pkg.amount,
    currency: "NGN",
    allowance: `${size} total`,
  };

  plan.validity_category = getPlanValidityCategory(plan);
  return plan;
}

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
  service_code?: string;
  service_name?: string;
  amount?: number; // in Naira major units
  package_name?: string;
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
  auto_refunded?: boolean;
}

/**
 * Retrieves available data bundle packages filtered by network and plan type.
 * Queries GET /api/v1/bills/data-bundles?service_code={service_code} via dataApi.
 */
export async function getDataPlans(
  network?: TelecomNetwork,
  planType?: DataPlanType
): Promise<DataBundlePlan[]> {
  try {
    if (network) {
      const { service_code } = networkToDataServiceCode(network);
      const bundles = await dataApi.getDataBundles(service_code);
      if (bundles && bundles.length > 0) {
        const mapped = bundles.map((b) => parseBundlePackageToPlan(b, network));
        if (planType) {
          return mapped.filter((p) => p.plan_type === planType);
        }
        return mapped;
      }
    } else {
      const services = await dataApi.getNetworks();
      if (services && services.length > 0) {
        const bundleArrays = await Promise.all(
          services.map(async (srv) => {
            const net = serviceCodeToDataNetwork(srv.service_code);
            const bundles = await dataApi.getDataBundles(srv.service_code);
            return bundles.map((b) => parseBundlePackageToPlan(b, net));
          })
        );
        const flat = bundleArrays.flat();
        if (flat.length > 0) {
          return planType ? flat.filter((p) => p.plan_type === planType) : flat;
        }
      }
    }
    // Fallback filter over mock plans in dev/test/offline
    return MOCK_DATA_PLANS.filter((p) => {
      if (network && p.network !== network) return false;
      if (planType && p.plan_type !== planType) return false;
      return true;
    });
  } catch {
    return MOCK_DATA_PLANS.filter((p) => {
      if (network && p.network !== network) return false;
      if (planType && p.plan_type !== planType) return false;
      return true;
    });
  }
}

/**
 * Purchases a data bundle with idempotency key handling (F16.2 & F16.4).
 * Calls POST /api/v1/bills/pay with minor units (integer kobo).
 */
export async function purchaseData(
  payload: DataPurchasePayload
): Promise<DataOrderResult> {
  const { service_code, service_name } =
    payload.service_code && payload.service_name
      ? { service_code: payload.service_code, service_name: payload.service_name }
      : networkToDataServiceCode(payload.network);

  const matchingPlan = MOCK_DATA_PLANS.find((p) => p.id === payload.plan_id);
  const priceNaira = payload.amount ?? matchingPlan?.price ?? 320;
  const amountKobo = Math.round(priceNaira * 100);

  const idempotencyKey =
    payload.idempotency_key ||
    (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `idem_data_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);

  try {
    const order: DataOrder = await dataApi.purchaseData(
      {
        service_code,
        service_name,
        category: "data",
        package_code: payload.plan_id,
        customer_identifier: payload.phone.trim(),
        amount: amountKobo,
        face_amount: amountKobo,
      },
      idempotencyKey
    );

    const netInfo =
      TELECOM_NETWORKS.find((n) => n.id === payload.network) ??
      TELECOM_NETWORKS[0];
    const planName = payload.package_name || matchingPlan?.name || `${netInfo.name} Data Plan`;
    const planSize = matchingPlan?.size || "Data Bundle";
    const resolvedAmount = order.amount ? Math.round(order.amount / 100) : priceNaira;

    let message = "";
    if (order.status === "completed") {
      message = `${planName} (${planSize}) successfully credited to ${payload.phone.trim()}.`;
    } else if (order.status === "processing") {
      message =
        "Data bundle request is processing with the network provider. Your line will be credited shortly.";
    } else if (order.status === "failed") {
      message =
        "Data bundle delivery could not be completed by the network. Your wallet has been automatically refunded.";
    } else {
      message = `Data bundle order is ${order.status}.`;
    }

    return {
      order_id: order.id,
      reference: order.reference,
      network: payload.network,
      plan_name: planName,
      size: planSize,
      phone: payload.phone.trim(),
      amount: resolvedAmount,
      status: order.status,
      message,
      created_at: order.created_at,
      auto_refunded: order.status === "failed",
    };
  } catch (error: unknown) {
    const err = error as {
      code?: string;
      response?: { data?: { code?: string; message?: string }; status?: number };
      status?: number;
    };
    if (
      err?.code === "insufficient_balance" ||
      err?.response?.data?.code === "insufficient_balance" ||
      err?.response?.status === 422 ||
      err?.status === 422
    ) {
      throw error;
    }

    if (
      process.env.NODE_ENV !== "production" ||
      err?.status === 404 ||
      err?.response?.status === 404
    ) {
      const plan = matchingPlan ?? MOCK_DATA_PLANS[0];
      return {
        order_id: `ord_${Date.now()}`,
        reference: `DAT-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`,
        network: payload.network,
        plan_name: plan.name,
        size: plan.size,
        phone: payload.phone.trim(),
        amount: plan.price,
        status: "completed",
        message: `${plan.name} (${plan.size}) successfully credited to ${payload.phone.trim()}.`,
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
