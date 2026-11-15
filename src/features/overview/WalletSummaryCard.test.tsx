import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { WalletSummaryCard } from "./WalletSummaryCard";
import type { WalletSummary } from "./api";

const mockWallet: WalletSummary = {
  balance: 4525000,
  currency: "NGN",
  ledger_count: 12,
  updated_at: "2026-11-14T10:00:00Z",
};

describe("WalletSummaryCard (F12.2)", () => {
  it("renders the formatted balance and ledger count", () => {
    render(<WalletSummaryCard wallet={mockWallet} />);

    expect(screen.getByText("Wallet Balance")).toBeInTheDocument();
    expect(screen.getByTestId("wallet-balance-amount")).toHaveTextContent(
      "₦45,250.00"
    );
    expect(screen.getByText("12 recorded ledger events")).toBeInTheDocument();
  });

  it("toggles balance masking when clicking the eye toggle button", async () => {
    const user = userEvent.setup();
    render(<WalletSummaryCard wallet={mockWallet} />);

    const toggleButton = screen.getByRole("button", { name: /hide balance/i });
    expect(toggleButton).toBeInTheDocument();

    // Click to mask
    await user.click(toggleButton);
    expect(screen.getByTestId("wallet-balance-amount")).toHaveTextContent(
      "₦••••••"
    );
    expect(
      screen.getByRole("button", { name: /show balance/i })
    ).toBeInTheDocument();

    // Click to unmask
    await user.click(screen.getByRole("button", { name: /show balance/i }));
    expect(screen.getByTestId("wallet-balance-amount")).toHaveTextContent(
      "₦45,250.00"
    );
  });

  it("invokes onTopUpClick handler when provided", async () => {
    const user = userEvent.setup();
    const handleTopUp = vi.fn();
    render(
      <WalletSummaryCard wallet={mockWallet} onTopUpClick={handleTopUp} />
    );

    const topUpButton = screen.getByRole("button", { name: /top up wallet/i });
    await user.click(topUpButton);
    expect(handleTopUp).toHaveBeenCalledTimes(1);
  });

  it("renders empty ledger messaging when ledger_count is 0", () => {
    render(
      <WalletSummaryCard
        wallet={{
          ...mockWallet,
          balance: 0,
          ledger_count: 0,
        }}
      />
    );

    expect(screen.getByTestId("wallet-balance-amount")).toHaveTextContent(
      "₦0.00"
    );
    expect(screen.getByText("No transaction entries yet")).toBeInTheDocument();
  });
});
