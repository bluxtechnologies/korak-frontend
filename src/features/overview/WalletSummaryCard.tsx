"use client";

import * as React from "react";
import Link from "next/link";
import { Eye, EyeOff, PlusCircle, ArrowUpRight, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/config/navigation";
import { formatCurrency, maskCurrency } from "@/lib/formatters";
import type { WalletSummary } from "./api";

export interface WalletSummaryCardProps {
  wallet: WalletSummary;
  /** Optional callback when user clicks Top Up */
  onTopUpClick?: () => void;
  className?: string;
}

/**
 * WalletSummaryCard (F12.2).
 * Displays read-only customer wallet balance in Nigerian Naira (NGN),
 * with privacy mask toggle (Doc 05 §8) and fast access to top-up and ledger history.
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

  return (
    <Card className={className} data-testid="wallet-summary-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <div className="flex items-center gap-2">
          <div
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface text-primary"
          >
            <Wallet className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Wallet Balance
            </CardTitle>
            <CardDescription className="text-xs">
              Primary ledger currency ({wallet.currency})
            </CardDescription>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={toggleMask}
          aria-label={isMasked ? "Show balance" : "Hide balance"}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          {isMasked ? (
            <Eye className="h-4 w-4" />
          ) : (
            <EyeOff className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="flex items-baseline justify-between">
          <div
            className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
            data-testid="wallet-balance-amount"
          >
            {displayBalance}
          </div>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {wallet.ledger_count > 0
            ? `${wallet.ledger_count} recorded ledger events`
            : "No transaction entries yet"}
        </p>
      </CardContent>

      <CardFooter className="flex items-center gap-2 pt-2 border-t border-border/60">
        {onTopUpClick ? (
          <Button
            type="button"
            size="sm"
            onClick={onTopUpClick}
            className="flex-1 gap-1.5 h-8 text-xs font-medium"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Top Up Wallet
          </Button>
        ) : (
          <Button
            asChild
            size="sm"
            className="flex-1 gap-1.5 h-8 text-xs font-medium"
          >
            <Link href={ROUTES.TRANSACTIONS}>
              <PlusCircle className="h-3.5 w-3.5" />
              Top Up Wallet
            </Link>
          </Button>
        )}

        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-8 text-xs font-medium gap-1"
        >
          <Link href={ROUTES.TRANSACTIONS}>
            <span>History</span>
            <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
