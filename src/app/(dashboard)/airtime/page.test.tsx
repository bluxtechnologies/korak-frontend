import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AirtimePage from "./page";

describe("AirtimePage (F16.1)", () => {
  it("renders page header, breadcrumbs, actions, and airtime view", () => {
    render(<AirtimePage />);

    expect(
      screen.getByRole("heading", { name: "Airtime Top-Up" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Instant automated airtime top-up for MTN, Airtel, Glo, and 9mobile/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Buy Data/i })).toBeInTheDocument();
    expect(screen.getByTestId("airtime-view")).toBeInTheDocument();
  });
});
