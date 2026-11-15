import { describe, expect, it, vi } from "vitest";
import { api } from "@/lib/api";
import { getOverviewData, MOCK_OVERVIEW_DATA } from "./api";

vi.mock("@/lib/api", () => ({
  api: {
    get: vi.fn(),
  },
}));

describe("overview api", () => {
  it("fetches overview data and unwraps the response envelope", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: MOCK_OVERVIEW_DATA,
    });

    const result = await getOverviewData();

    expect(api.get).toHaveBeenCalledWith("/api/v1/overview");
    expect(result.wallet.balance).toBe(4525000);
    expect(result.recent_orders).toHaveLength(5);
    expect(result.recent_transactions).toHaveLength(5);
  });
});
