import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ServicesCatalogPage from "./page";

describe("ServicesCatalogPage", () => {
  it("renders page title, breadcrumb, and all service cards", () => {
    render(<ServicesCatalogPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Services Catalog" })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("navigation", { name: "Breadcrumb" })
    ).toBeInTheDocument();

    expect(screen.getByText("Airtime Recharge")).toBeInTheDocument();
    expect(screen.getByText("Data Bundles")).toBeInTheDocument();
    expect(screen.getByText("Virtual Numbers & OTP")).toBeInTheDocument();
    expect(screen.getByText("WireGuard & OpenVPN")).toBeInTheDocument();
    expect(screen.getByText("Buy Verified Accounts")).toBeInTheDocument();
    expect(screen.getByText("Social Growth & Boosting")).toBeInTheDocument();
  });
});
