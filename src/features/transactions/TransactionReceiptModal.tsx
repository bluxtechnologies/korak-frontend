"use client";

import * as React from "react";
import {
  Check,
  CheckCircle2,
  Copy,
  FileText,
  Printer,
  ShieldCheck,
  ArrowDownLeft,
  ArrowUpRight,
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
import type { TransactionRecord } from "./api";
import { TRANSACTION_TYPE_LABELS } from "./TransactionDetailCard";

export interface TransactionReceiptModalProps {
  transaction: TransactionRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransactionReceiptModal({
  transaction,
  open,
  onOpenChange,
}: TransactionReceiptModalProps) {
  const [copiedRef, setCopiedRef] = React.useState(false);

  if (!transaction) return null;

  const isCredit = transaction.direction === "credit";
  const typeLabel = TRANSACTION_TYPE_LABELS[transaction.type] ?? transaction.type;
  const feeKobo = 0; // standard fee

  const copyReference = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(transaction.reference);
        setCopiedRef(true);
        toast.success("Transaction reference copied!");
        setTimeout(() => setCopiedRef(false), 2000);
      }
    } catch {
      toast.error("Failed to copy reference");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md rounded-2xl p-6 print:shadow-none print:border-none"
        data-testid="transaction-receipt-modal"
      >
        <DialogHeader className="border-b border-border/70 pb-4 text-center sm:text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-[#7A1F3D]/10 text-[#7A1F3D] dark:bg-[#7A1F3D]/20">
                <FileText className="size-4.5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Transaction Receipt
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Official financial ledger confirmation
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="size-3.5" />
              <span>Successful</span>
            </div>
          </div>
        </DialogHeader>

        {/* Amount Hero Box */}
        <div className="rounded-xl border border-border/80 bg-surface p-4 text-center">
          <div className="flex items-center justify-center gap-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {isCredit ? (
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <ArrowDownLeft className="size-3.5" />
                Money In (Credit)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <ArrowUpRight className="size-3.5" />
                Money Out (Debit)
              </span>
            )}
          </div>
          <p
            className={cn(
              "mt-1 font-mono text-2xl font-black tracking-tight",
              isCredit
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-foreground"
            )}
          >
            {isCredit ? "+" : "-"}
            {formatCurrency(transaction.amount, transaction.currency)}
          </p>
        </div>

        {/* Ledger Details Breakdown */}
        <div className="space-y-2.5 rounded-xl border border-border/70 bg-muted/20 p-3.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Reference</span>
            <div className="flex items-center gap-1.5 font-mono font-medium text-foreground">
              <span>{transaction.reference}</span>
              <button
                type="button"
                onClick={copyReference}
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Copy reference"
              >
                {copiedRef ? (
                  <Check className="size-3.5 text-emerald-600" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border/50 pt-2">
            <span className="text-muted-foreground">Transaction Type</span>
            <span className="font-semibold text-foreground">{typeLabel}</span>
          </div>

          <div className="flex items-start justify-between border-t border-border/50 pt-2 gap-3">
            <span className="text-muted-foreground shrink-0">Description</span>
            <span className="font-medium text-foreground text-right">
              {transaction.description}
            </span>
          </div>

          {transaction.originating_reference && (
            <div className="flex items-center justify-between border-t border-border/50 pt-2">
              <span className="text-muted-foreground">Related Order Ref</span>
              <span className="font-mono text-foreground font-medium">
                {transaction.originating_reference}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-border/50 pt-2">
            <span className="text-muted-foreground">Processing Fee</span>
            <span className="font-medium text-foreground">
              {formatCurrency(feeKobo, transaction.currency)}
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-border/50 pt-2">
            <span className="text-muted-foreground">Balance After</span>
            <span className="font-mono font-semibold text-foreground">
              {formatCurrency(transaction.balance_after, transaction.currency)}
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-border/50 pt-2">
            <span className="text-muted-foreground">Date & Time</span>
            <span className="text-foreground">{formatDate(transaction.created_at)}</span>
          </div>
        </div>

        {/* Security / Immutable Notice */}
        <div className="flex items-center gap-2 rounded-lg bg-muted/40 p-2.5 text-[11px] text-muted-foreground border border-border/50">
          <ShieldCheck className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>
            Immutable financial record generated by Korak Digitals. Cryptographically recorded.
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl text-xs font-semibold h-9"
          >
            Close
          </Button>
          <Button
            type="button"
            onClick={() => window.print()}
            className="rounded-xl bg-[#7A1F3D] px-4 text-xs font-bold text-white hover:bg-[#681a34] h-9 gap-1.5"
          >
            <Printer className="size-3.5" />
            <span>Print Receipt</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
