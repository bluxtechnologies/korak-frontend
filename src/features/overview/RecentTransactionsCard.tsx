"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  Phone,
  Receipt,
  Wallet,
  Wifi,
} from "lucide-react";
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
import { NAV_ICON_STROKE_WIDTH, ROUTES } from "@/config/navigation";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { OverviewTransaction } from "./api";

export interface RecentTransactionsCardProps {
  transactions: OverviewTransaction[];
  className?: string;
}

function resolveTransactionIconAndLabel(tx: OverviewTransaction) {
  const descLower = tx.description.toLowerCase();

  if (
    tx.direction === "credit" ||
    tx.type === "wallet_funding" ||
    descLower.includes("funding")
  ) {
    return {
      label: "Funding",
      Icon: Wallet,
      containerClass: "bg-success-surface text-success",
    };
  }
  if (descLower.includes("airtime")) {
    return {
      label: "Airtime",
      Icon: Phone,
      containerClass: "bg-primary/10 text-primary",
    };
  }
  if (descLower.includes("data")) {
    return {
      label: "Data",
      Icon: Wifi,
      containerClass: "bg-info-surface text-info",
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
 * Minimal transaction ledger displaying ~4 recent activities.
 * Minimal table on desktop and responsive clean list on mobile.
 *
 * Design system rules (Doc 05):
 * - 10px radius (rounded-md), no pill shapes.
 * - Text-only status badges (no dots, no icons).
 * - Semantic tokens only.
 * - Lucide icons with locked 1.75 stroke width.
 * - Near-zero shadows.
 */
export function RecentTransactionsCard({
  transactions,
  className,
}: RecentTransactionsCardProps) {
  // Display approximately four recent transactions per design specification
  const displayTransactions = React.useMemo(
    () => transactions.slice(0, 4),
    [transactions]
  );

  return (
    <Card
      className={cn(
        "border-border bg-card rounded-md border p-0",
        className
      )}
      data-testid="recent-transactions-card"
    >
      <CardHeader className="border-border flex flex-row items-center justify-between space-y-0 border-b px-5 py-4 sm:px-6">
        <div>
          <CardTitle className="text-foreground text-base font-semibold sm:text-lg">
            Recent Transactions
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-0.5 text-xs sm:text-sm">
            Your latest purchases and wallet activities.
          </CardDescription>
        </div>

        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-primary hover:bg-primary/10 hover:text-primary h-8 shrink-0 gap-1 px-2.5 text-xs font-semibold"
        >
          <Link href={ROUTES.TRANSACTIONS}>
            <span>View all</span>
            <ArrowRight className="size-3.5" strokeWidth={NAV_ICON_STROKE_WIDTH} aria-hidden="true" />
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        {displayTransactions.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No transactions yet"
            description="Your append-only ledger will record all wallet funding deposits, service debits, and automatic refunds."
            bordered={false}
            className="py-10"
            action={
              <Button asChild size="sm" className="mt-2 text-xs">
                <Link href={ROUTES.WALLET}>Fund Wallet</Link>
              </Button>
            }
          />
        ) : (
          <div>
            {/* 1. Mobile Activity List (< sm) */}
            <div className="divide-border divide-y sm:hidden">
              {displayTransactions.map((tx) => {
                const isCredit = tx.direction === "credit";
                const formattedAmount = formatCurrency(tx.amount, tx.currency);
                const { label, Icon } = resolveTransactionIconAndLabel(tx);
                const activityTitle =
                  label === "Funding" ? "Wallet Funding" : `${label} Purchase`;

                return (
                  <Link
                    key={tx.id}
                    href={`${ROUTES.TRANSACTIONS}/${tx.id}`}
                    className="hover:bg-muted/30 flex items-center justify-between px-4 py-3.5 transition-colors"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-md">
                        <Icon className="size-4.5" strokeWidth={NAV_ICON_STROKE_WIDTH} aria-hidden="true" />
                      </div>
                      <div className="flex min-w-0 flex-col">
                        <span className="text-foreground truncate text-xs font-semibold">
                          {activityTitle}
                        </span>
                        <span className="text-muted-foreground truncate text-[11px]">
                          {tx.description}
                        </span>
                      </div>
                    </div>

                    <div className="ml-3 flex shrink-0 flex-col items-end gap-1">
                      <span
                        className={cn(
                          "text-xs font-semibold",
                          isCredit
                            ? "text-success"
                            : "text-foreground"
                        )}
                      >
                        {isCredit
                          ? `+${formattedAmount}`
                          : `-${formattedAmount}`}
                      </span>
                      <span className="bg-success-surface text-success inline-flex items-center rounded-sm px-2 py-0.5 text-[10px] font-medium">
                        Success
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* 2. Desktop Table (>= sm) */}
            <div className="hidden overflow-x-auto sm:block">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground px-6 text-[11px] font-semibold tracking-wider uppercase">
                      Type
                    </TableHead>
                    <TableHead className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
                      Description
                    </TableHead>
                    <TableHead className="text-muted-foreground text-right text-[11px] font-semibold tracking-wider uppercase sm:text-left">
                      Amount
                    </TableHead>
                    <TableHead className="text-muted-foreground hidden text-[11px] font-semibold tracking-wider uppercase sm:table-cell">
                      Status
                    </TableHead>
                    <TableHead className="text-muted-foreground hidden text-[11px] font-semibold tracking-wider uppercase md:table-cell">
                      Date
                    </TableHead>
                    <TableHead className="w-10 px-6"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayTransactions.map((tx) => {
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
                        className="border-border hover:bg-muted/40 text-xs transition-colors"
                      >
                        {/* TYPE column with square icon box */}
                        <TableCell className="px-6 py-3.5 font-medium">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={cn(
                                "flex size-8 shrink-0 items-center justify-center rounded-md",
                                containerClass
                              )}
                            >
                              <Icon
                                className="size-4 shrink-0"
                                strokeWidth={NAV_ICON_STROKE_WIDTH}
                                aria-hidden="true"
                              />
                            </div>
                            <span className="text-foreground font-semibold">
                              {label}
                            </span>
                          </div>
                        </TableCell>

                        {/* DESCRIPTION column */}
                        <TableCell className="py-3.5">
                          <div className="flex flex-col">
                            <span className="text-foreground font-medium">
                              {tx.description}
                            </span>
                            <span className="text-muted-foreground text-[10px]">
                              {tx.reference}
                            </span>
                          </div>
                        </TableCell>

                        {/* AMOUNT column */}
                        <TableCell
                          className={cn(
                            "py-3.5 text-right font-semibold sm:text-left",
                            isCredit
                              ? "text-success"
                              : "text-foreground"
                          )}
                        >
                          {isCredit
                            ? `+${formattedAmount}`
                            : `-${formattedAmount}`}
                        </TableCell>

                        {/* STATUS column */}
                        <TableCell className="hidden py-3.5 sm:table-cell">
                          <span className="bg-success-surface text-success inline-flex items-center rounded-sm px-2.5 py-0.5 text-[11px] font-medium">
                            Completed
                          </span>
                        </TableCell>

                        {/* DATE column */}
                        <TableCell className="text-muted-foreground hidden py-3.5 md:table-cell">
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
                            <ChevronRight
                              className="size-4"
                              strokeWidth={NAV_ICON_STROKE_WIDTH}
                              aria-hidden="true"
                            />
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
