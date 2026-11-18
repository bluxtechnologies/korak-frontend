"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  Download,
  Plus,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  AlertCircle,
  Package,
  FileText,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  ShoppingBag,
  Receipt,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/config/navigation";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { OrderDetailModal, getOrderStatusBadge, getServiceCategoryIcon } from "./OrderDetailModal";
import { OrderReceiptModal } from "./OrderReceiptModal";
import {
  calculateOrderStats,
  type OrderRecord,
} from "./api";

export interface OrdersViewProps {
  initialOrders?: OrderRecord[];
  className?: string;
}

type FilterTab = "all" | "completed" | "processing" | "failed" | "cancelled";
type DateFilter = "all" | "today" | "7days" | "30days";

export function OrdersView({ initialOrders = [], className }: OrdersViewProps) {
  const [orders] = React.useState<OrderRecord[]>(initialOrders ?? []);
  const [activeTab, setActiveTab] = React.useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");
  const [dateFilter, setDateFilter] = React.useState<DateFilter>("all");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);

  // Modals state
  const [selectedOrder, setSelectedOrder] = React.useState<OrderRecord | null>(null);
  const [receiptOrder, setReceiptOrder] = React.useState<OrderRecord | null>(null);
  const [copiedRefId, setCopiedRefId] = React.useState<string | null>(null);

  const safeOrders = React.useMemo(() => orders || [], [orders]);
  const stats = React.useMemo(() => calculateOrderStats(safeOrders), [safeOrders]);

  // Tab counts
  const tabCounts = React.useMemo(() => {
    return {
      all: safeOrders.length,
      completed: safeOrders.filter((o) => o.status === "completed").length,
      processing: safeOrders.filter(
        (o) => o.status === "processing" || o.status === "active" || o.status === "pending"
      ).length,
      failed: safeOrders.filter((o) => o.status === "failed").length,
      cancelled: safeOrders.filter((o) => o.status === "cancelled" || o.status === "refunded").length,
    };
  }, [safeOrders]);

  // Active filters check
  const hasActiveFilters = Boolean(
    activeTab !== "all" ||
      searchQuery.trim() !== "" ||
      categoryFilter !== "all" ||
      dateFilter !== "all"
  );

  // Filtered orders
  const filteredOrders = React.useMemo(() => {
    let list = safeOrders;

    // Status Tab filter
    if (activeTab === "completed") {
      list = list.filter((o) => o.status === "completed");
    } else if (activeTab === "processing") {
      list = list.filter(
        (o) => o.status === "processing" || o.status === "active" || o.status === "pending"
      );
    } else if (activeTab === "failed") {
      list = list.filter((o) => o.status === "failed");
    } else if (activeTab === "cancelled") {
      list = list.filter((o) => o.status === "cancelled" || o.status === "refunded");
    }

    // Category filter
    if (categoryFilter !== "all") {
      list = list.filter((o) => o.category === categoryFilter);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (o) =>
          o.reference.toLowerCase().includes(q) ||
          o.service_name.toLowerCase().includes(q) ||
          o.beneficiary.toLowerCase().includes(q)
      );
    }

    // Date range filter
    if (dateFilter !== "all") {
      const now = new Date().getTime();
      list = list.filter((o) => {
        const orderTime = new Date(o.created_at).getTime();
        const diffMs = now - orderTime;
        if (dateFilter === "today") return diffMs <= 24 * 60 * 60 * 1000;
        if (dateFilter === "7days") return diffMs <= 7 * 24 * 60 * 60 * 1000;
        if (dateFilter === "30days") return diffMs <= 30 * 24 * 60 * 60 * 1000;
        return true;
      });
    }

    return list;
  }, [safeOrders, activeTab, categoryFilter, searchQuery, dateFilter]);

  // Pagination calculation
  const totalItems = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * perPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + perPage);

  const resetFilters = () => {
    setActiveTab("all");
    setSearchQuery("");
    setCategoryFilter("all");
    setDateFilter("all");
    setCurrentPage(1);
  };

  const copyRef = async (ref: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(ref);
        setCopiedRefId(ref);
        toast.success("Order reference copied!");
        setTimeout(() => setCopiedRefId(null), 2000);
      }
    } catch {
      toast.error("Failed to copy reference");
    }
  };

  const exportData = (format: "csv" | "txt") => {
    try {
      const headers = "Reference,Service,Beneficiary,Amount,Currency,Status,Date\n";
      const rows = filteredOrders
        .map(
          (o) =>
            `"${o.reference}","${o.service_name}","${o.beneficiary}","${o.amount / 100}","${
              o.currency
            }","${o.status}","${o.created_at}"`
        )
        .join("\n");

      const blob = new Blob([headers + rows], {
        type: format === "csv" ? "text/csv;charset=utf-8;" : "text/plain;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `korak-orders-${new Date().toISOString().split("T")[0]}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${filteredOrders.length} orders to ${format.toUpperCase()}`);
    } catch {
      toast.error("Failed to export orders");
    }
  };

  return (
    <div className={cn("space-y-6", className)} data-testid="orders-view">
      {/* 1. Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Orders
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            View and manage your digital service purchases.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => exportData("csv")}
            className="h-9 gap-1.5 rounded-xl border-border/80 text-xs font-semibold shadow-none"
          >
            <Download className="size-3.5 text-muted-foreground" />
            <span>Export CSV</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => exportData("txt")}
            className="h-9 gap-1.5 rounded-xl border-border/80 text-xs font-semibold shadow-none"
          >
            <FileText className="size-3.5 text-muted-foreground" />
            <span>Export TXT</span>
          </Button>

          <Button
            asChild
            size="sm"
            className="h-9 gap-1.5 rounded-xl bg-[#7A1F3D] text-white text-xs font-bold shadow-xs hover:bg-[#681a34]"
          >
            <Link href={ROUTES.SERVICES}>
              <Plus className="size-3.5" />
              <span>+ New Purchase</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. Compact Order Statistics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Total Orders */}
        <div className="rounded-xl border border-border/70 bg-card p-3.5 shadow-none transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Total Orders
            </span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Package className="size-3.5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {stats.total}
          </div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">Lifetime purchases</div>
        </div>

        {/* Successful Orders */}
        <div className="rounded-xl border border-border/70 bg-card p-3.5 shadow-none transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Completed
            </span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-3.5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {stats.completed}
          </div>
          <div className="mt-0.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            Fulfilled successfully
          </div>
        </div>

        {/* Processing Orders */}
        <div className="rounded-xl border border-border/70 bg-card p-3.5 shadow-none transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Processing
            </span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="size-3.5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {stats.processing}
          </div>
          <div className="mt-0.5 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            Active / In transit
          </div>
        </div>

        {/* Failed / Cancelled Orders */}
        <div className="rounded-xl border border-border/70 bg-card p-3.5 shadow-none transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Failed / Refunded
            </span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <AlertCircle className="size-3.5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {stats.failed}
          </div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">
            Cancelled or refunded
          </div>
        </div>
      </div>

      {/* 3. Filter Tabs (Segmented Control) */}
      <div
        role="tablist"
        aria-label="Order status filter"
        className="flex flex-wrap items-center gap-1.5 border-b border-border/70 pb-3"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "all"}
          onClick={() => {
            setActiveTab("all");
            setCurrentPage(1);
          }}
          className={cn(
            "rounded-full px-3.5 py-1 text-xs font-semibold transition-all",
            activeTab === "all"
              ? "bg-[#7A1F3D] text-white shadow-xs"
              : "bg-surface text-muted-foreground hover:bg-muted border border-border/70"
          )}
        >
          All Orders ({tabCounts.all})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "completed"}
          onClick={() => {
            setActiveTab("completed");
            setCurrentPage(1);
          }}
          className={cn(
            "rounded-full px-3.5 py-1 text-xs font-semibold transition-all",
            activeTab === "completed"
              ? "bg-[#7A1F3D] text-white shadow-xs"
              : "bg-surface text-muted-foreground hover:bg-muted border border-border/70"
          )}
        >
          Completed ({tabCounts.completed})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "processing"}
          onClick={() => {
            setActiveTab("processing");
            setCurrentPage(1);
          }}
          className={cn(
            "rounded-full px-3.5 py-1 text-xs font-semibold transition-all",
            activeTab === "processing"
              ? "bg-[#7A1F3D] text-white shadow-xs"
              : "bg-surface text-muted-foreground hover:bg-muted border border-border/70"
          )}
        >
          Active / Processing ({tabCounts.processing})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "failed"}
          onClick={() => {
            setActiveTab("failed");
            setCurrentPage(1);
          }}
          className={cn(
            "rounded-full px-3.5 py-1 text-xs font-semibold transition-all",
            activeTab === "failed"
              ? "bg-[#7A1F3D] text-white shadow-xs"
              : "bg-surface text-muted-foreground hover:bg-muted border border-border/70"
          )}
        >
          Failed ({tabCounts.failed})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "cancelled"}
          onClick={() => {
            setActiveTab("cancelled");
            setCurrentPage(1);
          }}
          className={cn(
            "rounded-full px-3.5 py-1 text-xs font-semibold transition-all",
            activeTab === "cancelled"
              ? "bg-[#7A1F3D] text-white shadow-xs"
              : "bg-surface text-muted-foreground hover:bg-muted border border-border/70"
          )}
        >
          Cancelled ({tabCounts.cancelled})
        </button>
      </div>

      {/* 4. Secondary Filter Bar (Search, Category, Date, Reset) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
        {/* Search */}
        <div className="relative sm:col-span-6 lg:col-span-6">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by order reference, service name, or beneficiary phone..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 rounded-xl bg-card pl-10 text-xs sm:text-sm border-border/80"
          />
        </div>

        {/* Category Filter */}
        <div className="sm:col-span-3 lg:col-span-3">
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by service category"
            className="h-10 w-full rounded-xl border border-border/80 bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
          >
            <option value="all">All Service Categories</option>
            <option value="airtime">Airtime Top-ups</option>
            <option value="data">Mobile Data</option>
            <option value="numbers_otp">SMS Verification (OTP)</option>
            <option value="numbers_rent">Virtual Number Rental</option>
            <option value="vpn">WireGuard VPN</option>
            <option value="social">Social Media Services</option>
          </select>
        </div>

        {/* Date Filter */}
        <div className="sm:col-span-3 lg:col-span-3 flex items-center gap-2">
          <select
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value as DateFilter);
              setCurrentPage(1);
            }}
            aria-label="Filter by date range"
            className="h-10 w-full rounded-xl border border-border/80 bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </select>

          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-10 px-2.5 text-xs text-muted-foreground hover:text-foreground shrink-0"
              title="Reset all filters"
            >
              <RotateCcw className="size-3.5 mr-1" />
              <span>Reset</span>
            </Button>
          )}
        </div>
      </div>

      {/* 5. Orders Table / Empty State */}
      {filteredOrders.length === 0 ? (
        <div className="rounded-2xl border border-border/70 bg-card py-16 px-4 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground">
            <ShoppingBag className="size-6" />
          </div>
          <h3 className="mt-4 text-base font-bold text-foreground">
            {hasActiveFilters ? "No matching orders" : "No orders yet"}
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
            {hasActiveFilters
              ? "No digital service orders match your active search or filter criteria. Try clearing filters."
              : "Your digital service purchases will appear here once you place an order."}
          </p>
          <div className="mt-6 flex justify-center gap-2">
            {hasActiveFilters ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="h-9 rounded-xl text-xs font-semibold"
              >
                Clear Filters
              </Button>
            ) : (
              <Button
                asChild
                size="sm"
                className="h-9 rounded-xl bg-[#7A1F3D] px-4 text-xs font-bold text-white hover:bg-[#681a34]"
              >
                <Link href={ROUTES.SERVICES}>Explore Services</Link>
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-none">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/70 bg-muted/30 text-muted-foreground font-semibold">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3">
                    Order
                  </th>
                  <th scope="col" className="px-3 py-3.5">
                    Service
                  </th>
                  <th scope="col" className="px-3 py-3.5">
                    Recipient
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-right">
                    Amount
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-center">
                    Status
                  </th>
                  <th scope="col" className="px-3 py-3.5">
                    Date
                  </th>
                  <th scope="col" className="py-3.5 pl-3 pr-4 text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {paginatedOrders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="cursor-pointer transition-colors hover:bg-muted/40"
                  >
                    {/* Order Reference */}
                    <td className="py-3.5 pl-4 pr-3 font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-[#7A1F3D] dark:text-rose-400">
                          {order.reference}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => copyRef(order.reference, e)}
                          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          title="Copy order reference"
                        >
                          {copiedRefId === order.reference ? (
                            <Check className="size-3 text-emerald-600" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Service */}
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#7A1F3D]/10 text-[#7A1F3D] dark:bg-[#7A1F3D]/20">
                          {getServiceCategoryIcon(order.category, "size-3.5")}
                        </div>
                        <span className="font-medium text-foreground line-clamp-1 max-w-[200px]">
                          {order.service_name}
                        </span>
                      </div>
                    </td>

                    {/* Recipient */}
                    <td className="px-3 py-3.5 font-mono text-muted-foreground">
                      <span className="line-clamp-1 max-w-[150px]">{order.beneficiary}</span>
                    </td>

                    {/* Amount */}
                    <td className="px-3 py-3.5 text-right font-bold text-foreground">
                      {formatCurrency(order.amount, order.currency)}
                    </td>

                    {/* Status */}
                    <td className="px-3 py-3.5 text-center">
                      {getOrderStatusBadge(order.status)}
                    </td>

                    {/* Date */}
                    <td className="px-3 py-3.5 text-muted-foreground whitespace-nowrap">
                      {formatDate(order.created_at)}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 pl-3 pr-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(order);
                          }}
                          className="h-7 px-2 text-xs font-semibold text-foreground hover:bg-muted"
                        >
                          <Eye className="size-3.5 mr-1 text-muted-foreground" />
                          <span>View Details</span>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setReceiptOrder(order);
                          }}
                          className="h-7 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                          title="View Receipt"
                        >
                          <FileText className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="divide-y divide-border/60 md:hidden">
            {paginatedOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="p-4 transition-colors hover:bg-muted/40 cursor-pointer space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#7A1F3D]/10 text-[#7A1F3D]">
                      {getServiceCategoryIcon(order.category, "size-4")}
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-foreground line-clamp-1">
                        {order.service_name}
                      </div>
                      <div className="font-mono text-[11px] text-muted-foreground">
                        {order.beneficiary}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-xs text-foreground">
                      {formatCurrency(order.amount, order.currency)}
                    </div>
                    <div className="mt-1">{getOrderStatusBadge(order.status)}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                  <span className="font-mono">{order.reference}</span>
                  <div className="flex items-center gap-2">
                    <span>{formatDate(order.created_at)}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setReceiptOrder(order);
                      }}
                      className="h-6 px-1.5 text-[11px]"
                    >
                      <Receipt className="size-3 mr-1" />
                      Receipt
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 6. Pagination Footer */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-border/70 bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
            <div>
              Showing{" "}
              <span className="font-medium text-foreground">
                {totalItems === 0 ? 0 : startIndex + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-foreground">
                {Math.min(startIndex + perPage, totalItems)}
              </span>{" "}
              of <span className="font-medium text-foreground">{totalItems}</span> orders
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span>Rows:</span>
                <select
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="rounded-md border border-border/80 bg-card px-2 py-0.5 text-xs text-foreground"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safeCurrentPage <= 1}
                  className="size-8 p-0 rounded-lg border-border/80"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="px-2 text-xs font-medium text-foreground">
                  {safeCurrentPage} / {totalPages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage >= totalPages}
                  className="size-8 p-0 rounded-lg border-border/80"
                  aria-label="Next page"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Dedicated Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        open={Boolean(selectedOrder)}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
        onViewReceipt={(order) => setReceiptOrder(order)}
      />

      {/* 8. Printable Order Receipt Modal */}
      <OrderReceiptModal
        order={receiptOrder}
        open={Boolean(receiptOrder)}
        onOpenChange={(open) => !open && setReceiptOrder(null)}
      />
    </div>
  );
}
