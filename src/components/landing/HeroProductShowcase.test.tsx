import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HeroProductShowcase } from "./HeroProductShowcase";

describe("HeroProductShowcase (Phase 01)", () => {
  it("renders the application preview region", () => {
    render(<HeroProductShowcase />);
    const region = screen.getByRole("region", {
      name: "KORAK Application Interface Preview",
    });
    expect(region).toBeInTheDocument();
  });

  it("displays simulated browser address bar with app.korak.ng", () => {
    render(<HeroProductShowcase />);
    expect(screen.getByText("app.korak.ng")).toBeInTheDocument();
    expect(screen.getByText("/dashboard")).toBeInTheDocument();
  });

  it("displays the customer wallet balance card", () => {
    render(<HeroProductShowcase />);
    expect(screen.getByText(/wallet balance/i)).toBeInTheDocument();
    expect(screen.getByText("₦45,250.00")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add money/i })).toBeInTheDocument();
  });

  it("displays the four popular digital services", () => {
    render(<HeroProductShowcase />);
    expect(screen.getByText("Airtime")).toBeInTheDocument();
    expect(screen.getByText("Data Bundles")).toBeInTheDocument();
    expect(screen.getByText("Activation")).toBeInTheDocument();
    expect(screen.getByText("eSIM & More")).toBeInTheDocument();
  });

  it("displays the floating transaction notification element", () => {
    render(<HeroProductShowcase />);
    const notification = screen.getByLabelText("Transaction notification highlight");
    expect(notification).toBeInTheDocument();
    expect(screen.getByText("Payment successful")).toBeInTheDocument();
    expect(screen.getByText(/airtime purchase/i)).toBeInTheDocument();
  });
});
