import { describe, expect, it, vi } from "vitest";
import { customerApi } from "@/lib/api/customer";
import { getOverviewData } from "./api";

vi.mock("@/lib/api/customer", () => ({
  customerApi: {
    getWallet: vi.fn(),
    getTransactions: vi.fn(),
    getBillHistory: vi.fn(),
    getProfile: vi.fn(),
  },
}));

describe("overview api", () => {
  it("fetches overview data from customer endpoints and aggregates result", async () => {
    vi.mocked(customerApi.getWallet).mockResolvedValueOnce({
      id: "w_123",
      balance: 4525000,
      balance_formatted: "45,250.00",
      currency: "NGN",
      created_at: "2026-03-01T00:00:00Z",
      updated_at: "2026-03-01T12:00:00Z",
    });

    vi.mocked(customerApi.getTransactions).mockResolvedValueOnce({
      data: [
        {
          id: "tx_1",
          reference: "TX-001",
          direction: "credit",
          type: "funding",
          amount: 500000,
          amount_formatted: "5,000.00",
          balance_after: 4525000,
          balance_after_formatted: "45,250.00",
          currency: "NGN",
          description: "Wallet funding via bank transfer",
          metadata: null,
          created_at: "2026-03-01T12:00:00Z",
        },
      ],
      meta: {
        current_page: 1,
        per_page: 5,
        total: 1,
        last_page: 1,
      },
    });

    vi.mocked(customerApi.getBillHistory).mockResolvedValueOnce({
      data: [
        {
          id: "bill_1",
          reference: "BIL-001",
          provider_reference: null,
          category: "data",
          service_code: "MTN_DATA",
          service_name: "MTN 1GB Data",
          package_code: "112364",
          customer_identifier: "08012345678",
          customer_name: null,
          amount: 100000,
          amount_formatted: "1,000.00",
          face_amount: 100000,
          face_amount_formatted: "1,000.00",
          discount_amount: 0,
          currency: "NGN",
          status: "completed",
          token: null,
          metadata: null,
          processed_at: "2026-03-01T12:00:00Z",
          created_at: "2026-03-01T12:00:00Z",
        },
      ],
      meta: {
        current_page: 1,
        per_page: 5,
        total: 1,
        last_page: 1,
      },
    });

    vi.mocked(customerApi.getProfile).mockResolvedValueOnce({
      id: "usr_1",
      first_name: "Obaseki",
      last_name: "Collins",
      full_name: "Obaseki Collins",
      username: "collinsobaseki23",
      email: "collins@example.com",
      email_verified_at: "2026-01-01T00:00:00Z",
      phone: "+2348012345678",
      has_virtual_account: false,
      virtual_account: null,
      created_at: "2026-01-01T00:00:00Z",
    });

    const result = await getOverviewData();

    expect(customerApi.getWallet).toHaveBeenCalled();
    expect(customerApi.getTransactions).toHaveBeenCalledWith({ per_page: 5 });
    expect(customerApi.getBillHistory).toHaveBeenCalledWith({ per_page: 5 });
    expect(result.wallet.balance).toBe(4525000);
    expect(result.recent_orders).toHaveLength(1);
    expect(result.recent_orders[0].service_label).toBe("MTN 1GB Data");
    expect(result.recent_transactions).toHaveLength(1);
    expect(result.user?.name).toBe("Obaseki Collins");
  });
});
