import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "./alert";
import { Toaster, showToast, toast } from "./sonner";

describe("Alert and Toast Provider Components", () => {
  describe("Alert (Four Levels, 10px Radius, Icon + Text)", () => {
    it("renders info alert by default with title, description, and icon", () => {
      render(
        <Alert data-testid="info-alert">
          <Info data-testid="alert-icon" />
          <AlertTitle>System Notice</AlertTitle>
          <AlertDescription>Maintenance scheduled at 2:00 AM.</AlertDescription>
        </Alert>
      );

      const alert = screen.getByTestId("info-alert");
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveAttribute("role", "alert");
      expect(alert).toHaveClass(
        "rounded-md border-info-border bg-info-surface shadow-none"
      );
      expect(screen.getByTestId("alert-icon")).toBeInTheDocument();
      expect(screen.getByText("System Notice")).toBeInTheDocument();
      expect(
        screen.getByText("Maintenance scheduled at 2:00 AM.")
      ).toBeInTheDocument();
    });

    it("renders success alert level with distinct styling", () => {
      render(
        <Alert variant="success" data-testid="success-alert">
          <CheckCircle2 data-testid="success-icon" />
          <AlertTitle>Wallet Funded</AlertTitle>
          <AlertDescription>₦20,000 added successfully.</AlertDescription>
        </Alert>
      );

      const alert = screen.getByTestId("success-alert");
      expect(alert).toHaveClass("border-success-border bg-success-surface");
    });

    it("renders warning alert level with distinct amber styling", () => {
      render(
        <Alert variant="warning" data-testid="warning-alert">
          <AlertTriangle data-testid="warning-icon" />
          <AlertTitle>Low Wallet Balance</AlertTitle>
          <AlertDescription>Please fund your wallet.</AlertDescription>
        </Alert>
      );

      const alert = screen.getByTestId("warning-alert");
      expect(alert).toHaveClass("border-warning-border bg-warning-surface");
    });

    it("renders destructive/error alert level with distinct bright red styling", () => {
      render(
        <Alert variant="destructive" data-testid="error-alert">
          <AlertCircle data-testid="error-icon" />
          <AlertTitle>Payment Failed</AlertTitle>
          <AlertDescription>Your card was declined.</AlertDescription>
        </Alert>
      );

      const alert = screen.getByTestId("error-alert");
      expect(alert).toHaveClass(
        "border-destructive-border bg-destructive-surface text-destructive"
      );
    });
  });

  describe("Toaster Provider & showToast Helper", () => {
    it("renders without crashing", () => {
      const { container } = render(<Toaster />);
      expect(container).toBeInTheDocument();
    });

    it("supports showToast.success with separate title and message", () => {
      const id = showToast.success("Payment Received", "₦50,000 has been credited to your wallet.");
      expect(id).toBeDefined();
    });

    it("supports showToast.error with payload object format", () => {
      const id = showToast.error({
        title: "Transaction Declined",
        message: "Your bank rejected the request.",
      });
      expect(id).toBeDefined();
    });

    it("supports showToast.warning and showToast.info", () => {
      const warnId = showToast.warning("Low Balance", "Your wallet balance is below ₦500.");
      const infoId = showToast.info("System Notice", "Scheduled maintenance tonight.");
      expect(warnId).toBeDefined();
      expect(infoId).toBeDefined();
    });
  });
});
