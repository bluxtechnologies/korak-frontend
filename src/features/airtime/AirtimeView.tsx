"use client";

import * as React from "react";
import Link from "next/link";
import {
  Zap,
  CheckCircle2,
  Clock,
  ShieldCheck,
  HelpCircle,
  ArrowUpRight,
  TrendingUp,
  Smartphone,
  Wifi,
  History,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NAV_ICON_STROKE_WIDTH, ROUTES } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { AirtimePurchaseForm } from "./AirtimePurchaseForm";
import {
  TELECOM_NETWORKS,
  MOCK_RECENT_AIRTIME,
  type RecentAirtimeItem,
  type AirtimeOrderResult,
} from "./api";
import { getOverviewData, type OverviewData, MOCK_OVERVIEW_DATA } from "@/features/overview/api";

export function AirtimeView() {
  const [walletBalance, setWalletBalance] = React.useState<number>(500000); // ₦5,000 default
  const [recentOrders, setRecentOrders] =
    React.useState<RecentAirtimeItem[]>(MOCK_RECENT_AIRTIME);

  React.useEffect(() => {
    getOverviewData()
      .then((data: OverviewData) => {
        if (data?.wallet?.balance !== undefined) {
          setWalletBalance(data.wallet.balance);
        }
      })
      .catch(() => {
        // Fallback to mock balance
        setWalletBalance(MOCK_OVERVIEW_DATA.wallet.balance);
      });
  }, []);

  const handleOrderCompleted = (order: AirtimeOrderResult) => {
    // Add new order to top of list
    const newItem: RecentAirtimeItem = {
      id: order.order_id,
      reference: order.reference,
      network: order.network,
      phone: order.phone,
      amount: order.amount,
      status: order.status === "failed" ? "failed" : "completed",
      created_at: order.created_at,
    };
    setRecentOrders((prev) => [newItem, ...prev.slice(0, 4)]);

    // Deduct from wallet balance locally
    setWalletBalance((prev) => Math.max(0, prev - order.final_amount * 100));
  };

  return (
    <div className="space-y-6" data-testid="airtime-view">
      {/* Service Switcher Tabs & Quick Guarantee */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[10px] border border-border bg-card p-3.5 shadow-none sm:p-4">
        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="default"
            size="sm"
            className="h-9 px-4 rounded-[8px] text-xs font-semibold shadow-none"
          >
            <Link href={ROUTES.AIRTIME} className="gap-2">
              <Smartphone className="size-3.5" strokeWidth={NAV_ICON_STROKE_WIDTH} />
              <span>Buy Airtime</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-9 px-4 rounded-[8px] text-xs font-semibold shadow-none hover:bg-muted"
          >
            <Link href={ROUTES.DATA} className="gap-2">
              <Wifi className="size-3.5" strokeWidth={NAV_ICON_STROKE_WIDTH} />
              <span>Mobile Data</span>
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" strokeWidth={NAV_ICON_STROKE_WIDTH} />
          <span className="font-medium">Instant Telecom Dispatch • 0% Convenience Fee</span>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Primary Column: Airtime Form */}
        <div className="lg:col-span-7 xl:col-span-8">
          <AirtimePurchaseForm
            walletBalance={walletBalance}
            onOrderCompleted={handleOrderCompleted}
          />
        </div>

        {/* Secondary Column: Network Discounts & History */}
        <div className="space-y-6 lg:col-span-5 xl:col-span-4">
          {/* Network Cashback Rates */}
          <Card
            className="rounded-[10px] border border-border bg-card shadow-none overflow-hidden"
            data-testid="airtime-rates-card"
          >
            <CardHeader className="border-b border-border p-5 pb-4 space-y-1">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-[6px] bg-primary/10 text-primary">
                  <Zap className="size-4" strokeWidth={NAV_ICON_STROKE_WIDTH} />
                </div>
                <CardTitle className="text-sm font-bold text-foreground">
                  Network Rates & Cashback
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-muted-foreground">
                Automated instant dispatch across all 4 major telcos
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 space-y-3">
              {TELECOM_NETWORKS.map((net) => (
                <div
                  key={net.id}
                  className="flex items-center justify-between rounded-[8px] border border-border bg-muted/20 p-3 text-xs transition-colors hover:bg-muted/40"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: net.color }}
                      aria-hidden="true"
                    />
                    <span className="font-bold uppercase tracking-wider text-foreground">
                      {net.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded-[4px] bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {Math.round(net.discountRate * 100)}% Discount
                    </span>
                    <span className="text-[11px] font-medium text-muted-foreground">
                      Instant
                    </span>
                  </div>
                </div>
              ))}

              <div className="rounded-[8px] border border-border bg-muted/30 p-3 text-xs text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  <span>⚡ Zero Dispatch Fees</span>
                </p>
                <p className="leading-relaxed">
                  No convenience charge. Top-ups are subsidized with instant wallet
                  cashback upon successful delivery.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Airtime Deliveries */}
          <Card
            className="rounded-[10px] border border-border bg-card shadow-none overflow-hidden"
            data-testid="recent-airtime-card"
          >
            <CardHeader className="flex flex-row items-center justify-between border-b border-border p-5 pb-4 space-y-0">
              <div>
                <CardTitle className="text-sm font-bold text-foreground">
                  Recent Airtime
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Your latest top-up transactions
                </CardDescription>
              </div>

              <Button
                asChild
                variant="ghost"
                size="sm"
                className="h-8 px-2.5 text-xs font-semibold text-primary hover:text-primary gap-1 rounded-[6px]"
              >
                <Link href={ROUTES.TRANSACTIONS}>
                  <span>History</span>
                  <ArrowUpRight className="size-3.5" strokeWidth={NAV_ICON_STROKE_WIDTH} />
                </Link>
              </Button>
            </CardHeader>

            <CardContent className="p-5 space-y-2.5">
              {recentOrders.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  No recent airtime purchases found.
                </div>
              ) : (
                recentOrders.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-[8px] border border-border bg-muted/20 p-3 text-xs transition-colors hover:bg-muted/40"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-foreground uppercase tracking-wide">
                        {item.network} · <span className="font-mono font-medium">{item.phone}</span>
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {item.reference}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-foreground block">
                        ₦{item.amount.toLocaleString()}
                      </span>
                      <span
                        className={cn(
                          "rounded-[4px] px-1.5 py-0.5 text-[9px] font-bold uppercase",
                          item.status === "completed"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-destructive/10 text-destructive border border-destructive/20"
                        )}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Security & Reliability Info */}
          <div className="rounded-[10px] border border-border bg-muted/15 p-4 flex items-start gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-[8px] bg-primary/10 text-primary">
              <ShieldCheck className="size-4" strokeWidth={NAV_ICON_STROKE_WIDTH} />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-foreground">
                Your Airtime is Guaranteed
              </h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Direct integration with official telecom switches ensures immediate recharge. Automated wallet reversals protect you against carrier delays.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
