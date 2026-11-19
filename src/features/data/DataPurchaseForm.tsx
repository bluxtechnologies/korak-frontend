"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Wifi,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Lock,
  Printer,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { NAV_ICON_STROKE_WIDTH, ROUTES } from "@/config/navigation";
import { formatNaira } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import {
  TELECOM_NETWORKS,
  detectNetworkFromPhone,
  type NetworkInfo,
} from "@/features/airtime/api";
import {
  MOCK_DATA_PLANS,
  purchaseData,
  getDataPlans,
  getSupportedDataNetworks,
  getPlanValidityCategory,
  getPlanAllowance,
  type DataBundlePlan,
  type DataOrderResult,
  DATA_PLAN_TYPES,
} from "./api";
import { DataPlanModal } from "./DataPlanModal";

// ---------------------------------------------------------------------------
// Schema — Doc 09 §6: Client usability validation
// ---------------------------------------------------------------------------
export const dataFormSchema = z.object({
  network: z.enum(["mtn", "airtel", "glo", "9mobile"]),
  plan_type: z.enum(["sme", "corporate", "gifting"]),
  plan_id: z.string().min(1, "Please choose a data bundle package."),
  phone: z
    .string()
    .min(1, "Please enter a recipient phone number.")
    .regex(
      /^(?:(?:(?:\+?234)|0)?[789][01]\d{8})$/,
      "Enter a valid 11-digit Nigerian mobile number (e.g. 08012345678)."
    ),
});

export type DataFormData = z.infer<typeof dataFormSchema>;

export interface DataPurchaseFormProps {
  walletBalance?: number; // minor units (e.g. 500000 = ₦5,000.00)
  onOrderCompleted?: (order: DataOrderResult) => void;
  onSelectionChange?: (data: {
    network: NetworkInfo;
    plan: DataBundlePlan | undefined;
    phone: string;
  }) => void;
  className?: string;
}

