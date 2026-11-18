import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MOCK_TRANSACTION_RECORDS } from "./api";
import { TransactionReceiptModal } from "./TransactionReceiptModal";

describe("TransactionReceiptModal Component", () => {
  it("renders transaction receipt with reference, amount, and print button", () => {
    const handleOpenChange = vi.fn();
    const tx = MOCK_TRANSACTION_RECORDS[0];

    render(
      <TransactionReceiptModal
        transaction={tx}
        open={true}
        onOpenChange={handleOpenChange}
      />
    );

    expect(screen.getByTestId("transaction-receipt-modal")).toBeInTheDocument();
    expect(screen.getByText("Transaction Receipt")).toBeInTheDocument();
    expect(screen.getByText(tx.reference)).toBeInTheDocument();
    expect(screen.getByText(/Money Out \(Debit\)/i)).toBeInTheDocument();
    expect(screen.getByText("Print Receipt")).toBeInTheDocument();
  });

  it("handles print button click", () => {
    const printSpy = vi.spyOn(window, "print").mockImplementation(() => {});
    const tx = MOCK_TRANSACTION_RECORDS[1]; // credit

    render(
      <TransactionReceiptModal
        transaction={tx}
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    expect(screen.getByText(/Money In \(Credit\)/i)).toBeInTheDocument();

    const printBtn = screen.getByRole("button", { name: /print receipt/i });
    fireEvent.click(printBtn);
    expect(printSpy).toHaveBeenCalled();

    printSpy.mockRestore();
  });
});
