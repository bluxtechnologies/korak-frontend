import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NumbersView } from "./NumbersView";
import { MOCK_ACTIVE_OTP_ORDER, MOCK_RENTAL_RECORDS } from "./api";

describe("NumbersView Component", () => {
  it("renders header, mode tabs, and selector card", () => {
    render(<NumbersView />);

    expect(screen.getByTestId("numbers-view")).toBeInTheDocument();
    expect(screen.getByText("Virtual Numbers & SMS OTP")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /One-Time OTP/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Rental Numbers/i })).toBeInTheDocument();
  });

  it("switches to Rental Numbers mode when tab is clicked", () => {
    render(<NumbersView initialMode="otp" />);

    const rentalTab = screen.getByRole("tab", { name: /Rental Numbers/i });
    fireEvent.click(rentalTab);

    expect(screen.getByText("Rent Virtual Phone Line")).toBeInTheDocument();
    expect(screen.getByText("3. Rental Period Duration")).toBeInTheDocument();
  });

  it("renders live waiting terminal when initialActiveOrder is provided", () => {
    render(<NumbersView initialActiveOrder={MOCK_ACTIVE_OTP_ORDER} />);

    expect(screen.getByTestId("live-waiting-terminal")).toBeInTheDocument();
    expect(screen.getByText(/Active Terminal Console/i)).toBeInTheDocument();
  });

  it("renders rentals ledger card with active rented numbers", () => {
    render(<NumbersView initialRentals={MOCK_RENTAL_RECORDS} />);

    expect(screen.getByTestId("rentals-ledger-card")).toBeInTheDocument();
    expect(screen.getByText(/Active Rental Lines/i)).toBeInTheDocument();
    expect(screen.getByText("+44 7700 900142")).toBeInTheDocument();
  });
});
