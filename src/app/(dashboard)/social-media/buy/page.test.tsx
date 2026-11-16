import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import BuyAccountPage from "./page";

describe("BuyAccountPage", () => {
  it("renders page header, breadcrumbs, actions, and buy view", () => {
    render(<BuyAccountPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Buy Verified Accounts" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Breadcrumb" })
    ).toBeInTheDocument();
    expect(screen.getByTestId("buy-account-view")).toBeInTheDocument();
  });
});
