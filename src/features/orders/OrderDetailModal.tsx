"use client";

import * as React from "react";
import Link from "next/link";
import {
  Copy,
  Check,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  HelpCircle,
  RotateCcw,
  Wifi,
  Phone,
  MessageSquare,
  Shield,
  Share2,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/navigation";
import { formatCurrency, formatDate } from "@/lib/formatters";
import type { OrderCategory, OrderRecord, OrderStatus } from "./api";

export interface OrderDetailModalProps {
  order: OrderRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewReceipt?: (order: OrderRecord) => void;
}

export function getOrderStatusBadge(status: OrderStatus) {
  switch (status) {
    case "completed":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="size-3.5" />
          <span>Completed</span>
        </span>
      );
    case "processing":
    case "active":
    case "pending":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
          <Clock className="size-3.5" />
          <span>{status === "active" ? "Active" : "Processing"}</span>
        </span>
      );
    case "failed":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-700 dark:text-rose-400">
          <AlertCircle className="size-3.5" />
          <span>Failed</span>
        </span>
      );
    case "cancelled":
    case "refunded":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-500/20 bg-slate-500/10 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:text-slate-400">
          <RotateCcw className="size-3.5" />
          <span>{status === "refunded" ? "Refunded" : "Cancelled"}</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
          <span className="capitalize">{status}</span>
        </span>
      );
  }
}

export function getServiceCategoryIcon(category: OrderCategory, className = "size-4") {
  switch (category) {
    case "airtime":
      return <Phone className={className} />;
    case "data":
      return <Wifi className={className} />;
    case "numbers_otp":
      return <MessageSquare className={className} />;
    case "numbers_rent":
      return <Phone className={className} />;
    case "vpn":
      return <Shield className={className} />;
    case "social":
      return <Share2 className={className} />;
    default:
      return <Package className={className} />;
  }
}

export function getCategoryLabel(category: OrderCategory): string {
  switch (category) {
    case "airtime":
      return "Airtime Top-up";
    case "data":
      return "Mobile Data";
    case "numbers_otp":
      return "SMS Verification (OTP)";
    case "numbers_rent":
      return "Virtual Number Rental";
    case "vpn":
      return "WireGuard VPN";
    case "social":
      return "Social Media Services";
    default:
      return "Digital Service";
  }
}

