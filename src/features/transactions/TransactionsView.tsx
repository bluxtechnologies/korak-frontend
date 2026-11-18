"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  History,
  Plus,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FilterPanel, type FilterDefinition, type FilterValues } from "@/components/shared/FilterPanel";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { ROUTES } from "@/config/navigation";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { ApiPaginatedResponse, PaginationMeta } from "@/lib/api/types";
import {
  calculateTransactionMetrics,
  getTransactions,
  type TransactionQueryParams,
  type TransactionRecord,
} from "./api";
import { TransactionDetailModal } from "./TransactionDetailModal";
import { TransactionReceiptModal } from "./TransactionReceiptModal";
import { TransactionsTable } from "./TransactionsTable";

export interface TransactionsViewProps {
  initialData?: ApiPaginatedResponse<TransactionRecord>;
  className?: string;
  showHeader?: boolean;
}

const FILTER_DEFINITIONS: FilterDefinition[] = [
  {
    key: "direction",
    label: "Direction",
    allLabel: "All Directions",
    options: [
      { label: "Credit (+)", value: "credit" },
      { label: "Debit (-)", value: "debit" },
    ],
  },
  {
    key: "type",
    label: "Type",
    allLabel: "All Types",
    options: [
      { label: "Wallet Funding", value: "wallet_funding" },
      { label: "Order Payment", value: "order_payment" },
      { label: "Order Refund", value: "order_refund" },
      { label: "Adjustment", value: "manual_adjustment" },
    ],
  },
];

/**
 * TransactionsView (F15.1 & F15.2).
 * Complete customer ledger history view with search, filter, sort, pagination,
 * financial overview metrics, and immutable transaction detail/receipt inspection.
 */
