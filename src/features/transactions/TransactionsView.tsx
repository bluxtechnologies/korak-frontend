"use client";

import * as React from "react";
import { Info, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FilterPanel, type FilterDefinition, type FilterValues } from "@/components/shared/FilterPanel";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { cn } from "@/lib/utils";
import type { ApiPaginatedResponse, PaginationMeta } from "@/lib/api/types";
import {
  getTransactions,
  type TransactionQueryParams,
  type TransactionRecord,
} from "./api";
import { TransactionDetailModal } from "./TransactionDetailModal";
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
 * and immutable transaction detail inspection.
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

  // Detail Modal state
  const [selectedTransaction, setSelectedTransaction] =
    React.useState<TransactionRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

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
      {/* Wallet Funding Notice (Roadmap F15.3 ⛔) */}
      <Alert className="border-border bg-muted/40">
        <Info className="h-4 w-4 text-muted-foreground" />
        <AlertTitle className="text-xs font-semibold">
          Append-Only Financial Ledger (F15)
        </AlertTitle>
        <AlertDescription className="text-xs text-muted-foreground">
          Every balance modification is strictly recorded as an immutable
          ledger row. Note that online self-service wallet funding is currently
          pending payment gateway integration (Doc 14).
        </AlertDescription>
      </Alert>

      {/* Search & Filter Panel (F6.2) */}
      <Card className="border-border shadow-none">
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

      {/* Transactions Table (F15.1) */}
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

      {/* Transaction Detail Modal (F15.2) */}
      <TransactionDetailModal
        transaction={selectedTransaction}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );

  if (showHeader) {
    return (
      <PageContainer>
        <PageHeader
          title="Transaction History"
          description="Immutable audit ledger of all balance credits, debits, and adjustments."
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
