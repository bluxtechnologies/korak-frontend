"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Wifi,
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
  detectNetworkFromPhone,
  type TelecomNetwork,
} from "@/features/airtime/api";
import {
  DATA_PLAN_TYPES,
  MOCK_DATA_PLANS,
  purchaseData,
  type DataPlanType,
  type DataBundlePlan,
  type DataOrderResult,
} from "./api";

// ---------------------------------------------------------------------------
// Schema — Doc 09 §6: client validation is a usability aid, server re-validates
// ---------------------------------------------------------------------------
export const dataFormSchema = z.object({
  network: z.enum(["mtn", "airtel", "glo", "9mobile"]),
  plan_type: z.enum(["sme", "corporate", "gifting"]),
  plan_id: z.string().min(1, "Please select a data bundle package."),
  phone: z
    .string()
    .min(1, "Please enter a recipient phone number.")
    .regex(
      /^0[789][01]\d{8}$/,
      "Please enter a valid 11-digit Nigerian phone number (e.g. 08031234567)."
    ),
});

export type DataFormData = z.infer<typeof dataFormSchema>;

export interface DataPurchaseFormProps {
  walletBalance?: number; // minor units, e.g. 500000 = ₦5,000.00
  onOrderCompleted?: (order: DataOrderResult) => void;
  className?: string;
}

