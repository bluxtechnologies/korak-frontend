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

  it("renders the composite data purchase view with codes and recent cards", async () => {
    vi.mocked(overviewApi.getOverviewData).mockResolvedValueOnce({
      ...overviewApi.MOCK_OVERVIEW_DATA,
      wallet: {
        ...overviewApi.MOCK_OVERVIEW_DATA.wallet,
        balance: 1200000, // ₦12,000
      },
    });

    render(<DataView />);

    expect(screen.getByTestId("data-view")).toBeInTheDocument();
    expect(screen.getByTestId("data-purchase-card")).toBeInTheDocument();
    expect(screen.getByTestId("data-codes-card")).toBeInTheDocument();
    expect(screen.getByTestId("recent-data-card")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("₦12,000.00")).toBeInTheDocument();
    });
  });
});
