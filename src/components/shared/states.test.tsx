import { fireEvent, render, screen } from "@testing-library/react";
import { ShoppingBag } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { ApiClientError } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { TableSkeleton } from "./TableSkeleton";

describe("Empty, Loading Skeleton & Error State Components (F6.4)", () => {
  describe("Skeleton", () => {
    it("renders with rounded-md, bg-muted, animate-pulse, and aria-hidden", () => {
      render(<Skeleton data-testid="skel" className="h-6 w-32" />);
      const skel = screen.getByTestId("skel");
      expect(skel).toHaveClass("animate-pulse", "rounded-md", "bg-muted");
      expect(skel).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("EmptyState", () => {
    it("renders title, description, custom icon, and next-action button", () => {
      render(
        <EmptyState
          icon={ShoppingBag}
          title="No orders yet"
          description="Your digital service purchases will appear here."
          action={<Button>Buy Airtime</Button>}
        />
      );

      expect(
        screen.getByRole("heading", { name: "No orders yet" })
      ).toBeInTheDocument();
      expect(
        screen.getByText("Your digital service purchases will appear here.")
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /buy airtime/i })
      ).toBeInTheDocument();
    });

    it("supports bordered={false} for embedding inside table or card wrappers", () => {
      const { container } = render(
        <EmptyState title="Nothing found" bordered={false} />
      );
      expect(container.firstChild).not.toHaveClass("border");
    });
  });

  describe("ErrorState", () => {
    it("renders a safe mapped message instead of raw SQL or stack traces", () => {
      const sqlErr = new ApiClientError(
        "SQLSTATE[42S02]: Table 'korak.orders' doesn't exist",
        500,
        "server_error",
        undefined,
        "req-777"
      );

      render(<ErrorState error={sqlErr} />);

      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
      expect(alert).not.toHaveTextContent("SQLSTATE");
      expect(alert).toHaveTextContent(/reference: req-777/i);
    });

    it("renders retry button when onRetry is passed and disables it while isRetrying", () => {
      const handleRetry = vi.fn();
      const { rerender } = render(
        <ErrorState message="Request timed out." onRetry={handleRetry} />
      );

      expect(screen.getByText("Request timed out.")).toBeInTheDocument();
      const retryBtn = screen.getByRole("button", { name: /try again/i });
      fireEvent.click(retryBtn);
      expect(handleRetry).toHaveBeenCalledTimes(1);

      rerender(
        <ErrorState
          message="Request timed out."
          onRetry={handleRetry}
          isRetrying
        />
      );
      expect(screen.getByRole("button", { name: /try again/i })).toBeDisabled();
    });
  });

  describe("TableSkeleton", () => {
    it("renders accessible status region with specified rows and columns", () => {
      render(<TableSkeleton columns={3} rows={4} />);

      const status = screen.getByRole("status", {
        name: /loading table data/i,
      });
      expect(status).toHaveAttribute("aria-busy", "true");

      // 1 header row + 4 body rows = 5 tr elements
      const tableRows = status.querySelectorAll("tr");
      expect(tableRows).toHaveLength(5);
      // 4 body rows * 3 cells = 12 td elements
      expect(status.querySelectorAll("td")).toHaveLength(12);
    });
  });
});
