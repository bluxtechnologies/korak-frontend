import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { OrdersView } from "./OrdersView";
import { MOCK_ORDER_RECORDS } from "./api";

describe("OrdersView Component", () => {
  it("renders order list and header controls", () => {
    render(<OrdersView initialOrders={MOCK_ORDER_RECORDS} />);

    expect(screen.getByTestId("orders-view")).toBeInTheDocument();
    expect(screen.getByText("Order History")).toBeInTheDocument();
    expect(screen.getByText("Export CSV")).toBeInTheDocument();
    expect(screen.getByText("Export TXT")).toBeInTheDocument();
    expect(screen.getByText("+ New Purchase")).toBeInTheDocument();
  });

  it("filters orders by status tabs", () => {
    render(<OrdersView initialOrders={MOCK_ORDER_RECORDS} />);

    // Click on Active / Processing tab
    const activeTab = screen.getByRole("tab", { name: /Active \/ Processing/i });
    fireEvent.click(activeTab);

    // Active order is Telegram Rental Number (rendered in desktop table and mobile card)
    const matches = screen.getAllByText(/Telegram Rental Number/i);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it("searches orders by query", () => {
    render(<OrdersView initialOrders={MOCK_ORDER_RECORDS} />);

    const searchInput = screen.getByPlaceholderText(/Search by order reference/i);
    fireEvent.change(searchInput, { target: { value: "WireGuard" } });

    const matches = screen.getAllByText(/WireGuard Fast Tunnel/i);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it("opens order receipt modal on row click", () => {
    render(<OrdersView initialOrders={MOCK_ORDER_RECORDS} />);

    // Click on first receipt action button
    const receiptButtons = screen.getAllByRole("button", { name: /View Receipt/i });
    fireEvent.click(receiptButtons[0]);

    // Modal should be open with details
    expect(screen.getByTestId("order-receipt-modal")).toBeInTheDocument();
  });
});
