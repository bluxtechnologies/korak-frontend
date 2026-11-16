"use client";

import * as React from "react";
import { CreditCard, Copy, Check, Info } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
        toast.success("Account number copied to clipboard");
        setTimeout(() => setHasCopied(false), 2000);
      }
    } catch {
      toast.error("Failed to copy account number");
    }
  };

  return (
    <Card
      id={id}
      className={cn("rounded-2xl border-border/80 shadow-xs", className)}
      data-testid="wallet-account-details-card"
    >
      <CardHeader className="pb-3.5">
        <div className="flex items-center gap-2 text-foreground">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <CreditCard className="size-4" aria-hidden="true" />
          </div>
          <CardTitle className="text-sm font-bold sm:text-base">
            Wallet Account Details
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {/* Account Name */}
        <div>
          <span className="text-[11px] font-medium text-muted-foreground">
            Account Name
          </span>
          <p className="mt-0.5 text-xs font-bold text-foreground sm:text-sm">
            {accountDetails.account_name}
          </p>
        </div>

        {/* Account Number with Copy Button */}
        <div>
          <span className="text-[11px] font-medium text-muted-foreground">
            Account Number
          </span>
          <div className="mt-0.5 flex items-center justify-between">
            <span
              className="font-mono text-sm font-bold tracking-wider text-foreground sm:text-base"
              data-testid="account-number-text"
            >
              {accountDetails.account_number}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              aria-label="Copy account number"
              className="h-7 gap-1 px-2 text-xs font-semibold text-primary hover:bg-primary/10 hover:text-primary"
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
                  <Copy className="size-3.5" />
                  <span>Copy</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Bank */}
        <div>
          <span className="text-[11px] font-medium text-muted-foreground">
            Bank
          </span>
          <p className="mt-0.5 text-xs font-bold text-foreground sm:text-sm">
            {accountDetails.bank_name}
          </p>
        </div>

        {/* Informational Callout */}
        <div className="flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs leading-relaxed text-foreground">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          <span>
            Use this account details to fund your wallet via bank transfer. Funds
            are credited automatically upon confirmation.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
