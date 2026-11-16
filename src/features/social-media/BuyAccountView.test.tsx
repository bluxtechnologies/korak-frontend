import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BuyAccountView } from "./BuyAccountView";

describe("BuyAccountView Component (F19.1)", () => {
  it("renders the account listings and platform filters", async () => {
    render(<BuyAccountView />);

    expect(
      screen.getByText("Buy Verified Accounts")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Boost & Engagement")
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("@fitglow_daily")).toBeInTheDocument();
      expect(screen.getByText("@techpulse_hub")).toBeInTheDocument();
    });
  });

  it("filters accounts by search input", async () => {
    render(<BuyAccountView />);

    await waitFor(() => {
      expect(screen.getByText("@fitglow_daily")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search by handle or niche/i);
    fireEvent.change(searchInput, { target: { value: "techpulse" } });

    await waitFor(() => {
      expect(screen.getByText("@techpulse_hub")).toBeInTheDocument();
      expect(screen.queryByText("@fitglow_daily")).not.toBeInTheDocument();
    });
  });

  it("opens purchase modal when clicking inspect & buy", async () => {
    render(<BuyAccountView />);

    await waitFor(() => {
      expect(screen.getByTestId("buy-button-acc_ig_01")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("buy-button-acc_ig_01"));

    expect(
      await screen.findByTestId("buy-account-modal")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Purchase Social Media Account")
    ).toBeInTheDocument();
  });

  it("completes purchase and displays masked deliverable card", async () => {
    render(<BuyAccountView />);

    await waitFor(() => {
      expect(screen.getByTestId("buy-button-acc_ig_01")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("buy-button-acc_ig_01"));

    const termsCheckbox = await screen.findByTestId("terms-checkbox");
    fireEvent.click(termsCheckbox);

    const payButton = screen.getByTestId("confirm-purchase-button");
    fireEvent.click(payButton);

    await waitFor(() => {
      expect(screen.getByTestId("masked-deliverable-card")).toBeInTheDocument();
    });
  });
});
