"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sparkles,
  Clock,
  Layers,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { formatCurrency } from "@/lib/formatters";
import { ROUTES } from "@/config/navigation";
import {
  getBoostServices,
  createSocialBoostOrder,
} from "./api";
import type {
  SocialBoostService,
  SocialPlatform,
  BoostOrderPayload,
} from "./types";
import type { OrderRecord } from "@/features/orders/api";

const BOOST_PLATFORMS: { id: string; label: string }[] = [
  { id: "all", label: "All Services" },
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
  { id: "x_twitter", label: "X (Twitter)" },
  { id: "youtube", label: "YouTube" },
];

export function BoostAccountView() {
  const [selectedPlatform, setSelectedPlatform] = React.useState("all");
  const [services, setServices] = React.useState<SocialBoostService[]>([]);
  const [selectedServiceId, setSelectedServiceId] = React.useState<string>("");
  const [loading, setLoading] = React.useState(true);

  // Form states
  const [targetLink, setTargetLink] = React.useState("");
  const [quantity, setQuantity] = React.useState<number>(1000);
  const [enableDripFeed, setEnableDripFeed] = React.useState(false);
  const [dripRuns, setDripRuns] = React.useState(5);
  const [dripInterval, setDripInterval] = React.useState(60);

  // Submission & Confirmation states
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [completedOrder, setCompletedOrder] = React.useState<OrderRecord | null>(
    null
  );
  const [formError, setFormError] = React.useState<string | null>(null);

  // Fetch services
  React.useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getBoostServices(selectedPlatform);
        setServices(data);
        if (data.length > 0 && (!selectedServiceId || !data.some((s) => s.id === selectedServiceId))) {
          setSelectedServiceId(data[0].id);
          setQuantity(data[0].min_quantity || 1000);
        }
      } catch {
        toast.error("Failed to load boost services");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedPlatform]);

  const activeService =
    services.find((s) => s.id === selectedServiceId) || services[0];

  // Price calculation
  const calculatedCost = React.useMemo(() => {
    if (!activeService || !quantity) return 0;
    return Math.round((quantity / 1000) * activeService.rate_per_thousand);
  }, [activeService, quantity]);

  const handleValidateAndOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!targetLink.trim()) {
      setFormError("Please enter a valid target URL or profile handle");
      return;
    }

    if (
      !targetLink.startsWith("http://") &&
      !targetLink.startsWith("https://") &&
      !targetLink.startsWith("@")
    ) {
      setFormError("Link must start with https:// or @username");
      return;
    }

    if (!activeService) {
      setFormError("Please select a boost service");
      return;
    }

    if (quantity < activeService.min_quantity) {
      setFormError(`Minimum order quantity for this service is ${activeService.min_quantity.toLocaleString()}`);
      return;
    }

    if (quantity > activeService.max_quantity) {
      setFormError(`Maximum order quantity for this service is ${activeService.max_quantity.toLocaleString()}`);
      return;
    }

    setConfirmOpen(true);
  };

  const handleExecuteOrder = async () => {
    if (!activeService) return;
    setIsSubmitting(true);
    setFormError(null);

    try {
      const idempotencyKey = `bst_${activeService.id}_${Date.now()}`;
      const payload: BoostOrderPayload = {
        service_id: activeService.id,
        platform: activeService.platform,
        target_link: targetLink.trim(),
        quantity,
        drip_feed: enableDripFeed
          ? { runs: dripRuns, interval_minutes: dripInterval }
          : undefined,
        idempotency_key: idempotencyKey,
      };

      const order = await createSocialBoostOrder(payload);
      setCompletedOrder(order);
      setConfirmOpen(false);
      toast.success("Boost order dispatched successfully!");
    } catch {
      toast.error("Order failed. Please verify your wallet balance.");
      setConfirmOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCompletedOrder(null);
    setTargetLink("");
    setFormError(null);
  };

  return (
    <div className="space-y-6" data-testid="boost-account-view">
      {/* Sub-navigation bar between Buy and Boost */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="text-xs font-semibold"
          >
            <Link href={ROUTES.SOCIAL_MEDIA_BUY}>Buy Verified Accounts</Link>
          </Button>
          <Button
            asChild
            variant="default"
            size="sm"
            className="text-xs font-semibold"
          >
            <Link href={ROUTES.SOCIAL_MEDIA_BOOST}>Boost & Engagement</Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="size-4 text-primary" />
          <span>High-Retention Safe Networks • Real-Time Progression</span>
        </div>
      </div>

      {completedOrder ? (
        /* Order Success State */
        <div className="rounded-xl border border-border bg-card p-6" data-testid="boost-success-banner">
          <div className="flex items-center gap-3 border-b border-border/60 pb-4">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Boost Order Queued Successfully
              </h3>
              <p className="text-xs text-muted-foreground">
                Order reference: <span className="font-mono font-semibold text-foreground">{completedOrder.reference}</span>
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3 rounded-lg border border-border/60 bg-muted/20 p-4 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service Name</span>
              <span className="font-semibold text-foreground">{completedOrder.service_name}</span>
            </div>
            <div className="flex justify-between border-t border-border/40 pt-2.5">
              <span className="text-muted-foreground">Target Destination</span>
              <span className="font-mono text-foreground">{completedOrder.beneficiary}</span>
            </div>
            <div className="flex justify-between border-t border-border/40 pt-2.5">
              <span className="text-muted-foreground">Amount Debited</span>
              <span className="font-mono font-bold text-foreground">
                {formatCurrency(completedOrder.amount, completedOrder.currency)}
              </span>
            </div>
            <div className="flex justify-between border-t border-border/40 pt-2.5">
              <span className="text-muted-foreground">Status</span>
              <Badge variant="outline" className="text-[11px] font-semibold capitalize">
                {completedOrder.status}
              </Badge>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={resetForm}
              className="text-xs font-semibold"
            >
              Place Another Boost
            </Button>

            <Button
              asChild
              size="sm"
              className="gap-1.5 text-xs font-bold"
            >
              <Link href={ROUTES.ORDERS}>
                <span>Track Progress in Orders</span>
                <ExternalLink className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        /* Order Creation Flow */
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Service Selector (5 cols) */}
          <div className="space-y-4 lg:col-span-5">
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                1. Select Platform & Service
              </h3>

              {/* Platform Pills */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {BOOST_PLATFORMS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPlatform(p.id)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                      selectedPlatform === p.id
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Service Cards Radio List */}
              <div className="mt-4 space-y-2.5">
                {loading ? (
                  [1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="h-20 animate-pulse rounded-lg border border-border/60 bg-muted/20"
                    />
                  ))
                ) : services.length === 0 ? (
                  <p className="py-6 text-center text-xs text-muted-foreground">
                    No services found for this platform.
                  </p>
                ) : (
                  services.map((srv) => (
                    <label
                      key={srv.id}
                      className={`flex cursor-pointer flex-col justify-between rounded-lg border p-3.5 transition-colors ${
                        selectedServiceId === srv.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                          : "border-border/70 hover:border-border hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="boost_service"
                            checked={selectedServiceId === srv.id}
                            onChange={() => setSelectedServiceId(srv.id)}
                            className="size-3.5 text-primary focus:ring-primary"
                          />
                          <span className="text-xs font-bold text-foreground">
                            {srv.title}
                          </span>
                        </div>
                      </div>

                      <p className="mt-1.5 pl-5.5 text-[11px] text-muted-foreground leading-relaxed">
                        {srv.description}
                      </p>

                      <div className="mt-2.5 flex items-center justify-between border-t border-border/40 pl-5.5 pt-2 text-[11px]">
                        <span className="font-mono font-bold text-foreground">
                          {formatCurrency(srv.rate_per_thousand, "NGN")} / 1k
                        </span>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="size-3" />
                          <span>{srv.delivery_speed}</span>
                        </div>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Order Form & Calculation (7 cols) */}
          <div className="space-y-4 lg:col-span-7">
            <form
              onSubmit={handleValidateAndOpenConfirm}
              className="rounded-xl border border-border bg-card p-5 space-y-5"
            >
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                2. Configure Target & Quantity
              </h3>

              {formError && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive-border bg-destructive-surface p-3 text-xs text-destructive">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Target Link Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Target URL or Profile Handle <span className="text-primary">*</span>
                </label>
                <Input
                  value={targetLink}
                  onChange={(e) => setTargetLink(e.target.value)}
                  placeholder={
                    activeService?.example_input || "https://... or @username"
                  }
                  className="h-10 text-xs font-mono"
                  data-testid="target-link-input"
                />
                <p className="text-[11px] text-muted-foreground">
                  Format: Enter full link (e.g. video, reel, post) or public handle.
                </p>
              </div>

              {/* Public Notice Banner */}
              <div className="flex items-start gap-2.5 rounded-lg border border-border/70 bg-muted/20 p-3 text-xs text-muted-foreground">
                <Info className="size-4 shrink-0 text-primary mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-semibold text-foreground">
                    Public Privacy Requirement
                  </span>
                  <p className="text-[11px] leading-relaxed">
                    Target profiles and posts must be set to PUBLIC before placing this order. Boosting to private accounts will fail without delivery.
                  </p>
                </div>
              </div>

              {/* Quantity Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">
                    Quantity Needed
                  </label>
                  {activeService && (
                    <span className="text-[11px] text-muted-foreground">
                      Min: {activeService.min_quantity.toLocaleString()} • Max:{" "}
                      {activeService.max_quantity.toLocaleString()}
                    </span>
                  )}
                </div>

                <Input
                  type="number"
                  min={activeService?.min_quantity || 100}
                  max={activeService?.max_quantity || 100000}
                  step={50}
                  value={quantity || ""}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="h-10 text-xs font-mono"
                  data-testid="quantity-input"
                />

                {/* Quick Increment Buttons */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[500, 1000, 2500, 5000, 10000].map((inc) => (
                    <button
                      key={inc}
                      type="button"
                      onClick={() => setQuantity(inc)}
                      className="rounded border border-border/70 px-2 py-0.5 text-[11px] font-mono text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      +{inc.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Drip-feed Toggle Option */}
              <div className="rounded-lg border border-border/60 p-3.5">
                <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={enableDripFeed}
                    onChange={(e) => setEnableDripFeed(e.target.checked)}
                    className="size-3.5 rounded border-border text-primary focus:ring-primary"
                  />
                  <span>Enable Drip-Feed Mode (Spread delivery gradually)</span>
                </label>

                {enableDripFeed && (
                  <div className="mt-3 grid grid-cols-2 gap-3 border-t border-border/40 pt-3">
                    <div>
                      <span className="text-[11px] text-muted-foreground">
                        Total Batches (Runs)
                      </span>
                      <Input
                        type="number"
                        min={2}
                        max={20}
                        value={dripRuns}
                        onChange={(e) => setDripRuns(Number(e.target.value))}
                        className="mt-1 h-8 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-muted-foreground">
                        Interval (Minutes)
                      </span>
                      <Input
                        type="number"
                        min={10}
                        max={1440}
                        step={10}
                        value={dripInterval}
                        onChange={(e) => setDripInterval(Number(e.target.value))}
                        className="mt-1 h-8 text-xs font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Live Price Summary Box */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-primary uppercase">
                      Total Calculated Cost
                    </span>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Debited securely from your primary wallet balance
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-2xl font-black text-foreground">
                      {formatCurrency(calculatedCost, "NGN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <Button
                type="submit"
                className="w-full gap-2 text-xs font-bold"
                data-testid="submit-boost-order-button"
              >
                <span>Review & Dispatch Order</span>
                <ArrowRight className="size-3.5" />
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirm Social Media Boost Order"
        description="Are you sure you want to dispatch this boost order? Once confirmed, the order will be queued with the provider and your wallet will be charged."
        confirmText="Confirm & Charge Wallet"
        variant="default"
        isLoading={isSubmitting}
        onConfirm={handleExecuteOrder}
      >
        {activeService && (
          <div className="space-y-2 rounded-lg border border-border/60 bg-muted/20 p-3 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service</span>
              <span className="font-semibold text-foreground text-right">{activeService.title}</span>
            </div>
            <div className="flex justify-between border-t border-border/40 pt-2">
              <span className="text-muted-foreground">Target</span>
              <span className="font-mono text-foreground">{targetLink}</span>
            </div>
            <div className="flex justify-between border-t border-border/40 pt-2">
              <span className="text-muted-foreground">Quantity</span>
              <span className="font-mono font-bold text-foreground">{quantity.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-border/40 pt-2">
              <span className="text-muted-foreground">Charge Amount</span>
              <span className="font-mono font-black text-foreground">
                {formatCurrency(calculatedCost, "NGN")}
              </span>
            </div>
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
}
