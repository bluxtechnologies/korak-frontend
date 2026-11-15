import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  detectNetworkFromPhone,
  purchaseAirtime,
  TELECOM_NETWORKS,
  MOCK_RECENT_AIRTIME,
} from "./api";
import { api } from "@/lib/api";

vi.mock("@/lib/api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
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

  describe("TELECOM_NETWORKS", () => {
    it("has configuration for all 4 major Nigerian telcos with discount rates", () => {
      expect(TELECOM_NETWORKS).toHaveLength(4);
      const ids = TELECOM_NETWORKS.map((n) => n.id);
      expect(ids).toEqual(["mtn", "airtel", "glo", "9mobile"]);
      TELECOM_NETWORKS.forEach((net) => {
        expect(net.discountRate).toBeGreaterThan(0);
        expect(net.color).toBeDefined();
      });
    });
  });

  describe("purchaseAirtime", () => {
    it("calls API endpoint with idempotency key header and returns unwrap response", async () => {
      const mockResult = {
        data: {
          order_id: "ord_123",
          reference: "AIR-20261114-9999",
          network: "mtn",
          phone: "08031234567",
          amount: 1000,
          discount_amount: 30,
          final_amount: 970,
          status: "completed",
          message: "Airtime of ₦1,000 sent successfully to 08031234567.",
          created_at: "2026-11-14T12:00:00Z",
        },
        meta: {},
      };

      vi.mocked(api.post).mockResolvedValueOnce(mockResult);

      const result = await purchaseAirtime({
        network: "mtn",
        phone: "08031234567",
        amount: 1000,
        idempotency_key: "idem_custom_key_123",
      });

      expect(api.post).toHaveBeenCalledWith(
        "/api/v1/services/airtime/purchase",
        {
          network: "mtn",
          phone: "08031234567",
          amount: 1000,
        },
        {
          headers: {
            "Idempotency-Key": "idem_custom_key_123",
          },
        }
      );
      expect(result.order_id).toBe("ord_123");
      expect(result.status).toBe("completed");
    });

    it("falls back to simulated success in non-production when endpoint gives 404", async () => {
      vi.mocked(api.post).mockRejectedValueOnce({ status: 404 });

      const result = await purchaseAirtime({
        network: "airtel",
        phone: "08021234567",
        amount: 2000,
      });

      expect(result.network).toBe("airtel");
      expect(result.phone).toBe("08021234567");
      expect(result.amount).toBe(2000);
      expect(result.status).toBe("completed");
      expect(result.reference).toContain("AIR-");
    });
  });
});
