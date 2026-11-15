import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrandPageLoader } from "./BrandPageLoader";

describe("BrandPageLoader", () => {
  it("renders with default status role and accessible label", () => {
    render(<BrandPageLoader />);

    const loader = screen.getByRole("status", {
      name: "Loading Korak Digitals",
    });
    expect(loader).toBeInTheDocument();
    expect(screen.getByText("Korak Digitals")).toBeInTheDocument();
    expect(screen.getByText("Loading your workspace…")).toBeInTheDocument();
  });

  it("renders custom message when provided", () => {
    render(<BrandPageLoader message="Authenticating session…" />);

    expect(screen.getByText("Authenticating session…")).toBeInTheDocument();
  });

  it("renders without wordmark when showWordmark is false", () => {
    render(<BrandPageLoader showWordmark={false} />);

    expect(screen.queryByText("Korak Digitals")).not.toBeInTheDocument();
  });

  it("applies fullscreen styling when size is fullscreen", () => {
    render(<BrandPageLoader size="fullscreen" data-testid="fullscreen-loader" />);

    const loader = screen.getByTestId("fullscreen-loader");
    expect(loader).toHaveClass("fixed inset-0 z-50");
  });
});
