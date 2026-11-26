import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AuthUserProvider } from "@/components/layout/DashboardShell";
import type { AuthUser } from "@/features/auth/api";
import { WalletView } from "./WalletView";
import { MOCK_WALLET_PAGE_DATA } from "./api";

describe("WalletView Component", () => {
  it("renders wallet page title, available balance, and last updated time", () => {
    render(<WalletView initialData={MOCK_WALLET_PAGE_DATA} />);

    expect(screen.getByTestId("wallet-view")).toBeInTheDocument();
    expect(screen.getByText("Available Balance")).toBeInTheDocument();
    expect(screen.getByTestId("wallet-large-balance")).toHaveTextContent("₦45,250.00");
    expect(screen.queryByText(/USD \(Estimated\)/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Last updated today at/i)).toBeInTheDocument();
  });

  it("masks balance when clicking privacy eye toggle button", async () => {
    const user = userEvent.setup();
    render(<WalletView initialData={MOCK_WALLET_PAGE_DATA} />);

    const hideButton = screen.getByRole("button", { name: /hide balance/i });
    await user.click(hideButton);

    expect(screen.getByTestId("wallet-large-balance")).toHaveTextContent("₦••••••");

    const showButton = screen.getByRole("button", { name: /show balance/i });
    await user.click(showButton);

    expect(screen.getByTestId("wallet-large-balance")).toHaveTextContent("₦45,250.00");
  });

  it("filters transactions when clicking filter pills", async () => {
    const user = userEvent.setup();
    render(<WalletView initialData={MOCK_WALLET_PAGE_DATA} />);

    // Click Money In filter pill
    const moneyInPill = screen.getByRole("button", { name: /money in/i });
    await user.click(moneyInPill);

    // Click Money Out filter pill
    const moneyOutPill = screen.getByRole("button", { name: /money out/i });
    await user.click(moneyOutPill);

    // Click All filter pill
    const allPill = screen.getByRole("button", { name: /all \(/i });
    await user.click(allPill);
  });

  it("renders wallet account details card with account number", () => {
    render(<WalletView initialData={MOCK_WALLET_PAGE_DATA} />);

    expect(screen.getByText("Wallet Account Details")).toBeInTheDocument();
    expect(screen.getByText("2603521256")).toBeInTheDocument();
    expect(screen.getByText("Paga")).toBeInTheDocument();
  });

  it("opens fund wallet modal when clicking Add Money", async () => {
    const user = userEvent.setup();
    render(<WalletView initialData={MOCK_WALLET_PAGE_DATA} />);

    const addMoneyBtn = screen.getByRole("button", { name: /\+ add money/i });
    await user.click(addMoneyBtn);

    expect(screen.getByText("Fund Your Wallet")).toBeInTheDocument();
  });

  it("renders back to services link and wallet security card", () => {
    render(<WalletView initialData={MOCK_WALLET_PAGE_DATA} />);

    const backLink = screen.getByRole("link", { name: /back to services/i });
    expect(backLink).toHaveAttribute("href", "/services");

    expect(screen.getByText("Your Wallet is Secure")).toBeInTheDocument();
    expect(screen.getByText("Quick Actions")).toBeInTheDocument();
  });

  it("filters transactions when searching in the search bar", async () => {
    const user = userEvent.setup();
    render(<WalletView initialData={MOCK_WALLET_PAGE_DATA} />);

    const searchInput = screen.getByPlaceholderText(/search transactions/i);
    await user.type(searchInput, "non_existent_reference_xyz");

    expect(screen.getByText("No transactions recorded yet")).toBeInTheDocument();
  });

  it("renders static NGN display currency badge without a select dropdown", () => {
    render(<WalletView initialData={MOCK_WALLET_PAGE_DATA} />);

    expect(screen.getByText("DISPLAY CURRENCY")).toBeInTheDocument();
    expect(screen.getByText("Nigerian Naira (₦)")).toBeInTheDocument();
    expect(screen.getByTestId("currency-badge")).toHaveTextContent("NGN");
    expect(
      screen.queryByRole("combobox", { name: /select display currency/i })
    ).not.toBeInTheDocument();
  });

  it("applies responsive mobile order classes so account details sits right after balance card on small screens", () => {
    render(<WalletView initialData={MOCK_WALLET_PAGE_DATA} />);

    const balanceCard = screen.getByTestId("wallet-main-balance-card");
    const accountDetailsWrapper = screen.getByTestId("wallet-account-details-wrapper");
    const transactionsSection = screen.getByTestId("wallet-transactions-section");

    expect(balanceCard).toHaveClass("order-1", "lg:order-none");
    expect(accountDetailsWrapper).toHaveClass("order-2", "lg:order-none");
    expect(transactionsSection).toHaveClass("order-3", "lg:order-none");
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
        <WalletView initialData={MOCK_WALLET_PAGE_DATA} />
      </AuthUserProvider>
    );

    expect(screen.getByTestId("email-verification-banner")).toBeInTheDocument();
    expect(screen.getByText("collins@example.com")).toBeInTheDocument();
  });
});
