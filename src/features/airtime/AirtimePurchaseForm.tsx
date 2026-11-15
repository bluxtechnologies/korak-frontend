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
import { ROUTES } from "@/config/navigation";
import { formatCurrency } from "@/lib/formatters";
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
  network: z.enum(["mtn", "airtel", "glo", "9mobile"], {
    required_error: "Please select a network provider.",
  }),
  phone: z
    .string()
    .min(1, "Please enter a phone number.")
    .regex(
      /^0[789][01]\d{8}$/,
      "Please enter a valid 11-digit Nigerian phone number (e.g. 08031234567)."
    ),
  amount: z.coerce
    .number({ invalid_type_error: "Please enter a valid amount." })
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

  // Render Completed / Success Receipt State
  if (completedOrder) {
    return (
      <Card className={className} data-testid="airtime-success-card">
        <CardHeader className="space-y-2 border-b border-border pb-4 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-md border border-emerald-500/20 bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 className="size-6" />
          </div>
          <CardTitle className="text-xl font-bold text-foreground">
            Airtime Purchase Successful
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Reference: {completedOrder.reference}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-6 text-sm">
          <div className="rounded-md border border-border bg-surface p-4 space-y-2.5">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Network</span>
              <span className="font-semibold uppercase text-foreground">
                {completedOrder.network}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Recipient Phone</span>
              <span className="font-mono font-medium text-foreground">
                {completedOrder.phone}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Airtime Value</span>
              <span className="font-medium text-foreground">
                ₦{completedOrder.amount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Discount Applied</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                -₦{completedOrder.discount.toLocaleString()}
              </span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between font-semibold">
              <span className="text-foreground">Total Debited</span>
              <span className="text-primary font-bold">
                ₦{completedOrder.final_amount.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 text-emerald-500 shrink-0" />
            <span>
              Direct automated telecom dispatch verified by network gateway.
            </span>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-2 border-t border-border pt-4">
          <Button
            type="button"
            onClick={handleResetForNewOrder}
            className="w-full sm:w-auto flex-1 text-xs"
          >
            Buy Another Airtime
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto flex-1 text-xs"
          >
            <Link href={ROUTES.TRANSACTIONS}>View Transactions</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className={className} data-testid="airtime-purchase-card">
      <CardHeader className="border-b border-border pb-4 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-md border border-border bg-surface text-primary">
              <Smartphone className="size-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-foreground">
                Buy Airtime
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Instant automated top-up with up to 3% cashback
              </CardDescription>
            </div>
          </div>

          {/* Available Wallet Balance */}
          <div className="text-right">
            <span className="text-[11px] text-muted-foreground block">
              Wallet Balance
            </span>
            <span className="font-mono text-xs font-semibold text-foreground">
              {formatCurrency(walletBalance, "NGN")}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <Form {...form}>
          <form
            onSubmit={handleValidateForConfirm}
            className="space-y-6"
            noValidate
          >
            {rootError && (
              <Alert variant="destructive" className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span className="text-xs">{rootError}</span>
              </Alert>
            )}

            {/* 1. Network Provider Selection */}
            <div className="space-y-2.5">
              <FormLabel className="text-xs font-medium text-foreground">
                Select Network Provider
              </FormLabel>
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
                      className={`relative flex flex-col items-center justify-center rounded-md border p-3 text-center transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5 text-primary shadow-xs"
                          : "border-border bg-card hover:bg-surface text-foreground"
                      }`}
                      aria-pressed={isSelected}
                    >
                      <span className="text-sm font-bold uppercase">
                        {net.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">
                        {Math.round(net.discountRate * 100)}% Cashback
                      </span>
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
                <FormItem>
                  <FormLabel className="text-xs font-medium">
                    Phone Number
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type="tel"
                        inputMode="numeric"
                        placeholder="08031234567"
                        maxLength={11}
                        className="font-mono text-sm"
                      />
                      {activeNetworkInfo && field.value.length >= 4 && (
                        <div className="absolute right-2.5 top-2.5">
                          <Badge variant="secondary" className="text-[10px]">
                            {activeNetworkInfo.name}
                          </Badge>
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
                    <FormLabel className="text-xs font-medium">
                      Airtime Amount (₦)
                    </FormLabel>
                    <span className="text-[11px] text-muted-foreground">
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
                      className="font-mono text-sm"
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
                          className={`rounded-md border px-2.5 py-1 text-xs font-mono transition-colors ${
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground font-semibold"
                              : "border-border bg-surface text-muted-foreground hover:text-foreground"
                          }`}
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

            {/* Price Breakdown Banner */}
            <div className="rounded-md border border-border bg-surface p-3.5 space-y-1.5 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Selected Amount:</span>
                <span className="font-mono font-medium text-foreground">
                  ₦{enteredAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>
                  Cashback Discount ({Math.round(activeNetworkInfo.discountRate * 100)}%):
                </span>
                <span className="font-mono font-medium">
                  -₦{discountAmount.toLocaleString()}
                </span>
              </div>
              <div className="border-t border-border pt-1.5 flex justify-between font-semibold">
                <span className="text-foreground">Amount to Pay:</span>
                <span className="font-mono text-primary text-sm font-bold">
                  ₦{finalChargeAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {!isBalanceSufficient && (
              <Alert variant="warning" className="flex items-center gap-2">
                <Wallet className="size-4 shrink-0" />
                <span className="text-xs">
                  Insufficient wallet balance. Please top up your wallet to
                  complete this order.
                </span>
              </Alert>
            )}

            <SubmitButton
              disabled={!isBalanceSufficient}
              className="w-full text-xs font-medium h-10"
              loadingText="Processing order..."
            >
              <span>Review Order</span>
              <ArrowRight className="ml-2 size-4" />
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
        description={
          <div className="space-y-3 pt-2 text-left">
            <p className="text-xs text-muted-foreground">
              Please verify your recipient details. Airtime top-ups are
              dispatched immediately and cannot be reversed once processed.
            </p>
            <div className="rounded-md border border-border bg-surface p-3 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Network:</span>
                <span className="font-semibold uppercase text-foreground">
                  {selectedNetwork}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Recipient:</span>
                <span className="font-mono font-medium text-foreground">
                  {enteredPhone}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Airtime Value:</span>
                <span className="font-mono font-medium text-foreground">
                  ₦{enteredAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Discount:</span>
                <span className="font-mono font-medium">
                  -₦{discountAmount.toLocaleString()}
                </span>
              </div>
              <div className="border-t border-border pt-1.5 flex justify-between font-bold">
                <span className="text-foreground">Net Wallet Debit:</span>
                <span className="font-mono text-primary text-sm">
                  ₦{finalChargeAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        }
      />
    </Card>
  );
}
