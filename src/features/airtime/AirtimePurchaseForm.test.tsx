import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { AirtimePurchaseForm } from "./AirtimePurchaseForm";
import * as airtimeApi from "./api";

vi.mock("./api", async (importOriginal) => {
  const actual = await importOriginal<typeof airtimeApi>();
  return {
    ...actual,
    purchaseAirtime: vi.fn(),
  };
});

describe("AirtimePurchaseForm (F16.1 & F16.4)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the airtime form with recipient carrier, amount grid, and order summary", () => {
    render(<AirtimePurchaseForm walletBalance={500000} />);

    expect(screen.getByTestId("airtime-purchase-card")).toBeInTheDocument();
    expect(screen.getByText("1. Recipient Phone Number & Carrier")).toBeInTheDocument();
    expect(screen.getByText("2. Select Amount")).toBeInTheDocument();
    expect(screen.getByTestId("airtime-order-summary")).toBeInTheDocument();

    // Network selector button
    expect(
      screen.getByRole("button", { name: /select network carrier/i })
    ).toBeInTheDocument();

    // Quick preset amounts
    expect(screen.getByRole("button", { name: "₦100" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "₦500" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "₦1,000" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "₦5,000" })).toBeInTheDocument();
  });

  it("auto-detects network when a Nigerian phone number is entered", async () => {
    const user = userEvent.setup();
    render(<AirtimePurchaseForm walletBalance={500000} />);

    const phoneInput = screen.getByPlaceholderText("08012345678");

    // Type Glo prefix 0805
    await user.type(phoneInput, "08051234567");

    const networkTrigger = screen.getByRole("button", {
      name: /select network carrier/i,
    });
    expect(networkTrigger).toHaveTextContent("Glo");
    expect(screen.getByText("Glo Nigeria")).toBeInTheDocument();
  });

  it("updates order summary values dynamically when amount is selected", async () => {
    const user = userEvent.setup();
    render(<AirtimePurchaseForm walletBalance={500000} />);

    // Select ₦1,000 quick button
    await user.click(screen.getByRole("button", { name: "₦1,000" }));

    // In Order Summary, Airtime Amount should show ₦1,000.00
    expect(screen.getByTestId("summary-airtime-amount")).toHaveTextContent("₦1,000.00");
    expect(screen.getByTestId("summary-total-amount")).toHaveTextContent("₦1,000.00");
  });

  it("disables submission and warns if wallet balance is insufficient", async () => {
    const user = userEvent.setup();
    // Wallet has ₦100 (10000 minor units)
    render(<AirtimePurchaseForm walletBalance={10000} />);

    // Select ₦1,000
    await user.click(screen.getByRole("button", { name: "₦1,000" }));

    expect(screen.getByText(/Insufficient balance/i)).toBeInTheDocument();

    const submitBtn = screen.getByRole("button", { name: /Continue to Review/i });
    expect(submitBtn).toBeDisabled();
  });

  it("validates form, opens confirmation modal, and submits order", async () => {
    const user = userEvent.setup();
    const handleOrderCompleted = vi.fn();

    vi.mocked(airtimeApi.purchaseAirtime).mockResolvedValueOnce({
      order_id: "ord_101",
      reference: "AIR-20261115-1234",
      network: "mtn",
      phone: "08031234567",
      amount: 500,
      discount: 10,
      final_amount: 490,
      status: "completed",
      message: "Airtime of ₦500 sent successfully to 08031234567.",
      created_at: new Date().toISOString(),
    });

    render(
      <AirtimePurchaseForm
        walletBalance={500000}
        onOrderCompleted={handleOrderCompleted}
      />
    );

    const phoneInput = screen.getByPlaceholderText("08012345678");
    await user.type(phoneInput, "08031234567");

    // Click Continue to Review
    const submitBtn = screen.getByRole("button", { name: /Continue to Review/i });
    expect(submitBtn).not.toBeDisabled();
    await user.click(submitBtn);

    // Confirm dialog should be visible
    expect(screen.getByText("Confirm Airtime Purchase")).toBeInTheDocument();
    expect(screen.getByText("Net Wallet Debit:")).toBeInTheDocument();

    // Click pay in dialog (500 - 2% (10) = 490)
    const payButton = screen.getByRole("button", { name: /Pay ₦490/i });
    await user.click(payButton);

    await waitFor(() => {
      expect(airtimeApi.purchaseAirtime).toHaveBeenCalledWith({
        network: "mtn",
        phone: "08031234567",
        amount: 500,
      });
      expect(handleOrderCompleted).toHaveBeenCalled();
    });

    // Success card appears
    expect(screen.getByTestId("airtime-success-card")).toBeInTheDocument();
    expect(screen.getByText(/Airtime Purchase Successful/i)).toBeInTheDocument();
    expect(screen.getByText(/AIR-20261115-1234/)).toBeInTheDocument();
  });
});
