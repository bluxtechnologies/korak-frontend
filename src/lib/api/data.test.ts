import { describe, expect, it, vi, beforeEach } from "vitest";
import { dataApi } from "./data";
import { apiClient } from "./client";

vi.mock("./client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("dataApi client (F16.2 & F16.3 Integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getNetworks", () => {
    it("calls GET /api/v1/bills/services?category=data and returns data", async () => {
      const mockServices = [
        { service_code: "MTN_DATA", name: "MTN Data", category: "data" },
        { service_code: "AIRTEL_DATA", name: "Airtel Data", category: "data" },
      ];

      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { data: mockServices, meta: {} },
        status: 200,
        headers: new Headers(),
      } as unknown as Awaited<ReturnType<typeof apiClient.get>>);

      const networks = await dataApi.getNetworks();
      expect(apiClient.get).toHaveBeenCalledWith(
        "/api/v1/bills/services?category=data"
      );
      expect(networks).toEqual(mockServices);
    });
  });

  describe("getDataBundles", () => {
    it("calls GET /api/v1/bills/data-bundles with service_code param", async () => {
      const mockBundles = [
        { code: "112381", name: "MTN 1GB Data Plan (30 Days)", amount: 320 },
        { code: "112382", name: "MTN 2GB Data Plan (30 Days)", amount: 640 },
      ];

      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { data: mockBundles, meta: {} },
        status: 200,
        headers: new Headers(),
      } as unknown as Awaited<ReturnType<typeof apiClient.get>>);

      const bundles = await dataApi.getDataBundles("MTN_DATA");
      expect(apiClient.get).toHaveBeenCalledWith(
        "/api/v1/bills/data-bundles",
        {
          params: { service_code: "MTN_DATA" },
        }
      );
      expect(bundles).toEqual(mockBundles);
    });
  });

  describe("purchaseData", () => {
    it("calls POST /api/v1/bills/pay with payload and Idempotency-Key header", async () => {
      const mockOrder = {
        id: "01JC8XYZ9876543210ABCDEFGH",
        reference: "BIL-DATA1B2C3D4E",
        provider_reference: "X8BSN-DATA",
        category: "data",
        service_code: "MTN_DATA",
        service_name: "MTN Data",
        package_code: "112381",
        customer_identifier: "08060671945",
        amount: 32000, // ₦320 in kobo
        amount_formatted: "320.00",
        status: "completed",
        created_at: "2026-11-18T13:29:58.000000Z",
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { data: mockOrder, meta: {} },
        status: 201,
        headers: new Headers(),
      } as unknown as Awaited<ReturnType<typeof apiClient.post>>);

      const order = await dataApi.purchaseData(
        {
          service_code: "MTN_DATA",
          service_name: "MTN Data",
          category: "data",
          package_code: "112381",
          customer_identifier: "08060671945",
          amount: 32000,
        },
        "test-data-uuid-123"
      );

      expect(apiClient.post).toHaveBeenCalledWith(
        "/api/v1/bills/pay",
        {
          service_code: "MTN_DATA",
          service_name: "MTN Data",
          category: "data",
          package_code: "112381",
          customer_identifier: "08060671945",
          amount: 32000,
        },
        {
          headers: {
            "Idempotency-Key": "test-data-uuid-123",
          },
        }
      );
      expect(order.reference).toBe("BIL-DATA1B2C3D4E");
      expect(order.status).toBe("completed");
    });
  });

  describe("getHistory", () => {
    it("calls GET /api/v1/bills/history with category=data, page, and per_page params", async () => {
      const mockHistory = {
        data: [
          {
            id: "01JC8DATA",
            reference: "BIL-DATA999",
            service_code: "MTN_DATA",
            service_name: "MTN Data",
            category: "data",
            customer_identifier: "08060671945",
            amount: 32000,
            amount_formatted: "320.00",
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

      const history = await dataApi.getHistory(1, 15);
      expect(apiClient.get).toHaveBeenCalledWith("/api/v1/bills/history", {
        params: {
          category: "data",
          page: 1,
          per_page: 15,
        },
      });
      expect(history.data).toHaveLength(1);
    });
  });
});
