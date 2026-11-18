import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { AirtimeView } from "./AirtimeView";
import * as overviewApi from "@/features/overview/api";

vi.mock("@/features/overview/api", async (importOriginal) => {
  const actual = await importOriginal<typeof overviewApi>();
  return {
    ...actual,
    getOverviewData: vi.fn(),
  };
});

describe("AirtimeView (F16)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the redesigned airtime purchase page with form and order summary", async () => {
    vi.mocked(overviewApi.getOverviewData).mockResolvedValueOnce({
      ...overviewApi.MOCK_OVERVIEW_DATA,
      wallet: {
        ...overviewApi.MOCK_OVERVIEW_DATA.wallet,
        balance: 750000, // ₦7,500
      },
    });

    render(<AirtimeView />);

    expect(screen.getByTestId("airtime-view")).toBeInTheDocument();
    expect(screen.getByText("Back to Services")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Airtime" })).toBeInTheDocument();
    expect(screen.getByText("Buy airtime for any supported network.")).toBeInTheDocument();

    expect(screen.getByTestId("airtime-purchase-card")).toBeInTheDocument();
    expect(screen.getByTestId("airtime-order-summary")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("₦7,500.00")).toBeInTheDocument();
    });
  });
});
