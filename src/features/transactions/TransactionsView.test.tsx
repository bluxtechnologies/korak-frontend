import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as apiModule from "./api";
import { TransactionsView } from "./TransactionsView";

describe("TransactionsView (F15.1 & F15.2)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders search input, direction and type filters, and transaction rows", () => {
    render(
      <TransactionsView
        initialData={{
          data: apiModule.MOCK_TRANSACTION_RECORDS,
          meta: apiModule.MOCK_PAGINATION_META,
        }}
      />
    );

    expect(
      screen.getByPlaceholderText(
        /search by reference, description, or order ref/i
      )
    ).toBeInTheDocument();
    expect(screen.getByText("Direction")).toBeInTheDocument();
    expect(screen.getByText("Type")).toBeInTheDocument();
    expect(
      screen.getByText(apiModule.MOCK_TRANSACTION_RECORDS[0].reference)
    ).toBeInTheDocument();
  });

  it("opens transaction detail modal when a transaction row is selected", async () => {
    render(
      <TransactionsView
        initialData={{
          data: apiModule.MOCK_TRANSACTION_RECORDS,
          meta: apiModule.MOCK_PAGINATION_META,
        }}
      />
    );

    const refBtn = screen.getByText(
      apiModule.MOCK_TRANSACTION_RECORDS[0].reference
    );
    fireEvent.click(refBtn);

    expect(
      await screen.findByTestId("transaction-detail-modal")
    ).toBeInTheDocument();
    expect(
      screen.getByText(/immutable append-only ledger entry/i)
    ).toBeInTheDocument();
  });

  it("handles search queries and triggers api call", async () => {
    const getTransactionsSpy = vi.spyOn(apiModule, "getTransactions");
    const user = userEvent.setup();

    render(
      <TransactionsView
        initialData={{
          data: apiModule.MOCK_TRANSACTION_RECORDS,
          meta: apiModule.MOCK_PAGINATION_META,
        }}
      />
    );

    const searchInput = screen.getByPlaceholderText(
      /search by reference, description, or order ref/i
    );
    await user.type(searchInput, "WireGuard");

    await waitFor(
      () => {
        expect(getTransactionsSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            search: "WireGuard",
          })
        );
      },
      { timeout: 1500 }
    );
  });

  it("renders page header when showHeader is true", () => {
    render(
      <TransactionsView
        showHeader={true}
        initialData={{
          data: apiModule.MOCK_TRANSACTION_RECORDS,
          meta: apiModule.MOCK_PAGINATION_META,
        }}
      />
    );

    expect(
      screen.getByRole("heading", { name: "Transaction History" })
    ).toBeInTheDocument();
  });
});
