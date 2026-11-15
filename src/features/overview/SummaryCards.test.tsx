import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SummaryCards } from "./SummaryCards";
import { MOCK_OVERVIEW_DATA } from "./api";

describe("SummaryCards (F12.1)", () => {
  it("renders all four metric cards with accurate data", () => {
    render(
      <SummaryCards
        wallet={MOCK_OVERVIEW_DATA.wallet}
        metrics={MOCK_OVERVIEW_DATA.metrics}
      />
    );

    // 1. Wallet Card
    expect(screen.getByTestId("wallet-summary-card")).toBeInTheDocument();
    expect(screen.getByTestId("wallet-balance-amount")).toHaveTextContent(
      "₦45,250.00"
    );

    // 2. Active Services Card
    const servicesCard = screen.getByTestId("active-services-card");
    expect(servicesCard).toBeInTheDocument();
    expect(screen.getByText("Active Services")).toBeInTheDocument();
    expect(servicesCard).toHaveTextContent("2");

    // 3. Orders Metric Card
    expect(screen.getByTestId("orders-metric-card")).toBeInTheDocument();
    expect(screen.getByText("Total Orders")).toBeInTheDocument();
    expect(screen.getByText("18")).toBeInTheDocument();

    // 4. Account Standing Card
    expect(screen.getByTestId("account-standing-card")).toBeInTheDocument();
    expect(screen.getByText("Account Status")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Verified")).toBeInTheDocument();
  });
});
