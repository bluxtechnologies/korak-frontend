import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MOCK_TRANSACTION_RECORDS } from "./api";
import { TransactionDetailModal } from "./TransactionDetailModal";

describe("TransactionDetailModal (F15.2)", () => {
  const sampleTx = MOCK_TRANSACTION_RECORDS[0];

  it("renders modal dialog when open is true with transaction details", () => {
    const onOpenChange = vi.fn();
    render(
      <TransactionDetailModal
        transaction={sampleTx}
        open={true}
        onOpenChange={onOpenChange}
      />
    );

    expect(screen.getByTestId("transaction-detail-modal")).toBeInTheDocument();
    expect(screen.getByText(sampleTx.reference)).toBeInTheDocument();
    expect(screen.getByText(sampleTx.description)).toBeInTheDocument();
  });

  it("does not render when transaction is null", () => {
    render(
      <TransactionDetailModal
        transaction={null}
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    expect(
      screen.queryByTestId("transaction-detail-modal")
    ).not.toBeInTheDocument();
  });

  it("does not render when open is false", () => {
    render(
      <TransactionDetailModal
        transaction={sampleTx}
        open={false}
        onOpenChange={vi.fn()}
      />
    );

    expect(
      screen.queryByTestId("transaction-detail-modal")
    ).not.toBeInTheDocument();
  });
});
