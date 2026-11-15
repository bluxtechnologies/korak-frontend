"use client";

import * as React from "react";
import Link from "next/link";
import { ShoppingBag, ArrowUpRight } from "lucide-react";
import { Badge, type BadgeProps } from "@/components/ui/badge";
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
import type { OverviewOrder, OrderStatus } from "./api";

export interface RecentOrdersCardProps {
  orders: OverviewOrder[];
  className?: string;
}

const ORDER_STATUS_VARIANTS: Record<OrderStatus, BadgeProps["variant"]> = {
  completed: "success",
  processing: "info",
  pending: "warning",
  failed: "destructive",
  refunded: "secondary",
};

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  completed: "Completed",
  processing: "Processing",
  pending: "Pending",
  failed: "Failed",
  refunded: "Refunded",
};

/**
 * RecentOrdersCard (F12.3).
 * Renders the top recent orders with text-only status badges,
 * formatted Naira amounts, and clean empty state handling.
 */
export function RecentOrdersCard({ orders, className }: RecentOrdersCardProps) {
  return (
    <Card className={className} data-testid="recent-orders-card">
      <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0 border-b border-border/60">
        <div>
          <CardTitle className="text-base font-semibold text-foreground">
            Recent Orders
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Latest digital deliveries and service requests
          </CardDescription>
        </div>

        <Button
          asChild
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs font-medium text-primary hover:text-primary hover:bg-surface gap-1"
        >
          <Link href={ROUTES.ORDERS}>
            <span>View all</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        {orders.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="No orders yet"
            description="Your recent purchases will appear here as soon as you order airtime, data, or digital services."
            bordered={false}
            className="py-10"
            action={
              <Button asChild size="sm" className="mt-2 text-xs">
                <Link href={ROUTES.AIRTIME}>Buy Airtime or Data</Link>
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs font-medium">Order</TableHead>
                  <TableHead className="text-xs font-medium">Service</TableHead>
                  <TableHead className="text-xs font-medium hidden sm:table-cell">
                    Recipient
                  </TableHead>
                  <TableHead className="text-xs font-medium text-right">
                    Amount
                  </TableHead>
                  <TableHead className="text-xs font-medium text-center">
                    Status
                  </TableHead>
                  <TableHead className="text-xs font-medium text-right hidden md:table-cell">
                    Date
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const statusVariant =
                    ORDER_STATUS_VARIANTS[order.status] ?? "secondary";
                  const statusLabel =
                    ORDER_STATUS_LABELS[order.status] ?? order.status;

                  return (
                    <TableRow key={order.id} className="text-xs">
                      <TableCell className="font-medium text-foreground py-3">
                        {order.reference}
                      </TableCell>
                      <TableCell className="text-muted-foreground py-3">
                        <span className="font-medium text-foreground block truncate max-w-[140px] sm:max-w-none">
                          {order.service_label}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground py-3 hidden sm:table-cell">
                        {order.recipient ?? "—"}
                      </TableCell>
                      <TableCell className="text-right font-medium text-foreground py-3">
                        {formatCurrency(order.amount, order.currency)}
                      </TableCell>
                      <TableCell className="text-center py-3">
                        <Badge variant={statusVariant}>{statusLabel}</Badge>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground py-3 hidden md:table-cell">
                        {formatDate(order.created_at, {
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
