import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  MOCK_TRANSACTION_RECORDS,
  type TransactionRecord,
} from "./api";
import { TransactionDetailCard } from "./TransactionDetailCard";

describe("TransactionDetailCard (F15.2)", () => {
  const sampleCredit: TransactionRecord = MOCK_TRANSACTION_RECORDS[1]; // Wallet Funding ₦25,000.00
  const sampleDebit: TransactionRecord = MOCK_TRANSACTION_RECORDS[0]; // Order Payment ₦1,500.00

  it("renders transaction details, formatted amount, and badges for a credit transaction", () => {
    render(<TransactionDetailCard transaction={sampleCredit} />);

    expect(screen.getByText(sampleCredit.reference)).toBeInTheDocument();
    expect(screen.getByText("+₦25,000.00")).toBeInTheDocument();
    expect(screen.getByText("credit")).toBeInTheDocument();
    expect(screen.getByText("Wallet Funding")).toBeInTheDocument();
    expect(screen.getByText(sampleCredit.description)).toBeInTheDocument();
    expect(screen.getByText(sampleCredit.wallet_id)).toBeInTheDocument();
    expect(
      screen.getByText(/balance after transaction:/i)
    ).toBeInTheDocument();
    expect(screen.getByText("₦46,750.00")).toBeInTheDocument();
  });

  it("renders debit transaction with negative amount indicator and order reference", () => {
    render(<TransactionDetailCard transaction={sampleDebit} />);

    expect(screen.getByText(sampleDebit.reference)).toBeInTheDocument();
    expect(screen.getByText("-₦1,500.00")).toBeInTheDocument();
    expect(screen.getByText("debit")).toBeInTheDocument();
    expect(screen.getByText("Order Payment")).toBeInTheDocument();
    expect(screen.getByText("ORD-2026-0042")).toBeInTheDocument();
  });

  it("displays append-only immutable ledger notice", () => {
    render(<TransactionDetailCard transaction={sampleDebit} />);
    expect(
      screen.getByText(/immutable append-only ledger entry/i)
    ).toBeInTheDocument();
  });

  it("copies transaction reference to clipboard on copy button click", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(<TransactionDetailCard transaction={sampleCredit} />);
    const copyBtn = screen.getByRole("button", {
      name: /copy transaction reference/i,
    });
    fireEvent.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalledWith(sampleCredit.reference);
    expect(await screen.findByText("Copied")).toBeInTheDocument();
  });

  it("renders back link when showBackLink is true", () => {
    render(
      <TransactionDetailCard transaction={sampleCredit} showBackLink />
    );
    expect(
      screen.getByRole("link", { name: /back to transactions/i })
    ).toHaveAttribute("href", "/transactions");
  });
});
