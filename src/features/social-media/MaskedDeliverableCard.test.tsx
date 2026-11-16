import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MaskedDeliverableCard } from "./MaskedDeliverableCard";

describe("MaskedDeliverableCard Component (F19.3 & Doc 12)", () => {
  it("renders masked credentials by default with a reveal button", () => {
    render(
      <MaskedDeliverableCard
        orderId="ord_123"
        accountHandle="test_creator"
        maskedLogin="test_••••••"
        maskedRecovery="rec••••@gmail.com"
      />
    );

    expect(screen.getByText("Account Transfer Deliverables")).toBeInTheDocument();
    expect(screen.getByText("@test_creator")).toBeInTheDocument();
    expect(screen.getByText("••••••••••••••••")).toBeInTheDocument();
    expect(screen.getByTestId("reveal-credentials-button")).toBeInTheDocument();
  });

  it("opens confirmation dialog naming the audit consequence when reveal is clicked", async () => {
    render(
      <MaskedDeliverableCard
        orderId="ord_123"
        accountHandle="test_creator"
      />
    );

    const revealBtn = screen.getByTestId("reveal-credentials-button");
    fireEvent.click(revealBtn);

    expect(
      await screen.findByText("Reveal Account Access Credentials")
    ).toBeInTheDocument();
    expect(
      screen.getByText(/security audit record in your account history/i)
    ).toBeInTheDocument();
  });

  it("reveals unmasked credentials and displays audit ID on confirmation", async () => {
    const onRevealed = vi.fn();
    render(
      <MaskedDeliverableCard
        orderId="ord_123"
        accountHandle="test_creator"
        onRevealed={onRevealed}
      />
    );

    fireEvent.click(screen.getByTestId("reveal-credentials-button"));
    const confirmBtn = await screen.findByRole("button", {
      name: /confirm & reveal/i,
    });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(screen.getByText("KorakAuth_#9821_SecureX")).toBeInTheDocument();
      expect(screen.getByText("creator_transferred_admin")).toBeInTheDocument();
    });

    expect(screen.getByText(/Audit ID logged:/i)).toBeInTheDocument();
    expect(onRevealed).toHaveBeenCalled();
  });
});
