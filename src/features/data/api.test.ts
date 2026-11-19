import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  getDataPlans,
  purchaseData,
  getSupportedDataNetworks,
  networkToDataServiceCode,
  serviceCodeToDataNetwork,
  extractSizeFromName,
  extractValidityFromName,
  extractPlanTypeFromName,
  parseBundlePackageToPlan,
  DATA_PLAN_TYPES,
  MOCK_DATA_PLANS,
} from "./api";
import { dataApi, type DataOrder } from "@/lib/api/data";
import { TELECOM_NETWORKS } from "@/features/airtime/api";

vi.mock("@/lib/api/data", () => ({
  dataApi: {
    getNetworks: vi.fn(),
    getDataBundles: vi.fn(),
    purchaseData: vi.fn(),
    getHistory: vi.fn(),
  },
}));

describe("Data API & Plans (F16.2 & F16.4)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("DATA_PLAN_TYPES", () => {
    it("defines SME, Corporate, and Gifting categories", () => {
      const types = DATA_PLAN_TYPES.map((t) => t.id);
      expect(types).toEqual(["sme", "corporate", "gifting"]);
    });
  });

  describe("Service Code Mappings", () => {
    it("maps network id to data service code and vice-versa", () => {
      expect(networkToDataServiceCode("mtn")).toEqual({
        service_code: "MTN_DATA",
        service_name: "MTN Data",
      });
      expect(networkToDataServiceCode("airtel")).toEqual({
        service_code: "AIRTEL_DATA",
        service_name: "Airtel Data",
      });
      expect(networkToDataServiceCode("glo")).toEqual({
        service_code: "GLO_DATA",
        service_name: "Glo Data",
      });
      expect(networkToDataServiceCode("9mobile")).toEqual({
        service_code: "9MOBILE_DATA",
        service_name: "9mobile Data",
      });

      expect(serviceCodeToDataNetwork("MTN_DATA")).toBe("mtn");
      expect(serviceCodeToDataNetwork("AIRTEL_DATA")).toBe("airtel");
      expect(serviceCodeToDataNetwork("GLO_DATA")).toBe("glo");
      expect(serviceCodeToDataNetwork("9MOBILE_DATA")).toBe("9mobile");
    });
  });

  describe("Parsers & Extractors", () => {
    it("extracts size, validity, and plan type from package name", () => {
      expect(extractSizeFromName("MTN 2.5GB 30-Day SME")).toBe("2.5 GB");
      expect(extractValidityFromName("Airtel 1GB 7 Days Weekly")).toBe("7 Days");
      expect(extractPlanTypeFromName("MTN 1GB SME Data")).toBe("sme");
      expect(extractPlanTypeFromName("Airtel 500MB Corporate Gifting")).toBe("corporate");
      expect(extractPlanTypeFromName("Glo 2GB Direct Gift")).toBe("gifting");
    });

    it("parses DataBundlePackage to DataBundlePlan", () => {
      const pkg = {
        code: "pkg_123",
        name: "MTN 1.0GB SME 30 Days",
        amount: 320,
      };
      const plan = parseBundlePackageToPlan(pkg, "mtn");
      expect(plan.id).toBe("pkg_123");
      expect(plan.network).toBe("mtn");
      expect(plan.plan_type).toBe("sme");
      expect(plan.size).toBe("1.0 GB");
      expect(plan.price).toBe(320);
      expect(plan.validity_category).toBe("Monthly");
    });
  });

  describe("getSupportedDataNetworks", () => {
    it("fetches active carriers from dataApi.getNetworks and enhances with metadata", async () => {
      vi.mocked(dataApi.getNetworks).mockResolvedValueOnce([
        { service_code: "MTN_DATA", name: "MTN Data", category: "data" },
        { service_code: "AIRTEL_DATA", name: "Airtel Data", category: "data" },
      ]);

      const networks = await getSupportedDataNetworks();
      expect(dataApi.getNetworks).toHaveBeenCalled();
      expect(networks).toHaveLength(2);
      expect(networks[0].id).toBe("mtn");
      expect(networks[1].id).toBe("airtel");
    });

    it("falls back to TELECOM_NETWORKS on error or empty response", async () => {
      vi.mocked(dataApi.getNetworks).mockRejectedValueOnce(new Error("Network Error"));

      const networks = await getSupportedDataNetworks();
      expect(networks).toEqual(TELECOM_NETWORKS);
    });
  });

  describe("getDataPlans", () => {
    it("fetches bundle packages from dataApi.getDataBundles when network specified", async () => {
      vi.mocked(dataApi.getDataBundles).mockResolvedValueOnce([
        {
          code: "112381",
          name: "MTN SME 1.0GB 30 Days",
          amount: 320,
          size: "1.0 GB",
          validity: "30 Days",
        },
      ]);

      const plans = await getDataPlans("mtn", "sme");
      expect(dataApi.getDataBundles).toHaveBeenCalledWith("MTN_DATA");
      expect(plans).toHaveLength(1);
      expect(plans[0].id).toBe("112381");
      expect(plans[0].name).toBe("MTN SME 1.0GB 30 Days");
      expect(plans[0].price).toBe(320);
    });

    it("falls back to filtered mock plans on API failure", async () => {
      vi.mocked(dataApi.getDataBundles).mockRejectedValueOnce(new Error("Network Error"));

      const plans = await getDataPlans("mtn", "sme");
      expect(plans.length).toBeGreaterThan(0);
      plans.forEach((p) => {
        expect(p.network).toBe("mtn");
        expect(p.plan_type).toBe("sme");
      });
    });
  });

  describe("purchaseData", () => {
    it("converts amount to integer kobo (price * 100) and submits with Idempotency-Key", async () => {
      const mockOrder: DataOrder = {
        id: "01JC8XYZ",
        reference: "BIL-DATA123456",
        provider_reference: "TELCO-DATA-REF",
        category: "data",
        service_code: "MTN_DATA",
        service_name: "MTN Data",
        package_code: "112381",
        customer_identifier: "08031234567",
        amount: 32000, // 32000 kobo = ₦320.00
        amount_formatted: "320.00",
        status: "completed",
        created_at: "2026-11-18T14:00:00Z",
      };

      vi.mocked(dataApi.purchaseData).mockResolvedValueOnce(mockOrder);

      const result = await purchaseData({
        network: "mtn",
        plan_id: "mtn_sme_1gb",
        phone: "08031234567",
        amount: 320,
        idempotency_key: "idem_data_test_key",
      });

      expect(dataApi.purchaseData).toHaveBeenCalledWith(
        {
          service_code: "MTN_DATA",
          service_name: "MTN Data",
          category: "data",
          package_code: "mtn_sme_1gb",
          customer_identifier: "08031234567",
          amount: 32000,
        },
        "idem_data_test_key"
      );

      expect(result.order_id).toBe("01JC8XYZ");
      expect(result.reference).toBe("BIL-DATA123456");
      expect(result.amount).toBe(320);
      expect(result.status).toBe("completed");
      expect(result.auto_refunded).toBe(false);
    });

    it("handles processing status gracefully", async () => {
      const mockOrder: DataOrder = {
        id: "01JC8XYZ_PROC",
        reference: "BIL-DATA-PROC",
        provider_reference: null,
        category: "data",
        service_code: "MTN_DATA",
        service_name: "MTN Data",
        package_code: "mtn_sme_1gb",
        customer_identifier: "08031234567",
        amount: 32000,
        amount_formatted: "320.00",
        status: "processing",
        created_at: "2026-11-18T14:00:00Z",
      };

      vi.mocked(dataApi.purchaseData).mockResolvedValueOnce(mockOrder);

      const result = await purchaseData({
        network: "mtn",
        plan_id: "mtn_sme_1gb",
        phone: "08031234567",
        amount: 320,
      });

      expect(result.status).toBe("processing");
      expect(result.message).toContain("processing with the network provider");
    });

    it("handles failed status with auto_refunded true", async () => {
      const mockOrder: DataOrder = {
        id: "01JC8XYZ_FAIL",
        reference: "BIL-DATA-FAIL",
        provider_reference: null,
        category: "data",
        service_code: "MTN_DATA",
        service_name: "MTN Data",
        package_code: "mtn_sme_1gb",
        customer_identifier: "08031234567",
        amount: 32000,
        amount_formatted: "320.00",
        status: "failed",
        created_at: "2026-11-18T14:00:00Z",
      };

      vi.mocked(dataApi.purchaseData).mockResolvedValueOnce(mockOrder);

      const result = await purchaseData({
        network: "mtn",
        plan_id: "mtn_sme_1gb",
        phone: "08031234567",
        amount: 320,
      });

      expect(result.status).toBe("failed");
      expect(result.auto_refunded).toBe(true);
      expect(result.message).toContain("automatically refunded");
    });

    it("re-throws 422 insufficient_balance error without falling back to mock", async () => {
      const error = {
        status: 422,
        code: "insufficient_balance",
        message: "Insufficient wallet balance for this purchase.",
      };

      vi.mocked(dataApi.purchaseData).mockRejectedValueOnce(error);

      await expect(
        purchaseData({
          network: "mtn",
          plan_id: "mtn_sme_1gb",
          phone: "08031234567",
          amount: 320,
        })
      ).rejects.toMatchObject({
        code: "insufficient_balance",
      });
    });

    it("falls back to simulated success in non-production when endpoint gives 404", async () => {
      vi.mocked(dataApi.purchaseData).mockRejectedValueOnce({ status: 404 });

      const result = await purchaseData({
        network: "mtn",
        plan_id: "mtn_sme_1gb",
        phone: "08031234567",
      });

      expect(result.network).toBe("mtn");
      expect(result.phone).toBe("08031234567");
      expect(result.amount).toBe(320);
      expect(result.status).toBe("completed");
      expect(result.reference).toContain("DAT-");
    });
  });
});
