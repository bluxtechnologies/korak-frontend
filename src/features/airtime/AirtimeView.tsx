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
import { ROUTES } from "@/config/navigation";
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
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12" data-testid="airtime-view">
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
        <Card data-testid="airtime-rates-card">
          <CardHeader className="border-b border-border pb-3 space-y-1">
            <div className="flex items-center gap-2">
              <Zap className="size-4 text-primary" />
              <CardTitle className="text-sm font-semibold text-foreground">
                Network Rates & Cashback
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              Automated instant dispatch across all 4 major telcos
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4 space-y-3">
            {TELECOM_NETWORKS.map((net) => (
              <div
                key={net.id}
                className="flex items-center justify-between rounded-md border border-border bg-surface p-2.5 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="size-2 rounded-full"
                    style={{ backgroundColor: net.color }}
                  />
                  <span className="font-semibold text-foreground uppercase">
                    {net.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success" className="text-[10px]">
                    {Math.round(net.discountRate * 100)}% Discount
                  </Badge>
                  <span className="text-[11px] text-muted-foreground">
                    Instant
                  </span>
                </div>
              </div>
            ))}

            <div className="rounded-md border border-border/80 bg-muted/40 p-3 text-[11px] text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">
                ⚡ Zero Dispatch Fees
              </p>
              <p>
                No convenience charge. Top-ups are subsidized with instant wallet
                cashback upon successful delivery.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Airtime Deliveries */}
        <Card data-testid="recent-airtime-card">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-3 space-y-0">
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">
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
              className="h-7 px-2 text-[11px] text-primary hover:text-primary gap-1"
            >
              <Link href={ROUTES.TRANSACTIONS}>
                <span>History</span>
                <ArrowUpRight className="size-3" />
              </Link>
            </Button>
          </CardHeader>

          <CardContent className="pt-3 space-y-2.5">
            {recentOrders.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-md border border-border p-2.5 text-xs"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-foreground uppercase">
                    {item.network} · {item.phone}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {item.reference}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-semibold text-foreground block">
                    ₦{item.amount.toLocaleString()}
                  </span>
                  <Badge variant="success" className="text-[9px]">
                    {item.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
