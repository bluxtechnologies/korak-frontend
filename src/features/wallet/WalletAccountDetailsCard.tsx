"use client";

import * as React from "react";
import { CreditCard, Copy, Check, Info, Loader2, Landmark, Building2 } from "lucide-react";
import { showToast } from "@/components/ui/sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NAV_ICON_STROKE_WIDTH } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { customerApi } from "@/lib/api/customer";
import type { DedicatedVirtualAccount, DedicatedAccountMeta } from "@/lib/api/types";
import type { VirtualAccountDetails } from "./api";

export interface WalletAccountDetailsCardProps {
  accountDetails?: VirtualAccountDetails | DedicatedVirtualAccount | null;
  hasAccount?: boolean;
  requiresPhone?: boolean;
  onGenerateSuccess?: (account: DedicatedVirtualAccount) => void;
  className?: string;
  id?: string;
}

/**
 * WalletAccountDetailsCard (Doc 25 §8.3 & Doc 14).
 * Supports both:
 * 1. Active State: Displays dedicated virtual account number (Wema/Providus/Paga)
 *    with 1-click copy, account name, and bank name.
 * 2. Unassigned State: Renders "Instant Bank Transfer Deposit" banner with
 *    "Generate Account Details" CTA and phone input if required.
 */
export function WalletAccountDetailsCard({
  accountDetails: initialAccountDetails,
  hasAccount: initialHasAccount,
  requiresPhone = false,
  onGenerateSuccess,
  className,
  id,
}: WalletAccountDetailsCardProps) {
  const [generatedAccount, setGeneratedAccount] =
    React.useState<VirtualAccountDetails | DedicatedVirtualAccount | null>(null);
  const [explicitHasAccount, setExplicitHasAccount] =
    React.useState<boolean | null>(null);

  // Sync state if initialAccountDetails prop updates or arrives
  React.useEffect(() => {
    if (initialAccountDetails && initialAccountDetails.account_number?.trim()) {
      setGeneratedAccount(initialAccountDetails);
      setExplicitHasAccount(true);
    }
  }, [initialAccountDetails]);

  // Client-side self-healing check if no account details provided yet
  React.useEffect(() => {
    let ignore = false;
    if (
      !initialAccountDetails &&
      !generatedAccount &&
      typeof customerApi?.getDedicatedAccount === "function"
    ) {
      customerApi
        .getDedicatedAccount()
        .then((res) => {
          if (!ignore && res?.account && res.account.account_number?.trim()) {
            setGeneratedAccount(res.account);
            setExplicitHasAccount(true);
            onGenerateSuccess?.(res.account);
          }
        })
        .catch(() => {});
    }
    return () => {
      ignore = true;
    };
  }, [initialAccountDetails, generatedAccount, onGenerateSuccess]);

  const account = generatedAccount ?? initialAccountDetails ?? null;
  const hasAccount =
    explicitHasAccount ??
    (initialHasAccount ?? Boolean(account?.account_number?.trim()));

  const [hasCopied, setHasCopied] = React.useState(false);
  const [phone, setPhone] = React.useState("");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [phoneError, setPhoneError] = React.useState<string | null>(null);

  const hasActiveAccount = Boolean(account && hasAccount);

  const handleCopy = async () => {
    if (!account) return;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(account.account_number);
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

  const handleGenerate = async () => {
    if (requiresPhone && !phone.trim()) {
      setPhoneError("Please enter your Nigerian phone number to generate an account.");
      return;
    }
    setPhoneError(null);
    setIsGenerating(true);

    try {
      const res = await customerApi.generateDedicatedAccount(
        phone.trim() ? { phone: phone.trim() } : undefined
      );
      setGeneratedAccount(res.account);
      setExplicitHasAccount(true);
      onGenerateSuccess?.(res.account);
      showToast.success(
        "Dedicated Account Generated",
        `Your ${res.account.bank_name} account number is ready for instant deposits.`
      );
    } catch (err: unknown) {
      const msg =
        (err as { message?: string })?.message ||
        "Unable to generate dedicated account. Please try again.";
      showToast.error("Generation Failed", msg);
    } finally {
      setIsGenerating(false);
    }
  };

  // State A: Active Dedicated Account
  if (hasActiveAccount && account) {
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
              {account.account_name}
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
                {account.account_number}
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
              {account.bank_name}
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

  // State B: No Dedicated Account Yet — Provisioning CTA (Doc 25 §8.3.A)
  return (
    <Card
      id={id}
      className={cn(
        "rounded-[10px] border border-dashed border-primary/30 bg-primary/[0.02] p-5 shadow-none transition-colors",
        className
      )}
      data-testid="wallet-account-details-card"
    >
      <div className="flex items-center gap-2.5 pb-3 border-b border-border/50">
        <div className="flex size-7 items-center justify-center rounded-[6px] bg-primary/10 text-primary">
          <Building2 className="size-4" strokeWidth={NAV_ICON_STROKE_WIDTH} aria-hidden="true" />
        </div>
        <h3 className="text-sm font-bold text-foreground">
          Instant Bank Transfer Deposit
        </h3>
      </div>

      <div className="pt-3 space-y-3.5 text-xs">
        <p className="text-muted-foreground leading-relaxed text-[11px]">
          Get a personal dedicated account number (Wema Bank / Providus Bank) to fund your Korak wallet directly from any commercial bank app or USSD.
        </p>

        {requiresPhone && (
          <div className="space-y-1">
            <label htmlFor="va-phone" className="block text-[11px] font-semibold text-foreground">
              Phone Number
            </label>
            <Input
              id="va-phone"
              type="tel"
              placeholder="08012345678"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (phoneError) setPhoneError(null);
              }}
              className="h-9 rounded-[8px] text-xs font-mono"
            />
            {phoneError && (
              <p className="text-[10px] text-destructive">{phoneError}</p>
            )}
          </div>
        )}

        <Button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full h-9 rounded-[8px] text-xs font-semibold gap-1.5"
        >
          {isGenerating ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              <span>Generating Account...</span>
            </>
          ) : (
            <>
              <Landmark className="size-3.5" strokeWidth={NAV_ICON_STROKE_WIDTH} />
              <span>Generate Account Details</span>
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
