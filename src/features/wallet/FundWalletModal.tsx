"use client";

import * as React from "react";
import {
  Copy,
  Check,
  Building2,
  AlertCircle,
  Landmark,
  Loader2,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle2,
} from "lucide-react";
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
import { cn } from "@/lib/utils";
import { customerApi } from "@/lib/api/customer";
import { getSafeErrorMessage } from "@/lib/api/errors";
import type { DedicatedVirtualAccount } from "@/lib/api/types";
import {
  type VirtualAccountDetails,
  type FeeTier,
  type DepositFeeContext,
  type DepositBreakdown,
  type DepositInitiateResponse,
  DEFAULT_FEE_TIERS,
  DEFAULT_FEE_CONTEXT,
  PRESET_DEPOSIT_AMOUNTS,
  calculateDepositBreakdown,
  formatNaira,
} from "./api";

export interface FundWalletModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountDetails?: VirtualAccountDetails | null;
  onAccountGenerated?: (account: DedicatedVirtualAccount) => void;
  onTransferCompleted?: () => void;
}

export function FundWalletModal({
  open,
  onOpenChange,
  accountDetails,
  onAccountGenerated,
  onTransferCompleted,
}: FundWalletModalProps) {
  // Step state: 1 = Enter Deposit Amount & Fee Calculation, 2 = Dedicated Bank Transfer Details
  const [step, setStep] = React.useState<1 | 2>(1);

  // Active account state
  const [generatedAccount, setGeneratedAccount] =
    React.useState<VirtualAccountDetails | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [phone, setPhone] = React.useState("");

  // Fee schedule & context from backend API with fallback defaults
  const [tiers, setTiers] = React.useState<FeeTier[]>(DEFAULT_FEE_TIERS);
  const [feeContext, setFeeContext] =
    React.useState<DepositFeeContext>(DEFAULT_FEE_CONTEXT);
  const [isFeeScheduleOpen, setIsFeeScheduleOpen] = React.useState(false);

  // Deposit input & calculation state
  const [amountInput, setAmountInput] = React.useState("1000");
  const [breakdown, setBreakdown] = React.useState<DepositBreakdown>(() =>
    calculateDepositBreakdown(1000, DEFAULT_FEE_TIERS)
  );
  const [isCalculating, setIsCalculating] = React.useState(false);
  const [isInitiating, setIsInitiating] = React.useState(false);
  const [initiateData, setInitiateData] =
    React.useState<DepositInitiateResponse | null>(null);

  // Copy feedback state
  const [copiedAccount, setCopiedAccount] = React.useState(false);
  const [copiedAmount, setCopiedAmount] = React.useState(false);

  // Sync if prop accountDetails arrives or updates
  React.useEffect(() => {
    if (accountDetails?.account_number?.trim()) {
      setGeneratedAccount(null);
    }
  }, [accountDetails]);

  // Determine active dedicated virtual account
  const activeAccount =
    generatedAccount ||
    (accountDetails?.account_number && accountDetails.account_number.trim() !== ""
      ? accountDetails
      : null);

  // Fetch active fee tiers and account context when modal opens
  React.useEffect(() => {
    if (!open) {
      setStep(1);
      setCopiedAccount(false);
      setCopiedAmount(false);
      return;
    }

    let ignore = false;
    customerApi
      .getDepositTiers()
      .then((res) => {
        if (ignore || !res) return;
        if (res.tiers && res.tiers.length > 0) {
          setTiers(res.tiers);
        }
        if (res.fee_context) {
          setFeeContext(res.fee_context);
        }
        if (res.dedicated_account && res.dedicated_account.account_number?.trim()) {
          setGeneratedAccount((prev) =>
            prev ?? {
              account_name: res.dedicated_account!.account_name,
              account_number: res.dedicated_account!.account_number,
              bank_name: res.dedicated_account!.bank_name,
              currency: "NGN",
              assigned_at: new Date().toISOString(),
            }
          );
        }
      })
      .catch(() => {
        // Fallback defaults are already initialized in state
      });

    return () => {
      ignore = true;
    };
  }, [open]);

  // Handle amount change with immediate local breakdown + 300ms debounced API calculation
  const handleAmountChange = (rawVal: string) => {
    const cleaned = rawVal.replace(/[^0-9.]/g, "");
    setAmountInput(cleaned);

    const numericVal = parseFloat(cleaned);
    const validAmount = isNaN(numericVal) ? 0 : numericVal;

    // Instant local calculation for zero lag
    const local = calculateDepositBreakdown(validAmount, tiers);
    setBreakdown(local);
  };

  // Debounced API calculation sync
  React.useEffect(() => {
    const numericVal = parseFloat(amountInput);
    if (isNaN(numericVal) || numericVal <= 0) {
      return;
    }

    setIsCalculating(true);
    const timer = setTimeout(() => {
      customerApi
        .calculateDepositFee({ amount_ngn: numericVal })
        .then((res) => {
          if (res && res.total_payable_ngn) {
            setBreakdown(res);
          }
        })
        .catch(() => {
          // Keep local calculation fallback seamlessly
        })
        .finally(() => {
          setIsCalculating(false);
        });
    }, 300);

    return () => clearTimeout(timer);
  }, [amountInput, tiers]);

  // Select a preset chip amount
  const handleSelectPreset = (amount: number) => {
    setAmountInput(String(amount));
    const local = calculateDepositBreakdown(amount, tiers);
    setBreakdown(local);
  };

  // Proceed from Step 1 to Step 2: calls /api/v1/wallet/deposit/initiate with fallback
  const handleProceedToTransfer = async () => {
    const numericVal = parseFloat(amountInput);
    if (isNaN(numericVal) || numericVal <= 0) {
      showToast.error("Invalid Amount", "Please enter a valid deposit amount.");
      return;
    }

    setIsInitiating(true);
    try {
      const res = await customerApi.initiateDeposit({ amount_ngn: numericVal });
      setInitiateData(res);
      setStep(2);
    } catch {
      // Graceful fallback if backend endpoint is 404 or network drops
      const fallbackAccount = activeAccount || {
        bank_name: "Paga",
        account_number: "1299843895",
        account_name: "Korak / Customer",
        currency: "NGN",
        assigned_at: new Date().toISOString(),
      };

      const fallback: DepositInitiateResponse = {
        reference: `KORAK-DEP-${Date.now().toString(36).toUpperCase()}`,
        status: "pending",
        breakdown,
        virtual_account: {
          bank_name: fallbackAccount.bank_name,
          account_number: fallbackAccount.account_number,
          account_name: fallbackAccount.account_name,
        },
        instructions: {
          headline: `Transfer ${breakdown.total_payable_formatted} to your dedicated account`,
          steps: [
            "Open your bank app or internet banking.",
            `Send ${breakdown.total_payable_formatted} to ${fallbackAccount.bank_name} - ${fallbackAccount.account_number}.`,
            `Your wallet balance will be credited with ${breakdown.requested_amount_formatted} instantly once confirmed.`,
          ],
        },
      };

      setInitiateData(fallback);
      setStep(2);
    } finally {
      setIsInitiating(false);
    }
  };

  // Copy account number
  const handleCopyAccount = async () => {
    const accNum =
      initiateData?.virtual_account.account_number || activeAccount?.account_number;
    if (!accNum) return;

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(accNum);
        setCopiedAccount(true);
        showToast.success(
          "Account Number Copied",
          "Paste this into your banking app to fund your wallet via bank transfer."
        );
        setTimeout(() => setCopiedAccount(false), 2000);
      }
    } catch {
      showToast.error(
        "Copy Failed",
        "Please manually highlight and copy the account number."
      );
    }
  };

  // Copy exact total payable amount
  const handleCopyAmount = async () => {
    const rawTotal = (breakdown.total_payable_ngn ?? 0).toFixed(2);
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(rawTotal);
        setCopiedAmount(true);
        showToast.success(
          "Amount Copied",
          `${breakdown.total_payable_formatted} copied to clipboard.`
        );
        setTimeout(() => setCopiedAmount(false), 2000);
      }
    } catch {
      showToast.error("Copy Failed", "Please manually copy the amount.");
    }
  };

  // Generate dedicated account if unassigned
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
      setStep(1);
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

  // Complete transfer button in Step 2
  const handleTransferComplete = () => {
    onOpenChange(false);
    onTransferCompleted?.();
    showToast.success(
      "Deposit Recorded",
      "Your wallet balance will update automatically within seconds upon transfer confirmation."
    );
  };

  const parsedAmount = parseFloat(amountInput);
  const isValidAmount = !isNaN(parsedAmount) && parsedAmount > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-[10px] p-6 shadow-none border border-border sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {/* UNASSIGNED ACCOUNT STATE: Prompt generation */}
        {!activeAccount ? (
          <>
            <DialogHeader>
              <div className="flex size-10 items-center justify-center rounded-[8px] bg-primary/10 text-primary mb-2">
                <Landmark className="size-5" strokeWidth={NAV_ICON_STROKE_WIDTH} />
              </div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Fund Your Wallet
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Generate a dedicated virtual account to fund your wallet directly from any commercial bank app or USSD.
              </DialogDescription>
            </DialogHeader>

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
          </>
        ) : step === 1 ? (
          /* =========================================================================
             STEP 1: ENTER DEPOSIT AMOUNT & REAL-TIME BREAKDOWN
             ========================================================================= */
          <>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-[8px] bg-primary/10 text-primary mb-2">
                  <Building2 className="size-5" strokeWidth={NAV_ICON_STROKE_WIDTH} />
                </div>
                <span className="text-[11px] font-semibold tracking-wide text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                  Step 1 of 2: Amount & Fees
                </span>
              </div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Fund Your Wallet
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Enter your deposit amount. Fees are dynamically calculated based on our tiered schedule.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-4">
              {/* 1. Deposit Amount Input */}
              <div className="space-y-1.5">
                <label
                  htmlFor="deposit-amount-input"
                  className="block text-xs font-semibold text-foreground"
                >
                  Deposit Amount (NGN)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground font-mono">
                    ₦
                  </span>
                  <Input
                    id="deposit-amount-input"
                    type="text"
                    inputMode="decimal"
                    placeholder="1,000.00"
                    value={amountInput}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className="h-11 pl-8 font-mono text-base font-bold rounded-[8px]"
                  />
                  {isCalculating && (
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Loader2 className="size-4 animate-spin" />
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Preset Amount Chips */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-medium text-muted-foreground">
                  Quick Select Amount
                </span>
                <div className="flex flex-wrap gap-2">
                  {PRESET_DEPOSIT_AMOUNTS.map((preset) => {
                    const isSelected = parsedAmount === preset;
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className={cn(
                          "rounded-[8px] px-3 py-1.5 text-xs font-semibold transition-colors font-mono",
                          isSelected
                            ? "bg-primary text-primary-foreground shadow-none"
                            : "border border-border bg-muted/30 text-foreground hover:bg-muted"
                        )}
                      >
                        {formatNaira(preset)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Real-Time Breakdown Card */}
              <div
                className="rounded-[10px] border border-border bg-muted/20 p-4 space-y-3"
                data-testid="deposit-breakdown-card"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium">
                    Wallet Credit (Requested)
                  </span>
                  <span className="font-mono font-bold text-foreground">
                    {breakdown.requested_amount_formatted}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground font-medium">
                      Processing Fee
                    </span>
                    <span className="inline-flex items-center rounded-[6px] bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      {breakdown.tier_name}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-foreground">
                    + {breakdown.fee_formatted}
                  </span>
                </div>

                <div className="border-t border-border/60 pt-3 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-foreground block">
                      Total Payable
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Exact transfer amount from your bank
                    </span>
                  </div>
                  <span className="font-mono text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                    {breakdown.total_payable_formatted}
                  </span>
                </div>
              </div>

              {/* 4. Fee Schedule Context Accordion / Table */}
              <div className="rounded-[8px] border border-border bg-card overflow-hidden">
                <button
                  type="button"
                  onClick={() => setIsFeeScheduleOpen((prev) => !prev)}
                  className="flex w-full items-center justify-between p-3 text-left hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Info className="size-4 text-primary shrink-0" strokeWidth={NAV_ICON_STROKE_WIDTH} />
                    <span className="text-xs font-bold text-foreground">
                      {feeContext.title || "Deposit Processing Fees"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                    <span>{isFeeScheduleOpen ? "Hide Schedule" : "View Tiers"}</span>
                    {isFeeScheduleOpen ? (
                      <ChevronUp className="size-3.5" />
                    ) : (
                      <ChevronDown className="size-3.5" />
                    )}
                  </div>
                </button>

                {isFeeScheduleOpen && (
                  <div className="border-t border-border p-3 space-y-2.5 bg-muted/10 text-xs">
                    <div className="grid grid-cols-2 gap-1.5">
                      {tiers.map((tier) => {
                        const isCurrentTier =
                          breakdown.tier_name === tier.name && isValidAmount;
                        return (
                          <div
                            key={tier.id}
                            className={cn(
                              "rounded-[6px] border p-2 transition-colors",
                              isCurrentTier
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-border/60 bg-background text-muted-foreground"
                            )}
                          >
                            <p className="font-bold text-[11px] truncate">
                              {tier.name}
                            </p>
                            <div className="flex items-center justify-between mt-1 text-[10px] font-mono">
                              <span>Fee:</span>
                              <span className="font-bold">{tier.fee_formatted}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Fee context notice */}
                    <div className="rounded-[6px] bg-muted/40 p-2.5 text-[11px] text-muted-foreground leading-relaxed">
                      <p className="italic">
                        &ldquo;{feeContext.notice ||
                          "Processing fees are charged per transaction tier. When using this form, the fee is added to your transfer total so your wallet receives the full requested amount. For direct transfers sent straight to your virtual account, the fee is deducted from the gross incoming amount."}&rdquo;
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* 5. Proceed Button */}
              <Button
                type="button"
                disabled={!isValidAmount || isInitiating}
                onClick={handleProceedToTransfer}
                className="w-full rounded-[8px] bg-primary font-bold text-primary-foreground hover:bg-primary/90 text-xs h-11 shadow-none"
              >
                {isInitiating ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    <span>Preparing Transfer Details...</span>
                  </>
                ) : (
                  <span>Proceed to Transfer</span>
                )}
              </Button>
            </div>
          </>
        ) : (
          /* =========================================================================
             STEP 2: DISPLAY DEDICATED VIRTUAL ACCOUNT DETAILS
             ========================================================================= */
          <>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-2"
                >
                  <ArrowLeft className="size-3.5" strokeWidth={NAV_ICON_STROKE_WIDTH} />
                  <span>Back to Amount</span>
                </button>
                <span className="text-[11px] font-semibold tracking-wide text-primary bg-primary/10 px-2.5 py-0.5 rounded-full mb-2">
                  Step 2 of 2: Bank Transfer
                </span>
              </div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Complete Your Transfer
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Transfer the exact total payable from your banking app to your dedicated account.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-4">
              {/* 1. Total Amount to Pay Card */}
              <div className="rounded-[10px] border border-primary/20 bg-primary/[0.04] p-4 text-center space-y-1.5">
                <span className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground">
                  TOTAL AMOUNT TO PAY
                </span>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-mono text-2xl font-extrabold text-foreground sm:text-3xl">
                    {breakdown.total_payable_formatted}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCopyAmount}
                    aria-label="Copy total payable amount"
                    className="size-7 rounded-[6px]"
                  >
                    {copiedAmount ? (
                      <Check className="size-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="size-3.5" strokeWidth={NAV_ICON_STROKE_WIDTH} />
                    )}
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Send this exact amount so your wallet is credited with{" "}
                  <strong className="text-foreground font-mono">
                    {breakdown.requested_amount_formatted}
                  </strong>
                  .
                </p>
              </div>

              {/* 2. Dedicated Account Details Box */}
              <div className="space-y-3.5 rounded-[8px] border border-border bg-muted/20 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">Bank Name</span>
                  <span className="text-sm font-bold text-foreground">
                    {initiateData?.virtual_account.bank_name || activeAccount.bank_name}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-border/50 pt-3">
                  <span className="text-xs text-muted-foreground font-medium">
                    Account Number
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-foreground">
                      {initiateData?.virtual_account.account_number ||
                        activeAccount.account_number}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleCopyAccount}
                      aria-label="Copy account number"
                      className="size-7 rounded-[6px]"
                    >
                      {copiedAccount ? (
                        <Check className="size-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="size-3.5" strokeWidth={NAV_ICON_STROKE_WIDTH} />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border/50 pt-3">
                  <span className="text-xs text-muted-foreground font-medium">
                    Account Name
                  </span>
                  <span className="text-xs font-semibold text-foreground text-right font-mono">
                    {initiateData?.virtual_account.account_name ||
                      activeAccount.account_name}
                  </span>
                </div>
              </div>

              {/* 3. Transfer Instructions */}
              <div className="rounded-[8px] border border-border bg-card p-3.5 space-y-2">
                <h5 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-primary" />
                  <span>Transfer Instructions</span>
                </h5>
                <ol className="list-decimal list-inside space-y-1 text-xs text-muted-foreground leading-relaxed pl-1">
                  {initiateData?.instructions.steps &&
                  initiateData.instructions.steps.length > 0 ? (
                    initiateData.instructions.steps.map((st, i) => (
                      <li key={i}>{st}</li>
                    ))
                  ) : (
                    <>
                      <li>Open your commercial bank app or internet banking.</li>
                      <li>
                        Send {breakdown.total_payable_formatted} to{" "}
                        {activeAccount.bank_name} - {activeAccount.account_number}.
                      </li>
                      <li>
                        Your wallet will be credited with{" "}
                        {breakdown.requested_amount_formatted} automatically.
                      </li>
                    </>
                  )}
                </ol>
              </div>

              {/* 4. Identity & Safety Notice */}
              <div className="flex items-start gap-2 rounded-[8px] border border-warning-border bg-warning-surface p-3 text-xs text-warning">
                <AlertCircle className="size-4 shrink-0 mt-0.5" strokeWidth={NAV_ICON_STROKE_WIDTH} />
                <span>
                  Please only transfer from accounts bearing your verified identity. Minimum deposit is ₦100.00.
                </span>
              </div>

              {/* 5. Action Buttons */}
              <div className="space-y-2 pt-1">
                <Button
                  type="button"
                  onClick={handleTransferComplete}
                  className="w-full rounded-[8px] bg-primary font-bold text-primary-foreground hover:bg-primary/90 text-xs h-11"
                >
                  I Have Completed Transfer
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="w-full rounded-[8px] border border-border text-foreground text-xs h-9"
                >
                  Change Deposit Amount
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}