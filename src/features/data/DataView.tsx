"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Wifi,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ArrowUpRight,
  Info,
  Radio,
  Smartphone,
  Copy,
  Check,
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
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

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

  const handleCopyCode = (code: string) => {
    const primaryCode = code.split(" or ")[0].trim();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(primaryCode);
      setCopiedCode(code);
      toast.success(`Copied USSD code: ${primaryCode}`);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  return (
    <div className="space-y-6" data-testid="data-view">
      {/* Service Switcher Tabs & Quick Guarantee */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[10px] border border-border bg-card p-3.5 shadow-none sm:p-4">
        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-9 px-4 rounded-[8px] text-xs font-semibold shadow-none hover:bg-muted"
          >
            <Link href={ROUTES.AIRTIME} className="gap-2">
              <Smartphone className="size-3.5" strokeWidth={NAV_ICON_STROKE_WIDTH} />
              <span>Airtime Top-Up</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="default"
            size="sm"
            className="h-9 px-4 rounded-[8px] text-xs font-semibold shadow-none"
          >
            <Link href={ROUTES.DATA} className="gap-2">
              <Wifi className="size-3.5" strokeWidth={NAV_ICON_STROKE_WIDTH} />
              <span>Mobile Data</span>
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" strokeWidth={NAV_ICON_STROKE_WIDTH} />
          <span className="font-medium">Direct SIM Cluster Provisioning • 5–15s Delivery</span>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
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
          <Card
            className="rounded-[10px] border border-border bg-card shadow-none overflow-hidden"
            data-testid="data-codes-card"
          >
            <CardHeader className="border-b border-border p-5 pb-4 space-y-1">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-[6px] bg-primary/10 text-primary">
                  <Radio className="size-4" strokeWidth={NAV_ICON_STROKE_WIDTH} />
                </div>
                <CardTitle className="text-sm font-bold text-foreground">
                  Balance Check USSD
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-muted-foreground">
                Dial these codes from recipient phone to check remaining data
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 space-y-3">
              {DATA_BALANCE_CODES.map((item) => (
                <div
                  key={item.network}
                  className="flex items-center justify-between rounded-[8px] border border-border bg-muted/20 p-3 text-xs transition-colors hover:bg-muted/40"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-foreground tracking-wide">
                      {item.network}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {item.desc}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <code className="rounded-[4px] border border-border bg-background px-2 py-0.5 font-mono text-xs font-semibold text-foreground">
                      {item.code}
                    </code>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(item.code)}
                      className="text-muted-foreground hover:text-foreground transition-colors p-1"
                      aria-label={`Copy USSD code for ${item.network}`}
                    >
                      {copiedCode === item.code ? (
                        <Check className="size-3.5 text-emerald-600" strokeWidth={NAV_ICON_STROKE_WIDTH} />
                      ) : (
                        <Copy className="size-3.5" strokeWidth={NAV_ICON_STROKE_WIDTH} />
                      )}
                    </button>
                  </div>
                </div>
              ))}

              <div className="rounded-[8px] border border-border bg-muted/30 p-3 text-xs text-muted-foreground space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" strokeWidth={NAV_ICON_STROKE_WIDTH} />
                  <span>Instant Auto-Provisioning</span>
                </div>
                <p className="leading-relaxed">
                  All data bundles are dispatched via high-speed SIM clusters and
                  reflect on the recipient device in 5–15 seconds.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Data Deliveries */}
          <Card
            className="rounded-[10px] border border-border bg-card shadow-none overflow-hidden"
            data-testid="recent-data-card"
          >
            <CardHeader className="flex flex-row items-center justify-between border-b border-border p-5 pb-4 space-y-0">
              <div>
                <CardTitle className="text-sm font-bold text-foreground">
                  Recent Data
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Your latest data activations
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
                  No recent data orders found.
                </div>
              ) : (
                recentOrders.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-[8px] border border-border bg-muted/20 p-3 text-xs transition-colors hover:bg-muted/40"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-foreground uppercase tracking-wide">
                        {item.network} · {item.size}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {item.phone} • {item.reference}
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

          {/* Network Compatibility Note */}
          <div className="rounded-[10px] border border-border bg-muted/15 p-4 flex items-start gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-[8px] bg-primary/10 text-primary">
              <ShieldCheck className="size-4" strokeWidth={NAV_ICON_STROKE_WIDTH} />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-foreground">
                Universal Network Compatibility
              </h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Bundles work seamlessly across 4G/5G smartphones, modems, routers, and tablets. Data rollover applies per telecom operator policies.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
