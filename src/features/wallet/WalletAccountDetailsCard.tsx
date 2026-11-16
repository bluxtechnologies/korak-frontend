"use client";

import * as React from "react";
import { CreditCard, Copy, Check, Info } from "lucide-react";
import { showToast } from "@/components/ui/sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NAV_ICON_STROKE_WIDTH } from "@/config/navigation";
import { cn } from "@/lib/utils";
import type { VirtualAccountDetails } from "./api";

export interface WalletAccountDetailsCardProps {
  accountDetails: VirtualAccountDetails;
  className?: string;
  id?: string;
}

export function WalletAccountDetailsCard({
  accountDetails,
  className,
  id,
}: WalletAccountDetailsCardProps) {
  const [hasCopied, setHasCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(accountDetails.account_number);
        setHasCopied(true);
        showToast.success(
          "Account Number Copied",
          "Dedicated virtual account number copied to clipboard."
        );
        setTimeout(() => setHasCopied(false), 2000);
      }
    } catch {
      showToast.error(
        "Copy Failed",
        "Please manually highlight and copy the account number."
      );
    }
  };

  return (
    <Card
      id={id}
      className={cn(
        "rounded-[10px] border border-border bg-card p-5 shadow-none transition-colors",
        className
      )}
      data-testid="wallet-account-details-card"
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 pb-4 border-b border-border/50">
        <div className="flex size-7 items-center justify-center rounded-[6px] bg-primary/10 text-primary">
          <CreditCard className="size-4" strokeWidth={NAV_ICON_STROKE_WIDTH} aria-hidden="true" />
        </div>
        <h3 className="text-sm font-bold text-foreground">
          Wallet Account Details
        </h3>
      </div>

      <div className="space-y-4 pt-4 text-xs">
        {/* Account Name */}
        <div>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            Account Name
          </span>
          <p className="mt-0.5 text-xs font-bold text-foreground sm:text-sm font-mono">
            {accountDetails.account_name}
          </p>
        </div>

        {/* Account Number with Copy Button */}
        <div>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            Account Number
          </span>
          <div className="mt-0.5 flex items-center justify-between">
            <span
              className="font-mono text-sm font-bold tracking-wider text-foreground sm:text-base"
              data-testid="account-number-text"
            >
              {accountDetails.account_number}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              aria-label="Copy account number"
              className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors focus:outline-none"
            >
              {hasCopied ? (
                <>
                  <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400">
                    Copied
                  </span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5" strokeWidth={NAV_ICON_STROKE_WIDTH} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Bank */}
        <div>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            Bank
          </span>
          <p className="mt-0.5 text-xs font-bold text-foreground sm:text-sm">
            {accountDetails.bank_name}
          </p>
        </div>

        {/* Informational Callout */}
        <div className="flex items-start gap-2 rounded-[8px] border border-primary/20 bg-primary/5 p-3 text-[11px] leading-relaxed text-foreground">
          <Info
            className="mt-0.5 size-3.5 shrink-0 text-primary"
            strokeWidth={NAV_ICON_STROKE_WIDTH}
            aria-hidden="true"
          />
          <span>
            Use this account details to fund your wallet via bank transfer.
          </span>
        </div>
      </div>
    </Card>
  );
}
