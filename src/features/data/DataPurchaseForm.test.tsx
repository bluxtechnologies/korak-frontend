import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { DataPurchaseForm } from "./DataPurchaseForm";
import * as dataApi from "./api";

vi.mock("./api", async (importOriginal) => {
  const actual = await importOriginal<typeof dataApi>();
  return {
    ...actual,
    purchaseData: vi.fn(),
  };
});

describe("DataPurchaseForm (F16.2 & F16.4)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders network selector and selected plan card without inline bundle buttons", () => {
    render(<DataPurchaseForm walletBalance={500000} />);

    expect(screen.getByTestId("data-purchase-card")).toBeInTheDocument();
    expect(screen.getByText("Buy Data Bundles")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /MTN/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Airtel/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Glo/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /9mobile/i })).toBeInTheDocument();

    // Prominent selected plan card with Change Plan action
    expect(screen.getByRole("button", { name: /Change Plan/i })).toBeInTheDocument();
    expect(screen.getByText(/MTN SME 1\.0GB/i)).toBeInTheDocument();

    // Inline quick select and plan grid are removed from main page
    expect(screen.queryByLabelText(/Or quick select:/i)).not.toBeInTheDocument();
  });

  it("opens data plan modal on Change Plan click and selects a plan", async () => {
    const user = userEvent.setup();
    render(<DataPurchaseForm walletBalance={500000} />);

    // Click Change Plan to open modal
    const changePlanBtn = screen.getByRole("button", { name: /Change Plan/i });
    await user.click(changePlanBtn);

    // Modal dialog is open
    expect(
      screen.getByRole("heading", { name: /Select MTN Nigeria Data Plan/i })
    ).toBeInTheDocument();

    // Select a plan in modal (e.g. MTN SME 5.0GB)
    const fiveGbPlan = screen.getByRole("button", { name: /MTN SME 5\.0GB/i });
    await user.click(fiveGbPlan);

    // Modal closes and main page updates to the selected plan
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(screen.getByText(/MTN SME 5\.0GB/i)).toBeInTheDocument();
    });
  });

  it("auto-detects network from phone number prefix", async () => {
    const user = userEvent.setup();
    render(<DataPurchaseForm walletBalance={500000} />);

    const phoneInput = screen.getByPlaceholderText("08031234567");
    // Type Glo prefix 0805
    await user.type(phoneInput, "08051234567");

    const gloButton = screen.getByRole("button", { name: /Glo/i });
    expect(gloButton).toHaveAttribute("aria-pressed", "true");
  });

  it("disables order review if wallet balance is insufficient", async () => {
    // ₦100 wallet balance (10000 minor units), while cheapest MTN bundle is ₦175
    render(<DataPurchaseForm walletBalance={10000} />);

    expect(
      screen.getByText(/Insufficient wallet balance/i)
    ).toBeInTheDocument();

    const submitBtn = screen.getByRole("button", { name: /Review Order/i });
    expect(submitBtn).toBeDisabled();
  });

  it("validates phone, opens confirmation modal, and completes data purchase", async () => {
    const user = userEvent.setup();
    const handleOrderCompleted = vi.fn();

    vi.mocked(dataApi.purchaseData).mockResolvedValueOnce({
      order_id: "ord_dat_202",
      reference: "DAT-20261115-9988",
      network: "mtn",
      plan_name: "MTN SME 1.0GB",
      size: "1.0 GB",
      phone: "08031234567",
      amount: 320,
      status: "completed",
      message: "MTN SME 1.0GB (1.0 GB) successfully credited.",
      created_at: new Date().toISOString(),
      auto_refunded: false,
    });

    render(
      <DataPurchaseForm
        walletBalance={500000}
        onOrderCompleted={handleOrderCompleted}
      />
    );

    const phoneInput = screen.getByPlaceholderText("08031234567");
    await user.type(phoneInput, "08031234567");

    // Click Review Order
    await user.click(screen.getByRole("button", { name: /Review Order/i }));

    // Confirm dialog should open
    expect(screen.getByText("Confirm Data Purchase")).toBeInTheDocument();
    expect(screen.getByText("Bundle:")).toBeInTheDocument();

    // Confirm order
    const payBtn = screen.getByRole("button", { name: /Pay ₦320/i });
    await user.click(payBtn);

    await waitFor(() => {
      expect(dataApi.purchaseData).toHaveBeenCalledWith(
        expect.objectContaining({
          network: "mtn",
          plan_id: "mtn_sme_1gb",
          phone: "08031234567",
        })
      );
      expect(handleOrderCompleted).toHaveBeenCalled();
    });

    // Success card appears
    expect(screen.getByTestId("data-success-card")).toBeInTheDocument();
    expect(screen.getByText(/Data Bundle Credited/i)).toBeInTheDocument();
    expect(screen.getByText(/DAT-20261115-9988/)).toBeInTheDocument();
  });

  it("displays auto-refund alert when purchase has failed status", async () => {
    const user = userEvent.setup();

    vi.mocked(dataApi.purchaseData).mockResolvedValueOnce({
      order_id: "ord_dat_fail",
      reference: "DAT-FAIL-1122",
      network: "mtn",
      plan_name: "MTN SME 1.0GB",
      size: "1.0 GB",
      phone: "08031234567",
      amount: 320,
      status: "failed",
      message: "Data bundle delivery could not be completed by the network. Your wallet has been automatically refunded.",
      created_at: new Date().toISOString(),
      auto_refunded: true,
    });

    render(<DataPurchaseForm walletBalance={500000} />);

    const phoneInput = screen.getByPlaceholderText("08031234567");
    await user.type(phoneInput, "08031234567");

    await user.click(screen.getByRole("button", { name: /Review Order/i }));
    await user.click(screen.getByRole("button", { name: /Pay ₦320/i }));

    await waitFor(() => {
      expect(screen.getByTestId("data-auto-refund-alert")).toBeInTheDocument();
      expect(
        screen.getByText(/Your wallet has been automatically refunded/i)
      ).toBeInTheDocument();
    });
  });

  it("displays processing alert when purchase has processing status", async () => {
    const user = userEvent.setup();

    vi.mocked(dataApi.purchaseData).mockResolvedValueOnce({
      order_id: "ord_dat_proc",
      reference: "DAT-PROC-3344",
      network: "mtn",
      plan_name: "MTN SME 1.0GB",
      size: "1.0 GB",
      phone: "08031234567",
      amount: 320,
      status: "processing",
      message: "Data bundle request is processing with the network provider. Your line will be credited shortly.",
      created_at: new Date().toISOString(),
      auto_refunded: false,
    });

    render(<DataPurchaseForm walletBalance={500000} />);

    const phoneInput = screen.getByPlaceholderText("08031234567");
    await user.type(phoneInput, "08031234567");

    await user.click(screen.getByRole("button", { name: /Review Order/i }));
    await user.click(screen.getByRole("button", { name: /Pay ₦320/i }));

    await waitFor(() => {
      expect(screen.getByTestId("data-processing-alert")).toBeInTheDocument();
      expect(
        screen.getByText(/processing with the network provider/i)
      ).toBeInTheDocument();
    });
  });

  it("handles 422 insufficient balance and displays deposit prompt", async () => {
    const user = userEvent.setup();

    vi.mocked(dataApi.purchaseData).mockRejectedValueOnce({
      status: 422,
      code: "insufficient_balance",
      message: "Insufficient wallet balance for this purchase.",
    });

    render(<DataPurchaseForm walletBalance={500000} />);

    const phoneInput = screen.getByPlaceholderText("08031234567");
    await user.type(phoneInput, "08031234567");

    await user.click(screen.getByRole("button", { name: /Review Order/i }));
    await user.click(screen.getByRole("button", { name: /Pay ₦320/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Insufficient wallet balance for this purchase/i)
      ).toBeInTheDocument();
    });
  });
});
