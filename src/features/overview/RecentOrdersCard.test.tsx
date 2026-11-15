import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RecentOrdersCard } from "./RecentOrdersCard";
import { MOCK_OVERVIEW_DATA } from "./api";

describe("RecentOrdersCard (F12.3)", () => {
  it("renders orders list with reference, service, formatted amount, and status badges", () => {
    render(<RecentOrdersCard orders={MOCK_OVERVIEW_DATA.recent_orders} />);

    expect(screen.getByText("Recent Orders")).toBeInTheDocument();
    expect(screen.getByText("ORD-2026-0042")).toBeInTheDocument();
    expect(screen.getByText("Airtel 5GB Monthly")).toBeInTheDocument();
    expect(screen.getByText("₦1,500.00")).toBeInTheDocument();
    expect(screen.getAllByText("Completed")).toHaveLength(2);

    expect(screen.getByText("ORD-2026-0038")).toBeInTheDocument();
    expect(screen.getByText("₦500.00")).toBeInTheDocument();
    expect(screen.getByText("Failed")).toBeInTheDocument();
  });

  it("renders empty state when orders list is empty", () => {
    render(<RecentOrdersCard orders={[]} />);

    expect(screen.getByText("No orders yet")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Your recent purchases will appear here as soon as you order airtime, data, or digital services."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /buy airtime or data/i })
    ).toBeInTheDocument();
  });
});
