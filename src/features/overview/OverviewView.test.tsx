import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { OverviewView } from "./OverviewView";
import * as overviewApi from "./api";
import { ApiClientError } from "@/lib/api/client";

vi.mock("./api", async (importOriginal) => {
  const actual = await importOriginal<typeof overviewApi>();
  return {
    ...actual,
    getOverviewData: vi.fn(),
  };
});

describe("OverviewView (F12)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with initialData immediately without showing loading state", () => {
    render(<OverviewView initialData={overviewApi.MOCK_OVERVIEW_DATA} />);

    expect(screen.getByTestId("overview-view")).toBeInTheDocument();
    expect(screen.getByTestId("wallet-summary-card")).toBeInTheDocument();
    expect(screen.getByTestId("recent-transactions-card")).toBeInTheDocument();
  });

  it("fetches data and renders loaded overview dashboard", async () => {
    vi.mocked(overviewApi.getOverviewData).mockResolvedValueOnce(
      overviewApi.MOCK_OVERVIEW_DATA
    );

    render(<OverviewView enableFallbackMock={false} />);

    // Initially loading skeleton
    expect(
      screen.getByTestId("overview-loading-skeleton")
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId("overview-view")).toBeInTheDocument();
    });

    expect(screen.getByTestId("wallet-summary-card")).toBeInTheDocument();
  });

  it("renders error state when API fails and retries upon clicking Try again", async () => {
    const user = userEvent.setup();
    vi.mocked(overviewApi.getOverviewData)
      .mockRejectedValueOnce(
        new ApiClientError("Network error", 500, "server_error")
      )
      .mockResolvedValueOnce(overviewApi.MOCK_OVERVIEW_DATA);

    render(<OverviewView enableFallbackMock={false} />);

    await waitFor(() => {
      expect(
        screen.getByText("Unable to load account overview")
      ).toBeInTheDocument();
    });

    const retryButton = screen.getByRole("button", { name: /try again/i });
    expect(retryButton).toBeInTheDocument();

    await user.click(retryButton);

    await waitFor(() => {
      expect(screen.getByTestId("overview-view")).toBeInTheDocument();
    });
  });

  it("handles empty overview data gracefully", async () => {
    vi.mocked(overviewApi.getOverviewData).mockResolvedValueOnce(
      overviewApi.MOCK_EMPTY_OVERVIEW_DATA
    );

    render(<OverviewView enableFallbackMock={false} />);

    await waitFor(() => {
      expect(screen.getByTestId("overview-view")).toBeInTheDocument();
    });

    expect(screen.getByText("No transactions yet")).toBeInTheDocument();
  });
});
