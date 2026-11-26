import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import { WalletProvider, useWallet, notifyWalletUpdated } from "./context";
import { customerApi } from "@/lib/api/customer";
import type { Wallet } from "@/lib/api/types";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/overview",
}));

// Mock customerApi
vi.mock("@/lib/api/customer", () => ({
  customerApi: {
    getWallet: vi.fn(),
  },
}));

const mockWalletInitial: Wallet = {
  id: "w_001",
  balance: 10000, // ₦100.00
  currency: "NGN",
  balance_formatted: "100.00",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

const mockWalletUpdated: Wallet = {
  id: "w_001",
  balance: 500000, // ₦5,000.00
  currency: "NGN",
  balance_formatted: "5000.00",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

function TestWalletConsumer() {
  const { balanceFormatted, balance, currency, refreshWallet } = useWallet();
  return (
    <div>
      <span data-testid="wallet-formatted">{balanceFormatted}</span>
      <span data-testid="wallet-raw">{balance}</span>
      <span data-testid="wallet-currency">{currency}</span>
      <button type="button" onClick={() => refreshWallet()} data-testid="refresh-btn">
        Refresh
      </button>
    </div>
  );
}

describe("WalletContext & WalletProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with initialWallet data immediately without waiting for API", () => {
    render(
      <WalletProvider initialWallet={mockWalletInitial}>
        <TestWalletConsumer />
      </WalletProvider>
    );

    expect(screen.getByTestId("wallet-formatted")).toHaveTextContent("₦100.00");
    expect(screen.getByTestId("wallet-raw")).toHaveTextContent("10000");
    expect(screen.getByTestId("wallet-currency")).toHaveTextContent("NGN");
  });

  it("fetches wallet from customerApi when initialWallet is not provided", async () => {
    vi.mocked(customerApi.getWallet).mockResolvedValueOnce(mockWalletInitial);

    render(
      <WalletProvider>
        <TestWalletConsumer />
      </WalletProvider>
    );

    await waitFor(() => {
      expect(customerApi.getWallet).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId("wallet-formatted")).toHaveTextContent("₦100.00");
    });
  });

  it("updates balance when notifyWalletUpdated event is dispatched", async () => {
    vi.mocked(customerApi.getWallet).mockResolvedValueOnce(mockWalletUpdated);

    render(
      <WalletProvider initialWallet={mockWalletInitial}>
        <TestWalletConsumer />
      </WalletProvider>
    );

    expect(screen.getByTestId("wallet-formatted")).toHaveTextContent("₦100.00");

    await act(async () => {
      notifyWalletUpdated();
    });

    await waitFor(() => {
      expect(customerApi.getWallet).toHaveBeenCalled();
      expect(screen.getByTestId("wallet-formatted")).toHaveTextContent("₦5,000.00");
    });
  });

  it("throws error when useWallet is accessed outside of WalletProvider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestWalletConsumer />)).toThrow(
      "useWallet must be used within a WalletProvider"
    );
    spy.mockRestore();
  });
});
