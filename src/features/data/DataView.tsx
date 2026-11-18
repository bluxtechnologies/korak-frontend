"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Radio,
  ArrowUpRight,
  ShieldCheck,
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
import { Button } from "@/components/ui/button";
import { NAV_ICON_STROKE_WIDTH, ROUTES } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { DataPurchaseForm } from "./DataPurchaseForm";
import { DataOrderSummary } from "./DataOrderSummary";
import {
  MOCK_RECENT_DATA_ORDERS,
  type RecentDataItem,
  type DataOrderResult,
  type DataBundlePlan,
} from "./api";
import {
  getOverviewData,
  type OverviewData,
  MOCK_OVERVIEW_DATA,
} from "@/features/overview/api";
import { TELECOM_NETWORKS, type NetworkInfo } from "@/features/airtime/api";

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

  // Sync state between form and summary
  const [selectedNetwork, setSelectedNetwork] = React.useState<NetworkInfo>(
    TELECOM_NETWORKS[0]
  );
  const [selectedPlan, setSelectedPlan] = React.useState<DataBundlePlan | undefined>(
    undefined
  );
  const [recipientPhone, setRecipientPhone] = React.useState<string>("");

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
    <div className="space-y-8" data-testid="data-view">
      {/* Main 2-Column Interface (Reference 1) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        {/* Left Column: Purchase Form */}
        <div className="lg:col-span-7 xl:col-span-8">
          <DataPurchaseForm
            walletBalance={walletBalance}
            onOrderCompleted={handleOrderCompleted}
            onSelectionChange={({ network, plan, phone }) => {
              setSelectedNetwork(network);
              setSelectedPlan(plan);
              setRecipientPhone(phone);
            }}
          />
        </div>

        {/* Right Column: Order Summary Panel */}
        <div className="lg:col-span-5 xl:col-span-4">
          <DataOrderSummary
            network={selectedNetwork}
            plan={selectedPlan}
            recipientPhone={recipientPhone}
            walletBalance={walletBalance}
          />
        </div>
      </div>

      {/* Secondary Information Section: Balance USSD Codes & Recent Deliveries */}
      <div className="pt-4 border-t border-border grid grid-cols-1 gap-6 lg:grid-cols-2 items-start">
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
                Balance Check USSD Codes
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              Dial directly on the recipient SIM to confirm balance
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5 space-y-2.5">
            {DATA_BALANCE_CODES.map((item) => (
              <div
                key={item.network}
                className="flex items-center justify-between rounded-[8px] border border-border bg-muted/20 p-3 text-xs transition-colors hover:bg-muted/40"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-foreground">
                    {item.network} Data
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {item.desc}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <code className="rounded-[6px] bg-background border border-border px-2.5 py-1 font-mono text-xs font-bold text-foreground">
                    {item.code}
                  </code>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopyCode(item.code)}
                    className="size-7 rounded-[6px] text-muted-foreground hover:text-foreground"
                    aria-label={`Copy ${item.network} code`}
                  >
                    {copiedCode === item.code ? (
                      <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </Button>
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
      </div>
    </div>
  );
}
