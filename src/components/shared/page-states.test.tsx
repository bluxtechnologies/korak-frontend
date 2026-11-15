import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PageLoadingState } from "./PageLoadingState";
import { PageState } from "./PageState";

describe("PageLoadingState", () => {
  it("renders accessible status role and default skeleton elements", () => {
    render(<PageLoadingState />);

    const container = screen.getByRole("status", {
      name: "Loading page content",
    });
    expect(container).toHaveAttribute("aria-busy", "true");
    // Default table skeleton should have table element
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("renders summary cards when summaryCards prop is positive", () => {
    const { container } = render(<PageLoadingState summaryCards={3} />);
    const cards = container.querySelectorAll(
      ".border-border.rounded-md.border.p-4"
    );
    expect(cards.length).toBe(3);
  });

  it("supports bodyType='cards' and bodyType='content'", () => {
    const { rerender, container } = render(
      <PageLoadingState bodyType="cards" />
    );
    expect(container.querySelectorAll(".p-5").length).toBe(6);

    rerender(<PageLoadingState bodyType="content" />);
    expect(container.querySelectorAll(".p-6").length).toBe(1);
  });
});

describe("PageState", () => {
  it("renders loading state when status is loading", () => {
    render(
      <PageState status="loading">
        <div>Success content</div>
      </PageState>
    );

    expect(
      screen.getByRole("status", { name: "Loading page content" })
    ).toBeInTheDocument();
    expect(screen.queryByText("Success content")).not.toBeInTheDocument();
  });

  it("renders custom loadingFallback when provided", () => {
    render(
      <PageState
        status="loading"
        loadingFallback={<div data-testid="custom-spinner">Custom Loader</div>}
      >
        <div>Success content</div>
      </PageState>
    );

    expect(screen.getByTestId("custom-spinner")).toBeInTheDocument();
  });

  it("renders ErrorState with errorProps when status is error", async () => {
    const handleRetry = vi.fn();
    const user = userEvent.setup();

    render(
      <PageState
        status="error"
        errorProps={{
          title: "Failed to load transactions",
          onRetry: handleRetry,
        }}
      >
        <div>Success content</div>
      </PageState>
    );

    expect(screen.getByText("Failed to load transactions")).toBeInTheDocument();
    expect(screen.queryByText("Success content")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it("renders EmptyState with emptyProps when status is empty", () => {
    render(
      <PageState
        status="empty"
        emptyProps={{
          title: "No orders yet",
          description: "Place your first order to see it here.",
        }}
      >
        <div>Success content</div>
      </PageState>
    );

    expect(screen.getByText("No orders yet")).toBeInTheDocument();
    expect(
      screen.getByText("Place your first order to see it here.")
    ).toBeInTheDocument();
    expect(screen.queryByText("Success content")).not.toBeInTheDocument();
  });

  it("renders children when status is success", () => {
    render(
      <PageState status="success">
        <div data-testid="real-data">Loaded 15 transactions successfully</div>
      </PageState>
    );

    expect(screen.getByTestId("real-data")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
