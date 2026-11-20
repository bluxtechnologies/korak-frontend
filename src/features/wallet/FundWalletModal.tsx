"use client";

import * as React from "react";
import { Copy, Check, Building2, AlertCircle, Landmark, Loader2 } from "lucide-react";
import { showToast } from "@/components/ui/sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NAV_ICON_STROKE_WIDTH } from "@/config/navigation";
import { customerApi } from "@/lib/api/customer";
import { getSafeErrorMessage } from "@/lib/api/errors";
import type { DedicatedVirtualAccount } from "@/lib/api/types";
import type { VirtualAccountDetails } from "./api";

export interface FundWalletModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountDetails?: VirtualAccountDetails | null;
  onAccountGenerated?: (account: DedicatedVirtualAccount) => void;
}

export function FundWalletModal({
  open,
  onOpenChange,
  accountDetails,
  onAccountGenerated,
}: FundWalletModalProps) {
  const [copied, setCopied] = React.useState(false);
  const [generatedAccount, setGeneratedAccount] =
    React.useState<VirtualAccountDetails | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [phone, setPhone] = React.useState("");

  // Sync if prop accountDetails arrives or updates
  React.useEffect(() => {
    if (accountDetails?.account_number?.trim()) {
      setGeneratedAccount(null);
    }
  }, [accountDetails]);

  // Determine if a non-empty, valid dedicated account is present
  const activeAccount =
    generatedAccount ||
    (accountDetails?.account_number && accountDetails.account_number.trim() !== ""
      ? accountDetails
      : null);

  const handleCopy = async () => {
    if (!activeAccount?.account_number) return;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(activeAccount.account_number);
        setCopied(true);
        showToast.success(
          "Account Number Copied",
          "Paste this into your banking app to fund your wallet via bank transfer."
        );
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      showToast.error(
        "Copy Failed",
        "Please manually highlight and copy the account number."
      );
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await customerApi.generateDedicatedAccount(
        phone.trim() ? { phone: phone.trim() } : undefined
      );
      const newAcc: VirtualAccountDetails = {
        account_name: res.account.account_name,
        account_number: res.account.account_number,
        bank_name: res.account.bank_name,
        currency: "NGN",
        assigned_at: res.account.created_at,
      };
      setGeneratedAccount(newAcc);
      onAccountGenerated?.(res.account);
      showToast.success(
        "Dedicated Account Generated",
        `Your ${res.account.bank_name} account number is ready for instant deposits.`
      );
    } catch (err: unknown) {
      const msg = getSafeErrorMessage(
        err,
        "Unable to generate dedicated account. Please try again."
      );
      showToast.error("Generation Failed", msg);
    } finally {
      setIsGenerating(false);
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
            {activeAccount
              ? "Make a direct bank transfer to your dedicated virtual account below. Your wallet will be credited automatically upon confirmation."
              : "Generate a dedicated virtual account to fund your wallet directly from any commercial bank app or USSD."}
          </DialogDescription>
        </DialogHeader>

        {activeAccount ? (
          <>
            <div className="mt-4 space-y-3.5 rounded-[8px] border border-border bg-muted/20 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">Bank Name</span>
                <span className="text-sm font-bold text-foreground">{activeAccount.bank_name}</span>
              </div>

              <div className="flex items-center justify-between border-t border-border/50 pt-3">
                <span className="text-xs text-muted-foreground font-medium">Account Number</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-foreground">
                    {activeAccount.account_number}
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
                  {activeAccount.account_name}
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
          </>
        ) : (
          <div className="mt-4 space-y-4">
            <div className="rounded-[8px] border border-dashed border-primary/30 bg-primary/[0.03] p-4 text-center space-y-2">
              <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Landmark className="size-5" strokeWidth={NAV_ICON_STROKE_WIDTH} />
              </div>
              <h4 className="text-sm font-bold text-foreground">
                No Dedicated Account Details Yet
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                You haven&apos;t generated a dedicated account number yet. Generate your personal account details (Wema Bank / Providus Bank / Paga) to fund your Korak wallet directly from any commercial bank app or USSD.
              </p>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="fund-phone-input"
                className="block text-[11px] font-semibold text-foreground"
              >
                Phone Number (Optional)
              </label>
              <Input
                id="fund-phone-input"
                type="tel"
                placeholder="08012345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-10 rounded-[8px] text-xs font-mono"
              />
            </div>

            <Button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerate}
              className="w-full rounded-[8px] bg-primary font-bold text-primary-foreground hover:bg-primary/90 text-xs h-10 gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Generating Account...</span>
                </>
              ) : (
                <>
                  <Landmark className="size-4" strokeWidth={NAV_ICON_STROKE_WIDTH} />
                  <span>Generate Account Details</span>
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
