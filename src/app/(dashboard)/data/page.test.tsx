import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import DataPage from "./page";

describe("DataPage (F16.2)", () => {
  it("renders page header, breadcrumbs, actions, and data view", () => {
    render(<DataPage />);

    expect(
      screen.getByRole("heading", { name: "Data Bundles" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Instant SME, Corporate Gifting, and Direct Data packages across all Nigerian networks/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Buy Airtime/i })).toBeInTheDocument();
    expect(screen.getByTestId("data-view")).toBeInTheDocument();
  });
});
