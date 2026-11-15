import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import TransactionDetailPage from "./page";

describe("TransactionDetailPage (F15.2)", () => {
  it("renders detail page with transaction details and breadcrumbs", async () => {
    const pageComponent = await TransactionDetailPage({
      params: Promise.resolve({ id: "txn_01" }),
    });

    render(pageComponent);

    expect(
      screen.getByRole("heading", { name: /transaction details/i })
    ).toBeInTheDocument();
    expect(
      screen.getAllByText("TXN-20261114-0012").length
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("-₦1,500.00")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /back to transactions/i })
    ).toBeInTheDocument();
  });
});
