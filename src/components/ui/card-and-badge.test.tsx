import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./card";
import { Badge } from "./badge";

describe("Card and Badge Components", () => {
  describe("Card", () => {
    it("renders card structure with header, title, description, content, and footer", () => {
      render(
        <Card data-testid="test-card">
          <CardHeader>
            <CardTitle>Wallet Balance</CardTitle>
            <CardDescription>Available funds in account</CardDescription>
          </CardHeader>
          <CardContent>
            <p>₦50,000.00</p>
          </CardContent>
          <CardFooter>
            <span>Updated just now</span>
          </CardFooter>
        </Card>
      );

      const card = screen.getByTestId("test-card");
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass(
        "rounded-lg border bg-card text-card-foreground"
      );
      expect(screen.getByText("Wallet Balance")).toBeInTheDocument();
      expect(
        screen.getByText("Available funds in account")
      ).toBeInTheDocument();
      expect(screen.getByText("₦50,000.00")).toBeInTheDocument();
      expect(screen.getByText("Updated just now")).toBeInTheDocument();
    });
  });

  describe("Badge (Text-Only, 10px Radius, No Icons/Dots)", () => {
    it("renders badge with text and enforces 10px radius (rounded-md, not rounded-full)", () => {
      render(<Badge>Active</Badge>);
      const badge = screen.getByText("Active");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass("rounded-md");
      expect(badge).not.toHaveClass("rounded-full");
      expect(badge).toHaveClass("bg-primary text-primary-foreground");
    });

    it("applies status and neutral variants correctly", () => {
      const { rerender } = render(<Badge variant="secondary">Pending</Badge>);
      expect(screen.getByText("Pending")).toHaveClass(
        "bg-secondary text-secondary-foreground"
      );

      rerender(<Badge variant="destructive">Failed</Badge>);
      expect(screen.getByText("Failed")).toHaveClass(
        "bg-destructive-surface text-destructive border-destructive-border"
      );

      rerender(<Badge variant="outline">Outline</Badge>);
      expect(screen.getByText("Outline")).toHaveClass(
        "border-border text-foreground bg-transparent"
      );

      rerender(<Badge variant="info">Info</Badge>);
      expect(screen.getByText("Info")).toHaveClass(
        "bg-info-surface text-info border-info-border"
      );

      rerender(<Badge variant="success">Completed</Badge>);
      expect(screen.getByText("Completed")).toHaveClass(
        "bg-success-surface text-success border-success-border"
      );

      rerender(<Badge variant="warning">Low Balance</Badge>);
      expect(screen.getByText("Low Balance")).toHaveClass(
        "bg-warning-surface text-warning border-warning-border"
      );
    });
  });
});
