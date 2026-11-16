import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { OrderReceiptModal } from "./OrderReceiptModal";
import type { OrderRecord } from "./api";

describe("OrderReceiptModal Component", () => {
  const mockOrder: OrderRecord = {
    id: "ord_soc_test",
    reference: "SOC-99887766",
    category: "social",
    service_name: "Verified Creator Profile (@techpulse_hub)",
    beneficiary: "@techpulse_hub",
    amount: 5200000,
    currency: "NGN",
    status: "completed",
    created_at: "2026-11-15T12:00:00Z",
    credentials: {
      account_handle: "techpulse_hub",
      target_link: "https://x.com/techpulse_hub",
      recovery_email: "kor••••@proton.me",
      notes: "Account transferred successfully under escrow.",
    },
  };

  it("renders order receipt dialog with social credentials and amount", () => {
    render(
      <OrderReceiptModal
        order={mockOrder}
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    expect(screen.getByTestId("order-receipt-modal")).toBeInTheDocument();
    expect(screen.getByText("SOC-99887766")).toBeInTheDocument();
    expect(screen.getByText("₦52,000.00")).toBeInTheDocument();
    expect(screen.getAllByText("@techpulse_hub").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("https://x.com/techpulse_hub")).toBeInTheDocument();
    expect(screen.getByText("kor••••@proton.me")).toBeInTheDocument();
  });
});
