"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Wallet,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Lock,
  Printer,
  Copy,
  Check,
  CheckCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  SubmitButton,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { NAV_ICON_STROKE_WIDTH, ROUTES } from "@/config/navigation";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import {
  TELECOM_NETWORKS,
  QUICK_AIRTIME_AMOUNTS,
  detectNetworkFromPhone,
  purchaseAirtime,
  type TelecomNetwork,
  type AirtimeOrderResult,
} from "./api";

// ---------------------------------------------------------------------------
// Schema — Doc 09 §6: client validation is a usability aid, server re-validates
// ---------------------------------------------------------------------------
export const airtimeFormSchema = z.object({
  network: z.enum(["mtn", "airtel", "glo", "9mobile"]),
  phone: z
    .string()
    .min(1, "Please enter a phone number.")
    .regex(
      /^0[789][01]\d{8}$/,
      "Please enter a valid 11-digit Nigerian phone number (e.g. 08031234567)."
    ),
  amount: z
    .number()
    .min(50, "Minimum airtime amount is ₦50.")
    .max(50000, "Maximum airtime amount is ₦50,000."),
});

export type AirtimeFormData = z.infer<typeof airtimeFormSchema>;

export interface AirtimePurchaseFormProps {
  walletBalance?: number; // minor units (e.g. 500000 = ₦5,000.00)
  onOrderCompleted?: (order: AirtimeOrderResult) => void;
  className?: string;
}

