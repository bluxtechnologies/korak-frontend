import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AuthLoading from "./loading";

describe("AuthLoading Component", () => {
  it("renders a full-screen loading overlay before auth content displays", () => {
    const { container } = render(<AuthLoading />);

    // Must be fixed inset-0 z-50 full-screen overlay so contents underneath don't show
    const overlay = container.firstChild as HTMLElement;
    expect(overlay).toHaveClass("fixed", "inset-0", "z-50", "bg-background");

    // Brand loader must be present
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getAllByText(/Korak Digitals/i).length).toBeGreaterThanOrEqual(1);
  });
});
