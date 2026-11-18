"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Copy, ExternalLink, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { TransactionRecord, TransactionType } from "./api";

export interface TransactionDetailCardProps {
  transaction: TransactionRecord;
  className?: string;
  showBackLink?: boolean;
  onViewReceipt?: () => void;
  onClose?: () => void;
}

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  wallet_funding: "Wallet Funding",
  order_payment: "Order Payment",
  order_refund: "Order Refund",
  manual_adjustment: "Manual Adjustment",
};

export const TRANSACTION_TYPE_BADGE_CLASSES: Record<TransactionType, string> = {
  wallet_funding:
    "border-blue-200 text-blue-700 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800",
  order_payment:
    "border-purple-200 text-purple-700 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800",
  order_refund:
    "border-emerald-200 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
  manual_adjustment:
    "border-amber-200 text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
};

/**
 * TransactionDetailCard (F15.2).
 * Displays full immutable details of an append-only ledger transaction.
 */
export function TransactionDetailCard({
  transaction,
  className,
  showBackLink = false,
  onViewReceipt,
  onClose,
}: TransactionDetailCardProps) {
  const [copied, setCopied] = React.useState(false);

  const isCredit = transaction.direction === "credit";
  const typeLabel = TRANSACTION_TYPE_LABELS[transaction.type] ?? transaction.type;
  const badgeClass =
    TRANSACTION_TYPE_BADGE_CLASSES[transaction.type] ??
    "border-border text-foreground bg-muted";

  const handleCopy = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(transaction.reference);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Ignore clipboard write failure
    }
  };

  return (
    <Card
      className={cn("max-w-2xl border-border bg-card shadow-none", className)}
      data-testid="transaction-detail-card"
    >
      <CardHeader className="border-b border-border pb-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Transaction Reference
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <CardTitle className="font-mono text-lg font-bold sm:text-xl">
                {transaction.reference}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={handleCopy}
                aria-label="Copy transaction reference"
              >
                {copied ? (
                  <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <Check className="h-3.5 w-3.5" />
                    Copied
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1">
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </span>
                )}
              </Button>
            </div>
            <CardDescription className="mt-1 text-xs">
              Recorded on {formatDate(transaction.created_at)}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 sm:self-start">
            <Badge
              variant="outline"
              className={cn("px-2.5 py-0.5 text-xs font-medium", badgeClass)}
            >
              {typeLabel}
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                "px-2.5 py-0.5 text-xs font-semibold capitalize",
                isCredit
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                  : "border-border bg-muted text-muted-foreground"
              )}
            >
              {transaction.direction}
            </Badge>
          </div>
        </div>

        {/* Amount Highlight */}
        <div className="mt-6 rounded-md border border-border bg-muted/40 p-4">
          <div className="text-xs font-medium text-muted-foreground">
            Transaction Amount
          </div>
          <div
            className={cn(
              "mt-1 font-mono text-2xl font-bold tracking-tight sm:text-3xl",
              isCredit
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-foreground"
            )}
          >
            {isCredit ? "+" : "-"}
            {formatCurrency(transaction.amount, transaction.currency)}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Balance after transaction:{" "}
            <span className="font-mono font-medium text-foreground">
              {formatCurrency(transaction.balance_after, transaction.currency)}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-5">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
          <div className="rounded-md border border-border/60 bg-background p-3">
            <dt className="text-xs font-medium text-muted-foreground">
              Description
            </dt>
            <dd className="mt-1 text-sm font-medium text-foreground">
              {transaction.description}
            </dd>
          </div>

          <div className="rounded-md border border-border/60 bg-background p-3">
            <dt className="text-xs font-medium text-muted-foreground">
              Wallet ID
            </dt>
            <dd className="mt-1 font-mono text-sm text-foreground">
              {transaction.wallet_id}
            </dd>
          </div>

          {transaction.originating_reference && (
            <div className="rounded-md border border-border/60 bg-background p-3">
              <dt className="text-xs font-medium text-muted-foreground">
                Originating Reference
              </dt>
              <dd className="mt-1 flex items-center gap-1.5 font-mono text-sm font-medium text-foreground">
                <span>{transaction.originating_reference}</span>
                {transaction.originating_order_id && (
                  <Link
                    href={`/orders?search=${encodeURIComponent(transaction.originating_reference)}`}
                    className="inline-flex items-center text-xs text-brand-burgundy hover:underline dark:text-rose-400"
                    title="View related order"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
              </dd>
            </div>
          )}

          {transaction.idempotency_key && (
            <div className="rounded-md border border-border/60 bg-background p-3">
              <dt className="text-xs font-medium text-muted-foreground">
                Idempotency Key
              </dt>
              <dd className="mt-1 truncate font-mono text-xs text-muted-foreground">
                {transaction.idempotency_key}
              </dd>
            </div>
          )}
        </dl>

        {/* Append-Only Ledger Notice (Doc 14 §1 & §2) */}
        <div className="flex items-start gap-2.5 rounded-md border border-border/80 bg-muted/30 p-3 text-xs text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <p>
            Immutable append-only ledger entry. In compliance with financial
            standards, ledger entries cannot be updated or deleted. Corrections
            are applied solely via reciprocal ledger entries.
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between border-t border-border pt-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          asChild
          className="h-9 gap-1.5 rounded-xl border-border/80 text-xs font-medium"
        >
          <Link href="/support">Need Help? Contact Support</Link>
        </Button>

        <div className="flex items-center gap-2">
          {onViewReceipt && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onViewReceipt}
              className="h-9 rounded-xl border-border/80 text-xs font-semibold"
            >
              View Receipt
            </Button>
          )}
          {onClose && (
            <Button
              type="button"
              size="sm"
              onClick={onClose}
              className="h-9 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Close
            </Button>
          )}
          {showBackLink && (
            <Button variant="outline" asChild size="sm">
              <Link href="/transactions">Back to Transactions</Link>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
