import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { FundWalletModal } from "./FundWalletModal";
import { customerApi } from "@/lib/api/customer";

vi.mock("@/lib/api/customer", () => ({
  customerApi: {
    generateDedicatedAccount: vi.fn(),
    getDepositTiers: vi.fn().mockResolvedValue(null),
    calculateDepositFee: vi.fn().mockResolvedValue(null),
    initiateDeposit: vi.fn().mockResolvedValue(null),
  },
}));

describe("FundWalletModal Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockActiveAccount = {
    account_name: "KORAK / Collins Obaseki",
    account_number: "7892341201",
    bank_name: "Wema Bank",
    currency: "NGN",
    assigned_at: "2026-11-18T00:30:00Z",
  };

  it("renders Step 1 (Amount & Fees) with preset chips and real-time breakdown", () => {
    render(
      <FundWalletModal
        open={true}
        onOpenChange={vi.fn()}
        accountDetails={mockActiveAccount}
      />
    );

    expect(screen.getByText("Fund Your Wallet")).toBeInTheDocument();
    expect(screen.getByText(/Step 1 of 2: Amount & Fees/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Deposit Amount \(NGN\)/i)).toHaveValue("1000");

    // Preset chips
    expect(screen.getByRole("button", { name: "₦1,000.00" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "₦5,000.00" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "₦10,000.00" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "₦20,000.00" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "₦50,000.00" })).toBeInTheDocument();

    // Breakdown card for default 1,000: credit ₦1,000.00, fee ₦75.00, total ₦1,075.00
    expect(screen.getByTestId("deposit-breakdown-card")).toBeInTheDocument();
    expect(screen.getAllByText("₦1,000.00").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("+ ₦75.00")).toBeInTheDocument();
    expect(screen.getByText("₦1,075.00")).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /proceed to transfer/i })
    ).toBeInTheDocument();
  });

  it("updates deposit amount and fee breakdown when clicking preset chips", async () => {
    const user = userEvent.setup();
    render(
      <FundWalletModal
        open={true}
        onOpenChange={vi.fn()}
        accountDetails={mockActiveAccount}
      />
    );

    const chip50k = screen.getByRole("button", { name: "₦50,000.00" });
    await user.click(chip50k);

    expect(screen.getByLabelText(/Deposit Amount \(NGN\)/i)).toHaveValue("50000");
    // For 50,000: tier is "₦10,001 to ₦50,000", fee is ₦155.00, total is ₦50,155.00
    expect(screen.getByText("+ ₦155.00")).toBeInTheDocument();
    expect(screen.getByText("₦50,155.00")).toBeInTheDocument();
  });

  it("toggles fee schedule accordion to inspect tiered schedule and context notice", async () => {
    const user = userEvent.setup();
    render(
      <FundWalletModal
        open={true}
        onOpenChange={vi.fn()}
        accountDetails={mockActiveAccount}
      />
    );

    const toggleBtn = screen.getByRole("button", { name: /view tiers/i });
    await user.click(toggleBtn);

    expect(screen.getByText("Below ₦1,000")).toBeInTheDocument();
    expect(screen.getByText("Above ₦100,000")).toBeInTheDocument();
    expect(
      screen.getByText(/Processing fees are charged per transaction tier/i)
    ).toBeInTheDocument();
  });

  it("advances to Step 2 and displays dedicated virtual account details and exact payable amount", async () => {
    const user = userEvent.setup();
    render(
      <FundWalletModal
        open={true}
        onOpenChange={vi.fn()}
        accountDetails={mockActiveAccount}
      />
    );

    const proceedBtn = screen.getByRole("button", { name: /proceed to transfer/i });
    await user.click(proceedBtn);

    expect(screen.getByText("Complete Your Transfer")).toBeInTheDocument();
    expect(screen.getByText(/Step 2 of 2: Bank Transfer/i)).toBeInTheDocument();
    expect(screen.getByText("Wema Bank")).toBeInTheDocument();
    expect(screen.getByText("7892341201")).toBeInTheDocument();
    expect(screen.getByText("KORAK / Collins Obaseki")).toBeInTheDocument();
    expect(screen.getByText("₦1,075.00")).toBeInTheDocument();
    expect(screen.getByText(/Transfer Instructions/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /i have completed transfer/i })
    ).toBeInTheDocument();
  });

  it("allows returning to Step 1 to edit amount", async () => {
    const user = userEvent.setup();
    render(
      <FundWalletModal
        open={true}
        onOpenChange={vi.fn()}
        accountDetails={mockActiveAccount}
      />
    );

    await user.click(screen.getByRole("button", { name: /proceed to transfer/i }));
    expect(screen.getByText("Complete Your Transfer")).toBeInTheDocument();

    const backBtn = screen.getByRole("button", { name: /back to amount/i });
    await user.click(backBtn);

    expect(screen.getByText(/Step 1 of 2: Amount & Fees/i)).toBeInTheDocument();
  });

  it("completes transfer, closes modal and triggers onTransferCompleted callback", async () => {
    const user = userEvent.setup();
    const handleOpenChange = vi.fn();
    const handleTransferCompleted = vi.fn();

    render(
      <FundWalletModal
        open={true}
        onOpenChange={handleOpenChange}
        accountDetails={mockActiveAccount}
        onTransferCompleted={handleTransferCompleted}
      />
    );

    await user.click(screen.getByRole("button", { name: /proceed to transfer/i }));

    const completeBtn = screen.getByRole("button", {
      name: /i have completed transfer/i,
    });
    await user.click(completeBtn);

    expect(handleOpenChange).toHaveBeenCalledWith(false);
    expect(handleTransferCompleted).toHaveBeenCalled();
  });

  it("renders the generation prompt when accountDetails is null or empty", () => {
    render(
      <FundWalletModal
        open={true}
        onOpenChange={vi.fn()}
        accountDetails={null}
      />
    );

    expect(screen.getByText("No Dedicated Account Details Yet")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /generate account details/i })
    ).toBeInTheDocument();
    expect(screen.queryByText(/proceed to transfer/i)).not.toBeInTheDocument();
  });

  it("renders generation prompt when accountDetails has empty strings", () => {
    render(
      <FundWalletModal
        open={true}
        onOpenChange={vi.fn()}
        accountDetails={{
          account_name: "",
          account_number: "",
          bank_name: "",
          currency: "NGN",
          assigned_at: "",
        }}
      />
    );

    expect(screen.getByText("No Dedicated Account Details Yet")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /generate account details/i })
    ).toBeInTheDocument();
  });

  it("generates dedicated account on button click and immediately transitions to Step 1", async () => {
    const user = userEvent.setup();
    const handleAccountGenerated = vi.fn();

    vi.mocked(customerApi.generateDedicatedAccount).mockResolvedValueOnce({
      account: {
        id: "01JCNEWACCULID01",
        provider: "finitypay",
        account_reference: "va_new123",
        bank_name: "Paga",
        bank_code: "100002",
        account_number: "9988776655",
        account_name: "KORAK / Collins",
        status: "active",
        created_at: new Date().toISOString(),
      },
      meta: { has_account: true, created: true },
    });

    render(
      <FundWalletModal
        open={true}
        onOpenChange={vi.fn()}
        accountDetails={null}
        onAccountGenerated={handleAccountGenerated}
      />
    );

    const generateBtn = screen.getByRole("button", { name: /generate account details/i });
    await user.click(generateBtn);

    await waitFor(() => {
      expect(customerApi.generateDedicatedAccount).toHaveBeenCalled();
      expect(handleAccountGenerated).toHaveBeenCalled();
      expect(screen.getByText(/Step 1 of 2: Amount & Fees/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /proceed to transfer/i })).toBeInTheDocument();
    });
  });
});