export function OrderDetailModal({
  order,
  open,
  onOpenChange,
  onViewReceipt,
}: OrderDetailModalProps) {
  const [copiedRef, setCopiedRef] = React.useState(false);
  const [copiedCode, setCopiedCode] = React.useState(false);

  if (!order) return null;

  const copyText = async (text: string, type: "ref" | "code") => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        if (type === "ref") {
          setCopiedRef(true);
          toast.success("Order ID copied to clipboard!");
          setTimeout(() => setCopiedRef(false), 2000);
        } else {
          setCopiedCode(true);
          toast.success("Code copied to clipboard!");
          setTimeout(() => setCopiedCode(false), 2000);
        }
      }
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const amountKobo = order.amount;
  const feeKobo = order.fee ?? 0;
  const totalKobo = amountKobo + feeKobo;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-lg rounded-2xl p-6"
        data-testid="order-detail-modal"
      >
        <DialogHeader className="border-b border-border/70 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#7A1F3D]/10 text-[#7A1F3D] dark:bg-[#7A1F3D]/20">
                {getServiceCategoryIcon(order.category, "size-5")}
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground sm:text-lg">
                  Order Details
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Purchased on {formatDate(order.created_at)}
                </DialogDescription>
              </div>
            </div>
            <div>{getOrderStatusBadge(order.status)}</div>
          </div>
        </DialogHeader>

        <div className="space-y-5 pt-3">
          {/* Section 1: Order Information */}
          <div className="rounded-xl border border-border/70 bg-muted/30 p-3.5 space-y-2.5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Order Information
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Order ID</span>
              <div className="flex items-center gap-1.5 font-mono font-medium text-foreground">
                <span>{order.reference}</span>
                <button
                  type="button"
                  onClick={() => copyText(order.reference, "ref")}
                  className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  title="Copy Order ID"
                >
                  {copiedRef ? (
                    <Check className="size-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Service Category</span>
              <span className="font-medium text-foreground">
                {getCategoryLabel(order.category)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Order Date</span>
              <span className="font-medium text-foreground">
                {formatDate(order.created_at)}
              </span>
            </div>
          </div>

          {/* Section 2: Purchase Information */}
          <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-2.5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Purchase Information
            </div>
            <div className="flex items-start justify-between text-xs gap-3">
              <span className="text-muted-foreground shrink-0">Product / Plan</span>
              <span className="font-medium text-foreground text-right">
                {order.service_name}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Recipient / Destination</span>
              <span className="font-mono font-medium text-foreground">
                {order.beneficiary}
              </span>
            </div>
            {order.provider && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Network / Provider</span>
                <span className="font-medium text-foreground">{order.provider}</span>
              </div>
            )}
          </div>

          {/* Section 3: Payment Information */}
          <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-2.5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Payment Information
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Purchase Amount</span>
              <span className="font-medium text-foreground">
                {formatCurrency(amountKobo, order.currency)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Service Fee</span>
              <span className="font-medium text-foreground">
                {formatCurrency(feeKobo, order.currency)}
              </span>
            </div>
            <div className="border-t border-border/60 pt-2 flex items-center justify-between text-sm font-bold">
              <span className="text-foreground">Total Paid</span>
              <span className="text-[#7A1F3D] dark:text-rose-400">
                {formatCurrency(totalKobo, order.currency)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
              <span>Payment Source</span>
              <span className="font-medium text-foreground">
                {order.payment_method ?? "KORAK Wallet"}
              </span>
            </div>
          </div>

          {/* Section 4: Fulfilment Information & Credentials */}
          <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-2.5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Fulfilment Information
            </div>

            {order.failure_reason ? (
              <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-2.5 text-xs text-rose-700 dark:text-rose-400 flex items-start gap-2">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{order.failure_reason}</span>
              </div>
            ) : (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Fulfilment Status</span>
                <span className="font-medium capitalize text-foreground">
                  {order.status === "completed"
                    ? "Successfully Fulfilled"
                    : order.status === "processing" || order.status === "active"
                    ? "Delivery in Progress"
                    : order.status}
                </span>
              </div>
            )}

            {order.credentials?.code && (
              <div className="rounded-lg border border-primary/20 bg-[#7A1F3D]/5 p-3 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-muted-foreground font-medium">
                    Verification SMS Code
                  </div>
                  <div className="font-mono text-base font-bold tracking-wider text-[#7A1F3D] dark:text-rose-400">
                    {order.credentials.code}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copyText(order.credentials?.code || "", "code")}
                  className="h-8 gap-1 rounded-lg text-xs font-semibold"
                >
                  {copiedCode ? (
                    <Check className="size-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                  <span>{copiedCode ? "Copied" : "Copy Code"}</span>
                </Button>
              </div>
            )}

            {order.credentials?.telecom_reference && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Carrier Reference</span>
                <span className="font-mono text-foreground">
                  {order.credentials.telecom_reference}
                </span>
              </div>
            )}

            {order.credentials?.server_endpoint && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Server Endpoint</span>
                <span className="font-mono text-foreground">
                  {order.credentials.server_endpoint}
                </span>
              </div>
            )}

            {order.credentials?.notes && (
              <div className="text-[11px] text-muted-foreground bg-muted/40 p-2.5 rounded-lg border border-border/50">
                <span className="font-medium text-foreground">Note: </span>
                {order.credentials.notes}
              </div>
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between border-t border-border/70 pt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            asChild
            className="h-9 gap-1.5 rounded-xl border-border/80 text-xs font-medium"
          >
            <Link href={ROUTES.SUPPORT || "/support"}>
              <HelpCircle className="size-3.5 text-muted-foreground" />
              <span>Contact Support</span>
            </Link>
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onOpenChange(false);
                onViewReceipt?.(order);
              }}
              className="h-9 gap-1.5 rounded-xl border-border/80 text-xs font-semibold text-foreground hover:bg-muted"
            >
              <FileText className="size-3.5 text-muted-foreground" />
              <span>View Receipt</span>
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-9 rounded-xl bg-[#7A1F3D] px-4 text-xs font-semibold text-white hover:bg-[#681a34]"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
