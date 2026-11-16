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
  Phone,
  Wifi,
  Hash,
  Shield,
  FileText,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/config/navigation";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { OrderReceiptModal } from "./OrderReceiptModal";
import type { OrderRecord } from "./api";

export interface OrdersViewProps {
  initialOrders?: OrderRecord[];
  className?: string;
}

type FilterTab = "all" | "active" | "completed" | "refunded";

export function OrdersView({ initialOrders = [], className }: OrdersViewProps) {
  const [orders] = React.useState<OrderRecord[]>(initialOrders ?? []);
  const [activeTab, setActiveTab] = React.useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedOrder, setSelectedOrder] = React.useState<OrderRecord | null>(null);
  const [copiedRefId, setCopiedRefId] = React.useState<string | null>(null);

  const safeOrders = orders || [];

  // Tab counts
  const counts = React.useMemo(() => {
    return {
      all: safeOrders.length,
      active: safeOrders.filter((o) => o.status === "active" || o.status === "processing").length,
      completed: safeOrders.filter((o) => o.status === "completed").length,
      refunded: safeOrders.filter((o) => o.status === "refunded" || o.status === "cancelled").length,
    };
  }, [safeOrders]);

  // Filtered orders
  const filteredOrders = React.useMemo(() => {
    let list = safeOrders;

    if (activeTab === "active") {
      list = list.filter((o) => o.status === "active" || o.status === "processing");
    } else if (activeTab === "completed") {
      list = list.filter((o) => o.status === "completed");
    } else if (activeTab === "refunded") {
      list = list.filter((o) => o.status === "refunded" || o.status === "cancelled");
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (o) =>
          o.reference.toLowerCase().includes(q) ||
          o.service_name.toLowerCase().includes(q) ||
          o.beneficiary.toLowerCase().includes(q)
      );
    }

    return list;
  }, [orders, activeTab, searchQuery]);

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
            `"${o.reference}","${o.service_name}","${o.beneficiary}",${o.amount / 100},"${o.currency}","${o.status}","${o.created_at}"`
        )
        .join("\n");
      const blob = new Blob([headers + rows], {
        type: format === "csv" ? "text/csv;charset=utf-8;" : "text/plain;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `korak_orders_${Date.now()}.${format}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Exported ${filteredOrders.length} orders as ${format.toUpperCase()}`);
    } catch {
      toast.error("Export failed. Please try again.");
    }
  };

  const getServiceIcon = (category: OrderRecord["category"]) => {
    switch (category) {
      case "data":
        return <Wifi className="size-4" />;
      case "airtime":
        return <Phone className="size-4" />;
      case "numbers_otp":
      case "numbers_rent":
        return <Hash className="size-4" />;
      case "vpn":
        return <Shield className="size-4" />;
      case "social":
        return <Sparkles className="size-4" />;
      default:
        return <Package className="size-4" />;
    }
  };

  const getStatusBadge = (status: OrderRecord["status"]) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-3" />
            <span>Completed</span>
          </span>
        );
      case "active":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
            <span className="size-1.5 animate-pulse rounded-full bg-primary" />
            <span>Active</span>
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
            <Clock className="size-3" />
            <span>Processing</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
            <AlertCircle className="size-3" />
            <span className="capitalize">{status}</span>
          </span>
        );
    }
  };

  return (
    <div className={cn("space-y-6", className)} data-testid="orders-view">
      {/* 1. Header & Export Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Order History
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Digital deliveries, SMS OTP receipts, and telecom fulfillments recorded with audit integrity.
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
            className="h-9 gap-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/95"
          >
            <Link href={ROUTES.SERVICES}>
              <Plus className="size-3.5" />
              <span>+ New Purchase</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. Status Filter Tabs */}
      <div
        role="tablist"
        aria-label="Order status filter"
        className="flex flex-wrap items-center gap-2 border-b border-border/70 pb-3"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "all"}
          onClick={() => setActiveTab("all")}
          className={cn(
            "rounded-full px-4 py-1.5 text-xs font-semibold transition-colors",
            activeTab === "all"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-surface text-muted-foreground hover:bg-muted border border-border/70"
          )}
        >
          All ({counts.all})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "active"}
          onClick={() => setActiveTab("active")}
          className={cn(
            "rounded-full px-4 py-1.5 text-xs font-semibold transition-colors",
            activeTab === "active"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-surface text-muted-foreground hover:bg-muted border border-border/70"
          )}
        >
          Active / Processing ({counts.active})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "completed"}
          onClick={() => setActiveTab("completed")}
          className={cn(
            "rounded-full px-4 py-1.5 text-xs font-semibold transition-colors",
            activeTab === "completed"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-surface text-muted-foreground hover:bg-muted border border-border/70"
          )}
        >
          Completed ({counts.completed})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "refunded"}
          onClick={() => setActiveTab("refunded")}
          className={cn(
            "rounded-full px-4 py-1.5 text-xs font-semibold transition-colors",
            activeTab === "refunded"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-surface text-muted-foreground hover:bg-muted border border-border/70"
          )}
        >
          Cancelled / Refunded ({counts.refunded})
        </button>
      </div>

      {/* 3. Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by order reference, service name, or beneficiary phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-10 rounded-xl bg-surface pl-10 text-xs sm:text-sm border-border/80"
        />
      </div>

      {/* 4. Orders Table (Desktop) / Cards (Mobile) */}
      {filteredOrders.length === 0 ? (
        <Card className="rounded-2xl border-border/70 p-12 text-center shadow-xs">
          <CardContent className="flex flex-col items-center justify-center p-0">
            <div className="flex size-14 items-center justify-center rounded-2xl border border-border/70 bg-muted/40 text-muted-foreground">
              <Package className="size-7 stroke-[1.5]" />
            </div>
            <h3 className="mt-4 text-sm font-bold text-foreground">
              No orders found
            </h3>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground leading-relaxed">
              When you purchase airtime, mobile data, or virtual verification numbers, fulfillment receipts will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table View (>= md) */}
          <div className="hidden md:block overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/70 bg-muted/30 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3.5">Reference</th>
                  <th className="px-4 py-3.5">Service Details</th>
                  <th className="px-4 py-3.5">Beneficiary</th>
                  <th className="px-4 py-3.5">Amount</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-5 py-3.5 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-foreground">
                {filteredOrders.map((order) => {
                  const isCopied = copiedRefId === order.reference;
                  return (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="cursor-pointer hover:bg-muted/30 transition-colors"
                    >
                      {/* Reference with copy */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-primary">
                            {order.reference}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => copyRef(order.reference, e)}
                            className="text-muted-foreground hover:text-foreground"
                            aria-label={`Copy reference ${order.reference}`}
                          >
                            {isCopied ? (
                              <Check className="size-3 text-emerald-500" />
                            ) : (
                              <Copy className="size-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Service Name */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                            {getServiceIcon(order.category)}
                          </div>
                          <div>
                            <p className="font-bold text-foreground">
                              {order.service_name}
                            </p>
                            <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                              {order.category.replace(/_/g, " ")}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Beneficiary */}
                      <td className="px-4 py-4">
                        <span className="font-mono text-muted-foreground">
                          {order.beneficiary}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-4">
                        <span className="font-mono font-bold text-foreground">
                          {formatCurrency(order.amount, order.currency)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        {getStatusBadge(order.status)}
                      </td>

                      {/* Date */}
                      <td className="px-4 py-4 text-muted-foreground text-[11px]">
                        {formatDate(order.created_at)}
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(order);
                          }}
                          aria-label={`View Receipt for ${order.reference}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                        >
                          <span>Details</span>
                          <ChevronRight className="size-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View (< md) */}
          <div className="space-y-3 md:hidden">
            {filteredOrders.map((order) => (
              <Card
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="cursor-pointer rounded-2xl border-border/80 p-4 shadow-xs hover:border-primary/40 transition-all"
              >
                <CardContent className="p-0 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        {getServiceIcon(order.category)}
                      </div>
                      <span className="font-mono text-xs font-bold text-primary">
                        {order.reference}
                      </span>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-foreground sm:text-sm">
                      {order.service_name}
                    </h3>
                    <p className="font-mono text-[11px] text-muted-foreground mt-0.5">
                      Target: {order.beneficiary}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-border/50 pt-2.5 text-xs">
                    <span className="text-[11px] text-muted-foreground">
                      {formatDate(order.created_at)}
                    </span>
                    <span className="font-mono font-bold text-foreground">
                      {formatCurrency(order.amount, order.currency)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* 5. Order Receipt Modal */}
      <OrderReceiptModal
        order={selectedOrder}
        open={Boolean(selectedOrder)}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      />
    </div>
  );
}
