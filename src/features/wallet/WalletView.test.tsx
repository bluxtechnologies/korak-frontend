import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { WalletView } from "./WalletView";
import { MOCK_WALLET_PAGE_DATA } from "./api";

describe("WalletView Component", () => {
  it("renders wallet page title, available balance, and converted subtitle", () => {
    render(<WalletView initialData={MOCK_WALLET_PAGE_DATA} />);

    expect(screen.getByTestId("wallet-view")).toBeInTheDocument();
    expect(screen.getByText("Available Balance")).toBeInTheDocument();
    expect(screen.getByTestId("wallet-large-balance")).toHaveTextContent("₦45,250.00");
    expect(screen.getByText(/≈ \$30\.17 USD/i)).toBeInTheDocument();
    expect(screen.getByText(/Last updated today at/i)).toBeInTheDocument();
  });

  it("masks balance when clicking privacy eye toggle button", async () => {
    const user = userEvent.setup();
    render(<WalletView initialData={MOCK_WALLET_PAGE_DATA} />);

    const hideButton = screen.getByRole("button", { name: /hide balance/i });
    await user.click(hideButton);

    expect(screen.getByTestId("wallet-large-balance")).toHaveTextContent("₦••••••");

    const showButton = screen.getByRole("button", { name: /show balance/i });
    await user.click(showButton);

    expect(screen.getByTestId("wallet-large-balance")).toHaveTextContent("₦45,250.00");
  });

  it("filters transactions when clicking filter pills", async () => {
    const user = userEvent.setup();
    render(<WalletView initialData={MOCK_WALLET_PAGE_DATA} />);

    // Click Money In filter pill
    const moneyInPill = screen.getByRole("button", { name: /money in/i });
    await user.click(moneyInPill);

    // Click Money Out filter pill
    const moneyOutPill = screen.getByRole("button", { name: /money out/i });
    await user.click(moneyOutPill);

    // Click All filter pill
    const allPill = screen.getByRole("button", { name: /all \(/i });
    await user.click(allPill);
  });

  it("renders wallet account details card with account number", () => {
    render(<WalletView initialData={MOCK_WALLET_PAGE_DATA} />);

    expect(screen.getByText("Wallet Account Details")).toBeInTheDocument();
    expect(screen.getByText("2603521256")).toBeInTheDocument();
    expect(screen.getByText("Paga")).toBeInTheDocument();
  });

  it("opens fund wallet modal when clicking Add Money", async () => {
    const user = userEvent.setup();
    render(<WalletView initialData={MOCK_WALLET_PAGE_DATA} />);

    const addMoneyBtn = screen.getByRole("button", { name: /\+ add money/i });
    await user.click(addMoneyBtn);

    expect(screen.getByText("Fund Your Wallet")).toBeInTheDocument();
  });
});
