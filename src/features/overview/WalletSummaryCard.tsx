"use client";

import * as React from "react";
import Link from "next/link";
import { Eye, EyeOff, Plus, ArrowRight, Wallet, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/navigation";
import { formatCurrency, maskCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { WalletSummary } from "./api";

export interface WalletSummaryCardProps {
  wallet: WalletSummary;
  /** Optional callback when user clicks Top Up */
  onTopUpClick?: () => void;
  className?: string;
}

/**
 * WalletSummaryCard (F12.2).
 * Displays customer wallet balance with solid brand burgundy card layout,
 * concentric circle vector watermark, privacy mask toggle, and fast top-up action.
 */
export function WalletSummaryCard({
  wallet,
  onTopUpClick,
  className,
}: WalletSummaryCardProps) {
  const [isMasked, setIsMasked] = React.useState(false);

  const toggleMask = () => {
    setIsMasked((prev) => !prev);
  };

  const displayBalance = isMasked
    ? maskCurrency(wallet.currency)
    : formatCurrency(wallet.balance, wallet.currency);

  // Approximate USD equivalent based on minor units (kobo) and nominal rate
  const balanceInMajor = wallet.balance / 100;
  const estimatedUsd = isMasked
    ? "••••"
    : (balanceInMajor / 1500).toFixed(2);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-[#7A1F3D] p-6 text-white shadow-md dark:bg-[#5C142B]",
        className
      )}
      data-testid="wallet-summary-card"
    >
      {/* Decorative concentric circular watermark on bottom right */}
      <svg
        className="pointer-events-none absolute -bottom-10 -right-8 h-56 w-56 text-white/10"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="100" cy="100" r="35" stroke="currentColor" strokeWidth="12" />
        <circle cx="100" cy="100" r="65" stroke="currentColor" strokeWidth="12" />
        <circle cx="100" cy="100" r="95" stroke="currentColor" strokeWidth="12" />
      </svg>

      {/* Top Header Row */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white/90">
          <Wallet className="size-4 shrink-0 text-white/80" aria-hidden="true" />
          <span className="text-xs sm:text-sm font-medium">Available Balance</span>
          {/* Accessible label for screen readers and unit tests */}
          <span className="sr-only">Wallet Balance</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Currency pill indicator */}
          <div className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-xs">
            <span>{wallet.currency || "NGN"}</span>
            <ChevronDown className="size-3 text-white/70" aria-hidden="true" />
          </div>

          {/* Privacy mask toggle */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleMask}
            aria-label={isMasked ? "Show balance" : "Hide balance"}
            className="h-7 w-7 text-white/80 hover:bg-white/15 hover:text-white"
          >
            {isMasked ? (
              <Eye className="size-4" aria-hidden="true" />
            ) : (
              <EyeOff className="size-4" aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>

      {/* Main Balance Row */}
      <div className="relative z-10 mt-6 sm:mt-8">
        <div
          className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
          data-testid="wallet-balance-amount"
        >
          {displayBalance}
        </div>
        <p className="mt-1 text-xs text-white/70">
          ≈ ${estimatedUsd} USD (Estimated equivalent)
        </p>
        {/* Accessible ledger description for screen readers and test suite */}
        <span className="sr-only">
          {wallet.ledger_count > 0
            ? `${wallet.ledger_count} recorded ledger events`
            : "No transaction entries yet"}
        </span>
      </div>

      {/* Action Buttons Row */}
      <div className="relative z-10 mt-6 flex flex-wrap items-center gap-3 sm:mt-8">
        {onTopUpClick ? (
          <Button
            type="button"
            onClick={onTopUpClick}
            aria-label="Top up wallet"
            className="h-9 gap-1.5 rounded-full bg-white px-4 text-xs font-semibold text-[#7A1F3D] shadow-sm hover:bg-white/90"
          >
            <Plus className="size-3.5" aria-hidden="true" />
            <span>+ Add Money</span>
          </Button>
        ) : (
          <Button
            asChild
            aria-label="Top up wallet"
            className="h-9 gap-1.5 rounded-full bg-white px-4 text-xs font-semibold text-[#7A1F3D] shadow-sm hover:bg-white/90"
          >
            <Link href={ROUTES.TRANSACTIONS}>
              <Plus className="size-3.5" aria-hidden="true" />
              <span>+ Add Money</span>
            </Link>
          </Button>
        )}

        <Button
          asChild
          variant="ghost"
          className="h-9 gap-1 rounded-full px-3 text-xs font-medium text-white/90 hover:bg-white/10 hover:text-white"
        >
          <Link href={ROUTES.TRANSACTIONS}>
            <span>View Wallet</span>
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
