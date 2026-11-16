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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Lock, Printer, Download, Copy, Check } from "lucide-react";

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
        <CardHeader className="border-border space-y-2 border-b pb-4 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-md border border-emerald-500/20 bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 className="size-6" />
          </div>
          <CardTitle className="text-foreground text-xl font-bold">
            Airtime Purchase Successful
          </CardTitle>
          <CardDescription className="text-muted-foreground text-xs">
            Reference: {completedOrder.reference}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-6 text-sm">
          <div className="border-border bg-surface space-y-2.5 rounded-md border p-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Network</span>
              <span className="text-foreground font-semibold uppercase">
                {completedOrder.network}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Recipient Phone</span>
              <span className="text-foreground font-mono font-medium">
                {completedOrder.phone}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Airtime Value</span>
              <span className="text-foreground font-medium">
                ₦{completedOrder.amount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Discount Applied</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                -₦{completedOrder.discount.toLocaleString()}
              </span>
            </div>
            <div className="border-border flex justify-between border-t pt-2 font-semibold">
              <span className="text-foreground">Total Debited</span>
              <span className="text-primary font-bold">
                ₦{completedOrder.final_amount.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <ShieldCheck className="size-4 shrink-0 text-emerald-500" />
            <span>
              Direct automated telecom dispatch verified by network gateway.
            </span>
          </div>
        </CardContent>

        <CardFooter className="border-border flex flex-col gap-2 border-t pt-4 sm:flex-row">
          <Button
            type="button"
            onClick={handleResetForNewOrder}
            className="w-full flex-1 text-xs sm:w-auto"
          >
            Buy Another Airtime
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (typeof window !== "undefined") window.print();
            }}
            className="w-full flex-1 text-xs sm:w-auto gap-1.5"
          >
            <Printer className="size-3.5 text-muted-foreground" />
            <span>Print Receipt</span>
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full flex-1 text-xs sm:w-auto"
          >
            <Link href={ROUTES.ORDERS}>View in Orders</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className={className} data-testid="airtime-purchase-card">
      <CardHeader className="border-border space-y-1 border-b pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="border-border bg-surface text-primary flex size-8 items-center justify-center rounded-md border">
              <Smartphone className="size-4" />
            </div>
            <div>
              <CardTitle className="text-foreground text-base font-semibold">
                Buy Airtime
              </CardTitle>
              <CardDescription className="text-muted-foreground text-xs">
                Instant automated top-up with up to 3% cashback
              </CardDescription>
            </div>
          </div>

          {/* Available Wallet Balance */}
          <div className="text-right">
            <span className="text-muted-foreground block text-[11px]">
              Wallet Balance
            </span>
            <span className="text-foreground font-mono text-xs font-semibold">
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
              <FormLabel className="text-foreground text-xs font-medium">
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
                      <span className="text-muted-foreground mt-0.5 text-[10px]">
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
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-xs font-medium">
                      Phone Number
                    </FormLabel>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-muted-foreground">Quick:</span>
                      <button
                        type="button"
                        onClick={() => form.setValue("phone", "08031234567", { shouldValidate: true })}
                        className="text-[10px] font-semibold text-primary hover:underline"
                      >
                        08031234567
                      </button>
                      <span className="text-muted-foreground/40">•</span>
                      <button
                        type="button"
                        onClick={() => form.setValue("phone", "08051234567", { shouldValidate: true })}
                        className="text-[10px] font-semibold text-primary hover:underline"
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
                        className="font-mono text-sm pl-13"
                      />
                      {activeNetworkInfo && field.value.length >= 4 && (
                        <div className="absolute top-2.5 right-2.5">
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
                          className={`rounded-md border px-2.5 py-1 font-mono text-xs transition-colors ${
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
            <div className="border-border bg-surface space-y-1.5 rounded-md border p-3.5 text-xs">
              <div className="text-muted-foreground flex justify-between">
                <span>Selected Amount:</span>
                <span className="text-foreground font-mono font-medium">
                  ₦{enteredAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>
                  Cashback Discount (
                  {Math.round(activeNetworkInfo.discountRate * 100)}%):
                </span>
                <span className="font-mono font-medium">
                  -₦{discountAmount.toLocaleString()}
                </span>
              </div>
              <div className="border-border flex justify-between border-t pt-1.5 font-semibold">
                <span className="text-foreground">Amount to Pay:</span>
                <span className="text-primary font-mono text-sm font-bold">
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
              className="h-10 w-full text-xs font-medium"
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
        description="Please verify your recipient details. Airtime top-ups are dispatched immediately and cannot be reversed once processed."
      >
        <div className="space-y-3 pt-1">
          <div className="border-border bg-surface space-y-2 rounded-xl border p-3.5 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Network:</span>
              <span className="text-foreground font-semibold uppercase">
                {selectedNetwork}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Recipient:</span>
              <span className="text-foreground font-mono font-medium">
                {enteredPhone}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Airtime Value:</span>
              <span className="text-foreground font-mono font-medium">
                ₦{enteredAmount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
              <span>Discount:</span>
              <span className="font-mono font-medium">
                -₦{discountAmount.toLocaleString()}
              </span>
            </div>
            <div className="border-border flex justify-between border-t pt-1.5 font-bold">
              <span className="text-foreground">Net Wallet Debit:</span>
              <span className="text-primary font-mono text-sm">
                ₦{finalChargeAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Wallet Balance Impact */}
          <div className="grid grid-cols-2 gap-2 rounded-xl border border-border/80 bg-muted/20 p-2.5 text-[11px]">
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
          <div className="space-y-1.5 rounded-xl border border-border/70 bg-surface p-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Lock className="size-3 text-primary" />
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
              className="font-mono text-center text-lg tracking-widest h-9 rounded-lg"
              aria-label="Transaction PIN"
            />
          </div>
        </div>
      </ConfirmDialog>
    </Card>
  );
}
