import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import BoostAccountPage from "./page";

describe("BoostAccountPage", () => {
  it("renders page header, breadcrumbs, actions, and boost view", () => {
    render(<BoostAccountPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Social Media Growth & Boosting" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Breadcrumb" })
    ).toBeInTheDocument();
    expect(screen.getByTestId("boost-account-view")).toBeInTheDocument();
  });
});
