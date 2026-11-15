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

  it("renders network selector, plan type tabs, and data bundle options", () => {
    render(<DataPurchaseForm walletBalance={500000} />);

    expect(screen.getByTestId("data-purchase-card")).toBeInTheDocument();
    expect(screen.getByText("Buy Data Bundles")).toBeInTheDocument();
    expect(screen.getByText("MTN")).toBeInTheDocument();
    expect(screen.getByText("AIRTEL")).toBeInTheDocument();
    expect(screen.getByText("GLO")).toBeInTheDocument();
    expect(screen.getByText("9MOBILE")).toBeInTheDocument();

    // Plan type tabs
    expect(screen.getByText("SME Data")).toBeInTheDocument();
    expect(screen.getByText("Corporate Gifting")).toBeInTheDocument();

    // Default MTN SME 1.0GB package card should be rendered
    expect(screen.getByText("MTN SME 1.0GB")).toBeInTheDocument();
  });

  it("switches network and filters available data bundles", async () => {
    const user = userEvent.setup();
    render(<DataPurchaseForm walletBalance={500000} />);

    // Click Airtel
    const airtelBtn = screen.getByRole("button", { name: /AIRTEL/i });
    await user.click(airtelBtn);

    // Switch to Corporate Gifting
    await user.click(screen.getByText("Corporate Gifting"));

    // Should display Airtel packages
    expect(screen.getByText("Airtel CG 1.0GB")).toBeInTheDocument();
  });

  it("auto-detects network from phone number prefix", async () => {
    const user = userEvent.setup();
    render(<DataPurchaseForm walletBalance={500000} />);

    const phoneInput = screen.getByPlaceholderText("08031234567");
    // Type Glo prefix 0805
    await user.type(phoneInput, "08051234567");

    const gloButton = screen.getByRole("button", { name: /GLO/i });
    expect(gloButton).toHaveAttribute("aria-pressed", "true");
  });

  it("disables order review if wallet balance is insufficient", async () => {
    const user = userEvent.setup();
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
    expect(screen.getByText("Package:")).toBeInTheDocument();

    // Confirm order
    const payBtn = screen.getByRole("button", { name: /Pay ₦320/i });
    await user.click(payBtn);

    await waitFor(() => {
      expect(dataApi.purchaseData).toHaveBeenCalledWith({
        network: "mtn",
        plan_id: "mtn_sme_1gb",
        phone: "08031234567",
      });
      expect(handleOrderCompleted).toHaveBeenCalled();
    });

    // Success card appears
    expect(screen.getByTestId("data-success-card")).toBeInTheDocument();
    expect(screen.getByText("Data Bundle Credited")).toBeInTheDocument();
    expect(screen.getByText("DAT-20261115-9988")).toBeInTheDocument();
  });
});
