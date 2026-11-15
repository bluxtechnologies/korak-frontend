import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/lib/api";
import {
  buildTransactionQueryParams,
  filterMockTransactions,
  getTransactionById,
  getTransactions,
  MOCK_TRANSACTION_RECORDS,
} from "./api";

vi.mock("@/lib/api", () => ({
  api: {
    get: vi.fn(),
  },
}));

describe("Transactions API (F15)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("buildTransactionQueryParams", () => {
    it("returns an empty object when no parameters are provided", () => {
      expect(buildTransactionQueryParams()).toEqual({});
    });

    it("maps pagination, search, sort, and filters correctly per Doc 06", () => {
      const params = buildTransactionQueryParams({
        page: 2,
        per_page: 25,
        search: "TXN-2026",
        sort: "-created_at",
        direction: "credit",
        type: "wallet_funding",
      });

      expect(params).toEqual({
        page: 2,
        per_page: 25,
        search: "TXN-2026",
        sort: "-created_at",
        "filter[direction]": "credit",
        "filter[type]": "wallet_funding",
      });
    });

    it("ignores whitespace-only and undefined values", () => {
      const params = buildTransactionQueryParams({
        search: "   ",
        direction: undefined,
        type: "",
      });

      expect(params).toEqual({});
    });
  });

  describe("filterMockTransactions", () => {
    it("returns paginated mock results with metadata", () => {
      const result = filterMockTransactions({ page: 1, per_page: 4 });
      expect(result.data).toHaveLength(4);
      expect(result.meta.current_page).toBe(1);
      expect(result.meta.per_page).toBe(4);
      expect(result.meta.total).toBe(MOCK_TRANSACTION_RECORDS.length);
    });

    it("filters by search term in reference or description", () => {
      const result = filterMockTransactions({ search: "WireGuard" });
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0].description).toContain("WireGuard");
    });

    it("filters by direction (credit)", () => {
      const result = filterMockTransactions({ direction: "credit" });
      expect(result.data.every((t) => t.direction === "credit")).toBe(true);
    });

    it("filters by type (wallet_funding)", () => {
      const result = filterMockTransactions({ type: "wallet_funding" });
      expect(result.data.every((t) => t.type === "wallet_funding")).toBe(true);
    });

    it("sorts by amount ascending and descending", () => {
      const asc = filterMockTransactions({ sort: "amount" });
      expect(asc.data[0].amount).toBeLessThanOrEqual(asc.data[1].amount);

      const desc = filterMockTransactions({ sort: "-amount" });
      expect(desc.data[0].amount).toBeGreaterThanOrEqual(desc.data[1].amount);
    });
  });

  describe("getTransactions", () => {
    it("calls /api/v1/transactions with formatted parameters", async () => {
      const mockResponse = {
        data: MOCK_TRANSACTION_RECORDS.slice(0, 2),
        meta: { current_page: 1, per_page: 2, total: 2, last_page: 1 },
      };
      vi.mocked(api.get).mockResolvedValueOnce(mockResponse);

      const res = await getTransactions({ page: 1, search: "test" });
      expect(api.get).toHaveBeenCalledWith("/api/v1/transactions", {
        params: { page: 1, search: "test" },
      });
      expect(res).toEqual(mockResponse);
    });

    it("falls back to mock data in test/dev mode when api fails", async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error("Network Error"));
      const res = await getTransactions({ search: "Bank Transfer" });
      expect(res.data.length).toBeGreaterThan(0);
      expect(res.data[0].description).toContain("Bank Transfer");
    });
  });

  describe("getTransactionById", () => {
    it("fetches single transaction by id from api", async () => {
      const mockRecord = MOCK_TRANSACTION_RECORDS[0];
      vi.mocked(api.get).mockResolvedValueOnce({
        data: mockRecord,
        meta: {},
      });

      const res = await getTransactionById("txn_01");
      expect(api.get).toHaveBeenCalledWith("/api/v1/transactions/txn_01");
      expect(res).toEqual(mockRecord);
    });

    it("falls back to mock record lookup when api fails", async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error("404 Not Found"));
      const res = await getTransactionById("TXN-20261114-0012");
      expect(res.id).toBe("txn_01");
    });
  });
});
