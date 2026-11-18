import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { OrdersView } from "./OrdersView";
import { MOCK_ORDER_RECORDS } from "./api";

describe("OrdersView Component", () => {
  it("renders order list, statistics, and header controls", () => {
    render(<OrdersView initialOrders={MOCK_ORDER_RECORDS} />);

    expect(screen.getByTestId("orders-view")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Orders" })).toBeInTheDocument();
    expect(
      screen.getByText("View and manage your digital service purchases.")
    ).toBeInTheDocument();
    expect(screen.getByText("Total Orders")).toBeInTheDocument();
    expect(screen.getByText("Export CSV")).toBeInTheDocument();
    expect(screen.getByText("Export TXT")).toBeInTheDocument();
    expect(screen.getByText("+ New Purchase")).toBeInTheDocument();
  });

  it("filters orders by status tabs", () => {
    render(<OrdersView initialOrders={MOCK_ORDER_RECORDS} />);

    // Click on Active / Processing tab
    const activeTab = screen.getByRole("tab", { name: /Active \/ Processing/i });
    fireEvent.click(activeTab);

    // Active order is Telegram Rental Number
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

  it("opens order detail modal on row click", () => {
    render(<OrdersView initialOrders={MOCK_ORDER_RECORDS} />);

    // Click on first "View Details" button
    const detailButtons = screen.getAllByRole("button", { name: /View Details/i });
    fireEvent.click(detailButtons[0]);

    // Order detail modal should be open with details
    expect(screen.getByTestId("order-detail-modal")).toBeInTheDocument();
  });

  it("opens order receipt modal when receipt action button is clicked", () => {
    render(<OrdersView initialOrders={MOCK_ORDER_RECORDS} />);

    // Click on first receipt action button
    const receiptButtons = screen.getAllByRole("button", { name: /View Receipt|Receipt/i });
    fireEvent.click(receiptButtons[0]);

    // Modal should be open with details
    expect(screen.getByTestId("order-receipt-modal")).toBeInTheDocument();
  });

  it("filters orders by category dropdown", () => {
    render(<OrdersView initialOrders={MOCK_ORDER_RECORDS} />);

    const categorySelect = screen.getByLabelText(/filter by service category/i);
    fireEvent.change(categorySelect, { target: { value: "vpn" } });

    const matches = screen.getAllByText(/WireGuard Fast Tunnel/i);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });
});