export function DataPurchaseForm({
  walletBalance = 500000,
  onOrderCompleted,
  className,
}: DataPurchaseFormProps) {
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [rootError, setRootError] = React.useState<string | null>(null);
  const [pin, setPin] = React.useState<string>("1234");
  const [hasCopiedRef, setHasCopiedRef] = React.useState(false);
  const [completedOrder, setCompletedOrder] =
    React.useState<DataOrderResult | null>(null);

  const form = useForm<DataFormData>({
    resolver: zodResolver(dataFormSchema),
    defaultValues: {
      network: "mtn",
      plan_type: "sme",
      plan_id: "mtn_sme_1gb",
      phone: "",
    },
  });

  const selectedNetwork = form.watch("network");
  const selectedPlanType = form.watch("plan_type");
  const selectedPlanId = form.watch("plan_id");
  const enteredPhone = form.watch("phone");

  // Filter plans available for current network and plan_type
  const availablePlans = React.useMemo(() => {
    return MOCK_DATA_PLANS.filter(
      (p) => p.network === selectedNetwork && p.plan_type === selectedPlanType
    );
  }, [selectedNetwork, selectedPlanType]);

  // When network or plan type changes, keep plan_id valid
  React.useEffect(() => {
    if (availablePlans.length > 0) {
      const stillValid = availablePlans.some((p) => p.id === selectedPlanId);
      if (!stillValid) {
        form.setValue("plan_id", availablePlans[0].id, {
          shouldValidate: true,
        });
      }
    } else {
      // If none for this combo (e.g. 9mobile SME), switch to corporate or available
      const fallback = MOCK_DATA_PLANS.find((p) => p.network === selectedNetwork);
      if (fallback) {
        form.setValue("plan_type", fallback.plan_type);
        form.setValue("plan_id", fallback.id);
      }
    }
  }, [selectedNetwork, selectedPlanType, availablePlans, selectedPlanId, form]);

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

  const activePlan =
    MOCK_DATA_PLANS.find((p) => p.id === selectedPlanId) ?? availablePlans[0];

  const planPrice = activePlan?.price ?? 0;
  const planPriceMinor = planPrice * 100;
  const isBalanceSufficient = walletBalance >= planPriceMinor;

  // Step 1: Open Confirmation Modal
  const handleValidateForConfirm = form.handleSubmit(() => {
    setRootError(null);
    setIsConfirmOpen(true);
  });

  // Step 2: Submit order to API
  const handleConfirmPurchase = async () => {
    const values = form.getValues();
    setIsSubmitting(true);
    setRootError(null);

    try {
      const order = await purchaseData({
        network: values.network,
        plan_id: values.plan_id,
        phone: values.phone,
      });

      setCompletedOrder(order);
      setIsConfirmOpen(false);
      toast.success(
        `${order.size} data bundle successfully dispatched to ${values.phone}!`
      );
      onOrderCompleted?.(order);
    } catch (err: unknown) {
      setIsConfirmOpen(false);
      const msg =
        (err as { message?: string })?.message ||
        "Could not complete data bundle purchase. Please try again.";
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
      plan_type: "sme",
      plan_id: "mtn_sme_1gb",
      phone: "",
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
        data-testid="data-success-card"
      >
        <CardHeader className="border-b border-border p-6 text-center bg-muted/20">
          <div className="mx-auto flex size-12 items-center justify-center rounded-[10px] border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-6" strokeWidth={NAV_ICON_STROKE_WIDTH} />
          </div>
          <CardTitle className="mt-3 text-lg font-bold text-foreground sm:text-xl">
            Data Bundle Credited
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Direct high-speed carrier provisioning completed
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
              <span className="text-muted-foreground">Data Package</span>
              <span className="font-semibold text-foreground">
                {completedOrder.plan_name} ({completedOrder.size})
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Recipient Phone</span>
              <span className="font-mono font-semibold text-foreground">
                {completedOrder.phone}
              </span>
            </div>
            <div className="border-t border-border pt-2.5 flex justify-between text-sm font-bold">
              <span className="text-foreground">Total Debited</span>
              <span className="text-primary font-mono">
                ₦{completedOrder.amount.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-[8px] border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" strokeWidth={NAV_ICON_STROKE_WIDTH} />
            <span>Automated carrier cluster delivery. Check data balance using the network USSD code.</span>
          </div>
        </CardContent>

        <CardFooter className="border-t border-border p-6 flex flex-col gap-2.5 sm:flex-row bg-muted/10">
          <Button
            type="button"
            onClick={handleResetForNewOrder}
            className="w-full flex-1 text-xs font-semibold rounded-[8px] h-10 sm:w-auto"
          >
            Buy Another Data Bundle
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
      data-testid="data-purchase-card"
    >
      <CardHeader className="border-b border-border p-6 pb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-[8px] border border-primary/20 bg-primary/10 text-primary">
              <Wifi className="size-4.5" strokeWidth={NAV_ICON_STROKE_WIDTH} />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                Buy Data Bundles
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Instant delivery for SME, Corporate, and Direct Gifting plans
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
                  1. Select Network
                </FormLabel>
                <span className="text-[11px] text-muted-foreground">
                  Instant automated delivery
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

                      <span className="text-[10px] font-medium text-muted-foreground">
                        4G / 5G Data
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

            {/* 2. Plan Type Selector Tabs */}
            <div className="space-y-2">
              <FormLabel className="text-xs font-semibold text-foreground">
                2. Data Plan Category
              </FormLabel>
              <div className="grid grid-cols-3 gap-2 rounded-[8px] bg-muted/40 p-1 border border-border">
                {DATA_PLAN_TYPES.map((type) => {
                  const isSelected = selectedPlanType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() =>
                        form.setValue("plan_type", type.id, {
                          shouldValidate: true,
                        })
                      }
                      className={cn(
                        "rounded-[6px] py-2 px-2.5 text-center text-xs font-medium transition-all focus:outline-none",
                        isSelected
                          ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                      aria-pressed={isSelected}
                    >
                      {type.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Data Bundle Package Selection Grid */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <FormLabel className="text-xs font-semibold text-foreground">
                  3. Choose Data Package
                </FormLabel>
                <span className="text-[11px] text-muted-foreground">
                  30-day validity
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {availablePlans.map((plan) => {
                  const isSelected = selectedPlanId === plan.id;
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() =>
                        form.setValue("plan_id", plan.id, {
                          shouldValidate: true,
                        })
                      }
                      className={cn(
                        "relative flex flex-col items-start rounded-[10px] border p-3.5 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
                        isSelected
                          ? "border-primary bg-primary/[0.04] text-foreground shadow-none"
                          : "border-border bg-card hover:bg-muted/30 text-foreground"
                      )}
                      aria-pressed={isSelected}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className="text-sm font-extrabold text-foreground tracking-tight">
                          {plan.size}
                        </span>
                        {isSelected && (
                          <div className="text-primary">
                            <Check className="size-3.5" strokeWidth={2.5} />
                          </div>
                        )}
                      </div>
                      <span className="mt-1 text-[11px] font-medium text-muted-foreground">
                        {plan.validity}
                      </span>
                      <span className="mt-2.5 font-mono text-xs font-bold text-primary">
                        ₦{plan.price.toLocaleString()}
                      </span>
                    </button>
                  );
                })}
              </div>
              <FormMessage className="text-xs" />
            </div>

            {/* 4. Recipient Phone Number */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-xs font-semibold text-foreground">
                      4. Recipient Phone Number
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
                  <p className="text-[11px] text-muted-foreground">
                    Note: Ensure line is active. Bundles apply to all ported/non-ported numbers.
                  </p>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* 5. Plan Summary Banner */}
            {activePlan && (
              <div className="rounded-[10px] border border-border bg-muted/20 p-4 space-y-2 text-xs">
                <div className="text-muted-foreground flex justify-between">
                  <span>Selected Bundle:</span>
                  <span className="font-semibold text-foreground">
                    {activePlan.name} ({activePlan.size})
                  </span>
                </div>
                <div className="text-muted-foreground flex justify-between">
                  <span>Validity Duration:</span>
                  <span className="font-medium text-foreground">
                    {activePlan.validity}
                  </span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between items-center font-bold">
                  <span className="text-foreground">Price:</span>
                  <span className="text-primary font-mono text-base font-extrabold">
                    ₦{activePlan.price.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {!isBalanceSufficient && (
              <Alert variant="warning" className="flex items-center gap-2 rounded-[8px]">
                <Wallet className="size-4 shrink-0" strokeWidth={NAV_ICON_STROKE_WIDTH} />
                <span className="text-xs">
                  Insufficient wallet balance for this bundle. Please{" "}
                  <Link href={ROUTES.WALLET} className="font-bold underline">
                    top up your wallet
                  </Link>
                  .
                </span>
              </Alert>
            )}

            <SubmitButton
              disabled={!isBalanceSufficient}
              className="h-11 w-full text-xs font-semibold rounded-[8px]"
              loadingText="Purchasing data..."
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
        title="Confirm Data Purchase"
        variant="default"
        confirmText={
          isSubmitting ? "Purchasing..." : `Pay ₦${planPrice.toLocaleString()}`
        }
        isLoading={isSubmitting}
        onConfirm={handleConfirmPurchase}
        description="Please verify recipient phone number and package carefully before confirming. Data deliveries are automated and non-refundable once processed by the telecom operator."
      >
        <div className="space-y-3.5 pt-1">
          <div className="rounded-[10px] border border-border bg-card p-3.5 space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Network:</span>
              <span className="font-bold uppercase text-foreground">
                {selectedNetwork}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bundle:</span>
              <span className="font-semibold text-foreground">
                {activePlan?.name} ({activePlan?.size})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Validity:</span>
              <span className="font-medium text-foreground">
                {activePlan?.validity}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Recipient:</span>
              <span className="font-mono font-semibold text-foreground">
                {enteredPhone}
              </span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between font-bold">
              <span className="text-foreground">Total Debited:</span>
              <span className="text-primary font-mono text-sm">
                ₦{planPrice.toLocaleString()}
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
                {formatCurrency(Math.max(0, walletBalance - planPriceMinor), "NGN")}
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