export function DataPurchaseForm({
  walletBalance = 500000,
  onOrderCompleted,
  onSelectionChange,
  className,
}: DataPurchaseFormProps) {
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = React.useState(false);
  const [isCarrierDropdownOpen, setIsCarrierDropdownOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [rootError, setRootError] = React.useState<string | null>(null);
  const [pin, setPin] = React.useState<string>("1234");
  const [hasCopiedRef, setHasCopiedRef] = React.useState(false);
  const [completedOrder, setCompletedOrder] =
    React.useState<DataOrderResult | null>(null);
  const [availablePlans, setAvailablePlans] = React.useState<DataBundlePlan[]>(MOCK_DATA_PLANS);
  const [networks, setNetworks] = React.useState<NetworkInfo[]>(TELECOM_NETWORKS);

  // Dynamic discovery of supported telecom data networks
  React.useEffect(() => {
    let ignore = false;
    getSupportedDataNetworks().then((data) => {
      if (!ignore && data && data.length > 0) {
        setNetworks(data);
      }
    });
    return () => {
      ignore = true;
    };
  }, []);

  const form = useForm<DataFormData>({
    resolver: zodResolver(dataFormSchema),
    defaultValues: {
      network: "mtn",
      plan_type: "sme",
      plan_id: "mtn_sme_1gb",
      phone: "",
    },
    mode: "onChange",
  });

  const selectedNetwork = form.watch("network");
  const selectedPlanType = form.watch("plan_type");
  const selectedPlanId = form.watch("plan_id");
  const enteredPhone = form.watch("phone");

  const currentNetworkInfo = React.useMemo(() => {
    return (
      networks.find((n) => n.id === selectedNetwork) ||
      TELECOM_NETWORKS.find((n) => n.id === selectedNetwork) ||
      networks[0] ||
      TELECOM_NETWORKS[0]
    );
  }, [networks, selectedNetwork]);

  // Load plans whenever network changes
  React.useEffect(() => {
    let isMounted = true;
    getDataPlans(selectedNetwork)
      .then((plans) => {
        if (!isMounted) return;
        const networkPlans = plans.filter((p) => p.network === selectedNetwork);
        setAvailablePlans(
          networkPlans.length > 0
            ? networkPlans
            : MOCK_DATA_PLANS.filter((p) => p.network === selectedNetwork)
        );
      })
      .catch(() => {
        if (!isMounted) return;
        setAvailablePlans(MOCK_DATA_PLANS.filter((p) => p.network === selectedNetwork));
      });

    return () => {
      isMounted = false;
    };
  }, [selectedNetwork]);

  // Keep plan_id synced when network or availablePlans changes
  React.useEffect(() => {
    if (availablePlans.length > 0) {
      const exists = availablePlans.some((p) => p.id === selectedPlanId);
      if (!exists) {
        // Prefer matching plan_type if available
        const matchingType = availablePlans.find((p) => p.plan_type === selectedPlanType);
        form.setValue("plan_id", (matchingType || availablePlans[0]).id, {
          shouldValidate: true,
        });
      }
    }
  }, [availablePlans, selectedPlanId, selectedPlanType, form]);

  // Auto-detect carrier from phone prefix
  React.useEffect(() => {
    if (enteredPhone && enteredPhone.length >= 4) {
      const detected = detectNetworkFromPhone(enteredPhone);
      if (detected && detected !== selectedNetwork) {
        form.setValue("network", detected, { shouldValidate: true });
      }
    }
  }, [enteredPhone, selectedNetwork, form]);

  const activePlan: DataBundlePlan | undefined = React.useMemo(() => {
    return (
      availablePlans.find((p) => p.id === selectedPlanId) ||
      MOCK_DATA_PLANS.find((p) => p.id === selectedPlanId) ||
      availablePlans[0]
    );
  }, [availablePlans, selectedPlanId]);

  // Notify parent of state changes
  React.useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange({
        network: currentNetworkInfo,
        plan: activePlan,
        phone: enteredPhone || "",
      });
    }
  }, [currentNetworkInfo, activePlan, enteredPhone, onSelectionChange]);

  const balanceInMajorUnits = walletBalance / 100;
  const isInsufficient = activePlan ? activePlan.price > balanceInMajorUnits : false;

  const handleValidateForConfirm = form.handleSubmit(() => {
    if (!activePlan) {
      toast.error("Please select a data bundle package.");
      return;
    }
    if (isInsufficient) {
      toast.error("Insufficient wallet balance for this bundle.");
      return;
    }
    setIsConfirmOpen(true);
  });

  const handleExecutePurchase = async () => {
    if (!activePlan) return;
    setIsSubmitting(true);
    setRootError(null);

    const values = form.getValues();
    try {
      const result = await purchaseData({
        network: values.network,
        plan_id: values.plan_id,
        phone: values.phone,
        amount: activePlan.price,
        package_name: activePlan.name,
        service_code: currentNetworkInfo.service_code,
        service_name: currentNetworkInfo.fullName,
      });

      setCompletedOrder(result);
      setIsConfirmOpen(false);

      if (result.status === "failed") {
        toast.error(
          "Data bundle delivery could not be completed by the network. Your wallet has been automatically refunded."
        );
      } else if (result.status === "processing") {
        toast.info(
          "Data bundle request is processing with the network provider. Your line will be credited shortly."
        );
      } else {
        toast.success(result.message || "Data bundle credited successfully!");
      }

      if (onOrderCompleted) onOrderCompleted(result);
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
          "Could not complete data bundle purchase. Please try again.";
        setRootError(msg);
        toast.error(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForNewOrder = () => {
    setCompletedOrder(null);
    form.reset({
      network: "mtn",
      plan_type: "sme",
      plan_id: availablePlans[0]?.id || "mtn_sme_1gb",
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
    const isFailed = completedOrder.status === "failed";
    const isProcessing = completedOrder.status === "processing";

    return (
      <Card
        className={cn(
          "rounded-[10px] border border-border bg-card shadow-none overflow-hidden",
          className
        )}
        data-testid="data-success-card"
      >
        <CardHeader
          className={cn(
            "border-b border-border p-6 text-center",
            isFailed
              ? "bg-amber-500/5 dark:bg-amber-500/10"
              : isProcessing
              ? "bg-primary/5 dark:bg-primary/10"
              : "bg-muted/20"
          )}
        >
          <div
            className={cn(
              "mx-auto flex size-12 items-center justify-center rounded-[10px]",
              isFailed
                ? "border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                : isProcessing
                ? "border border-primary/20 bg-primary/10 text-primary"
                : "border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            )}
          >
            {isFailed ? (
              <AlertCircle className="size-6" strokeWidth={NAV_ICON_STROKE_WIDTH} />
            ) : isProcessing ? (
              <Clock className="size-6" strokeWidth={NAV_ICON_STROKE_WIDTH} />
            ) : (
              <CheckCircle2 className="size-6" strokeWidth={NAV_ICON_STROKE_WIDTH} />
            )}
          </div>
          <CardTitle className="mt-3 text-lg font-bold text-foreground sm:text-xl">
            {isFailed
              ? "Data Bundle Delivery Failed"
              : isProcessing
              ? "Data Bundle Request Processing"
              : "Data Bundle Credited"}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            {isFailed
              ? "Carrier route unavailable — wallet automatically refunded"
              : isProcessing
              ? "Direct carrier provisioning currently in progress"
              : "Direct high-speed carrier provisioning completed"}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-5 text-sm">
          {/* Status Alert Banners */}
          {isFailed && (
            <div
              className="flex items-start gap-2.5 rounded-[8px] border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-900 dark:text-amber-200"
              data-testid="data-auto-refund-alert"
            >
              <AlertCircle
                className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400"
                strokeWidth={NAV_ICON_STROKE_WIDTH}
              />
              <div className="space-y-1">
                <p className="font-semibold">
                  Data bundle delivery could not be completed by the network. Your wallet has been automatically refunded.
                </p>
                <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80">
                  ₦{completedOrder.amount.toLocaleString()} has been restored to your wallet ledger. No funds were debited.
                </p>
              </div>
            </div>
          )}

          {isProcessing && (
            <div
              className="flex items-start gap-2.5 rounded-[8px] border border-primary/30 bg-primary/10 p-3.5 text-xs text-foreground"
              data-testid="data-processing-alert"
            >
              <Clock
                className="mt-0.5 size-4 shrink-0 text-primary"
                strokeWidth={NAV_ICON_STROKE_WIDTH}
              />
              <div className="space-y-1">
                <p className="font-semibold">
                  Data bundle request is processing with the network provider. Your line will be credited shortly.
                </p>
                <p className="text-[11px] text-muted-foreground">
                  The telecom network has accepted the request and is provisioning the data bundle.
                </p>
              </div>
            </div>
          )}

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
                  <Check className="size-3.5 text-emerald-600" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </button>
            </div>
          </div>

          <div className="rounded-[8px] border border-border bg-muted/10 p-4 space-y-3">
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
              <span className="text-foreground">
                {isFailed ? "Amount Refunded" : "Total Debited"}
              </span>
              <span
                className={cn(
                  "font-mono",
                  isFailed
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-primary"
                )}
              >
                ₦{completedOrder.amount.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-[8px] border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-muted-foreground">
            <ShieldCheck
              className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
              strokeWidth={NAV_ICON_STROKE_WIDTH}
            />
            <span>
              {isFailed
                ? "Transaction verified and balance safely credited back to your wallet."
                : "Automated carrier cluster delivery. Check data balance using the network USSD code."}
            </span>
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
            <Printer
              className="size-3.5 text-muted-foreground"
              strokeWidth={NAV_ICON_STROKE_WIDTH}
            />
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
    <div className={cn("space-y-6", className)} data-testid="data-purchase-card">
      {/* 4.A Page Introduction (Reference 1) */}
      <div className="space-y-3">
        <Link
          href={ROUTES.SERVICES}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" strokeWidth={NAV_ICON_STROKE_WIDTH} />
          <span>Back to Services</span>
        </Link>

        <div className="flex items-center gap-3 pt-1">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
            <Wifi className="size-5" strokeWidth={NAV_ICON_STROKE_WIDTH} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Mobile Data
              <span className="sr-only">Buy Data Bundles</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Choose a data bundle for your recipient.
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={handleValidateForConfirm} className="space-y-6" noValidate>
          {rootError && (
            <Alert variant="destructive" className="flex items-start gap-2 rounded-[8px]">
              <AlertCircle className="mt-0.5 size-4 shrink-0" strokeWidth={NAV_ICON_STROKE_WIDTH} />
              <span className="text-xs">{rootError}</span>
            </Alert>
          )}

          {/* 4.B Section 1: Recipient Phone Number & Carrier */}
          <div className="space-y-2">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-foreground">
                1. Recipient Phone Number & Carrier
              </h2>
              <p className="text-xs text-muted-foreground">
                Select your carrier and enter the mobile number to top up.
              </p>
            </div>

            {/* Combined Carrier + Phone Input Container */}
            <div className="relative">
              <div className="flex items-center h-12 w-full rounded-[10px] border border-border bg-card transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-primary shadow-2xs">
                {/* Carrier Dropdown Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsCarrierDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 h-full px-3.5 hover:bg-muted/40 transition-colors rounded-l-[9px] focus:outline-none shrink-0"
                  aria-label="Toggle network carrier dropdown"
                  aria-haspopup="listbox"
                  aria-expanded={isCarrierDropdownOpen}
                >
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-[4px] bg-background p-0.5">
                    <img
                      src={currentNetworkInfo.logo}
                      alt={currentNetworkInfo.name}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-foreground">
                    {currentNetworkInfo.name}
                  </span>
                  <ChevronDown className="size-3.5 text-muted-foreground" />
                </button>

                {/* Vertical Divider */}
                <div className="h-6 w-px bg-border shrink-0" aria-hidden="true" />

                {/* Recipient Phone Field */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="flex-1 h-full space-y-0">
                      <FormControl>
                        <input
                          {...field}
                          type="tel"
                          placeholder="08031234567"
                          autoComplete="tel"
                          className="w-full h-full border-none bg-transparent px-3.5 text-xs sm:text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Validation error message if phone invalid */}
              {form.formState.errors.phone && (
                <p className="text-xs font-medium text-destructive mt-1.5">
                  {form.formState.errors.phone.message}
                </p>
              )}

              {/* Carrier Selection Popover Menu */}
              {isCarrierDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsCarrierDropdownOpen(false)}
                    aria-hidden="true"
                  />
                  <div
                    role="listbox"
                    aria-label="Select carrier network"
                    className="absolute left-0 top-full mt-1.5 z-40 w-64 rounded-[10px] border border-border bg-card p-1.5 shadow-lg space-y-1"
                  >
                    {networks.map((net) => {
                      const isSelected = selectedNetwork === net.id;
                      return (
                        <div
                          key={net.id}
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            form.setValue("network", net.id, { shouldValidate: true });
                            setIsCarrierDropdownOpen(false);
                          }}
                          className={cn(
                            "flex items-center justify-between w-full rounded-[8px] px-3 py-2 text-xs font-semibold cursor-pointer transition-colors",
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "text-foreground hover:bg-muted"
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="flex size-6 shrink-0 items-center justify-center rounded-[4px] bg-background p-0.5 border border-border">
                              <img
                                src={net.logo}
                                alt={net.name}
                                className="h-full w-full object-contain"
                              />
                            </div>
                            <span>{net.fullName}</span>
                          </div>
                          {isSelected && <Check className="size-3.5" strokeWidth={2.5} />}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Carrier Network Selector Buttons */}
            <div className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar">
              {networks.map((net) => {
                const isSelected = selectedNetwork === net.id;
                return (
                  <button
                    key={net.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => form.setValue("network", net.id, { shouldValidate: true })}
                    className={cn(
                      "flex items-center gap-1.5 rounded-[6px] border px-2.5 py-1 text-[11px] font-semibold transition-all",
                      isSelected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-muted/20 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <img src={net.logo} alt="" className="size-3.5 object-contain" />
                    <span>{net.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4.C Section 2: Select Data Plan */}
          <div className="space-y-3">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-foreground">
                2. Select Data Plan
              </h2>
              <p className="text-xs text-muted-foreground">
                Choose a data bundle that fits your needs.
              </p>
            </div>

            {/* Prominent Selected Plan Component */}
            {activePlan ? (
              <div
                onClick={() => setIsPlanModalOpen(true)}
                className="group relative flex items-center justify-between rounded-[10px] border border-primary/30 bg-primary/[0.03] p-4 sm:p-5 transition-all hover:border-primary/60 cursor-pointer shadow-2xs"
              >
                <div className="space-y-1 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-[4px] bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                      {getPlanValidityCategory(activePlan)} PLAN
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">
                      {activePlan.validity}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors">
                    {activePlan.name}
                  </h3>

                  <p className="text-xs text-muted-foreground">
                    Allowance: {getPlanAllowance(activePlan)}
                  </p>
                </div>

                <div className="text-right flex items-center gap-3">
                  <div>
                    <span className="font-mono text-base sm:text-lg font-bold text-foreground block">
                      {formatNaira(activePlan.price)}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsPlanModalOpen(true);
                      }}
                      className="text-xs font-semibold text-primary group-hover:underline"
                    >
                      Change Plan
                    </button>
                  </div>

                  <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                    <ChevronRight className="size-4" strokeWidth={NAV_ICON_STROKE_WIDTH} />
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsPlanModalOpen(true)}
                className="flex items-center justify-between w-full rounded-[10px] border-2 border-dashed border-border bg-card p-4 sm:p-5 text-left transition-colors hover:border-primary/50 hover:bg-muted/20"
              >
                <div>
                  <span className="text-sm font-semibold text-foreground block">
                    No data plan selected
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Click to browse and choose an available bundle
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-[6px] text-xs font-semibold"
                >
                  Choose Plan
                </Button>
              </button>
            )}
          </div>

          {/* 4.E Wallet Balance Warning */}
          {isInsufficient && (
            <div className="rounded-[10px] border border-destructive/30 bg-destructive/[0.04] p-3 text-xs flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-destructive font-medium">
                <AlertCircle className="size-4 shrink-0" strokeWidth={NAV_ICON_STROKE_WIDTH} />
                <span>Insufficient wallet balance. Your wallet balance is insufficient for this purchase.</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPlanModalOpen(true)}
                  className="font-semibold text-foreground underline hover:text-primary transition-colors"
                >
                  Change Plan
                </button>
                <Link
                  href={ROUTES.WALLET}
                  className="font-semibold text-primary underline hover:opacity-80 transition-opacity"
                >
                  Add Money
                </Link>
              </div>
            </div>
          )}

          {/* 4.F Continue to Review Action Button */}
          <div className="pt-2">
            <Button
              type="submit"
              disabled={isSubmitting || !activePlan || isInsufficient}
              className="w-full h-12 rounded-[10px] bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-xs"
              aria-label="Review Order"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="size-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Continue to Review</span>
                  <span className="sr-only">Review Order</span>
                  <ArrowRight className="size-4" strokeWidth={NAV_ICON_STROKE_WIDTH} />
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>

      {/* 6. Data Plan Selection Modal */}
      <DataPlanModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        plans={availablePlans}
        selectedPlanId={selectedPlanId}
        onSelectPlan={(plan) => {
          form.setValue("plan_id", plan.id, { shouldValidate: true });
        }}
        networkName={currentNetworkInfo.fullName}
        networkLogo={currentNetworkInfo.logo}
      />

      {/* Confirmation & Authorization Dialog */}
      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Confirm Data Purchase"
        description={`You are about to purchase ${activePlan?.name || "data bundle"} for ${enteredPhone}.`}
        confirmText={`Pay ₦${activePlan?.price || 0}`}
        cancelText="Cancel"
        variant="default"
        isLoading={isSubmitting}
        onConfirm={handleExecutePurchase}
      >
        <div className="space-y-3 py-2 text-xs">
          <div className="rounded-[8px] border border-border bg-muted/20 p-3 space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Network Provider:</span>
              <span className="font-bold uppercase text-foreground">{currentNetworkInfo.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bundle:</span>
              <span className="font-semibold text-foreground">
                {activePlan?.name} ({activePlan?.size})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Validity:</span>
              <span className="font-medium text-foreground">{activePlan?.validity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Recipient Number:</span>
              <span className="font-mono font-bold text-foreground">{enteredPhone}</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between font-bold text-sm">
              <span className="text-foreground">Debit Amount:</span>
              <span className="text-primary font-mono">₦{activePlan?.price}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Lock className="size-3.5 text-muted-foreground" />
              <span>Enter 4-Digit Transaction PIN</span>
            </label>
            <Input
              type="password"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              className="h-10 text-center font-mono tracking-widest text-base rounded-[8px]"
              placeholder="••••"
            />
            <p className="text-[11px] text-muted-foreground text-center">
              Enter your transaction security PIN to authorize this purchase.
            </p>
          </div>
        </div>
      </ConfirmDialog>
    </div>
  );
}
