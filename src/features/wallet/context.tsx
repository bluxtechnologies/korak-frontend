"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { customerApi } from "@/lib/api/customer";
import { formatCurrency } from "@/lib/formatters";
import type { Wallet } from "@/lib/api/types";

export interface WalletContextValue {
  wallet: Wallet | null;
  balance: number; // in minor units / kobo (e.g. 10000 = ₦100.00)
  balanceFormatted: string; // e.g. "₦100.00"
  currency: string;
  isLoading: boolean;
  refreshWallet: () => Promise<void>;
  setWallet: React.Dispatch<React.SetStateAction<Wallet | null>>;
}

const WalletContext = React.createContext<WalletContextValue | null>(null);

export const WALLET_UPDATED_EVENT = "wallet:updated";

/**
 * Dispatches a global event instructing the WalletProvider to refresh
 * the wallet balance from the backend (e.g. after funding or purchase).
 */
export function notifyWalletUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(WALLET_UPDATED_EVENT));
  }
}

export interface WalletProviderProps {
  children: React.ReactNode;
  initialWallet?: Wallet | null;
}

/**
 * WalletProvider (Doc 14 & Doc 25 §2).
 * Provides centralized, live wallet state to the Topbar and dashboard views.
 *
 * Synchronizes automatically:
 * 1. On mount (hydrates from server initialWallet or live API).
 * 2. On navigation (re-fetches when pathname changes).
 * 3. On focus (re-fetches when customer switches back to the tab, e.g. after bank transfer).
 * 4. On global event "wallet:updated" (when an order completes or funding is initiated).
 */
export function WalletProvider({
  children,
  initialWallet = null,
}: WalletProviderProps) {
  const [wallet, setWallet] = React.useState<Wallet | null>(initialWallet);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const pathname = usePathname();
  const prevPathnameRef = React.useRef<string | null>(null);

  // If initialWallet updates from SSR / parent props, sync state
  React.useEffect(() => {
    if (initialWallet) {
      setWallet(initialWallet);
    }
  }, [initialWallet]);

  const refreshWallet = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await customerApi.getWallet();
      if (data && typeof data.balance === "number") {
        setWallet(data);
      }
    } catch {
      // Non-blocking: keep existing wallet state if network fails
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount if no initial wallet
  React.useEffect(() => {
    if (!initialWallet) {
      refreshWallet();
    }
  }, [initialWallet, refreshWallet]);

  // Re-fetch only when pathname actually changes (subsequent navigations)
  React.useEffect(() => {
    if (prevPathnameRef.current !== null && prevPathnameRef.current !== pathname) {
      refreshWallet();
    }
    prevPathnameRef.current = pathname;
  }, [pathname, refreshWallet]);

  // Listen to custom updates and window focus
  React.useEffect(() => {
    const handleUpdate = () => {
      refreshWallet();
    };

    window.addEventListener(WALLET_UPDATED_EVENT, handleUpdate);
    window.addEventListener("focus", handleUpdate);

    return () => {
      window.removeEventListener(WALLET_UPDATED_EVENT, handleUpdate);
      window.removeEventListener("focus", handleUpdate);
    };
  }, [refreshWallet]);

  const balance = wallet?.balance ?? 0;
  const currency = wallet?.currency ?? "NGN";
  const balanceFormatted = React.useMemo(
    () => formatCurrency(balance, currency),
    [balance, currency]
  );

  const value = React.useMemo<WalletContextValue>(
    () => ({
      wallet,
      balance,
      balanceFormatted,
      currency,
      isLoading,
      refreshWallet,
      setWallet,
    }),
    [wallet, balance, balanceFormatted, currency, isLoading, refreshWallet]
  );

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

/**
 * Accesses the live wallet context. Throws if rendered outside WalletProvider.
 */
export function useWallet(): WalletContextValue {
  const context = React.useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}

/**
 * Safe accessor for components that may be rendered outside WalletProvider.
 */
export function useOptionalWallet(): WalletContextValue | null {
  return React.useContext(WalletContext);
}
