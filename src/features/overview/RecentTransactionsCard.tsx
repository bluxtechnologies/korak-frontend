"use client";

import * as React from "react";
import Link from "next/link";
import { Receipt, ArrowUpRight } from "lucide-react";
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
import type { OverviewTransaction } from "./api";

export interface RecentTransactionsCardProps {
  transactions: OverviewTransaction[];
  className?: string;
}

/**
 * RecentTransactionsCard (F12.3).
 * Read-only ledger transactions table adhering to append-only principles
 * in docs/14-wallet-and-payments.md §1 & §2.
 */
export function RecentTransactionsCard({
  transactions,
  className,
}: RecentTransactionsCardProps) {
  return (
    <Card className={className} data-testid="recent-transactions-card">
      <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0 border-b border-border/60">
        <div>
          <CardTitle className="text-base font-semibold text-foreground">
            Recent Transactions
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Wallet ledger entries and funding events
          </CardDescription>
        </div>

        <Button
          asChild
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs font-medium text-primary hover:text-primary hover:bg-surface gap-1"
        >
          <Link href={ROUTES.TRANSACTIONS}>
            <span>View all</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
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
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs font-medium">Reference</TableHead>
                  <TableHead className="text-xs font-medium">Description</TableHead>
                  <TableHead className="text-xs font-medium text-right">
                    Amount
                  </TableHead>
                  <TableHead className="text-xs font-medium text-right hidden sm:table-cell">
                    Balance After
                  </TableHead>
                  <TableHead className="text-xs font-medium text-right hidden md:table-cell">
                    Date
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => {
                  const isCredit = tx.direction === "credit";
                  const formattedAmount = formatCurrency(
                    tx.amount,
                    tx.currency
                  );

                  return (
                    <TableRow key={tx.id} className="text-xs">
                      <TableCell className="font-medium text-foreground py-3">
                        {tx.reference}
                      </TableCell>
                      <TableCell className="text-muted-foreground py-3">
                        <span className="font-medium text-foreground block truncate max-w-[150px] sm:max-w-none">
                          {tx.description}
                        </span>
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium py-3 ${
                          isCredit
                            ? "text-success font-semibold"
                            : "text-foreground"
                        }`}
                      >
                        {isCredit ? `+${formattedAmount}` : `-${formattedAmount}`}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground py-3 hidden sm:table-cell">
                        {formatCurrency(tx.balance_after, tx.currency)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground py-3 hidden md:table-cell">
                        {formatDate(tx.created_at, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
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
