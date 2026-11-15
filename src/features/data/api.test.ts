import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  getDataPlans,
  purchaseData,
  MOCK_DATA_PLANS,
  DATA_PLAN_TYPES,
} from "./api";
import { api } from "@/lib/api";

vi.mock("@/lib/api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
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

  describe("getDataPlans", () => {
    it("fetches plans from API when available", async () => {
      const mockPlans = [
        {
          id: "mtn_sme_1gb",
          network: "mtn" as const,
          plan_type: "sme" as const,
          name: "MTN SME 1.0GB",
          size: "1.0 GB",
          validity: "30 Days",
          price: 320,
          currency: "NGN",
        },
      ];

      vi.mocked(api.get).mockResolvedValueOnce({
        data: mockPlans,
        meta: {},
      });

      const plans = await getDataPlans("mtn", "sme");
      expect(api.get).toHaveBeenCalledWith(
        "/api/v1/services/data/plans?network=mtn&plan_type=sme"
      );
      expect(plans).toHaveLength(1);
      expect(plans[0].name).toBe("MTN SME 1.0GB");
    });

    it("falls back to filtered mock plans on API failure", async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error("Network Error"));

      const plans = await getDataPlans("mtn", "sme");
      expect(plans.length).toBeGreaterThan(0);
      plans.forEach((p) => {
        expect(p.network).toBe("mtn");
        expect(p.plan_type).toBe("sme");
      });
    });
  });

  describe("purchaseData", () => {
    it("submits purchase with idempotency header and returns order result", async () => {
      const mockResult = {
        data: {
          order_id: "ord_dat_99",
          reference: "DAT-20261115-5555",
          network: "mtn" as const,
          plan_name: "MTN SME 2.0GB",
          size: "2.0 GB",
          phone: "08031234567",
          amount: 640,
          status: "completed" as const,
          message: "MTN SME 2.0GB (2.0 GB) successfully credited.",
          created_at: "2026-11-15T12:00:00Z",
        },
        meta: {},
      };

      vi.mocked(api.post).mockResolvedValueOnce(mockResult);

      const result = await purchaseData({
        network: "mtn",
        plan_id: "mtn_sme_2gb",
        phone: "08031234567",
        idempotency_key: "idem_data_test_key",
      });

      expect(api.post).toHaveBeenCalledWith(
        "/api/v1/services/data/purchase",
        {
          network: "mtn",
          plan_id: "mtn_sme_2gb",
          phone: "08031234567",
        },
        {
          headers: {
            "Idempotency-Key": "idem_data_test_key",
          },
        }
      );
      expect(result.order_id).toBe("ord_dat_99");
      expect(result.amount).toBe(640);
    });

    it("falls back to simulated success in non-production when endpoint gives 404", async () => {
      vi.mocked(api.post).mockRejectedValueOnce({ status: 404 });

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
