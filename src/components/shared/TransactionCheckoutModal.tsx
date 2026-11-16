"use client";

import * as React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ShieldCheck,
  Wallet,
  ArrowRight,
  ArrowLeft,
  Lock,
  Copy,
  Check,
  Printer,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/config/navigation";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";

export interface CheckoutDetailItem {
  label: string;
  value: string;
  isMono?: boolean;
}

export interface TransactionCheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceType: "airtime" | "data" | "utility";
  serviceTitle: string;
  network?: "mtn" | "airtel" | "glo" | "9mobile";
  beneficiary: string;
  faceValue: number; // in Naira major units (e.g. 500)
  discount?: number; // in Naira major units (e.g. 10)
  finalAmount: number; // in Naira major units (e.g. 490)
  walletBalance: number; // in minor units (e.g. 500000 = ₦5,000.00)
  extraDetails?: CheckoutDetailItem[];
  onSubmitPurchase: (pin: string) => Promise<{ reference: string; message?: string }>;
  onSuccessDone?: (reference: string) => void;
}

type CheckoutStep = "summary" | "pin" | "success";

const NETWORK_COLORS: Record<string, { bg: string; text: string; border: string; label: string }> = {
  mtn: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", border: "border-amber-500/30", label: "MTN" },
  airtel: { bg: "bg-rose-500/10", text: "text-rose-600 dark:text-rose-400", border: "border-rose-500/30", label: "Airtel" },
  glo: { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/30", label: "Glo" },
  "9mobile": { bg: "bg-lime-500/10", text: "text-lime-700 dark:text-lime-400", border: "border-lime-500/30", label: "9mobile" },
};

export function TransactionCheckoutModal({
  open,
  onOpenChange,
  serviceType: _serviceType,
  serviceTitle,
  network,
  beneficiary,
  faceValue,
  discount = 0,
  finalAmount,
  walletBalance,
  extraDetails = [],
  onSubmitPurchase,
  onSuccessDone,
}: TransactionCheckoutModalProps) {
  const [step, setStep] = React.useState<CheckoutStep>("summary");
  const [pinDigits, setPinDigits] = React.useState<string[]>(["", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successReference, setSuccessReference] = React.useState<string>("");
  const [hasCopiedRef, setHasCopiedRef] = React.useState(false);

  const [prevOpen, setPrevOpen] = React.useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setStep("summary");
      setPinDigits(["", "", "", ""]);
      setErrorMessage(null);
      setSuccessReference("");
      setHasCopiedRef(false);
    }
  }

  const inputRefs = [
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
  ];

  // Focus first PIN input when entering PIN step
  React.useEffect(() => {
    if (step === "pin") {
      setTimeout(() => {
        inputRefs[0]?.current?.focus();
      }, 100);
    }
  }, [step]);

  const finalAmountMinor = finalAmount * 100;
  const balanceAfter = Math.max(0, walletBalance - finalAmountMinor);
  const isBalanceSufficient = walletBalance >= finalAmountMinor;
  const netInfo = network ? NETWORK_COLORS[network] : undefined;

  const handlePinChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...pinDigits];
    newDigits[index] = digit;
    setPinDigits(newDigits);
    setErrorMessage(null);

    // Auto-advance to next input
    if (digit && index < 3) {
      inputRefs[index + 1]?.current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pinDigits[index] && index > 0) {
      inputRefs[index - 1]?.current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (pasted.length > 0) {
      const newDigits = ["", "", "", ""];
      for (let i = 0; i < pasted.length; i++) {
        newDigits[i] = pasted[i];
      }
      setPinDigits(newDigits);
      if (pasted.length === 4) {
        inputRefs[3]?.current?.focus();
      } else {
        inputRefs[pasted.length]?.current?.focus();
      }
    }
  };

  const handleConfirmSummary = () => {
    if (!isBalanceSufficient) {
      toast.error("Insufficient wallet balance to proceed.");
      return;
    }
    setStep("pin");
  };

  const handleExecutePurchase = async () => {
    const fullPin = pinDigits.join("");
    if (fullPin.length !== 4) {
      setErrorMessage("Please enter your complete 4-digit transaction PIN.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await onSubmitPurchase(fullPin);
      setSuccessReference(result.reference);
      setStep("success");
      onSuccessDone?.(result.reference);
      toast.success("Transaction fulfilled successfully!");
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message || "Payment authorization failed. Please check your PIN.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyReference = async () => {
    if (!successReference) return;
    try {
      await navigator.clipboard.writeText(successReference);
      setHasCopiedRef(true);
      toast.success("Reference copied to clipboard");
      setTimeout(() => setHasCopiedRef(false), 2000);
    } catch {
      toast.error("Could not copy reference");
    }
  };

  const handlePrintReceipt = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md rounded-2xl border-border/80 p-0 shadow-lg"
        data-testid="transaction-checkout-modal"
      >
        {/* Step 1: Summary Review */}
        {step === "summary" && (
          <div className="space-y-5 p-6">
            <DialogHeader className="space-y-1 text-left">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-[11px] font-semibold uppercase tracking-wider">
                  Step 1 of 2: Review Order
                </Badge>
                {netInfo && (
                  <span className={cn("rounded-md border px-2 py-0.5 text-xs font-bold uppercase", netInfo.bg, netInfo.text, netInfo.border)}>
                    {netInfo.label}
                  </span>
                )}
              </div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Confirm {serviceTitle}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Review your transaction summary before entering authorization PIN.
              </DialogDescription>
            </DialogHeader>

            {/* Breakdown card */}
            <div className="space-y-2.5 rounded-xl border border-border/70 bg-muted/20 p-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Beneficiary</span>
                <span className="font-mono font-bold text-foreground">{beneficiary}</span>
              </div>

              {extraDetails.map((detail, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{detail.label}</span>
                  <span className={cn("font-medium text-foreground", detail.isMono && "font-mono")}>
                    {detail.value}
                  </span>
                </div>
              ))}

              <div className="flex items-center justify-between border-t border-border/60 pt-2">
                <span className="text-muted-foreground">Face Value</span>
                <span className="font-mono font-medium text-foreground">
                  {formatCurrency(faceValue * 100, "NGN")}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Discount Savings</span>
                  <span className="font-mono font-bold">
                    -{formatCurrency(discount * 100, "NGN")}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-border/80 pt-2 font-bold text-sm">
                <span className="text-foreground">Total To Pay</span>
                <span className="font-mono text-primary">
                  {formatCurrency(finalAmountMinor, "NGN")}
                </span>
              </div>
            </div>

            {/* Ledger Wallet Balance Before & After */}
            <div className="rounded-xl border border-border/80 bg-surface p-3.5 text-xs">
              <div className="flex items-center gap-2 mb-2 font-semibold text-foreground">
                <Wallet className="size-3.5 text-primary" />
                <span>Wallet Balance Impact</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="rounded-lg bg-muted/40 p-2">
                  <span className="text-muted-foreground block">Current Balance</span>
                  <span className="font-mono font-bold text-foreground">
                    {formatCurrency(walletBalance, "NGN")}
                  </span>
                </div>
                <div className="rounded-lg bg-muted/40 p-2">
                  <span className="text-muted-foreground block">Balance After</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(balanceAfter, "NGN")}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-10 rounded-xl px-4 text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleConfirmSummary}
                disabled={!isBalanceSufficient}
                className="h-10 gap-1.5 rounded-xl bg-primary px-5 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/95"
              >
                <span>Continue to PIN</span>
                <ArrowRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: 4-Digit Transaction PIN Input */}
        {step === "pin" && (
          <div className="space-y-6 p-6">
            <DialogHeader className="space-y-1 text-left">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-[11px] font-semibold uppercase tracking-wider">
                  Step 2 of 2: Authorization
                </Badge>
                <button
                  type="button"
                  onClick={() => setStep("summary")}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="size-3" />
                  <span>Back</span>
                </button>
              </div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Enter Transaction PIN
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Enter your 4-digit security PIN to authorize the payment of{" "}
                <span className="font-mono font-bold text-foreground">
                  {formatCurrency(finalAmountMinor, "NGN")}
                </span>
                .
              </DialogDescription>
            </DialogHeader>

            {/* PIN Inputs */}
            <div className="flex flex-col items-center justify-center py-2 space-y-4">
              <div className="flex items-center justify-center gap-3">
                {[0, 1, 2, 3].map((idx) => (
                  <input
                    key={idx}
                    ref={inputRefs[idx]}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={pinDigits[idx]}
                    onChange={(e) => handlePinChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onPaste={idx === 0 ? handlePaste : undefined}
                    aria-label={`Digit ${idx + 1}`}
                    className="size-13 rounded-xl border border-border/80 bg-surface text-center font-mono text-2xl font-black text-foreground shadow-xs focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all sm:size-14"
                  />
                ))}
              </div>

              {errorMessage && (
                <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                  {errorMessage}
                </p>
              )}

              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Lock className="size-3 text-muted-foreground" />
                <span>Protected by 256-bit financial encryption</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setStep("summary")}
                className="h-10 text-xs font-semibold text-muted-foreground"
              >
                Back to Summary
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={handleExecutePurchase}
                disabled={isSubmitting || pinDigits.some((d) => !d)}
                className="h-10 gap-1.5 rounded-xl bg-primary px-6 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/95"
              >
                {isSubmitting ? (
                  <span>Processing Payment…</span>
                ) : (
                  <>
                    <span>Authorize & Pay</span>
                    <ShieldCheck className="size-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Success State & Instant Receipt */}
        {step === "success" && (
          <div className="space-y-6 p-6 text-center" data-testid="checkout-success-step">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-8" />
            </div>

            <DialogHeader className="space-y-1 text-center">
              <DialogTitle className="text-xl font-bold text-foreground">
                Payment & Dispatch Successful!
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Your digital service order has been authorized and dispatched to the carrier gateway.
              </DialogDescription>
            </DialogHeader>

            {/* Receipt Summary Card */}
            <div className="space-y-2.5 rounded-xl border border-border/70 bg-muted/20 p-4 text-left text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Order Reference</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-primary">{successReference}</span>
                  <button
                    type="button"
                    onClick={handleCopyReference}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Copy reference"
                  >
                    {hasCopiedRef ? (
                      <Check className="size-3 text-emerald-500" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Beneficiary</span>
                <span className="font-mono font-bold text-foreground">{beneficiary}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Service</span>
                <span className="font-medium text-foreground">{serviceTitle}</span>
              </div>

              <div className="flex items-center justify-between border-t border-border/60 pt-2 font-bold">
                <span className="text-foreground">Amount Charged</span>
                <span className="font-mono text-foreground">
                  {formatCurrency(finalAmountMinor, "NGN")}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePrintReceipt}
                className="h-10 flex-1 gap-1.5 rounded-xl border-border/80 text-xs font-semibold"
              >
                <Printer className="size-3.5 text-muted-foreground" />
                <span>Print Receipt</span>
              </Button>

              <Button
                asChild
                size="sm"
                className="h-10 flex-1 gap-1.5 rounded-xl bg-primary text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/95"
              >
                <Link href={ROUTES.ORDERS}>
                  <Package className="size-3.5" />
                  <span>View in Orders</span>
                </Link>
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
