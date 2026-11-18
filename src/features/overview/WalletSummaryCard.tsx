"use client";

import * as React from "react";
import Link from "next/link";
import { Eye, EyeOff, Plus, Wallet, History } from "lucide-react";
import { motion } from "motion/react";
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

      const timeStr = d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      const now = new Date();
      const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
      const startOfTarget = new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate()
      );
      const diffDays = Math.round(
        (startOfToday.getTime() - startOfTarget.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 0) {
        return `today at ${timeStr}`;
      }
      if (diffDays === 1) {
        return `yesterday at ${timeStr}`;
      }

      const dateStr = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        ...(d.getFullYear() !== now.getFullYear() ? { year: "numeric" } : {}),
      });

      return `on ${dateStr} at ${timeStr}`;
    } catch {
      return "today at 10:15 AM";
    }
  }, [wallet.updated_at, isMasked]);

  return (
    <div
      className={cn(
        "bg-primary text-primary-foreground relative flex min-h-[220px] flex-col justify-between overflow-hidden rounded-[10px] p-6 sm:p-7 shadow-xs",
        className
      )}
      data-testid="wallet-summary-card"
    >
      {/* Decorative refined concentric circular watermark */}
      <svg
        className="pointer-events-none absolute -right-10 -bottom-14 h-64 w-64 select-none text-white sm:h-72 sm:w-72"
        viewBox="0 0 300 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <radialGradient
            id="wallet-card-radial"
            cx="150"
            cy="150"
            r="150"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="white" stopOpacity="0.08" />
            <stop offset="60%" stopColor="white" stopOpacity="0.03" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient radial glow */}
        <circle cx="150" cy="150" r="140" fill="url(#wallet-card-radial)" />

        {/* Delicate concentric precision rings */}
        <circle
          cx="150"
          cy="150"
          r="30"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeOpacity="0.16"
        />
        <circle
          cx="150"
          cy="150"
          r="60"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeOpacity="0.13"
        />
        <circle
          cx="150"
          cy="150"
          r="90"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeOpacity="0.10"
        />
        <circle
          cx="150"
          cy="150"
          r="120"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeOpacity="0.07"
        />
        <circle
          cx="150"
          cy="150"
          r="150"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeOpacity="0.05"
        />
        <circle
          cx="150"
          cy="150"
          r="180"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeOpacity="0.03"
        />
      </svg>

      {/* Top Header Row */}
      <div className="relative z-10 flex items-center justify-between gap-3">
        {/* Left: Icon & Label */}
        <div className="flex items-center gap-2">
          <Wallet
            className="size-4 shrink-0 text-white/80"
            strokeWidth={NAV_ICON_STROKE_WIDTH}
            aria-hidden="true"
          />
          <span className="text-xs font-semibold tracking-wider text-white/90 uppercase select-none">
            Available Balance
          </span>
          <span className="sr-only">Wallet Balance</span>
        </div>

        {/* Right: NGN Currency Badge + Visibility Toggle */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-[5px] border border-white/20 bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold tracking-wider text-white select-none backdrop-blur-xs">
            {wallet.currency || "NGN"}
          </span>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleMask}
            aria-label={isMasked ? "Show balance" : "Hide balance"}
            className="h-8 w-8 rounded-[5px] text-white/80 hover:bg-white/15 hover:text-white transition-colors"
          >
            {isMasked ? (
              <EyeOff
                className="size-4"
                strokeWidth={NAV_ICON_STROKE_WIDTH}
                aria-hidden="true"
              />
            ) : (
              <Eye
                className="size-4"
                strokeWidth={NAV_ICON_STROKE_WIDTH}
                aria-hidden="true"
              />
            )}
          </Button>
        </div>
      </div>

      {/* Middle: Current Wallet Balance & Metadata */}
      <div className="relative z-10 my-4 sm:my-5">
        <motion.div
          key={isMasked ? "masked" : "unmasked"}
          variants={MOTION_VARIANTS.balanceMask}
          initial="initial"
          animate="animate"
          className="font-sans text-3xl font-extrabold tracking-tight text-white leading-none sm:text-4xl"
          data-testid="wallet-balance-amount"
        >
          {displayBalance}
        </motion.div>

        {/* Timestamp */}
        <div className="mt-2 text-xs text-white/70">
          <span>Last updated {updatedTimeLabel}</span>
        </div>
      </div>

      {/* Action Buttons: Fund Wallet & History */}
      <div className="relative z-10 flex flex-wrap items-center gap-3">
        {onTopUpClick ? (
          <Button
            type="button"
            onClick={onTopUpClick}
            aria-label="Top up wallet"
            className="text-primary h-9 gap-1.5 rounded-[5px] bg-white px-5 text-xs font-semibold leading-none shadow-none transition-colors hover:bg-white/95 sm:text-sm"
          >
            <Plus
              className="size-4"
              strokeWidth={NAV_ICON_STROKE_WIDTH}
              aria-hidden="true"
            />
            <span>Fund Wallet</span>
          </Button>
        ) : (
          <Button
            asChild
            aria-label="Top up wallet"
            className="text-primary h-9 gap-1.5 rounded-[5px] bg-white px-5 text-xs font-semibold leading-none shadow-none transition-colors hover:bg-white/95 sm:text-sm"
          >
            <Link href={ROUTES.WALLET}>
              <Plus
                className="size-4"
                strokeWidth={NAV_ICON_STROKE_WIDTH}
                aria-hidden="true"
              />
              <span>Fund Wallet</span>
            </Link>
          </Button>
        )}

        <Button
          asChild
          variant="ghost"
          aria-label="View transaction history"
          className="h-9 gap-1.5 rounded-[5px] border border-white/20 bg-white/10 px-4 text-xs font-medium leading-none text-white hover:bg-white/20 hover:text-white sm:text-sm"
        >
          <Link href={ROUTES.TRANSACTIONS}>
            <History
              className="size-3.5 text-white/80"
              strokeWidth={NAV_ICON_STROKE_WIDTH}
              aria-hidden="true"
            />
            <span>History</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
