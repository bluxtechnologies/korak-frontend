import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  MOCK_PAGINATION_META,
  MOCK_TRANSACTION_RECORDS,
} from "./api";
import { TransactionsTable } from "./TransactionsTable";

describe("TransactionsTable (F15.1)", () => {
  it("renders transaction table rows with references, types, and amounts", () => {
    render(
      <TransactionsTable
        transactions={MOCK_TRANSACTION_RECORDS.slice(0, 3)}
        pagination={MOCK_PAGINATION_META}
      />
    );

    // References
    expect(
      screen.getByText(MOCK_TRANSACTION_RECORDS[0].reference)
    ).toBeInTheDocument();
    expect(
      screen.getByText(MOCK_TRANSACTION_RECORDS[1].reference)
    ).toBeInTheDocument();

    // Formatted amounts
    expect(screen.getByText("-₦1,500.00")).toBeInTheDocument();
    expect(screen.getByText("+₦25,000.00")).toBeInTheDocument();

    // Type badges
    expect(screen.getAllByText("Order Payment").length).toBeGreaterThan(0);
    expect(screen.getByText("Wallet Funding")).toBeInTheDocument();
  });

  it("calls onSelectTransaction when clicking reference or details button", () => {
    const onSelect = vi.fn();
    render(
      <TransactionsTable
        transactions={MOCK_TRANSACTION_RECORDS.slice(0, 2)}
        onSelectTransaction={onSelect}
      />
    );

    const refBtn = screen.getByText(MOCK_TRANSACTION_RECORDS[0].reference);
    fireEvent.click(refBtn);
    expect(onSelect).toHaveBeenCalledWith(MOCK_TRANSACTION_RECORDS[0]);

    const detailBtns = screen.getAllByRole("button", { name: /view details for/i });
    fireEvent.click(detailBtns[1]);
    expect(onSelect).toHaveBeenCalledWith(MOCK_TRANSACTION_RECORDS[1]);
  });

  it("calls onSortChange when clicking sortable column header", () => {
    const onSort = vi.fn();
    render(
      <TransactionsTable
        transactions={MOCK_TRANSACTION_RECORDS.slice(0, 2)}
        sort="-created_at"
        onSortChange={onSort}
      />
    );

    const amountHeader = screen.getByRole("button", { name: "Amount" });
    fireEvent.click(amountHeader);
    expect(onSort).toHaveBeenCalled();
  });

  it("renders empty state when transaction list is empty", () => {
    render(<TransactionsTable transactions={[]} />);
    expect(screen.getByText("No transactions yet")).toBeInTheDocument();
  });

  it("renders filtered empty state with reset button when hasActiveFilters is true", () => {
    const onReset = vi.fn();
    render(
      <TransactionsTable
        transactions={[]}
        hasActiveFilters={true}
        onResetFilters={onReset}
      />
    );

    expect(screen.getByText("No matching transactions")).toBeInTheDocument();
    const resetBtn = screen.getByRole("button", { name: /reset filters/i });
    fireEvent.click(resetBtn);
    expect(onReset).toHaveBeenCalled();
  });

  it("renders table loading skeleton while isLoading is true", () => {
    const { container } = render(
      <TransactionsTable transactions={[]} isLoading={true} />
    );
    const tbody = container.querySelector("tbody");
    expect(tbody).toHaveAttribute("aria-busy", "true");
  });
});
