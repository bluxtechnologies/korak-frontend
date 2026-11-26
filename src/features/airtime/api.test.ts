import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  detectNetworkFromPhone,
  purchaseAirtime,
  getSupportedAirtimeNetworks,
  networkToServiceCode,
  serviceCodeToNetwork,
  TELECOM_NETWORKS,
} from "./api";
import { airtimeApi } from "@/lib/api/airtime";

vi.mock("@/lib/api/airtime", () => ({
  airtimeApi: {
    getNetworks: vi.fn(),
    purchaseAirtime: vi.fn(),
    getHistory: vi.fn(),
  },
}));

describe("Airtime API & Helpers (F16.1 & F16.4)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("detectNetworkFromPhone", () => {
    it("detects MTN prefix correctly", () => {
      expect(detectNetworkFromPhone("08031234567")).toBe("mtn");
      expect(detectNetworkFromPhone("08061234567")).toBe("mtn");
      expect(detectNetworkFromPhone("07031234567")).toBe("mtn");
      expect(detectNetworkFromPhone("09031234567")).toBe("mtn");
      expect(detectNetworkFromPhone("+2348031234567")).toBe("mtn");
    });

    it("detects Airtel prefix correctly", () => {
      expect(detectNetworkFromPhone("08021234567")).toBe("airtel");
      expect(detectNetworkFromPhone("08081234567")).toBe("airtel");
      expect(detectNetworkFromPhone("07081234567")).toBe("airtel");
      expect(detectNetworkFromPhone("09021234567")).toBe("airtel");
    });

    it("detects Glo prefix correctly", () => {
      expect(detectNetworkFromPhone("08051234567")).toBe("glo");
      expect(detectNetworkFromPhone("08071234567")).toBe("glo");
      expect(detectNetworkFromPhone("07051234567")).toBe("glo");
      expect(detectNetworkFromPhone("09051234567")).toBe("glo");
    });

    it("detects 9mobile prefix correctly", () => {
      expect(detectNetworkFromPhone("08091234567")).toBe("9mobile");
      expect(detectNetworkFromPhone("08171234567")).toBe("9mobile");
      expect(detectNetworkFromPhone("08181234567")).toBe("9mobile");
      expect(detectNetworkFromPhone("09091234567")).toBe("9mobile");
    });

    it("returns null for unknown prefix or short number", () => {
      expect(detectNetworkFromPhone("01234567890")).toBeNull();
      expect(detectNetworkFromPhone("080")).toBeNull();
      expect(detectNetworkFromPhone("")).toBeNull();
    });
  });

  describe("Service Code Mappings", () => {
    it("maps network id to service code and vice-versa", () => {
      expect(networkToServiceCode("mtn")).toEqual({
        service_code: "MTN_AIRTIME",
        service_name: "MTN Airtime",
      });
      expect(serviceCodeToNetwork("MTN_AIRTIME")).toBe("mtn");
      expect(serviceCodeToNetwork("AIRTEL_AIRTIME")).toBe("airtel");
      expect(serviceCodeToNetwork("GLO_AIRTIME")).toBe("glo");
      expect(serviceCodeToNetwork("9MOBILE_AIRTIME")).toBe("9mobile");
    });
  });

  describe("getSupportedAirtimeNetworks", () => {
    it("calls airtimeApi.getNetworks and enhances with logos and discounts", async () => {
      vi.mocked(airtimeApi.getNetworks).mockResolvedValueOnce([
        { service_code: "MTN_AIRTIME", name: "MTN Airtime", category: "airtime" },
        { service_code: "GLO_AIRTIME", name: "Glo Airtime", category: "airtime" },
      ]);

      const networks = await getSupportedAirtimeNetworks();
      expect(airtimeApi.getNetworks).toHaveBeenCalled();
      expect(networks).toHaveLength(2);
      expect(networks[0].id).toBe("mtn");
      expect(networks[0].logo).toBeDefined();
    });

    it("falls back to default TELECOM_NETWORKS on failure", async () => {
      vi.mocked(airtimeApi.getNetworks).mockRejectedValueOnce(new Error("Network error"));
      const networks = await getSupportedAirtimeNetworks();
      expect(networks).toEqual(TELECOM_NETWORKS);
    });
  });

  describe("purchaseAirtime", () => {
    it("converts Naira to kobo (amount * 100) and calls airtimeApi.purchaseAirtime", async () => {
      const mockOrder = {
        id: "01JC8XYZ",
        reference: "BIL-A1B2C3D4E5F6",
        provider_reference: "X8BSN",
        category: "airtime" as const,
        service_code: "MTN_AIRTIME",
        service_name: "MTN Airtime",
        customer_identifier: "08060671945",
        amount: 100000, // ₦1,000 in kobo
        amount_formatted: "1000.00",
        status: "completed" as const,
        created_at: "2026-11-18T13:29:58.000000Z",
      };

      vi.mocked(airtimeApi.purchaseAirtime).mockResolvedValueOnce(mockOrder);

      const result = await purchaseAirtime({
        network: "mtn",
        phone: "08060671945",
        amount: 1000,
        idempotency_key: "idem_custom_key_123",
      });

      expect(airtimeApi.purchaseAirtime).toHaveBeenCalledWith(
        {
          service_code: "MTN_AIRTIME",
          service_name: "MTN Airtime",
          category: "airtime",
          customer_identifier: "08060671945",
          amount: 100000, // in kobo
          face_amount: 100000,
        },
        "idem_custom_key_123"
      );
      expect(result.reference).toBe("BIL-A1B2C3D4E5F6");
      expect(result.status).toBe("completed");
      expect(result.amount).toBe(1000);
      expect(result.discount).toBe(0);
      expect(result.final_amount).toBe(1000);
    });

    it("handles status: failed by flagging auto_refunded and message", async () => {
      const mockFailedOrder = {
        id: "01JC8FAIL",
        reference: "BIL-FAILED123",
        provider_reference: null,
        category: "airtime" as const,
        service_code: "GLO_AIRTIME",
        service_name: "Glo Airtime",
        customer_identifier: "08051234567",
        amount: 50000,
        amount_formatted: "500.00",
        status: "failed" as const,
        created_at: "2026-11-18T13:30:00.000000Z",
      };

      vi.mocked(airtimeApi.purchaseAirtime).mockResolvedValueOnce(mockFailedOrder);

      const result = await purchaseAirtime({
        network: "glo",
        phone: "08051234567",
        amount: 500,
      });

      expect(result.status).toBe("failed");
      expect(result.auto_refunded).toBe(true);
      expect(result.message).toContain("automatically refunded");
    });

    it("handles status: processing by returning appropriate message", async () => {
      const mockProcessingOrder = {
        id: "01JC8PROC",
        reference: "BIL-PROC123",
        provider_reference: null,
        category: "airtime" as const,
        service_code: "AIRTEL_AIRTIME",
        service_name: "Airtel Airtime",
        customer_identifier: "08021234567",
        amount: 200000,
        amount_formatted: "2000.00",
        status: "processing" as const,
        created_at: "2026-11-18T13:30:00.000000Z",
      };

      vi.mocked(airtimeApi.purchaseAirtime).mockResolvedValueOnce(mockProcessingOrder);

      const result = await purchaseAirtime({
        network: "airtel",
        phone: "08021234567",
        amount: 2000,
      });

      expect(result.status).toBe("processing");
      expect(result.message).toContain("credited shortly");
    });
  });
});
