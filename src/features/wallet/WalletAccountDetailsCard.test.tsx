import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { WalletAccountDetailsCard } from "./WalletAccountDetailsCard";
import { customerApi } from "@/lib/api/customer";

vi.mock("@/lib/api/customer", () => ({
  customerApi: {
    generateDedicatedAccount: vi.fn(),
  },
}));

describe("WalletAccountDetailsCard Component (Doc 25 §8.3)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockActiveAccount = {
    account_name: "COFINANCE / John Doe",
    account_number: "7892341201",
    bank_name: "Wema Bank",
    currency: "NGN",
    assigned_at: "2026-11-18T00:30:00Z",
  };

  it("renders active account details when account is present", () => {
    render(<WalletAccountDetailsCard accountDetails={mockActiveAccount} />);

    expect(screen.getByText("Wallet Account Details")).toBeInTheDocument();
    expect(screen.getByText("COFINANCE / John Doe")).toBeInTheDocument();
    expect(screen.getByText("7892341201")).toBeInTheDocument();
    expect(screen.getByText("Wema Bank")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /copy account number/i })).toBeInTheDocument();
  });

  it("renders unassigned CTA when hasAccount is false", () => {
    render(
      <WalletAccountDetailsCard
        accountDetails={null}
        hasAccount={false}
        requiresPhone={true}
      />
    );

    expect(screen.getByText("Instant Bank Transfer Deposit")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("08012345678")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /generate account details/i })
    ).toBeInTheDocument();
  });

  it("generates dedicated account on button click", async () => {
    const user = userEvent.setup();
    const handleSuccess = vi.fn();

    vi.mocked(customerApi.generateDedicatedAccount).mockResolvedValueOnce({
      account: {
        id: "01JCNEWACCULID01",
        provider: "finitypay",
        account_reference: "va_new123",
        bank_name: "Wema Bank",
        bank_code: "035",
        account_number: "9988776655",
        account_name: "COFINANCE / John Doe",
        status: "active",
        created_at: new Date().toISOString(),
      },
      meta: { has_account: true, created: true },
    });

    render(
      <WalletAccountDetailsCard
        accountDetails={null}
        hasAccount={false}
        requiresPhone={true}
        onGenerateSuccess={handleSuccess}
      />
    );

    const phoneInput = screen.getByPlaceholderText("08012345678");
    await user.type(phoneInput, "08012345678");

    const generateBtn = screen.getByRole("button", { name: /generate account details/i });
    await user.click(generateBtn);

    expect(customerApi.generateDedicatedAccount).toHaveBeenCalledWith({
      phone: "08012345678",
    });

    // After success, it transitions to active card state
    expect(await screen.findByText("9988776655")).toBeInTheDocument();
    expect(handleSuccess).toHaveBeenCalled();
  });
});
