import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { AirtimePurchaseForm } from "./AirtimePurchaseForm";
import * as airtimeApi from "./api";

vi.mock("./api", async (importOriginal) => {
  const actual = await importOriginal<typeof airtimeApi>();
  return {
    ...actual,
    getSupportedAirtimeNetworks: vi.fn().mockResolvedValue(actual.TELECOM_NETWORKS),
    purchaseAirtime: vi.fn(),
  };
});

describe("AirtimePurchaseForm (F16.1 & F16.4 & Integration Guide)", () => {
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

  it("validates form, opens confirmation modal, and submits order (Case A: completed)", async () => {
    const user = userEvent.setup();
    const handleOrderCompleted = vi.fn();

    vi.mocked(airtimeApi.purchaseAirtime).mockResolvedValueOnce({
      order_id: "ord_101",
      reference: "BIL-A1B2C3D4E5F6",
      network: "mtn",
      phone: "08031234567",
      amount: 500,
      discount: 0,
      final_amount: 500,
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
    expect(screen.getByText("Total to Pay:")).toBeInTheDocument();

    // Click pay in dialog (exact 100% nominal price: 500)
    const payButton = screen.getByRole("button", { name: /Pay ₦500/i });
    await user.click(payButton);

    await waitFor(() => {
      expect(airtimeApi.purchaseAirtime).toHaveBeenCalled();
      expect(handleOrderCompleted).toHaveBeenCalled();
    });

    // Success card appears
    expect(screen.getByTestId("airtime-success-card")).toBeInTheDocument();
    expect(screen.getByText(/Airtime Purchase Successful/i)).toBeInTheDocument();
    expect(screen.getByText(/BIL-A1B2C3D4E5F6/)).toBeInTheDocument();
  });

  it("displays auto-refund notification when order status is failed (Case C: failed)", async () => {
    const user = userEvent.setup();

    vi.mocked(airtimeApi.purchaseAirtime).mockResolvedValueOnce({
      order_id: "ord_fail_1",
      reference: "BIL-FAILED-999",
      network: "airtel",
      phone: "08021234567",
      amount: 500,
      discount: 0,
      final_amount: 500,
      status: "failed",
      message: "Airtime recharge could not be delivered by the network. Your wallet has been automatically refunded.",
      created_at: new Date().toISOString(),
      auto_refunded: true,
    });

    render(<AirtimePurchaseForm walletBalance={500000} />);

    const phoneInput = screen.getByPlaceholderText("08012345678");
    await user.type(phoneInput, "08021234567");

    const submitBtn = screen.getByRole("button", { name: /Continue to Review/i });
    await user.click(submitBtn);

    const payButton = screen.getByRole("button", { name: /Pay ₦/i });
    await user.click(payButton);

    await waitFor(() => {
      expect(screen.getByTestId("airtime-auto-refund-alert")).toBeInTheDocument();
      expect(
        screen.getByText(/Your wallet has been automatically refunded/i)
      ).toBeInTheDocument();
    });
  });

  it("displays provider processing notice when order status is processing (Case B: processing)", async () => {
    const user = userEvent.setup();

    vi.mocked(airtimeApi.purchaseAirtime).mockResolvedValueOnce({
      order_id: "ord_proc_1",
      reference: "BIL-PROC-888",
      network: "glo",
      phone: "08051234567",
      amount: 500,
      discount: 0,
      final_amount: 500,
      status: "processing",
      message: "Airtime request is processing with the network provider. Your line will be credited shortly.",
      created_at: new Date().toISOString(),
    });

    render(<AirtimePurchaseForm walletBalance={500000} />);

    const phoneInput = screen.getByPlaceholderText("08012345678");
    await user.type(phoneInput, "08051234567");

    const submitBtn = screen.getByRole("button", { name: /Continue to Review/i });
    await user.click(submitBtn);

    const payButton = screen.getByRole("button", { name: /Pay ₦/i });
    await user.click(payButton);

    await waitFor(() => {
      expect(screen.getByTestId("airtime-processing-alert")).toBeInTheDocument();
      expect(
        screen.getByText(/processing with the network provider/i)
      ).toBeInTheDocument();
    });
  });
});
