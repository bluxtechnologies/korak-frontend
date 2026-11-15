"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight, Phone, Receipt, Wallet, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/EmptyState";
import { ROUTES } from "@/config/navigation";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { OverviewTransaction } from "./api";

export interface RecentTransactionsCardProps {
  transactions: OverviewTransaction[];
  className?: string;
}

function resolveTransactionIconAndLabel(tx: OverviewTransaction) {
  const descLower = tx.description.toLowerCase();

  if (tx.direction === "credit" || tx.type === "wallet_funding" || descLower.includes("funding")) {
    return {
      label: "Funding",
      Icon: Wallet,
      containerClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    };
  }
  if (descLower.includes("airtime")) {
    return {
      label: "Airtime",
      Icon: Phone,
      containerClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    };
  }
  if (descLower.includes("data")) {
    return {
      label: "Data",
      Icon: Wifi,
      containerClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    };
  }
  return {
    label: "Payment",
    Icon: Receipt,
    containerClass: "bg-muted text-muted-foreground",
  };
}

/**
 * RecentTransactionsCard (F12.3).
 * Read-only ledger transactions table matching the legacy dashboard design reference
 * with type icons, status pills, and direct row navigation.
 */
export function RecentTransactionsCard({
  transactions,
  className,
}: RecentTransactionsCardProps) {
  return (
    <Card
      className={cn("rounded-2xl border border-border/70 p-0 shadow-xs", className)}
      data-testid="recent-transactions-card"
    >
      <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 px-6 py-4 space-y-0">
        <div>
          <CardTitle className="text-base font-bold text-foreground sm:text-lg">
            Recent Transactions
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Your latest purchases and wallet activities.
          </CardDescription>
        </div>

        <Button
          asChild
          variant="ghost"
          size="sm"
          className="h-8 gap-1 px-2 text-xs font-semibold text-primary hover:bg-primary/10 hover:text-primary"
        >
          <Link href={ROUTES.TRANSACTIONS}>
            <span>View all</span>
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        {transactions.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No transactions yet"
            description="Your append-only ledger will record all wallet funding deposits, service debits, and automatic refunds."
            bordered={false}
            className="py-10"
            action={
              <Button asChild size="sm" className="mt-2 text-xs">
                <Link href={ROUTES.TRANSACTIONS}>Fund Wallet</Link>
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead className="px-6 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Type
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Description
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-right sm:text-left">
                    Amount
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">
                    Status
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                    Date
                  </TableHead>
                  <TableHead className="w-10 px-6"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => {
                  const isCredit = tx.direction === "credit";
                  const formattedAmount = formatCurrency(
                    tx.amount,
                    tx.currency
                  );
                  const { label, Icon, containerClass } =
                    resolveTransactionIconAndLabel(tx);

                  return (
                    <TableRow
                      key={tx.id}
                      className="border-border/50 text-xs transition-colors hover:bg-muted/40"
                    >
                      {/* TYPE column with circular icon */}
                      <TableCell className="px-6 py-3.5 font-medium">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={cn(
                              "flex size-8 shrink-0 items-center justify-center rounded-full",
                              containerClass
                            )}
                          >
                            <Icon className="size-4 shrink-0" aria-hidden="true" />
                          </div>
                          <span className="font-semibold text-foreground">
                            {label}
                          </span>
                        </div>
                      </TableCell>

                      {/* DESCRIPTION column */}
                      <TableCell className="py-3.5">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">
                            {tx.description}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {tx.reference}
                          </span>
                        </div>
                      </TableCell>

                      {/* AMOUNT column */}
                      <TableCell
                        className={cn(
                          "py-3.5 text-right sm:text-left font-semibold",
                          isCredit
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-foreground"
                        )}
                      >
                        {isCredit
                          ? `+${formattedAmount}`
                          : `-${formattedAmount}`}
                      </TableCell>

                      {/* STATUS column */}
                      <TableCell className="py-3.5 hidden sm:table-cell">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                          <span className="size-1.5 rounded-full bg-emerald-500" />
                          Completed
                        </span>
                      </TableCell>

                      {/* DATE column */}
                      <TableCell className="py-3.5 text-muted-foreground hidden md:table-cell">
                        {formatDate(tx.created_at, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>

                      {/* Action Chevron */}
                      <TableCell className="px-6 py-3.5 text-right">
                        <Link
                          href={`${ROUTES.TRANSACTIONS}/${tx.id}`}
                          aria-label={`View details for transaction ${tx.reference}`}
                          className="text-muted-foreground hover:text-foreground inline-flex items-center"
                        >
                          <ChevronRight className="size-4" aria-hidden="true" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
