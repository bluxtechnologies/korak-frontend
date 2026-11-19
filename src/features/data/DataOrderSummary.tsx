"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Clock, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NAV_ICON_STROKE_WIDTH, ROUTES } from "@/config/navigation";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { DataBundlePlan } from "./api";
import type { NetworkInfo } from "@/features/airtime/api";

export interface DataOrderSummaryProps {
  network: NetworkInfo;
  plan?: DataBundlePlan;
  recipientPhone?: string;
  walletBalance: number; // minor units (e.g. 500000 = ₦5,000.00)
  className?: string;
}

export function DataOrderSummary({
  network,
  plan,
  recipientPhone,
  walletBalance,
  className,
}: DataOrderSummaryProps) {
  const planPriceMajor = plan?.price ?? 0;
  const planPriceMinor = planPriceMajor * 100;
  const isInsufficient = planPriceMinor > walletBalance;
  const remainingMinor = Math.max(0, walletBalance - planPriceMinor);

  return (
    <Card
      className={cn(
        "rounded-[10px] border border-border bg-card p-5 sm:p-6 shadow-none space-y-5 sticky top-20",
        className
      )}
      data-testid="data-order-summary"
    >
      <CardHeader className="p-0 space-y-0">
        <CardTitle className="text-base font-bold text-foreground">
          Order Summary
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0 space-y-4">
        {/* Network Information Box */}
        <div className="flex items-center gap-3 rounded-[10px] border border-border bg-muted/20 p-3.5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-[8px] border border-border bg-background p-1.5 shadow-2xs">
            <img
              src={network.logo}
              alt={network.fullName}
              className="h-full w-full object-contain"
            />
          </div>
          <div className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-foreground truncate">
              {network.fullName}
            </span>
            <span className="block text-xs text-muted-foreground">
              Selected Network
            </span>
          </div>
        </div>

        {/* Plan Details Breakdown */}
        <div className="space-y-2.5 text-xs sm:text-sm pt-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Data Plan</span>
            <span className="font-semibold text-foreground text-right truncate max-w-[60%]">
              {plan?.name || "None Selected"}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Validity</span>
            <span className="font-medium text-foreground text-right">
              {plan?.validity || "—"}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Recipient</span>
            <span className="font-mono font-medium text-foreground text-right">
              {recipientPhone || "—"}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Plan Price</span>
            <span className="font-mono font-semibold text-foreground text-right">
              {formatCurrency(planPriceMinor, "NGN")}
            </span>
          </div>

          {/* Divider */}
          <div className="border-t border-border pt-2.5 flex items-center justify-between text-sm sm:text-base font-bold">
            <span className="text-foreground">Total</span>
            <span className="font-mono text-primary">
              {formatCurrency(planPriceMinor, "NGN")}
            </span>
          </div>
        </div>

        {/* Wallet Balance & After-Purchase Box */}
        <div className="rounded-[10px] border border-border bg-muted/20 p-3.5 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-[6px] border border-border bg-background text-muted-foreground">
              <Wallet className="size-4" strokeWidth={NAV_ICON_STROKE_WIDTH} />
            </div>
            <div>
              <span className="block text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                Wallet Balance
              </span>
              <span className="font-mono text-xs font-bold text-foreground">
                {formatCurrency(walletBalance, "NGN")}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="block text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              After purchase
            </span>
            <span
              className={cn(
                "font-mono text-xs font-bold",
                isInsufficient ? "text-destructive" : "text-foreground"
              )}
            >
              {isInsufficient
                ? `-${formatCurrency(planPriceMinor - walletBalance, "NGN")}`
                : formatCurrency(remainingMinor, "NGN")}
            </span>
          </div>
        </div>

        {/* Insufficient / Positive Balance State */}
        {isInsufficient ? (
          <div className="flex items-center justify-between text-xs pt-0.5">
            <div className="flex items-center gap-1.5 text-destructive font-medium">
              <AlertCircle className="size-3.5 shrink-0" strokeWidth={NAV_ICON_STROKE_WIDTH} />
              <span>Insufficient balance</span>
            </div>
            <Link
              href={ROUTES.WALLET}
              className="text-xs font-semibold text-destructive hover:underline"
            >
              Add Money →
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium pt-0.5">
            <CheckCircle2 className="size-3.5 shrink-0" strokeWidth={NAV_ICON_STROKE_WIDTH} />
            <span>Sufficient wallet balance</span>
          </div>
        )}

        {/* Delivery Guarantee */}
        <div className="border-t border-border/80 pt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3.5 text-muted-foreground shrink-0" strokeWidth={NAV_ICON_STROKE_WIDTH} />
          <span>Usually delivered within a few seconds.</span>
        </div>
      </CardContent>
    </Card>
  );
}
