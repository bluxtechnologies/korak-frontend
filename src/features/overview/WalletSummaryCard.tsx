"use client";

import * as React from "react";
import Link from "next/link";
import { Eye, EyeOff, Plus, Clock, Wallet } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { NAV_ICON_STROKE_WIDTH, ROUTES } from "@/config/navigation";
import { formatCurrency, maskCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { MOTION_VARIANTS } from "@/lib/motion";
import type { WalletSummary } from "./api";

export interface WalletSummaryCardProps {
  wallet: WalletSummary;
  /** Optional callback when user clicks Top Up */
  onTopUpClick?: () => void;
  className?: string;
}

/**
 * WalletSummaryCard.
 * Clean, fintech-style KORAK burgundy balance card with white typography,
 * balance visibility toggle, last updated timestamp, Add Money and View Wallet actions.
 *
 * Design system rules (Doc 05):
 * - 10px radius (rounded-md), no pill shapes.
 * - Primary burgundy token (bg-primary).
 * - Lucide icons with locked 1.75 stroke width.
 * - Near-zero shadows.
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

  const updatedTimeLabel = React.useMemo(() => {
    if (isMasked) return "••••";
    if (!wallet.updated_at) return "today at 10:15 AM";
    try {
      const d = new Date(wallet.updated_at);
      if (isNaN(d.getTime())) return "today at 10:15 AM";
      return d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "today at 10:15 AM";
    }
  }, [wallet.updated_at, isMasked]);

  return (
    <div
      className={cn(
        "bg-primary text-primary-foreground relative flex min-h-[220px] flex-col justify-between overflow-hidden rounded-md p-6 sm:p-7",
        className
      )}
      data-testid="wallet-summary-card"
    >
      {/* Decorative concentric circular watermark */}
      <svg
        className="pointer-events-none absolute -right-6 -bottom-8 h-48 w-48 text-white/5 sm:h-56 sm:w-56"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle
          cx="100"
          cy="100"
          r="40"
          stroke="currentColor"
          strokeWidth="10"
        />
        <circle
          cx="100"
          cy="100"
          r="70"
          stroke="currentColor"
          strokeWidth="10"
        />
        <circle
          cx="100"
          cy="100"
          r="100"
          stroke="currentColor"
          strokeWidth="10"
        />
      </svg>

      {/* Top Header Row */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet
            className="size-4 shrink-0 text-white/80"
            strokeWidth={NAV_ICON_STROKE_WIDTH}
            aria-hidden="true"
          />
          <span className="text-xs font-medium tracking-wider text-white/90 uppercase">
            Available Balance
          </span>
          <span className="sr-only">Wallet Balance</span>
          <span className="rounded-sm border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white">
            {wallet.currency || "NGN"}
          </span>
        </div>

        {/* Visibility Toggle */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={toggleMask}
          aria-label={isMasked ? "Show balance" : "Hide balance"}
          className="h-8 w-8 rounded-md text-white/80 hover:bg-white/15 hover:text-white"
        >
          {isMasked ? (
            <EyeOff className="size-4" strokeWidth={NAV_ICON_STROKE_WIDTH} aria-hidden="true" />
          ) : (
            <Eye className="size-4" strokeWidth={NAV_ICON_STROKE_WIDTH} aria-hidden="true" />
          )}
        </Button>
      </div>

      {/* Current Wallet Balance & Last Updated */}
      <div className="relative z-10 my-4 sm:my-5">
        <motion.div
          key={isMasked ? "masked" : "unmasked"}
          variants={MOTION_VARIANTS.balanceMask}
          initial="initial"
          animate="animate"
          className="font-sans text-3xl font-bold tracking-tight text-white sm:text-4xl"
          data-testid="wallet-balance-amount"
        >
          {displayBalance}
        </motion.div>
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-white/70">
          <Clock className="size-3.5 text-white/60" strokeWidth={NAV_ICON_STROKE_WIDTH} aria-hidden="true" />
          <span>Last updated at {updatedTimeLabel}</span>
        </p>
        <span className="sr-only">
          {wallet.ledger_count > 0
            ? `${wallet.ledger_count} recorded ledger events`
            : "No transaction entries yet"}
        </span>
      </div>

      {/* Action Buttons: Add Money & View Wallet */}
      <div className="relative z-10 flex flex-wrap items-center gap-3">
        {onTopUpClick ? (
          <Button
            type="button"
            onClick={onTopUpClick}
            aria-label="Top up wallet"
            className="text-primary h-9 gap-1.5 rounded-md bg-white px-5 text-xs font-semibold transition-colors hover:bg-white/90 sm:text-sm"
          >
            <Plus className="size-4" strokeWidth={NAV_ICON_STROKE_WIDTH} aria-hidden="true" />
            <span>Add Money</span>
          </Button>
        ) : (
          <Button
            asChild
            aria-label="Top up wallet"
            className="text-primary h-9 gap-1.5 rounded-md bg-white px-5 text-xs font-semibold transition-colors hover:bg-white/90 sm:text-sm"
          >
            <Link href={ROUTES.WALLET}>
              <Plus className="size-4" strokeWidth={NAV_ICON_STROKE_WIDTH} aria-hidden="true" />
              <span>Add Money</span>
            </Link>
          </Button>
        )}

        <Button
          asChild
          variant="ghost"
          className="h-9 rounded-md border border-white/20 bg-white/10 px-4 text-xs font-medium text-white hover:bg-white/20 hover:text-white sm:text-sm"
        >
          <Link href={ROUTES.WALLET}>
            <span>View Wallet</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
