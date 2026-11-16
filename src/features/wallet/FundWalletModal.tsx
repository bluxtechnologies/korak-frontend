"use client";

import * as React from "react";
import { Copy, Check, Building2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
        toast.success("Account number copied!");
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      toast.error("Failed to copy account number");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl p-6">
        <DialogHeader>
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-2">
            <Building2 className="size-5" />
          </div>
          <DialogTitle className="text-lg font-bold">Fund Your Wallet</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Make a bank transfer to your dedicated virtual account below. Your wallet
            will be credited automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4 rounded-xl border border-border bg-muted/30 p-4">
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
                className="size-7 rounded-md"
              >
                {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border/50 pt-3">
            <span className="text-xs text-muted-foreground font-medium">Account Name</span>
            <span className="text-xs font-semibold text-foreground text-right">
              {accountDetails.account_name}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-muted-foreground mt-2">
          <AlertCircle className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <span>
            Please only transfer from accounts bearing your verified identity. Minimum deposit is ₦100.00.
          </span>
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full rounded-xl bg-primary font-bold text-primary-foreground hover:bg-primary/90"
          >
            I Have Transferred
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
