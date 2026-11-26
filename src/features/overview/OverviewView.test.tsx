import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { AuthUserProvider } from "@/components/layout/DashboardShell";
import type { AuthUser } from "@/features/auth/api";
import { OverviewView } from "./OverviewView";
import * as overviewApi from "./api";
import { customerApi } from "@/lib/api/customer";
import { ApiClientError } from "@/lib/api/client";

vi.mock("@/lib/api/customer", () => ({
  customerApi: {
    getProfile: vi.fn().mockResolvedValue(null),
    getWallet: vi.fn(),
    getTransactions: vi.fn(),
    getBillHistory: vi.fn(),
  },
}));

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

  it("displays real customer name dynamically in the greeting banner instead of username", () => {
    const dataWithUser: overviewApi.OverviewData = {
      ...overviewApi.MOCK_OVERVIEW_DATA,
      user: {
        name: "Obaseki Collins",
        first_name: "Obaseki",
        last_name: "Collins",
        full_name: "Obaseki Collins",
        username: "victoriousking35",
      },
    };

    render(<OverviewView initialData={dataWithUser} />);

    // Verify real name is displayed, and raw username is not displayed in the greeting
    expect(screen.getByText(/Obaseki Collins/)).toBeInTheDocument();
    expect(screen.queryByText(/victoriousking35/)).not.toBeInTheDocument();
  });

  it("dynamically resolves real name from customer profile if user data is initially missing or equals username", async () => {
    vi.mocked(customerApi.getProfile).mockResolvedValueOnce({
      id: "usr_01",
      username: "victoriousking35",
      first_name: "Obaseki",
      last_name: "Collins",
      full_name: "Obaseki Collins",
      phone: "08012345678",
      email: "victoriousking35@gmail.com",
      email_verified_at: "2026-11-01T00:00:00Z",
      has_virtual_account: true,
      virtual_account: null,
      created_at: "2026-11-01T00:00:00Z",
    });

    render(<OverviewView initialData={overviewApi.MOCK_EMPTY_OVERVIEW_DATA} />);

    await waitFor(() => {
      expect(screen.getByText(/Obaseki Collins/)).toBeInTheDocument();
    });
    expect(screen.queryByText(/victoriousking35/)).not.toBeInTheDocument();
  });

  it("renders email verification alert banner when user is unverified", () => {
    const unverifiedUser: AuthUser = {
      id: "u_unverified",
      name: "Collins Okeke",
      email: "collins@example.com",
      username: "collins",
      email_verified_at: null,
      created_at: "2026-01-01T00:00:00Z",
    };

    render(
      <AuthUserProvider user={unverifiedUser}>
        <OverviewView initialData={overviewApi.MOCK_OVERVIEW_DATA} />
      </AuthUserProvider>
    );

    expect(screen.getByTestId("email-verification-banner")).toBeInTheDocument();
    expect(screen.getByText("collins@example.com")).toBeInTheDocument();
  });
});
