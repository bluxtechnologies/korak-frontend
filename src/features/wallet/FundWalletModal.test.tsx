import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { FundWalletModal } from "./FundWalletModal";
import { customerApi } from "@/lib/api/customer";

vi.mock("@/lib/api/customer", () => ({
  customerApi: {
    generateDedicatedAccount: vi.fn(),
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

  it("renders active account details when a valid account is provided", () => {
    render(
      <FundWalletModal
        open={true}
        onOpenChange={vi.fn()}
        accountDetails={mockActiveAccount}
      />
    );

    expect(screen.getByText("Fund Your Wallet")).toBeInTheDocument();
    expect(screen.getByText("Wema Bank")).toBeInTheDocument();
    expect(screen.getByText("7892341201")).toBeInTheDocument();
    expect(screen.getByText("KORAK / Collins Obaseki")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /i have transferred/i })).toBeInTheDocument();
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
    expect(screen.queryByText(/i have transferred/i)).not.toBeInTheDocument();
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

  it("generates dedicated account on button click and displays new details", async () => {
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
      expect(screen.getByText("9988776655")).toBeInTheDocument();
      expect(screen.getByText("Paga")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /i have transferred/i })).toBeInTheDocument();
    });
  });
});
