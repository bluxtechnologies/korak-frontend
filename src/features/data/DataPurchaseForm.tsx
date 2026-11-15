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
  Wallet,
  ArrowRight,
  ShieldCheck,
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
import { ROUTES } from "@/config/navigation";
import { formatCurrency } from "@/lib/formatters";
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
// Schema — Doc 09 §6
// ---------------------------------------------------------------------------
export const dataFormSchema = z.object({
  network: z.enum(["mtn", "airtel", "glo", "9mobile"], {
    message: "Please select a network provider.",
  }),
  plan_type: z.enum(["sme", "corporate", "gifting"], {
    message: "Please select a data plan type.",
  }),
  plan_id: z.string().min(1, "Please choose a data bundle package."),
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
  walletBalance?: number; // minor units (e.g. 500000 = ₦5,000.00)
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

  // Available plans matching network and plan_type
  const availablePlans = React.useMemo(() => {
    const directMatches = MOCK_DATA_PLANS.filter(
      (p) => p.network === selectedNetwork && p.plan_type === selectedPlanType
    );
    if (directMatches.length > 0) return directMatches;
    // Fallback to any plans for this network if specific type has none
    return MOCK_DATA_PLANS.filter((p) => p.network === selectedNetwork);
  }, [selectedNetwork, selectedPlanType]);

  // Keep plan_id synced when network/type changes
  React.useEffect(() => {
    if (availablePlans.length > 0) {
      const exists = availablePlans.some((p) => p.id === selectedPlanId);
      if (!exists) {
        form.setValue("plan_id", availablePlans[0].id, {
          shouldValidate: true,
        });
      }
    }
  }, [availablePlans, selectedPlanId, form]);

  // Auto-detect network from phone
  React.useEffect(() => {
    if (enteredPhone && enteredPhone.length >= 4) {
      const detected = detectNetworkFromPhone(enteredPhone);
      if (detected && detected !== selectedNetwork) {
        form.setValue("network", detected, { shouldValidate: true });
      }
    }
  }, [enteredPhone, selectedNetwork, form]);

  const activePlan: DataBundlePlan | undefined = MOCK_DATA_PLANS.find(
    (p) => p.id === selectedPlanId
  );
  const planPrice = activePlan?.price ?? 0;
  const planPriceMinor = planPrice * 100;
  const isBalanceSufficient = walletBalance >= planPriceMinor;

  const handleValidateForConfirm = form.handleSubmit(() => {
    setRootError(null);
    setIsConfirmOpen(true);
  });

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
        `${order.plan_name} (${order.size}) delivered to ${values.phone}!`
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

  // Render Completed / Success Receipt State (Doc 23 §F16.3)
  if (completedOrder) {
    return (
      <Card className={className} data-testid="data-success-card">
        <CardHeader className="space-y-2 border-b border-border pb-4 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-md border border-emerald-500/20 bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 className="size-6" />
          </div>
          <CardTitle className="text-xl font-bold text-foreground">
            Data Bundle Credited
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
              <span className="text-muted-foreground">Package</span>
              <span className="font-medium text-foreground">
                {completedOrder.plan_name} ({completedOrder.size})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Recipient Phone</span>
              <span className="font-mono font-medium text-foreground">
                {completedOrder.phone}
              </span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between font-semibold">
              <span className="text-foreground">Total Debited</span>
              <span className="text-primary font-bold">
                ₦{completedOrder.amount.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 text-emerald-500 shrink-0" />
            <span>
              Direct automated telecom delivery completed via SIM cluster.
            </span>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-2 border-t border-border pt-4">
          <Button
            type="button"
            onClick={handleResetForNewOrder}
            className="w-full sm:w-auto flex-1 text-xs"
          >
            Buy Another Data Bundle
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
    <Card className={className} data-testid="data-purchase-card">
      <CardHeader className="border-b border-border pb-4 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-md border border-border bg-surface text-primary">
              <Wifi className="size-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-foreground">
                Buy Data Bundles
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Instant delivery for SME, Corporate, and Direct Gifting plans
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
                1. Select Network
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
                        4G / 5G Data
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Plan Type Selector Tabs */}
            <div className="space-y-2">
              <FormLabel className="text-xs font-medium text-foreground">
                2. Data Plan Category
              </FormLabel>
              <div className="grid grid-cols-3 gap-2">
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
                      className={`rounded-md border p-2 text-center text-xs transition-colors ${
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground font-semibold"
                          : "border-border bg-surface text-muted-foreground hover:text-foreground"
                      }`}
                      aria-pressed={isSelected}
                    >
                      {type.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Data Bundle Package Selection Grid */}
            <div className="space-y-2">
              <FormLabel className="text-xs font-medium text-foreground">
                3. Choose Data Package
              </FormLabel>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
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
                      className={`relative flex flex-col items-start rounded-md border p-3 text-left transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-xs"
                          : "border-border bg-card hover:bg-surface"
                      }`}
                      aria-pressed={isSelected}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className="font-bold text-sm text-foreground">
                          {plan.size}
                        </span>
                        {isSelected && (
                          <Check className="size-3.5 text-primary" />
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground mt-0.5">
                        {plan.validity}
                      </span>
                      <span className="font-mono text-xs font-semibold text-primary mt-2">
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
                <FormItem>
                  <FormLabel className="text-xs font-medium">
                    4. Recipient Phone Number
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="tel"
                      inputMode="numeric"
                      placeholder="08031234567"
                      maxLength={11}
                      className="font-mono text-sm"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Plan Summary Banner */}
            {activePlan && (
              <div className="rounded-md border border-border bg-surface p-3.5 space-y-1.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Selected Bundle:</span>
                  <span className="font-medium text-foreground">
                    {activePlan.name} ({activePlan.size})
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Validity Duration:</span>
                  <span className="font-medium text-foreground">
                    {activePlan.validity}
                  </span>
                </div>
                <div className="border-t border-border pt-1.5 flex justify-between font-semibold">
                  <span className="text-foreground">Price:</span>
                  <span className="font-mono text-primary text-sm font-bold">
                    ₦{activePlan.price.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {!isBalanceSufficient && (
              <Alert variant="warning" className="flex items-center gap-2">
                <Wallet className="size-4 shrink-0" />
                <span className="text-xs">
                  Insufficient wallet balance for this bundle. Please top up
                  your wallet.
                </span>
              </Alert>
            )}

            <SubmitButton
              disabled={!isBalanceSufficient}
              className="w-full text-xs font-medium h-10"
              loadingText="Purchasing data..."
            >
              <span>Review Data Order</span>
              <ArrowRight className="ml-2 size-4" />
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
          isSubmitting
            ? "Purchasing..."
            : `Pay ₦${planPrice.toLocaleString()}`
        }
        isLoading={isSubmitting}
        onConfirm={handleConfirmPurchase}
        description={
          <div className="space-y-3 pt-2 text-left">
            <p className="text-xs text-muted-foreground">
              Please verify recipient phone number and package carefully before
              confirming. Data deliveries are automated and non-refundable once
              processed by the telecom operator.
            </p>
            <div className="rounded-md border border-border bg-surface p-3 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Network:</span>
                <span className="font-semibold uppercase text-foreground">
                  {selectedNetwork}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bundle:</span>
                <span className="font-medium text-foreground">
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
                <span className="font-mono font-medium text-foreground">
                  {enteredPhone}
                </span>
              </div>
              <div className="border-t border-border pt-1.5 flex justify-between font-bold">
                <span className="text-foreground">Total Debited:</span>
                <span className="font-mono text-primary text-sm">
                  ₦{planPrice.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        }
      />
    </Card>
  );
}
