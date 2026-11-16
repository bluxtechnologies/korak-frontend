"use client";

import * as React from "react";
import {
  MessageSquareText,
  Clock,
  ShieldCheck,
  Zap,
  HelpCircle,
  Hash,
  PhoneCall,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LiveWaitingTerminal } from "./LiveWaitingTerminal";
import { NumbersSelectorCard } from "./NumbersSelectorCard";
import { RentalsLedgerCard } from "./RentalsLedgerCard";
import {
  MOCK_ACTIVE_OTP_ORDER,
  MOCK_RENTAL_RECORDS,
  cancelOtpOrder,
  type ActiveOtpOrder,
  type RentalNumberRecord,
} from "./api";
import { getOverviewData, type OverviewData, MOCK_OVERVIEW_DATA } from "@/features/overview/api";

export type NumbersMode = "otp" | "rental";

export interface NumbersViewProps {
  initialMode?: NumbersMode;
  initialActiveOrder?: ActiveOtpOrder | null;
  initialRentals?: RentalNumberRecord[];
  className?: string;
}

export function NumbersView({
  initialMode = "otp",
  initialActiveOrder = null,
  initialRentals = MOCK_RENTAL_RECORDS,
  className,
}: NumbersViewProps) {
  const [mode, setMode] = React.useState<NumbersMode>(initialMode);
  const [activeOrder, setActiveOrder] = React.useState<ActiveOtpOrder | null>(initialActiveOrder);
  const [rentals, setRentals] = React.useState<RentalNumberRecord[]>(initialRentals);
  const [walletBalance, setWalletBalance] = React.useState<number>(500000); // ₦5,000

  React.useEffect(() => {
    getOverviewData()
      .then((data: OverviewData) => {
        if (data?.wallet?.balance !== undefined) {
          setWalletBalance(data.wallet.balance);
        }
      })
      .catch(() => {
        setWalletBalance(MOCK_OVERVIEW_DATA.wallet.balance);
      });
  }, []);

  const handleCancelActiveOrder = async (orderId: string) => {
    await cancelOtpOrder(orderId);
    if (activeOrder) {
      setWalletBalance((prev) => prev + activeOrder.platform.price * 100);
    }
  };

  return (
    <div className={cn("space-y-6", className)} data-testid="numbers-view">
      {/* 1. Header & Mode Switcher */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Virtual Numbers & SMS OTP
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Instant private temporary & rental phone lines for global app verification.
          </p>
        </div>

        {/* 2-Mode Switcher */}
        <div
          role="tablist"
          aria-label="Numbers service mode"
          className="flex items-center rounded-xl border border-border/80 bg-surface p-1 shadow-xs"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === "otp"}
            onClick={() => setMode("otp")}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all",
              mode === "otp"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Zap className="size-3.5" />
            <span>One-Time OTP (20 Mins)</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={mode === "rental"}
            onClick={() => setMode("rental")}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all",
              mode === "rental"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Clock className="size-3.5" />
            <span>Rental Numbers (1–30 Days)</span>
          </button>
        </div>
      </div>

      {/* 2. Live Waiting Terminal (If an Active OTP Order Exists) */}
      {activeOrder && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Active Terminal Console</span>
            </span>
          </div>

          <LiveWaitingTerminal
            order={activeOrder}
            onCancelOrder={handleCancelActiveOrder}
            onOrderCompleted={() => setActiveOrder(null)}
          />
        </div>
      )}

      {/* 3. Main Grid: Selector + Trust/Instructions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Number Selector Form */}
        <div className="lg:col-span-8">
          <NumbersSelectorCard
            mode={mode}
            walletBalance={walletBalance}
            onOtpOrderCreated={(newOrder) => {
              setActiveOrder(newOrder);
              setWalletBalance((prev) => Math.max(0, prev - newOrder.platform.price * 100));
            }}
            onRentalCreated={(newRental) => {
              setRentals((prev) => [newRental, ...prev]);
              setWalletBalance((prev) => Math.max(0, prev - newRental.price * 100));
            }}
          />
        </div>

        {/* Right Column: How It Works & Reliability Guarantee */}
        <div className="space-y-6 lg:col-span-4">
          {/* How It Works Card */}
          <Card className="rounded-2xl border-border/80 shadow-xs">
            <CardHeader className="border-b border-border/70 pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="size-4 text-primary" />
                <CardTitle className="text-sm font-bold text-foreground">
                  How OTP Verification Works
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[10px]">
                  1
                </div>
                <div>
                  <p className="font-semibold text-foreground">Select Country & Service</p>
                  <p className="text-muted-foreground mt-0.5 text-[11px]">
                    Choose your desired platform (e.g. WhatsApp, OpenAI) and target country.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[10px]">
                  2
                </div>
                <div>
                  <p className="font-semibold text-foreground">Copy & Paste Number</p>
                  <p className="text-muted-foreground mt-0.5 text-[11px]">
                    Copy the dedicated number directly into the target app to request an SMS code.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[10px]">
                  3
                </div>
                <div>
                  <p className="font-semibold text-foreground">Instant Live Code Delivery</p>
                  <p className="text-muted-foreground mt-0.5 text-[11px]">
                    Incoming SMS codes appear live in the terminal within 5 to 30 seconds.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Refund Guarantee Badge */}
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.04] p-4 text-xs dark:bg-emerald-500/[0.08]">
            <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="size-4" />
              <span>100% Refund Guarantee</span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
              If an SMS code is not received within the 20-minute window, click Cancel & Refund to return 100% of the funds to your wallet instantly.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Active Rentals Ledger Section */}
      <div className="pt-2">
        <RentalsLedgerCard
          rentals={rentals}
          onRenewRental={(rentalId) => {
            // Demo renew action
            setRentals((prev) =>
              prev.map((r) =>
                r.id === rentalId
                  ? {
                      ...r,
                      expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
                    }
                  : r
              )
            );
          }}
        />
      </div>
    </div>
  );
}
