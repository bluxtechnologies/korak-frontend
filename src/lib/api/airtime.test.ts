import { describe, expect, it, vi, beforeEach } from "vitest";
import { airtimeApi } from "./airtime";
import { apiClient } from "./client";

vi.mock("./client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("airtimeApi client (Integration Guide)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getNetworks", () => {
    it("calls GET /api/v1/bills/services?category=airtime and returns data", async () => {
      const mockServices = [
        { service_code: "MTN_AIRTIME", name: "MTN Airtime", category: "airtime" },
        { service_code: "AIRTEL_AIRTIME", name: "Airtel Airtime", category: "airtime" },
      ];

      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { data: mockServices, meta: {} },
        status: 200,
        headers: new Headers(),
      } as unknown as Awaited<ReturnType<typeof apiClient.get>>);

      const networks = await airtimeApi.getNetworks();
      expect(apiClient.get).toHaveBeenCalledWith(
        "/api/v1/bills/services?category=airtime"
      );
      expect(networks).toEqual(mockServices);
    });
  });

  describe("purchaseAirtime", () => {
    it("calls POST /api/v1/bills/pay with payload and Idempotency-Key header", async () => {
      const mockOrder = {
        id: "01JC8XYZ9876543210ABCDEFGH",
        reference: "BIL-A1B2C3D4E5F6",
        provider_reference: "X8BSN-AIRTIME",
        category: "airtime",
        service_code: "MTN_AIRTIME",
        service_name: "MTN Airtime",
        customer_identifier: "08060671945",
        amount: 100000,
        amount_formatted: "1000.00",
        status: "completed",
        created_at: "2026-11-18T13:29:58.000000Z",
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { data: mockOrder, meta: {} },
        status: 201,
        headers: new Headers(),
      } as unknown as Awaited<ReturnType<typeof apiClient.post>>);

      const order = await airtimeApi.purchaseAirtime(
        {
          service_code: "MTN_AIRTIME",
          service_name: "MTN Airtime",
          category: "airtime",
          customer_identifier: "08060671945",
          amount: 100000,
        },
        "test-uuid-key-1234"
      );

      expect(apiClient.post).toHaveBeenCalledWith(
        "/api/v1/bills/pay",
        {
          service_code: "MTN_AIRTIME",
          service_name: "MTN Airtime",
          category: "airtime",
          customer_identifier: "08060671945",
          amount: 100000,
        },
        {
          headers: {
            "Idempotency-Key": "test-uuid-key-1234",
          },
        }
      );
      expect(order.reference).toBe("BIL-A1B2C3D4E5F6");
      expect(order.status).toBe("completed");
    });
  });

  describe("getHistory", () => {
    it("calls GET /api/v1/bills/history with category, page, and per_page params", async () => {
      const mockHistory = {
        data: [
          {
            id: "01JC8XYZ",
            reference: "BIL-A1B2C3D4E5F6",
            service_code: "MTN_AIRTIME",
            service_name: "MTN Airtime",
            category: "airtime",
            customer_identifier: "08060671945",
            amount: 100000,
            amount_formatted: "1000.00",
            status: "completed",
            created_at: "2026-11-18T13:29:58.000000Z",
          },
        ],
        meta: {
          current_page: 1,
          per_page: 15,
          total: 1,
          last_page: 1,
        },
      };

      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: mockHistory,
        status: 200,
        headers: new Headers(),
      } as unknown as Awaited<ReturnType<typeof apiClient.get>>);

      const history = await airtimeApi.getHistory(1, 15);
      expect(apiClient.get).toHaveBeenCalledWith("/api/v1/bills/history", {
        params: {
          category: "airtime",
          page: 1,
          per_page: 15,
        },
      });
      expect(history.data).toHaveLength(1);
      expect(history.meta.current_page).toBe(1);
    });
  });
});
