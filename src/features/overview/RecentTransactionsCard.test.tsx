import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RecentTransactionsCard } from "./RecentTransactionsCard";
import { MOCK_OVERVIEW_DATA } from "./api";

describe("RecentTransactionsCard (F12.3)", () => {
  it("renders transaction ledger records with formatted credit and debit amounts", () => {
    render(
      <RecentTransactionsCard
        transactions={MOCK_OVERVIEW_DATA.recent_transactions}
      />
    );

    expect(screen.getByText("Recent Transactions")).toBeInTheDocument();
    expect(screen.getByText("TXN-2026-0199")).toBeInTheDocument();
    expect(
      screen.getByText("Wallet Funding via Card (Paystack)")
    ).toBeInTheDocument();
    expect(screen.getByText("+₦50,000.00")).toBeInTheDocument();

    expect(screen.getByText("TXN-2026-0198")).toBeInTheDocument();
    expect(screen.getByText("-₦1,500.00")).toBeInTheDocument();
  });

  it("renders empty state when transaction list is empty", () => {
    render(<RecentTransactionsCard transactions={[]} />);

    expect(screen.getByText("No transactions yet")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Your append-only ledger will record all wallet funding deposits, service debits, and automatic refunds."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /fund wallet/i })
    ).toBeInTheDocument();
  });
});
