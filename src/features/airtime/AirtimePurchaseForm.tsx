"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  ChevronDown,
  Check,
  AlertCircle,
  Wallet,
  CheckCircle2,
  Copy,
  Printer,
  Lock,
  Clock,
} from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { NAV_ICON_STROKE_WIDTH, ROUTES } from "@/config/navigation";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { notifyWalletUpdated } from "@/features/wallet";
import {
  TELECOM_NETWORKS,
  QUICK_AIRTIME_AMOUNTS,
  detectNetworkFromPhone,
  purchaseAirtime,
  getSupportedAirtimeNetworks,
  type NetworkInfo,
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
      "Please enter a valid 11-digit Nigerian phone number (e.g. 08012345678)."
    ),
  amount: z
    .number()
    .min(100, "Minimum airtime amount is ₦100.")
    .max(50000, "Maximum airtime amount is ₦50,000."),
});

export type AirtimeFormData = z.infer<typeof airtimeFormSchema>;

export interface AirtimePurchaseFormProps {
  walletBalance?: number; // minor units (e.g. 0 = ₦0.00)
  onOrderCompleted?: (order: AirtimeOrderResult) => void;
  className?: string;
}

export function AirtimePurchaseForm({
  walletBalance = 0,
  onOrderCompleted,
  className,
}: AirtimePurchaseFormProps) {
  const [networks, setNetworks] =
    React.useState<NetworkInfo[]>(TELECOM_NETWORKS);
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [rootError, setRootError] = React.useState<string | null>(null);
  const [pin, setPin] = React.useState<string>("");
  const [hasCopiedRef, setHasCopiedRef] = React.useState(false);
  const [customAmountInput, setCustomAmountInput] = React.useState<string>("500");
  const [completedOrder, setCompletedOrder] =
    React.useState<AirtimeOrderResult | null>(null);

  React.useEffect(() => {
    let ignore = false;
    getSupportedAirtimeNetworks().then((loaded) => {
      if (!ignore && loaded && loaded.length > 0) {
        setNetworks(loaded);
      }
    });
    return () => {
      ignore = true;
    };
  }, []);

  const form = useForm<AirtimeFormData>({
    resolver: zodResolver(airtimeFormSchema),
    defaultValues: {
      network: "airtel",
      phone: "",
      amount: 500,
    },
    mode: "onChange",
  });

  const selectedNetwork = form.watch("network");
  const enteredPhone = form.watch("phone") || "";
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
    networks.find((n) => n.id === selectedNetwork) ??
    networks[0] ??
    TELECOM_NETWORKS[0];

  const discountAmount = Math.round(
    enteredAmount * activeNetworkInfo.discountRate
  );
  const finalChargeAmount = Math.max(0, enteredAmount - discountAmount);
  const finalChargeMinor = finalChargeAmount * 100;
  const isBalanceSufficient = walletBalance >= finalChargeMinor;
  const isFormValid =
    /^0[789][01]\d{8}$/.test(enteredPhone) &&
    enteredAmount >= 100 &&
    enteredAmount <= 50000;

  // Handle Preset Button Click
  const handleSelectPreset = (amt: number) => {
    form.setValue("amount", amt, { shouldValidate: true });
    setCustomAmountInput(String(amt));
  };

  // Handle Custom Amount Input Change
  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setCustomAmountInput(raw);
    const parsed = parseInt(raw, 10);
    form.setValue("amount", isNaN(parsed) ? 0 : parsed, {
      shouldValidate: true,
    });
  };

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
        service_code: activeNetworkInfo.service_code,
        service_name: activeNetworkInfo.fullName,
      });

      setCompletedOrder(order);
      setIsConfirmOpen(false);

      if (order.status === "failed") {
        toast.error(
          "Airtime recharge could not be delivered by the network. Your wallet has been automatically refunded."
        );
      } else if (order.status === "processing") {
        toast.info(
          "Airtime request is processing with the network provider. Your line will be credited shortly."
        );
      } else {
        toast.success(
          `₦${values.amount.toLocaleString()} airtime sent to ${values.phone}!`
        );
      }
      notifyWalletUpdated();
      onOrderCompleted?.(order);
    } catch (err: unknown) {
      setIsConfirmOpen(false);
      const errObj = err as {
        code?: string;
        message?: string;
        response?: { data?: { code?: string; message?: string } };
      };
      const code = errObj?.code || errObj?.response?.data?.code;
      if (code === "insufficient_balance") {
        const msg =
          "Insufficient wallet balance for this purchase. Please deposit funds into your wallet.";
        setRootError(msg);
        toast.error(msg);
      } else {
        const msg =
          errObj?.message ||
          errObj?.response?.data?.message ||
          "Could not complete airtime purchase. Please try again.";
        setRootError(msg);
        toast.error(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForNewOrder = () => {
    setCompletedOrder(null);
    setCustomAmountInput("500");
    form.reset({
      network: "airtel",
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
    const isFailed = completedOrder.status === "failed";
    const isProcessing = completedOrder.status === "processing";

    return (
      <div
        className={cn(
          "rounded-[16px] border border-border bg-card p-6 shadow-none max-w-2xl mx-auto space-y-6",
          className
        )}
        data-testid="airtime-success-card"
      >
        <div className="text-center space-y-2">
          <div
            className={cn(
              "mx-auto flex size-12 items-center justify-center rounded-[10px]",
              isFailed
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                : isProcessing
                ? "bg-primary/10 text-primary"
                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            )}
          >
            {isFailed ? (
              <AlertCircle
                className="size-6"
                strokeWidth={NAV_ICON_STROKE_WIDTH}
              />
            ) : isProcessing ? (
              <Clock
                className="size-6"
                strokeWidth={NAV_ICON_STROKE_WIDTH}
              />
            ) : (
              <CheckCircle2
                className="size-6"
                strokeWidth={NAV_ICON_STROKE_WIDTH}
              />
            )}
          </div>
          <h2 className="text-xl font-bold text-foreground">
            {isFailed
              ? "Recharge Failed (Auto-Refunded)"
              : isProcessing
              ? "Recharge Processing"
              : "Airtime Purchase Successful"}
          </h2>
          <p className="text-xs text-muted-foreground">
            {isFailed
              ? "Your wallet has been automatically credited back."
              : isProcessing
              ? "Request submitted to telecom network carrier."
              : "Direct telecom carrier delivery completed"}
          </p>
        </div>

        {/* Status Callout Banner */}
        {isFailed && (
          <div
            className="flex items-start gap-2.5 rounded-[10px] border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-800 dark:text-amber-300"
            data-testid="airtime-auto-refund-alert"
          >
            <AlertCircle
              className="mt-0.5 size-4 shrink-0"
              strokeWidth={NAV_ICON_STROKE_WIDTH}
            />
            <span>
              Airtime recharge could not be delivered by the network. Your wallet has been automatically refunded.
            </span>
          </div>
        )}

        {isProcessing && (
          <div
            className="flex items-start gap-2.5 rounded-[10px] border border-primary/20 bg-primary/5 p-3.5 text-xs text-foreground"
            data-testid="airtime-processing-alert"
          >
            <Clock
              className="mt-0.5 size-4 shrink-0 text-primary"
              strokeWidth={NAV_ICON_STROKE_WIDTH}
            />
            <span>
              Airtime request is processing with the network provider. Your line will be credited shortly.
            </span>
          </div>
        )}

        {/* Reference pill */}
        <div className="flex items-center justify-between rounded-[10px] border border-border bg-muted/30 px-4 py-3 text-xs">
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
                <Check
                  className="size-3.5 text-emerald-600"
                  strokeWidth={NAV_ICON_STROKE_WIDTH}
                />
              ) : (
                <Copy
                  className="size-3.5"
                  strokeWidth={NAV_ICON_STROKE_WIDTH}
                />
              )}
            </button>
          </div>
        </div>

        {/* Receipt summary */}
        <div className="rounded-[12px] border border-border bg-muted/20 p-4 space-y-3 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Network Provider</span>
            <span className="font-bold uppercase text-foreground">
              {completedOrder.network}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Recipient Phone</span>
            <span className="font-mono font-semibold text-foreground">
              {completedOrder.phone}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Airtime Amount</span>
            <span className="font-mono font-medium text-foreground">
              ₦{completedOrder.amount.toLocaleString()}.00
            </span>
          </div>
          {completedOrder.discount > 0 && !isFailed && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
              <span>Cashback Savings</span>
              <span className="font-mono font-semibold">
                -₦{completedOrder.discount.toLocaleString()}.00
              </span>
            </div>
          )}
          <div className="border-t border-border/80 pt-2.5 flex justify-between text-sm font-bold">
            <span className="text-foreground">
              {isFailed ? "Wallet Refunded" : "Total Debited"}
            </span>
            <span
              className={cn(
                "font-mono",
                isFailed ? "text-amber-600 dark:text-amber-400" : "text-primary"
              )}
            >
              ₦{completedOrder.final_amount.toLocaleString()}.00
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 sm:flex-row pt-2">
          <Button
            type="button"
            onClick={handleResetForNewOrder}
            className="flex-1 rounded-[10px] bg-primary text-white font-semibold h-11 text-xs"
          >
            Buy Another Airtime
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (typeof window !== "undefined") window.print();
            }}
            className="rounded-[10px] h-11 text-xs font-medium gap-1.5"
          >
            <Printer className="size-3.5 text-muted-foreground" strokeWidth={NAV_ICON_STROKE_WIDTH} />
            <span>Print Receipt</span>
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-[10px] h-11 text-xs font-medium"
          >
            <Link href={ROUTES.TRANSACTIONS}>View in Transactions</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn("grid grid-cols-1 gap-8 lg:grid-cols-12 items-start", className)}
      data-testid="airtime-purchase-card"
    >
      {/* ============================================================ */}
      {/* Left Column: Airtime Purchase Form (lg:col-span-7 xl:col-span-8) */}
      {/* ============================================================ */}
      <div className="space-y-8 lg:col-span-7 xl:col-span-8">
        <Form {...form}>
          <form onSubmit={handleValidateForConfirm} className="space-y-7" noValidate>
            {rootError && (
              <div className="flex items-start gap-2.5 rounded-[10px] border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle className="mt-0.5 size-4 shrink-0" strokeWidth={NAV_ICON_STROKE_WIDTH} />
                <span>{rootError}</span>
              </div>
            )}

            {/* Section 1: Recipient Phone Number & Carrier */}
            <div className="space-y-2">
              <h2 className="text-sm font-bold text-foreground sm:text-base">
                1. Recipient Phone Number & Carrier
              </h2>
              <p className="text-xs text-muted-foreground">
                Select your network carrier and enter the recipient mobile number.
              </p>

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="space-y-1.5 pt-1">
                    <FormControl>
                      {/* Combined Input Container */}
                      <div className="flex items-center rounded-[10px] border border-border bg-card transition-all focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20">
                        {/* Network Selector Dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              className="flex items-center gap-2.5 px-3.5 py-3 hover:bg-muted/40 transition-colors focus:outline-none rounded-l-[10px] shrink-0"
                              aria-label={`Select network carrier. Currently selected: ${activeNetworkInfo.name}`}
                            >
                              <div className="size-5 shrink-0 flex items-center justify-center">
                                <Image
                                  src={activeNetworkInfo.logo}
                                  alt={activeNetworkInfo.name}
                                  width={20}
                                  height={20}
                                  className="size-4.5 object-contain"
                                  unoptimized
                                />
                              </div>
                              <span className="text-xs sm:text-sm font-bold text-foreground">
                                {activeNetworkInfo.name}
                              </span>
                              <ChevronDown
                                className="size-3.5 text-muted-foreground"
                                strokeWidth={NAV_ICON_STROKE_WIDTH}
                              />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="start"
                            className="w-56 p-1.5 rounded-[10px] border-border bg-card shadow-lg"
                          >
                            {networks.map((net) => (
                              <DropdownMenuItem
                                key={net.id}
                                onClick={() =>
                                  form.setValue("network", net.id, {
                                    shouldValidate: true,
                                  })
                                }
                                className="flex items-center justify-between gap-2.5 px-3 py-2 rounded-[8px] cursor-pointer text-xs sm:text-sm"
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className="size-5 shrink-0 flex items-center justify-center">
                                    <Image
                                      src={net.logo}
                                      alt={net.name}
                                      width={20}
                                      height={20}
                                      className="size-4.5 object-contain"
                                      unoptimized
                                    />
                                  </div>
                                  <span className="font-semibold text-foreground">
                                    {net.name}
                                  </span>
                                </div>
                                {selectedNetwork === net.id && (
                                  <Check
                                    className="size-4 text-primary"
                                    strokeWidth={NAV_ICON_STROKE_WIDTH}
                                  />
                                )}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Subtle Vertical Divider */}
                        <div className="h-6 w-px bg-border shrink-0" aria-hidden="true" />

                        {/* Recipient Phone Input */}
                        <input
                          {...field}
                          type="tel"
                          inputMode="numeric"
                          placeholder="08012345678"
                          maxLength={11}
                          className="w-full bg-transparent px-3.5 py-3 text-xs sm:text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none rounded-r-[10px]"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            {/* Section 2: Select Amount */}
            <div className="space-y-2 pt-1">
              <h2 className="text-sm font-bold text-foreground sm:text-base">
                2. Select Amount
              </h2>
              <p className="text-xs text-muted-foreground">
                Choose a quick amount or enter a custom amount.
              </p>

              {/* 3-Column Preset Amount Grid */}
              <div className="grid grid-cols-3 gap-3 pt-1">
                {QUICK_AIRTIME_AMOUNTS.map((amt) => {
                  const isSelected = enteredAmount === amt;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleSelectPreset(amt)}
                      className={cn(
                        "h-12 rounded-[10px] border text-xs sm:text-sm font-bold transition-all focus:outline-none",
                        isSelected
                          ? "border-primary bg-primary/[0.05] text-primary dark:text-[#E892A8]"
                          : "border-border bg-card text-foreground hover:bg-muted/40 hover:border-border/80"
                      )}
                      aria-pressed={isSelected}
                    >
                      ₦{amt.toLocaleString()}
                    </button>
                  );
                })}
              </div>

              {/* Custom Amount Input */}
              <div className="space-y-1 pt-2">
                <div className="relative flex items-center rounded-[10px] border border-border bg-card transition-all focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20">
                  <div className="pointer-events-none flex items-center pl-4 text-xs sm:text-sm font-bold text-muted-foreground">
                    ₦
                  </div>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={100}
                    max={50000}
                    placeholder="500"
                    value={customAmountInput}
                    onChange={handleCustomAmountChange}
                    className="w-full bg-transparent py-3 pl-2.5 pr-4 text-xs sm:text-sm font-bold text-foreground placeholder:text-muted-foreground focus:outline-none"
                    aria-label="Custom airtime amount"
                  />
                </div>
                <div className="flex justify-end pr-1">
                  <span className="text-[11px] text-muted-foreground">
                    Min: ₦100 | Max: ₦50,000
                  </span>
                </div>
                {form.formState.errors.amount && (
                  <p className="text-xs font-medium text-destructive">
                    {form.formState.errors.amount.message}
                  </p>
                )}
              </div>
            </div>

            {/* Section 3: Continue to Review Action */}
            <Button
              type="submit"
              disabled={!isBalanceSufficient || !isFormValid}
              className="mt-6 h-12 w-full rounded-[10px] bg-primary text-white font-semibold text-xs sm:text-sm shadow-none hover:bg-primary/95 transition-colors disabled:opacity-50"
            >
              <span>Continue to Review →</span>
            </Button>
          </form>
        </Form>
      </div>

      {/* ============================================================ */}
      {/* Right Column: Order Summary Panel (lg:col-span-5 xl:col-span-4) */}
      {/* ============================================================ */}
      <div className="lg:col-span-5 xl:col-span-4">
        <div
          className="rounded-[16px] border border-border bg-card p-6 shadow-none space-y-6"
          data-testid="airtime-order-summary"
        >
          <h3 className="text-sm font-bold text-foreground sm:text-base">
            Order Summary
          </h3>

          {/* A. Selected Network Card */}
          <div className="flex items-center gap-3.5 rounded-[12px] border border-border/70 bg-muted/20 p-3.5">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-[8px] border border-border/50 bg-white p-1.5 shadow-2xs">
              <Image
                src={activeNetworkInfo.logo}
                alt={activeNetworkInfo.fullName}
                width={36}
                height={36}
                className="size-8 object-contain"
                unoptimized
              />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-foreground truncate">
                {activeNetworkInfo.fullName}
              </h4>
              <p className="text-[11px] text-muted-foreground">Airtime</p>
            </div>
          </div>

          {/* B. Purchase Information Rows */}
          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Recipient</span>
              <span className="font-mono font-medium text-foreground">
                {enteredPhone.trim() ? enteredPhone : "—"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Airtime Amount</span>
              <span
                className="font-mono font-medium text-foreground"
                data-testid="summary-airtime-amount"
              >
                {formatCurrency(enteredAmount * 100, "NGN")}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Service Fee</span>
              <span className="font-mono font-medium text-foreground">₦0.00</span>
            </div>

            <div className="border-t border-border/80 pt-3 flex justify-between items-center">
              <span className="text-xs sm:text-sm font-bold text-foreground">
                Total
              </span>
              <span
                className="font-mono text-sm sm:text-base font-bold text-foreground"
                data-testid="summary-total-amount"
              >
                {formatCurrency(enteredAmount * 100, "NGN")}
              </span>
            </div>
          </div>

          {/* C. Wallet Balance Component */}
          <div className="flex items-center justify-between rounded-[12px] border border-border/70 bg-muted/20 p-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-[6px] border border-border bg-card text-muted-foreground">
                <Wallet className="size-4" strokeWidth={NAV_ICON_STROKE_WIDTH} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-muted-foreground block leading-tight">
                  Wallet Balance
                </span>
                <span className="font-mono text-xs font-bold text-foreground">
                  {formatCurrency(walletBalance, "NGN")}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground block leading-tight">
                After purchase
              </span>
              <span
                className={cn(
                  "font-mono text-xs font-bold",
                  isBalanceSufficient
                    ? "text-foreground"
                    : "text-destructive"
                )}
              >
                {isBalanceSufficient
                  ? formatCurrency(Math.max(0, walletBalance - finalChargeMinor), "NGN")
                  : "₦0.00"}
              </span>
            </div>
          </div>

          {/* D. Insufficient Balance Notification */}
          {!isBalanceSufficient ? (
            <div className="flex items-center justify-between rounded-[10px] border border-rose-500/20 bg-rose-500/5 px-3.5 py-2.5 text-xs">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
                <AlertCircle
                  className="size-4 shrink-0"
                  strokeWidth={NAV_ICON_STROKE_WIDTH}
                />
                <span className="font-medium">Insufficient balance</span>
              </div>
              <Link
                href={ROUTES.WALLET}
                className="text-xs font-bold text-primary hover:underline"
              >
                Add Money →
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-[10px] border border-emerald-500/20 bg-emerald-500/5 px-3.5 py-2.5 text-xs text-emerald-700 dark:text-emerald-400">
              <CheckCircle2
                className="size-4 shrink-0"
                strokeWidth={NAV_ICON_STROKE_WIDTH}
              />
              <span className="font-medium">Available balance covers this order</span>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog Step */}
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
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Network Provider</span>
              <div className="flex items-center gap-1.5 font-bold uppercase text-foreground">
                <Image
                  src={activeNetworkInfo.logo}
                  alt={activeNetworkInfo.name}
                  width={16}
                  height={16}
                  className="size-3.5 object-contain"
                  unoptimized
                />
                <span>{activeNetworkInfo.fullName}</span>
              </div>
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
                ₦{enteredAmount.toLocaleString()}.00
              </span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>
                  Cashback Savings (
                  {Math.round(activeNetworkInfo.discountRate * 100)}%):
                </span>
                <span className="font-mono font-semibold">
                  -₦{discountAmount.toLocaleString()}.00
                </span>
              </div>
            )}
            <div className="border-t border-border pt-2 flex justify-between font-bold">
              <span className="text-foreground">Net Wallet Debit:</span>
              <span className="text-primary font-mono text-sm">
                ₦{finalChargeAmount.toLocaleString()}.00
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
    </div>
  );
}
