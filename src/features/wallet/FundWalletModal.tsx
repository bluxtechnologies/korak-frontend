"use client";

import * as React from "react";
import { Copy, Check, Building2, AlertCircle } from "lucide-react";
import { showToast } from "@/components/ui/sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { NAV_ICON_STROKE_WIDTH } from "@/config/navigation";
import type { VirtualAccountDetails } from "./api";

export interface FundWalletModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountDetails: VirtualAccountDetails;
}

export function FundWalletModal({
  open,
  onOpenChange,
  accountDetails,
}: FundWalletModalProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(accountDetails.account_number);
        setCopied(true);
        showToast.success(
          "Account Number Copied",
          "Paste this into your banking app to fund your wallet via bank transfer."
        );
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      showToast.error("Copy Failed", "Please manually highlight and copy the account number.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-[10px] p-6 shadow-none border border-border">
        <DialogHeader>
          <div className="flex size-10 items-center justify-center rounded-[8px] bg-primary/10 text-primary mb-2">
            <Building2 className="size-5" strokeWidth={NAV_ICON_STROKE_WIDTH} />
          </div>
          <DialogTitle className="text-lg font-bold text-foreground">Fund Your Wallet</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Make a direct bank transfer to your dedicated virtual account below. Your wallet
            will be credited automatically upon confirmation.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-3.5 rounded-[8px] border border-border bg-muted/20 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Bank Name</span>
            <span className="text-sm font-bold text-foreground">{accountDetails.bank_name}</span>
          </div>

          <div className="flex items-center justify-between border-t border-border/50 pt-3">
            <span className="text-xs text-muted-foreground font-medium">Account Number</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-foreground">
                {accountDetails.account_number}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopy}
                aria-label="Copy account number"
                className="size-7 rounded-[6px]"
              >
                {copied ? (
                  <Check className="size-3.5 text-emerald-500" />
                ) : (
                  <Copy className="size-3.5" strokeWidth={NAV_ICON_STROKE_WIDTH} />
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border/50 pt-3">
            <span className="text-xs text-muted-foreground font-medium">Account Name</span>
            <span className="text-xs font-semibold text-foreground text-right font-mono">
              {accountDetails.account_name}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-[8px] border border-warning-border bg-warning-surface p-3 text-xs text-warning mt-2">
          <AlertCircle className="size-4 shrink-0 mt-0.5" strokeWidth={NAV_ICON_STROKE_WIDTH} />
          <span>
            Please only transfer from accounts bearing your verified identity. Minimum deposit is ₦100.00.
          </span>
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full rounded-[8px] bg-primary font-bold text-primary-foreground hover:bg-primary/90 text-xs h-10"
          >
            I Have Transferred
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
