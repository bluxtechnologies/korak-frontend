"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Wifi } from "lucide-react";
import { NAV_ICON_STROKE_WIDTH, ROUTES } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { DataPurchaseForm } from "./DataPurchaseForm";
import { DataOrderSummary } from "./DataOrderSummary";
import {
  type DataOrderResult,
  type DataBundlePlan,
} from "./api";
import {
  getOverviewData,
  type OverviewData,
  MOCK_OVERVIEW_DATA,
} from "@/features/overview/api";
import { TELECOM_NETWORKS, type NetworkInfo } from "@/features/airtime/api";

export interface DataViewProps {
  className?: string;
}

export function DataView({ className }: DataViewProps) {
  const [walletBalance, setWalletBalance] = React.useState<number>(500000); // ₦5,000 default

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
    setWalletBalance((prev) => Math.max(0, prev - order.amount * 100));
  };

  return (
    <div className={cn("space-y-6 sm:space-y-8", className)} data-testid="data-view">
      {/* 1. Page Introduction (Matching Airtime header style) */}
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
            <Wifi className="size-5" strokeWidth={NAV_ICON_STROKE_WIDTH} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Mobile Data
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Choose a data bundle for your recipient.
            </p>
          </div>
        </div>
      </div>

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
    </div>
  );
}
