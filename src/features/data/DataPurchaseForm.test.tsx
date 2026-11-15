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
    expect(screen.getByRole("button", { name: /MTN/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Airtel/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Glo/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /9mobile/i })).toBeInTheDocument();

    // Plan type tabs
    expect(
      screen.getByRole("button", { name: /SME Data/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Corporate Gifting/i })
    ).toBeInTheDocument();

    // Bundle card options (e.g. 1.0 GB)
    expect(
      screen.getByRole("button", { name: /1\.0 GB/i })
    ).toBeInTheDocument();
  });

  it("switches network and filters available data bundles", async () => {
    const user = userEvent.setup();
    render(<DataPurchaseForm walletBalance={500000} />);

    // Click Airtel
    const airtelBtn = screen.getByRole("button", { name: /Airtel/i });
    await user.click(airtelBtn);

    // Switch to Corporate Gifting
    await user.click(
      screen.getByRole("button", { name: /Corporate Gifting/i })
    );

    // Airtel CG 1.0GB is ₦340
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /340/i })
      ).toBeInTheDocument();
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
