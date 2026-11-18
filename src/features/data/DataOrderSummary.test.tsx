import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DataOrderSummary } from "./DataOrderSummary";
import { TELECOM_NETWORKS } from "@/features/airtime/api";
import { MOCK_DATA_PLANS } from "./api";

const mockMtn = TELECOM_NETWORKS[0];
const mockPlan = MOCK_DATA_PLANS[0]; // 40MB + 5MB Night Bonus, ₦50

describe("DataOrderSummary", () => {
  it("renders network info, plan details, total and delivery estimate", () => {
    render(
      <DataOrderSummary
        network={mockMtn}
        plan={mockPlan}
        recipientPhone="08012345678"
        walletBalance={500000} // ₦5,000.00
      />
    );

    expect(screen.getByText("Order Summary")).toBeInTheDocument();
    expect(screen.getByText("MTN Nigeria")).toBeInTheDocument();
    expect(screen.getByText("Selected Network")).toBeInTheDocument();

    expect(screen.getByText("Data Plan")).toBeInTheDocument();
    expect(screen.getByText(mockPlan.name)).toBeInTheDocument();
    expect(screen.getByText(mockPlan.validity)).toBeInTheDocument();
    expect(screen.getByText("08012345678")).toBeInTheDocument();

    // Check delivery guarantee
    expect(
      screen.getByText(/Usually delivered within a few seconds\./i)
    ).toBeInTheDocument();
    // Sufficient balance state
    expect(screen.getByText(/Sufficient wallet balance/i)).toBeInTheDocument();
  });

  it("shows insufficient balance state and Add Money link when wallet has less funds than plan price", () => {
    render(
      <DataOrderSummary
        network={mockMtn}
        plan={mockPlan} // ₦50
        recipientPhone="08012345678"
        walletBalance={2000} // ₦20.00 (< ₦50.00)
      />
    );

    expect(screen.getByText(/Insufficient balance/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Add Money →/i })).toBeInTheDocument();
  });
});
