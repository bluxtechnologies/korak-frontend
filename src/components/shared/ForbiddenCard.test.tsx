import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ForbiddenCard } from "./ForbiddenCard";

describe("ForbiddenCard (F11.4)", () => {
  it("renders default title, description, and action buttons", () => {
    render(<ForbiddenCard />);

    expect(screen.getByRole("heading", { level: 1, name: "Access Denied" })).toBeInTheDocument();
    expect(
      screen.getByText(/you do not have permission to view this page/i)
    ).toBeInTheDocument();

    const overviewLink = screen.getByRole("link", { name: /return to overview/i });
    expect(overviewLink).toBeInTheDocument();
    expect(overviewLink).toHaveAttribute("href", "/overview");

    expect(screen.getByRole("button", { name: /go back/i })).toBeInTheDocument();
  });

  it("renders custom title and description when provided", () => {
    render(
      <ForbiddenCard
        title="Restricted Feature"
        description="This action requires additional account permissions."
      />
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Restricted Feature" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("This action requires additional account permissions.")
    ).toBeInTheDocument();
  });
});
