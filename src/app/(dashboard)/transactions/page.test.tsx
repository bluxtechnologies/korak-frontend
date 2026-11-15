import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import TransactionsPage from "./page";

describe("TransactionsPage (F15.1)", () => {
  it("renders page header and transactions view", () => {
    render(<TransactionsPage />);

    expect(
      screen.getByRole("heading", { name: "Transactions" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/immutable audit ledger of all balance credits, debits, and adjustments/i)
    ).toBeInTheDocument();
    expect(screen.getByTestId("transactions-view")).toBeInTheDocument();
  });
});
