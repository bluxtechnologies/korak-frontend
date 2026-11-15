"use client";

import * as React from "react";
import Link from "next/link";
import {
  Wifi,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ArrowUpRight,
  Info,
  Radio,
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
import { DataPurchaseForm } from "./DataPurchaseForm";
import {
  MOCK_RECENT_DATA_ORDERS,
  type RecentDataItem,
  type DataOrderResult,
} from "./api";
import {
  getOverviewData,
  type OverviewData,
  MOCK_OVERVIEW_DATA,
} from "@/features/overview/api";

const DATA_BALANCE_CODES = [
  { network: "MTN", code: "*323*4# or *461*4#", desc: "SME & CG Balance" },
  { network: "Airtel", code: "*323# or *140#", desc: "Corporate & Gifting" },
  { network: "Glo", code: "*312# or *127*0#", desc: "Direct & CG Balance" },
  { network: "9mobile", code: "*323# or *228#", desc: "Corporate Balance" },
];

export function DataView() {
  const [walletBalance, setWalletBalance] = React.useState<number>(500000); // ₦5,000 default
  const [recentOrders, setRecentOrders] =
    React.useState<RecentDataItem[]>(MOCK_RECENT_DATA_ORDERS);

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

  const handleOrderCompleted = (order: DataOrderResult) => {
    // Add new order to top of list
    const newItem: RecentDataItem = {
      id: order.order_id,
      reference: order.reference,
      network: order.network,
      plan_name: order.plan_name,
      size: order.size,
      phone: order.phone,
      amount: order.amount,
      status: order.status === "failed" ? "failed" : "completed",
      created_at: order.created_at,
    };
    setRecentOrders((prev) => [newItem, ...prev.slice(0, 4)]);

    // Deduct from wallet balance locally
    setWalletBalance((prev) => Math.max(0, prev - order.amount * 100));
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12" data-testid="data-view">
      {/* Primary Column: Data Purchase Form */}
      <div className="lg:col-span-7 xl:col-span-8">
        <DataPurchaseForm
          walletBalance={walletBalance}
          onOrderCompleted={handleOrderCompleted}
        />
      </div>

      {/* Secondary Column: Balance Codes, Network Status & Recent Deliveries */}
      <div className="space-y-6 lg:col-span-5 xl:col-span-4">
        {/* USSD Balance Check Codes */}
        <Card data-testid="data-codes-card">
          <CardHeader className="border-b border-border pb-3 space-y-1">
            <div className="flex items-center gap-2">
              <Radio className="size-4 text-primary" />
              <CardTitle className="text-sm font-semibold text-foreground">
                Balance Check USSD
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              Dial these codes from recipient phone to check remaining data
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4 space-y-3">
            {DATA_BALANCE_CODES.map((item) => (
              <div
                key={item.network}
                className="flex items-center justify-between rounded-md border border-border bg-surface p-2.5 text-xs"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-foreground">
                    {item.network}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {item.desc}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="rounded border border-border bg-muted/50 px-1.5 py-0.5 font-mono text-xs font-semibold text-foreground">
                    {item.code}
                  </code>
                </div>
              </div>
            ))}

            <div className="rounded-md border border-border/80 bg-muted/40 p-3 text-[11px] text-muted-foreground space-y-1.5">
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <ShieldCheck className="size-3.5 text-emerald-500" />
                <span>Instant Auto-Provisioning</span>
              </div>
              <p>
                All data bundles are dispatched via high-speed SIM clusters and
                reflect on the recipient device in 5–15 seconds.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Data Deliveries */}
        <Card data-testid="recent-data-card">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-3 space-y-0">
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">
                Recent Data Bundles
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Your latest data package orders
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
                    {item.network} · {item.size}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {item.phone}
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