export function TransactionsView({
  initialData,
  className,
  showHeader = false,
}: TransactionsViewProps) {
  const [transactions, setTransactions] = React.useState<TransactionRecord[]>(
    initialData?.data ?? []
  );
  const [pagination, setPagination] = React.useState<PaginationMeta>(
    initialData?.meta ?? {
      current_page: 1,
      per_page: 15,
      total: initialData?.data.length ?? 0,
      last_page: 1,
    }
  );
  const [isLoading, setIsLoading] = React.useState(!initialData);
  const [error, setError] = React.useState<unknown | null>(null);

  // Filters & Query state
  const [search, setSearch] = React.useState("");
  const [filterValues, setFilterValues] = React.useState<FilterValues>({});
  const [sort, setSort] = React.useState<string | null>("-created_at");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(15);

  // Modals state
  const [selectedTransaction, setSelectedTransaction] =
    React.useState<TransactionRecord | null>(null);
  const [receiptTransaction, setReceiptTransaction] =
    React.useState<TransactionRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Financial summary metrics calculated from loaded records
  const metrics = React.useMemo(
    () => calculateTransactionMetrics(transactions),
    [transactions]
  );

  // Direction tab counts
  const directionCounts = React.useMemo(() => {
    return {
      all: transactions.length,
      credit: transactions.filter((t) => t.direction === "credit").length,
      debit: transactions.filter((t) => t.direction === "debit").length,
    };
  }, [transactions]);

  // Active filter calculation
  const hasActiveFilters = Boolean(
    search.trim() ||
      (filterValues.direction && filterValues.direction !== "") ||
      (filterValues.type && filterValues.type !== "")
  );

  // Track initial render to skip duplicate fetch when initialData is supplied
  const isInitialMount = React.useRef(true);

  const fetchTransactions = React.useCallback(
    (params: TransactionQueryParams) => {
      setIsLoading(true);
      setError(null);

      getTransactions(params)
        .then((res) => {
          setTransactions(res.data);
          setPagination(res.meta);
        })
        .catch((err: unknown) => {
          setError(err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    []
  );

  // Effect to load / update transactions when query params change
  React.useEffect(() => {
    if (isInitialMount.current && initialData) {
      isInitialMount.current = false;
      return;
    }
    isInitialMount.current = false;

    fetchTransactions({
      page: currentPage,
      per_page: perPage,
      search: search || undefined,
      sort: sort || undefined,
      direction: filterValues.direction,
      type: filterValues.type,
    });
  }, [
    currentPage,
    perPage,
    search,
    sort,
    filterValues.direction,
    filterValues.type,
    fetchTransactions,
    initialData,
  ]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleFilterChange = (newValues: FilterValues) => {
    setFilterValues(newValues);
    setCurrentPage(1);
  };

  const handleDirectionTabChange = (direction: "" | "credit" | "debit") => {
    setFilterValues((prev) => ({
      ...prev,
      direction: direction === "" ? undefined : direction,
    }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearch("");
    setFilterValues({});
    setCurrentPage(1);
  };

  const handleSortChange = (newSort: string | undefined) => {
    setSort(newSort ?? null);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
  };

  const handleSelectTransaction = (transaction: TransactionRecord) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleRetry = () => {
    fetchTransactions({
      page: currentPage,
      per_page: perPage,
      search: search || undefined,
      sort: sort || undefined,
      direction: filterValues.direction,
      type: filterValues.type,
    });
  };

  const content = (
    <div className={cn("space-y-6", className)} data-testid="transactions-view">
      {/* 1. Page Header (When rendered standalone) */}
      {!showHeader && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Transactions
            </h1>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Track your wallet activity, payments and financial history. Immutable audit ledger of all balance credits, debits, and adjustments.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRetry}
              disabled={isLoading}
              className="h-9 gap-1.5 rounded-xl border-border/80 text-xs font-semibold shadow-none"
            >
              <RefreshCw
                className={`size-3.5 ${isLoading ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </Button>

            <Button
              asChild
              size="sm"
              className="h-9 gap-1.5 rounded-xl bg-[#7A1F3D] text-white text-xs font-bold shadow-xs hover:bg-[#681a34]"
            >
              <Link href={ROUTES.WALLET}>
                <Plus className="size-3.5" />
                <span>+ Fund Wallet</span>
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* 2. Compact Financial Overview Metrics */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Total Money In */}
        <div className="rounded-xl border border-border/70 bg-card p-3.5 shadow-none transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Total Money In
            </span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ArrowDownLeft className="size-3.5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 sm:text-2xl">
            +{formatCurrency(metrics.totalMoneyIn, "NGN")}
          </div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">
            Wallet deposits & refunds
          </div>
        </div>

        {/* Total Money Out */}
        <div className="rounded-xl border border-border/70 bg-card p-3.5 shadow-none transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Total Money Out
            </span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <ArrowUpRight className="size-3.5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            -{formatCurrency(metrics.totalMoneyOut, "NGN")}
          </div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">
            Service orders & payments
          </div>
        </div>

        {/* Total Transactions */}
        <div className="rounded-xl border border-border/70 bg-card p-3.5 shadow-none transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Total Transactions
            </span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-[#7A1F3D]/10 text-[#7A1F3D] dark:bg-[#7A1F3D]/20">
              <History className="size-3.5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {metrics.totalCount}
          </div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">
            Recorded ledger entries
          </div>
        </div>
      </div>

      {/* 3. Direction Segmented Filter Tabs */}
      <div
        role="tablist"
        aria-label="Transaction direction filter"
        className="flex flex-wrap items-center gap-1.5 border-b border-border/70 pb-3"
      >
        <button
          type="button"
          role="tab"
          aria-selected={!filterValues.direction}
          onClick={() => handleDirectionTabChange("")}
          className={cn(
            "rounded-full px-3.5 py-1 text-xs font-semibold transition-all",
            !filterValues.direction
              ? "bg-[#7A1F3D] text-white shadow-xs"
              : "bg-surface text-muted-foreground hover:bg-muted border border-border/70"
          )}
        >
          All ({directionCounts.all})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={filterValues.direction === "credit"}
          onClick={() => handleDirectionTabChange("credit")}
          className={cn(
            "rounded-full px-3.5 py-1 text-xs font-semibold transition-all",
            filterValues.direction === "credit"
              ? "bg-[#7A1F3D] text-white shadow-xs"
              : "bg-surface text-muted-foreground hover:bg-muted border border-border/70"
          )}
        >
          Money In (+{directionCounts.credit})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={filterValues.direction === "debit"}
          onClick={() => handleDirectionTabChange("debit")}
          className={cn(
            "rounded-full px-3.5 py-1 text-xs font-semibold transition-all",
            filterValues.direction === "debit"
              ? "bg-[#7A1F3D] text-white shadow-xs"
              : "bg-surface text-muted-foreground hover:bg-muted border border-border/70"
          )}
        >
          Money Out (-{directionCounts.debit})
        </button>
      </div>

      {/* 4. Search & Filter Panel */}
      <Card className="border-border/70 shadow-none">
        <CardContent className="p-4 sm:p-5">
          <FilterPanel
            search={search}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Search by reference, description, or order ref..."
            filters={FILTER_DEFINITIONS}
            values={filterValues}
            onValuesChange={handleFilterChange}
            onReset={handleResetFilters}
          />
        </CardContent>
      </Card>

      {/* 5. Transactions Table */}
      <TransactionsTable
        transactions={transactions}
        pagination={pagination}
        sort={sort}
        onSortChange={handleSortChange}
        onPageChange={handlePageChange}
        onPerPageChange={handlePerPageChange}
        isLoading={isLoading}
        error={error}
        onRetry={handleRetry}
        onSelectTransaction={handleSelectTransaction}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* 6. Transaction Detail Modal */}
      <TransactionDetailModal
        transaction={selectedTransaction}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onViewReceipt={(tx) => setReceiptTransaction(tx)}
      />

      {/* 7. Printable Transaction Receipt Modal */}
      <TransactionReceiptModal
        transaction={receiptTransaction}
        open={Boolean(receiptTransaction)}
        onOpenChange={(open) => !open && setReceiptTransaction(null)}
      />
    </div>
  );

  if (showHeader) {
    return (
      <PageContainer>
        <PageHeader
          title="Transaction History"
          description="Track your wallet activity, payments and financial history."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              disabled={isLoading}
              className="h-8 gap-1.5 text-xs"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          }
        />
        <div className="mt-6">{content}</div>
      </PageContainer>
    );
  }

  return content;
}
