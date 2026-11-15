"use client";

import * as React from "react";
import { Eye, Receipt } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  createDataTableColumnHelper,
  DataTable,
} from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatCurrency, formatDate } from "@/lib/formatters";
import type { PaginationMeta } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import type { TransactionRecord } from "./api";
import {
  TRANSACTION_TYPE_BADGE_CLASSES,
  TRANSACTION_TYPE_LABELS,
} from "./TransactionDetailCard";

export interface TransactionsTableProps {
  transactions: TransactionRecord[];
  pagination?: PaginationMeta;
  sort?: string | null;
  onSortChange?: (sort: string | undefined) => void;
  onPageChange?: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
  isLoading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  onSelectTransaction?: (transaction: TransactionRecord) => void;
  onResetFilters?: () => void;
  hasActiveFilters?: boolean;
}

const columnHelper = createDataTableColumnHelper<TransactionRecord>();

/**
 * TransactionsTable (F15.1).
 * Read-only table of append-only ledger entries supporting server-side sorting,
 * server-side pagination, loading skeletons, and detail inspection.
 */
export function TransactionsTable({
  transactions,
  pagination,
  sort,
  onSortChange,
  onPageChange,
  onPerPageChange,
  isLoading = false,
  error,
  onRetry,
  onSelectTransaction,
  onResetFilters,
  hasActiveFilters = false,
}: TransactionsTableProps) {
  const columns = React.useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor("created_at", {
          id: "created_at",
          header: "Date & Time",
          enableSorting: true,
          meta: { align: "left" },
          cell: (info) => (
            <span className="whitespace-nowrap text-xs text-muted-foreground">
              {formatDate(info.getValue())}
            </span>
          ),
        }),
        columnHelper.accessor("reference", {
          id: "reference",
          header: "Reference",
          enableSorting: true,
          meta: { align: "left" },
          cell: (info) => {
            const tx = info.row.original;
            return (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTransaction?.(tx);
                }}
                className="font-mono text-xs font-semibold text-brand-burgundy hover:underline focus:outline-none dark:text-rose-400"
                title="View transaction details"
              >
                {info.getValue()}
              </button>
            );
          },
        }),
        columnHelper.accessor("description", {
          id: "description",
          header: "Description",
          enableSorting: false,
          meta: { align: "left" },
          cell: (info) => {
            const tx = info.row.original;
            return (
              <div className="flex flex-col">
                <span className="text-xs font-medium text-foreground line-clamp-1">
                  {info.getValue()}
                </span>
                {tx.originating_reference && (
                  <span className="font-mono text-[11px] text-muted-foreground">
                    Ref: {tx.originating_reference}
                  </span>
                )}
              </div>
            );
          },
        }),
        columnHelper.accessor("type", {
          id: "type",
          header: "Type",
          enableSorting: false,
          meta: { align: "left" },
          cell: (info) => {
            const type = info.getValue();
            const label = TRANSACTION_TYPE_LABELS[type] ?? type;
            const badgeClass =
              TRANSACTION_TYPE_BADGE_CLASSES[type] ??
              "border-border text-foreground bg-muted";
            return (
              <Badge
                variant="outline"
                className={cn("whitespace-nowrap px-2 py-0.5 text-[11px] font-medium", badgeClass)}
              >
                {label}
              </Badge>
            );
          },
        }),
        columnHelper.accessor("direction", {
          id: "direction",
          header: "Direction",
          enableSorting: false,
          meta: { align: "left" },
          cell: (info) => {
            const isCredit = info.getValue() === "credit";
            return (
              <Badge
                variant="outline"
                className={cn(
                  "whitespace-nowrap px-2 py-0.5 text-[11px] font-semibold capitalize",
                  isCredit
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                    : "border-border bg-muted text-muted-foreground"
                )}
              >
                {info.getValue()}
              </Badge>
            );
          },
        }),
        columnHelper.accessor("amount", {
          id: "amount",
          header: "Amount",
          enableSorting: true,
          meta: { align: "right" },
          cell: (info) => {
            const tx = info.row.original;
            const isCredit = tx.direction === "credit";
            return (
              <span
                className={cn(
                  "font-mono text-xs font-bold whitespace-nowrap",
                  isCredit
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-foreground"
                )}
              >
                {isCredit ? "+" : "-"}
                {formatCurrency(info.getValue(), tx.currency)}
              </span>
            );
          },
        }),
        columnHelper.accessor("balance_after", {
          id: "balance_after",
          header: "Balance After",
          enableSorting: false,
          meta: { align: "right" },
          cell: (info) => (
            <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">
              {formatCurrency(info.getValue(), info.row.original.currency)}
            </span>
          ),
        }),
        columnHelper.display({
          id: "actions",
          header: "Actions",
          meta: { align: "right" },
          cell: (info) => (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                onSelectTransaction?.(info.row.original);
              }}
              aria-label={`View details for ${info.row.original.reference}`}
            >
              <Eye className="mr-1 h-3.5 w-3.5" />
              Details
            </Button>
          ),
        }),
      ]),
    [onSelectTransaction]
  );

  const emptyState = (
    <EmptyState
      icon={Receipt}
      title={hasActiveFilters ? "No matching transactions" : "No transactions yet"}
      description={
        hasActiveFilters
          ? "No ledger records matched your active search or filter criteria."
          : "When you fund your wallet or make purchases, every balance change will appear in this append-only ledger."
      }
      action={
        hasActiveFilters && onResetFilters ? (
          <Button variant="outline" size="sm" onClick={onResetFilters}>
            Reset filters
          </Button>
        ) : undefined
      }
    />
  );

  return (
    <DataTable
      columns={columns}
      data={transactions}
      getRowId={(row) => row.id}
      sort={sort}
      onSortChange={onSortChange}
      pagination={pagination}
      onPageChange={onPageChange}
      onPerPageChange={onPerPageChange}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      onRowClick={onSelectTransaction}
      emptyState={emptyState}
    />
  );
}
