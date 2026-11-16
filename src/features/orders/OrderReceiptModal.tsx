"use client";

import * as React from "react";
import {
  Copy,
  Check,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  KeyRound,
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
import { formatCurrency, formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { OrderRecord } from "./api";

export interface OrderReceiptModalProps {
  order: OrderRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderReceiptModal({
  order,
  open,
  onOpenChange,
}: OrderReceiptModalProps) {
  const [copiedRef, setCopiedRef] = React.useState(false);
  const [copiedCode, setCopiedCode] = React.useState(false);

  if (!order) return null;

  const copyToClipboard = async (text: string, type: "ref" | "code") => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        if (type === "ref") {
          setCopiedRef(true);
          toast.success("Order reference copied!");
          setTimeout(() => setCopiedRef(false), 2000);
        } else {
          setCopiedCode(true);
          toast.success("Verification code copied!");
          setTimeout(() => setCopiedCode(false), 2000);
        }
      }
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const getStatusBadge = (status: OrderRecord["status"]) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-3.5" />
            <span>Completed</span>
          </span>
        );
      case "active":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            <span className="size-1.5 animate-pulse rounded-full bg-primary" />
            <span>Active Line</span>
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <Clock className="size-3.5" />
            <span>Processing</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
            <AlertCircle className="size-3.5" />
            <span className="capitalize">{status}</span>
          </span>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl p-6" data-testid="order-receipt-modal">
        <DialogHeader className="border-b border-border/60 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="size-4" />
              </div>
              <DialogTitle className="text-base font-bold">
                Order Receipt & Credentials
              </DialogTitle>
            </div>
            {getStatusBadge(order.status)}
          </div>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Official immutable digital receipt for order fulfilled on Korak Digitals.
          </DialogDescription>
        </DialogHeader>

        {/* Amount Paid Banner */}
        <div className="rounded-xl border border-border/80 bg-surface p-4 text-center">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            Amount Debited
          </span>
          <p className="mt-1 font-mono text-2xl font-black text-foreground">
            {formatCurrency(order.amount, order.currency)}
          </p>
        </div>

        {/* Received Output / Credentials Box */}
        {order.credentials?.code && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                <KeyRound className="size-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Verification Code (OTP)
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(order.credentials!.code!, "code")}
                className="h-7 gap-1 border-emerald-500/30 px-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10"
              >
                {copiedCode ? <Check className="size-3" /> : <Copy className="size-3" />}
                <span>{copiedCode ? "Copied" : "Copy Code"}</span>
              </Button>
            </div>
            <div className="mt-2 font-mono text-3xl font-black tracking-widest text-emerald-600 dark:text-emerald-400">
              {order.credentials.code}
            </div>
          </div>
        )}

        {/* Breakdown Rows */}
        <div className="space-y-3 rounded-xl border border-border/70 bg-muted/20 p-4 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Order Reference</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-bold text-foreground">
                {order.reference}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(order.reference, "ref")}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Copy order reference"
              >
                {copiedRef ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border/40 pt-2.5">
            <span className="text-muted-foreground">Service Name</span>
            <span className="font-semibold text-foreground text-right">{order.service_name}</span>
          </div>

          <div className="flex items-center justify-between border-t border-border/40 pt-2.5">
            <span className="text-muted-foreground">Beneficiary / Target</span>
            <span className="font-mono font-semibold text-foreground">{order.beneficiary}</span>
          </div>

          {order.credentials?.telecom_reference && (
            <div className="flex items-center justify-between border-t border-border/40 pt-2.5">
              <span className="text-muted-foreground">Carrier Reference</span>
              <span className="font-mono text-foreground">{order.credentials.telecom_reference}</span>
            </div>
          )}

          {order.credentials?.server_endpoint && (
            <div className="flex items-center justify-between border-t border-border/40 pt-2.5">
              <span className="text-muted-foreground">VPN Gateway</span>
              <span className="font-mono text-foreground">{order.credentials.server_endpoint}</span>
            </div>
          )}

          {order.credentials?.account_handle && (
            <div className="flex items-center justify-between border-t border-border/40 pt-2.5">
              <span className="text-muted-foreground">Account Handle</span>
              <span className="font-mono text-foreground font-semibold">@{order.credentials.account_handle}</span>
            </div>
          )}

          {order.credentials?.target_link && (
            <div className="flex items-center justify-between border-t border-border/40 pt-2.5">
              <span className="text-muted-foreground">Target Destination</span>
              <span className="font-mono text-foreground truncate max-w-[220px]">{order.credentials.target_link}</span>
            </div>
          )}

          {order.credentials?.recovery_email && (
            <div className="flex items-center justify-between border-t border-border/40 pt-2.5">
              <span className="text-muted-foreground">Transfer Security Email</span>
              <span className="font-mono text-foreground">{order.credentials.recovery_email}</span>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-border/40 pt-2.5">
            <span className="text-muted-foreground">Fulfillment Timestamp</span>
            <span className="text-foreground">{formatDate(order.created_at)}</span>
          </div>
        </div>

        {order.credentials?.notes && (
          <p className="text-[11px] text-muted-foreground leading-relaxed px-1">
            Note: {order.credentials.notes}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl text-xs font-semibold"
          >
            Close
          </Button>
          <Button
            type="button"
            onClick={() => {
              window.print();
            }}
            className="rounded-xl bg-primary text-primary-foreground font-bold text-xs"
          >
            Print Receipt
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
