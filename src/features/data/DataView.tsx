"use client";

import * as React from "react";
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

export function DataView() {
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
    </div>
  );
}
