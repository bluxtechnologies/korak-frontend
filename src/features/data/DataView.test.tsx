import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { DataView } from "./DataView";
import * as overviewApi from "@/features/overview/api";

vi.mock("@/features/overview/api", async (importOriginal) => {
  const actual = await importOriginal<typeof overviewApi>();
  return {
    ...actual,
    getOverviewData: vi.fn(),
  };
});

describe("DataView (F16)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the clean 2-column data purchase interface without bottom cards", async () => {
    vi.mocked(overviewApi.getOverviewData).mockResolvedValueOnce({
      ...overviewApi.MOCK_OVERVIEW_DATA,
      wallet: {
        ...overviewApi.MOCK_OVERVIEW_DATA.wallet,
        balance: 1200000, // ₦12,000
      },
    });

    render(<DataView />);

    expect(screen.getByTestId("data-view")).toBeInTheDocument();
    expect(screen.getByText("Back to Services")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Mobile Data/i })).toBeInTheDocument();
    expect(screen.getByText("Choose a data bundle for your recipient.")).toBeInTheDocument();
    expect(screen.getByTestId("data-purchase-card")).toBeInTheDocument();
    expect(screen.getByTestId("data-order-summary")).toBeInTheDocument();

    // Verify the bottom cards are removed
    expect(screen.queryByTestId("data-codes-card")).not.toBeInTheDocument();
    expect(screen.queryByTestId("recent-data-card")).not.toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("₦12,000.00")).toBeInTheDocument();
    });
  });
});