export function AirtimePurchaseForm({
  walletBalance = 500000,
  onOrderCompleted,
  className,
}: AirtimePurchaseFormProps) {
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [rootError, setRootError] = React.useState<string | null>(null);
  const [pin, setPin] = React.useState<string>("1234");
  const [hasCopiedRef, setHasCopiedRef] = React.useState(false);
  const [completedOrder, setCompletedOrder] =
    React.useState<AirtimeOrderResult | null>(null);

  const form = useForm<AirtimeFormData>({
    resolver: zodResolver(airtimeFormSchema),
    defaultValues: {
      network: "mtn",
      phone: "",
      amount: 500,
    },
  });

  const selectedNetwork = form.watch("network");
  const enteredPhone = form.watch("phone");
  const enteredAmount = form.watch("amount") || 0;

  // Auto-detect network from phone number
  React.useEffect(() => {
    if (enteredPhone && enteredPhone.length >= 4) {
      const detected = detectNetworkFromPhone(enteredPhone);
      if (detected && detected !== selectedNetwork) {
        form.setValue("network", detected, { shouldValidate: true });
      }
    }
  }, [enteredPhone, selectedNetwork, form]);

  const activeNetworkInfo =
    TELECOM_NETWORKS.find((n) => n.id === selectedNetwork) ??
    TELECOM_NETWORKS[0];

  const discountAmount = Math.round(
    enteredAmount * activeNetworkInfo.discountRate
  );
  const finalChargeAmount = Math.max(0, enteredAmount - discountAmount);
  const finalChargeMinor = finalChargeAmount * 100;
  const isBalanceSufficient = walletBalance >= finalChargeMinor;

  // Step 1: Open Confirmation Dialog
  const handleValidateForConfirm = form.handleSubmit(() => {
    setRootError(null);
    setIsConfirmOpen(true);
  });

  // Step 2: Idempotent Execution on Confirmation
  const handleConfirmPurchase = async () => {
    const values = form.getValues();
    setIsSubmitting(true);
    setRootError(null);

    try {
      const order = await purchaseAirtime({
        network: values.network,
        phone: values.phone,
        amount: values.amount,
      });

      setCompletedOrder(order);
      setIsConfirmOpen(false);
      toast.success(
        `₦${values.amount.toLocaleString()} airtime sent to ${values.phone}!`
      );
      onOrderCompleted?.(order);
    } catch (err: unknown) {
      setIsConfirmOpen(false);
      const msg =
        (err as { message?: string })?.message ||
        "Could not complete airtime purchase. Please try again.";
      setRootError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForNewOrder = () => {
    setCompletedOrder(null);
    form.reset({
      network: "mtn",
      phone: "",
      amount: 500,
    });
  };

  const handleCopyReference = (ref: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(ref);
      setHasCopiedRef(true);
      toast.success("Transaction reference copied!");
      setTimeout(() => setHasCopiedRef(false), 2000);
    }
  };

  // Render Completed / Success Receipt State
  if (completedOrder) {
    return (
      <Card
        className={cn("rounded-[10px] border border-border bg-card shadow-none overflow-hidden", className)}
        data-testid="airtime-success-card"
      >
        <CardHeader className="border-b border-border p-6 text-center bg-muted/20">
          <div className="mx-auto flex size-12 items-center justify-center rounded-[10px] border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-6" strokeWidth={NAV_ICON_STROKE_WIDTH} />
          </div>
          <CardTitle className="mt-3 text-lg font-bold text-foreground sm:text-xl">
            Airtime Purchase Successful
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Direct telecom carrier delivery completed
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-5 text-sm">
          {/* Reference pill */}
          <div className="flex items-center justify-between rounded-[8px] border border-border bg-muted/30 px-3.5 py-2.5 text-xs">
            <span className="text-muted-foreground font-medium">Reference</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-foreground">
                {completedOrder.reference}
              </span>
              <button
                type="button"
                onClick={() => handleCopyReference(completedOrder.reference)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                aria-label="Copy reference"
              >
                {hasCopiedRef ? (
                  <Check className="size-3.5 text-emerald-600" strokeWidth={NAV_ICON_STROKE_WIDTH} />
                ) : (
                  <Copy className="size-3.5" strokeWidth={NAV_ICON_STROKE_WIDTH} />
                )}
              </button>
            </div>
          </div>

          <div className="rounded-[10px] border border-border bg-card p-4 space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Network Provider</span>
              <span className="font-bold uppercase text-foreground">
                {completedOrder.network}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Recipient Phone</span>
              <span className="font-mono font-semibold text-foreground">
                {completedOrder.phone}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Airtime Value</span>
              <span className="font-mono font-medium text-foreground">
                ₦{completedOrder.amount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-xs text-emerald-600 dark:text-emerald-400">
              <span>Instant Cashback</span>
              <span className="font-mono font-semibold">
                -₦{completedOrder.discount.toLocaleString()}
              </span>
            </div>
            <div className="border-t border-border pt-2.5 flex justify-between text-sm font-bold">
              <span className="text-foreground">Total Wallet Debited</span>
              <span className="text-primary font-mono">
                ₦{completedOrder.final_amount.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-[8px] border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" strokeWidth={NAV_ICON_STROKE_WIDTH} />
            <span>Automated telecom gateway dispatch completed. Check recipient device balance.</span>
          </div>
        </CardContent>

        <CardFooter className="border-t border-border p-6 flex flex-col gap-2.5 sm:flex-row bg-muted/10">
          <Button
            type="button"
            onClick={handleResetForNewOrder}
            className="w-full flex-1 text-xs font-semibold rounded-[8px] h-10 sm:w-auto"
          >
            Buy Another Airtime
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (typeof window !== "undefined") window.print();
            }}
            className="w-full flex-1 text-xs font-medium rounded-[8px] h-10 sm:w-auto gap-1.5"
          >
            <Printer className="size-3.5 text-muted-foreground" strokeWidth={NAV_ICON_STROKE_WIDTH} />
            <span>Print Receipt</span>
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full flex-1 text-xs font-medium rounded-[8px] h-10 sm:w-auto"
          >
            <Link href={ROUTES.ORDERS}>View in Orders</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card
      className={cn("rounded-[10px] border border-border bg-card shadow-none", className)}
      data-testid="airtime-purchase-card"
    >
      <CardHeader className="border-b border-border p-6 pb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-[8px] border border-primary/20 bg-primary/10 text-primary">
              <Smartphone className="size-4.5" strokeWidth={NAV_ICON_STROKE_WIDTH} />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                Buy Airtime
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Instant automated top-up with up to 3% cashback
              </CardDescription>
            </div>
          </div>

          {/* Available Wallet Balance */}
          <div className="rounded-[8px] border border-border bg-muted/40 px-3 py-1.5 text-right">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Wallet Balance
            </span>
            <span className="font-mono text-xs font-bold text-foreground">
              {formatCurrency(walletBalance, "NGN")}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <Form {...form}>
          <form
            onSubmit={handleValidateForConfirm}
            className="space-y-6"
            noValidate
          >
            {rootError && (
              <Alert variant="destructive" className="flex items-start gap-2 rounded-[8px]">
                <AlertCircle className="mt-0.5 size-4 shrink-0" strokeWidth={NAV_ICON_STROKE_WIDTH} />
                <span className="text-xs">{rootError}</span>
              </Alert>
            )}

            {/* 1. Network Provider Selection */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <FormLabel className="text-xs font-semibold text-foreground">
                  Select Network Provider
                </FormLabel>
                <span className="text-[11px] text-muted-foreground">
                  Cashback credited instantly
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {TELECOM_NETWORKS.map((net) => {
                  const isSelected = selectedNetwork === net.id;
                  return (
                    <button
                      key={net.id}
                      type="button"
                      onClick={() =>
                        form.setValue("network", net.id, {
                          shouldValidate: true,
                        })
                      }
                      className={cn(
                        "relative flex flex-col items-center justify-center rounded-[10px] border p-3.5 text-center transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
                        isSelected
                          ? "border-primary bg-primary/[0.04] text-foreground shadow-none"
                          : "border-border bg-card hover:bg-muted/30 text-foreground"
                      )}
                      aria-pressed={isSelected}
                    >
                      {/* Brand indicator dot */}
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <div
                          className="size-2.5 rounded-full"
                          style={{ backgroundColor: net.color }}
                          aria-hidden="true"
                        />
                        <span className="text-sm font-bold uppercase tracking-wide">
                          {net.name}
                        </span>
                      </div>

                      <span className="rounded-[4px] bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {Math.round(net.discountRate * 100)}% Cashback
                      </span>

                      {isSelected && (
                        <div className="absolute top-2 right-2 text-primary">
                          <Check className="size-3.5" strokeWidth={2.5} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Recipient Phone Number */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-xs font-semibold text-foreground">
                      Phone Number
                    </FormLabel>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-muted-foreground">Quick:</span>
                      <button
                        type="button"
                        onClick={() => form.setValue("phone", "08031234567", { shouldValidate: true })}
                        className="rounded-[4px] bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono font-medium text-foreground hover:bg-muted transition-colors"
                      >
                        08031234567
                      </button>
                      <button
                        type="button"
                        onClick={() => form.setValue("phone", "08051234567", { shouldValidate: true })}
                        className="rounded-[4px] bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono font-medium text-foreground hover:bg-muted transition-colors"
                      >
                        08051234567
                      </button>
                    </div>
                  </div>

                  <FormControl>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-xs font-bold text-muted-foreground font-mono">
                          +234
                        </span>
                      </div>
                      <Input
                        {...field}
                        type="tel"
                        inputMode="numeric"
                        placeholder="08031234567"
                        maxLength={11}
                        className="font-mono text-sm pl-13 h-10 rounded-[8px]"
                      />
                      {activeNetworkInfo && field.value.length >= 4 && (
                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 rounded-[6px] border border-border bg-muted/60 px-2 py-0.5">
                          <div
                            className="size-2 rounded-full"
                            style={{ backgroundColor: activeNetworkInfo.color }}
                            aria-hidden="true"
                          />
                          <span className="text-[10px] font-bold uppercase text-foreground">
                            {activeNetworkInfo.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* 3. Amount & Quick Pills */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-xs font-semibold text-foreground">
                      Airtime Amount (₦)
                    </FormLabel>
                    <span className="text-muted-foreground text-[11px]">
                      Min: ₦50 · Max: ₦50,000
                    </span>
                  </div>

                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      inputMode="numeric"
                      min={50}
                      max={50000}
                      step={50}
                      placeholder="500"
                      className="font-mono text-sm h-10 rounded-[8px]"
                    />
                  </FormControl>

                  {/* Quick Amount Buttons */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {QUICK_AIRTIME_AMOUNTS.map((amt) => {
                      const isSelected = field.value === amt;
                      return (
                        <button
                          key={amt}
                          type="button"
                          onClick={() =>
                            form.setValue("amount", amt, {
                              shouldValidate: true,
                            })
                          }
                          className={cn(
                            "rounded-[8px] border px-3 py-1.5 font-mono text-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground font-semibold shadow-none"
                              : "border-border bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
                          ₦{amt.toLocaleString()}
                        </button>
                      );
                    })}
                  </div>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* 4. Price & Cashback Breakdown */}
            <div className="rounded-[10px] border border-border bg-muted/20 p-4 space-y-2.5 text-xs">
              <div className="text-muted-foreground flex justify-between">
                <span>Selected Amount:</span>
                <span className="font-mono font-medium text-foreground">
                  ₦{enteredAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>
                  Cashback Discount (
                  {Math.round(activeNetworkInfo.discountRate * 100)}%):
                </span>
                <span className="font-mono font-semibold">
                  -₦{discountAmount.toLocaleString()}
                </span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between items-center font-bold">
                <span className="text-foreground">Amount to Pay:</span>
                <span className="text-primary font-mono text-base font-extrabold">
                  ₦{finalChargeAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {!isBalanceSufficient && (
              <Alert variant="warning" className="flex items-center gap-2 rounded-[8px]">
                <Wallet className="size-4 shrink-0" strokeWidth={NAV_ICON_STROKE_WIDTH} />
                <span className="text-xs">
                  Insufficient wallet balance. Please{" "}
                  <Link href={ROUTES.WALLET} className="font-bold underline">
                    top up your wallet
                  </Link>{" "}
                  to complete this order.
                </span>
              </Alert>
            )}

            <SubmitButton
              disabled={!isBalanceSufficient}
              className="h-11 w-full text-xs font-semibold rounded-[8px]"
              loadingText="Processing order..."
            >
              <span>Review Order</span>
              <ArrowRight className="ml-2 size-4" strokeWidth={NAV_ICON_STROKE_WIDTH} />
            </SubmitButton>
          </form>
        </Form>
      </CardContent>

      {/* Confirmation Modal Step (Doc 23 §F16.1 & F16.4) */}
      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Confirm Airtime Purchase"
        variant="default"
        confirmText={
          isSubmitting
            ? "Processing..."
            : `Pay ₦${finalChargeAmount.toLocaleString()}`
        }
        isLoading={isSubmitting}
        onConfirm={handleConfirmPurchase}
        description="Please verify your recipient details. Airtime top-ups are dispatched immediately and cannot be reversed once processed."
      >
        <div className="space-y-3.5 pt-1">
          <div className="rounded-[10px] border border-border bg-card p-3.5 space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Network Provider</span>
              <span className="font-bold uppercase text-foreground">
                {selectedNetwork}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Recipient Phone</span>
              <span className="font-mono font-semibold text-foreground">
                {enteredPhone}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Airtime Value</span>
              <span className="font-mono font-medium text-foreground">
                ₦{enteredAmount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
              <span>Cashback Savings</span>
              <span className="font-mono font-semibold">
                -₦{discountAmount.toLocaleString()}
              </span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between font-bold">
              <span className="text-foreground">Net Wallet Debit:</span>
              <span className="text-primary font-mono text-sm">
                ₦{finalChargeAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Wallet Balance Impact */}
          <div className="grid grid-cols-2 gap-2 rounded-[8px] border border-border bg-muted/30 p-2.5 text-[11px]">
            <div>
              <span className="text-muted-foreground block">Current Balance</span>
              <span className="font-mono font-bold text-foreground">
                {formatCurrency(walletBalance, "NGN")}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">Balance After</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(Math.max(0, walletBalance - finalChargeMinor), "NGN")}
              </span>
            </div>
          </div>

          {/* 4-Digit Transaction PIN Input */}
          <div className="space-y-1.5 rounded-[8px] border border-border bg-muted/20 p-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Lock className="size-3.5 text-primary" strokeWidth={NAV_ICON_STROKE_WIDTH} />
                <span>Transaction PIN</span>
              </span>
              <span className="text-[10px] text-muted-foreground">
                4-digit security code
              </span>
            </div>
            <Input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="••••"
              className="font-mono text-center text-lg tracking-widest h-10 rounded-[8px]"
              aria-label="Transaction PIN"
            />
          </div>
        </div>
      </ConfirmDialog>
    </Card>
  );
}
