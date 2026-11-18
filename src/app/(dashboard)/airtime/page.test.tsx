import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AirtimePage from "./page";

describe("AirtimePage (F16.1)", () => {
  it("renders page header and airtime view", async () => {
    const pageComponent = await AirtimePage();
    render(pageComponent);

    expect(
      screen.getByRole("heading", { name: "Airtime" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Buy airtime for any supported network/i)
    ).toBeInTheDocument();
    expect(screen.getByTestId("airtime-view")).toBeInTheDocument();
  });
});
