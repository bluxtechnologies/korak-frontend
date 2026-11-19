"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Smartphone } from "lucide-react";
import { NAV_ICON_STROKE_WIDTH, ROUTES } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { AirtimePurchaseForm } from "./AirtimePurchaseForm";
import type { AirtimeOrderResult } from "./api";
import { getOverviewData, type OverviewData } from "@/features/overview/api";

export interface AirtimeViewProps {
  className?: string;
}

export function AirtimeView({ className }: AirtimeViewProps) {
  const [walletBalance, setWalletBalance] = React.useState<number>(0);

  React.useEffect(() => {
    getOverviewData()
      .then((data: OverviewData) => {
        if (data?.wallet?.balance !== undefined) {
          setWalletBalance(data.wallet.balance);
        }
      })
      .catch(() => {
        setWalletBalance(0);
      });
  }, []);

  const handleOrderCompleted = (order: AirtimeOrderResult) => {
    // Deduct from wallet balance locally
    setWalletBalance((prev) => Math.max(0, prev - order.final_amount * 100));
  };

  return (
    <div className={cn("space-y-6 sm:space-y-8", className)} data-testid="airtime-view">
      {/* 1. Page Introduction (Doc Requirements §4) */}
      <div className="space-y-3">
        <Link
          href={ROUTES.SERVICES}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" strokeWidth={NAV_ICON_STROKE_WIDTH} />
          <span>Back to Services</span>
        </Link>

        <div className="flex items-center gap-3.5">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-[12px] border border-primary/20 bg-primary/10 text-primary">
            <Smartphone className="size-5" strokeWidth={NAV_ICON_STROKE_WIDTH} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Airtime
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Buy airtime for any supported network.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Main 2-Column Content Area */}
      <AirtimePurchaseForm
        walletBalance={walletBalance}
        onOrderCompleted={handleOrderCompleted}
      />
    </div>
  );
}
