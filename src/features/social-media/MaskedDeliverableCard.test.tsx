import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MaskedDeliverableCard } from "./MaskedDeliverableCard";
import * as socialApi from "./api";

vi.mock("./api", async (importOriginal) => {
  const actual = await importOriginal<typeof socialApi>();
  return {
    ...actual,
    revealSocialCredentials: vi.fn().mockResolvedValue({
      order_id: "ord_123",
      username: "creator_transferred_admin",
      password: "KorakAuth_#9821_SecureX",
      recovery_email: "transfer-backup@korakdigital.com",
      two_factor_backup_key: "K79A 28BC 9901 4410",
      audit_id: "aud_rev_mock_9821",
      revealed_at: new Date().toISOString(),
    }),
  };
});

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
    const user = userEvent.setup();
    render(
      <MaskedDeliverableCard
        orderId="ord_123"
        accountHandle="test_creator"
      />
    );

    const revealBtn = screen.getByTestId("reveal-credentials-button");
    await user.click(revealBtn);

    expect(
      await screen.findByText("Reveal Account Access Credentials")
    ).toBeInTheDocument();
    expect(
      screen.getByText(/security audit record in your account history/i)
    ).toBeInTheDocument();
  });

  it("reveals unmasked credentials and displays audit ID on confirmation", async () => {
    const user = userEvent.setup();
    const onRevealed = vi.fn();
    render(
      <MaskedDeliverableCard
        orderId="ord_123"
        accountHandle="test_creator"
        onRevealed={onRevealed}
      />
    );

    await user.click(screen.getByTestId("reveal-credentials-button"));
    const confirmBtn = await screen.findByRole("button", {
      name: /confirm & reveal/i,
    });
    await user.click(confirmBtn);

    await waitFor(() => {
      expect(screen.getByText("KorakAuth_#9821_SecureX")).toBeInTheDocument();
      expect(screen.getByText("creator_transferred_admin")).toBeInTheDocument();
    });

    expect(screen.getByText(/Audit ID logged:/i)).toBeInTheDocument();
    expect(onRevealed).toHaveBeenCalled();
  });
});
