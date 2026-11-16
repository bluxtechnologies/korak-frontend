import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BoostAccountView } from "./BoostAccountView";

describe("BoostAccountView Component (F19.2)", () => {
  it("renders platform selection, service items, and config inputs", async () => {
    render(<BoostAccountView />);

    expect(screen.getByText("1. Select Platform & Service")).toBeInTheDocument();
    expect(screen.getByText("2. Configure Target & Quantity")).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText("Instagram High-Quality Profile Followers")
      ).toBeInTheDocument();
    });
  });

  it("validates target link format before opening confirmation", async () => {
    render(<BoostAccountView />);

    await waitFor(() => {
      expect(
        screen.getByText("Instagram High-Quality Profile Followers")
      ).toBeInTheDocument();
    });

    const submitBtn = screen.getByTestId("submit-boost-order-button");
    fireEvent.click(submitBtn);

    expect(
      await screen.findByText(/please enter a valid target URL or profile handle/i)
    ).toBeInTheDocument();
  });

  it("updates calculated cost when quantity is modified", async () => {
    render(<BoostAccountView />);

    await screen.findByText("Instagram High-Quality Profile Followers");

    const qtyInput = screen.getByTestId("quantity-input");
    fireEvent.change(qtyInput, { target: { value: "3000" } });

    // 3,000 * 2,500 = 7,500 NGN = ₦7,500.00
    await waitFor(() => {
      expect(screen.getByText(/₦7,500\.00/i)).toBeInTheDocument();
    });
  });

  it("dispatches order and renders success banner on confirmation", async () => {
    render(<BoostAccountView />);

    await screen.findByText("Instagram High-Quality Profile Followers");

    fireEvent.change(screen.getByTestId("target-link-input"), {
      target: { value: "https://instagram.com/korakdemo" },
    });

    fireEvent.click(screen.getByTestId("submit-boost-order-button"));

    const confirmBtn = await screen.findByRole("button", {
      name: /confirm & charge wallet/i,
    });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(screen.getByTestId("boost-success-banner")).toBeInTheDocument();
      expect(screen.getByText("Boost Order Queued Successfully")).toBeInTheDocument();
    });
  });
});
