"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  Eye,
  EyeOff,
  FileText,
  FolderOpen,
  HelpCircle,
  Info,
  Search,
  Shield,
  Wallet as WalletIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/config/navigation";
import { formatCurrency, maskCurrency, formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { TransactionDetailModal } from "@/features/transactions/TransactionDetailModal";
import type { TransactionRecord } from "@/features/transactions/api";
import { WalletAccountDetailsCard } from "./WalletAccountDetailsCard";
import { FundWalletModal } from "./FundWalletModal";
import type { WalletPageData } from "./api";

export interface WalletViewProps {
  initialData: WalletPageData;
  className?: string;
}

export function WalletView({ initialData, className }: WalletViewProps) {
  const [data] = React.useState<WalletPageData>(initialData);
  const [isMasked, setIsMasked] = React.useState(false);
  const [activeFilter, setActiveFilter] = React.useState<"all" | "in" | "out">("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedTx, setSelectedTx] = React.useState<TransactionRecord | null>(null);
  const [isFundModalOpen, setIsFundModalOpen] = React.useState(false);

  const toggleMask = () => setIsMasked((prev) => !prev);

  // Currency & balances
  const displayBalance = isMasked
    ? maskCurrency(data.wallet.currency)
    : formatCurrency(data.wallet.balance, data.wallet.currency);

  const balanceInMajor = data.wallet.balance / 100;
  const estimatedUsd = isMasked ? "••••" : (balanceInMajor / 1500).toFixed(2);

  // Formatted last updated timestamp
  const updatedTimeLabel = React.useMemo(() => {
    if (isMasked) return "Last updated: ••••";
    if (!data.wallet.updated_at) return "Last updated today at 10:15 AM";
    try {
      const d = new Date(data.wallet.updated_at);
      if (isNaN(d.getTime())) return "Last updated today at 10:15 AM";
      const timeStr = d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      return `Last updated today at ${timeStr}`;
    } catch {
      return "Last updated today at 10:15 AM";
    }
  }, [data.wallet.updated_at, isMasked]);

  // Transaction counts for filter tabs
  const allTxs = data.transactions || [];
  const moneyInTxs = React.useMemo(
    () => allTxs.filter((t) => t.direction === "credit"),
    [allTxs]
  );
  const moneyOutTxs = React.useMemo(
    () => allTxs.filter((t) => t.direction === "debit"),
    [allTxs]
  );

  // Filtered transactions based on tab and search
  const filteredTxs = React.useMemo(() => {
    let list = allTxs;
    if (activeFilter === "in") list = moneyInTxs;
    if (activeFilter === "out") list = moneyOutTxs;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.description.toLowerCase().includes(query) ||
          t.reference.toLowerCase().includes(query) ||
          t.type.toLowerCase().includes(query)
      );
    }
    return list;
  }, [allTxs, moneyInTxs, moneyOutTxs, activeFilter, searchQuery]);

  const scrollToAccountDetails = () => {
    const el = document.getElementById("wallet-account-details");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2", "ring-primary", "transition-all");
      setTimeout(() => {
        el.classList.remove("ring-2", "ring-primary");
      }, 2000);
    }
  };

  return (
    <div className={cn("space-y-6", className)} data-testid="wallet-view">
      {/* 1. Back Navigation & Page Header */}
      <div>
        <Link
          href={ROUTES.OVERVIEW}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to Services</span>
        </Link>

        <div className="mt-3">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Wallet
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Manage your wallet balance, check live converted rates, and review past transaction receipts.
          </p>
        </div>
      </div>

      {/* 2. Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left / Primary Column */}
        <div className="space-y-6 lg:col-span-7 xl:col-span-8">
          {/* Main Burgundy Balance Card */}
          <div
            className="relative overflow-hidden rounded-2xl bg-[#5C142B] p-6 text-white shadow-md dark:bg-[#4A0F22] sm:p-7"
            data-testid="wallet-main-balance-card"
          >
            {/* Wave & Radial Vector Ornament */}
            <div
              className="pointer-events-none absolute inset-0 opacity-15"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 100% 100%, rgba(255,255,255,0.4) 0, transparent 60%)",
              }}
              aria-hidden="true"
            />

            {/* Top row: Label + Eye toggle + Circular Wallet Badge */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-white/90 sm:text-sm">
                  Available Balance
                </span>
                <HelpCircle
                  className="size-3.5 text-white/70"
                  aria-hidden="true"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={toggleMask}
                  aria-label={isMasked ? "Show balance" : "Hide balance"}
                  className="size-7 rounded-full text-white/80 hover:bg-white/15 hover:text-white"
                >
                  {isMasked ? (
                    <Eye className="size-3.5" aria-hidden="true" />
                  ) : (
                    <EyeOff className="size-3.5" aria-hidden="true" />
                  )}
                </Button>
              </div>

              {/* Top right circular icon */}
              <div className="flex size-9 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white/90 backdrop-blur-xs">
                <WalletIcon className="size-4" aria-hidden="true" />
              </div>
            </div>

            {/* Middle: Large Amount + Subtitle */}
            <div className="relative z-10 mt-6 sm:mt-8">
              <div
                className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl"
                data-testid="wallet-large-balance"
              >
                {displayBalance}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/75">
                <span className="inline-flex items-center gap-1">
                  <span>≈ ${estimatedUsd} USD (Estimated)</span>
                  <Info className="size-3 text-white/60" aria-hidden="true" />
                </span>
                <span className="text-white/40">•</span>
                <span className="inline-flex items-center gap-1.5 text-white/80 font-medium">
                  <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                  <span>{updatedTimeLabel}</span>
                </span>
              </div>
            </div>

            {/* Bottom Row: Currency Pill + View Account Details + Add Money */}
            <div className="relative z-10 mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/15 pt-5 sm:mt-8">
              <div className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-xs">
                <span>{data.wallet.currency || "NGN"}</span>
                <ChevronRight className="size-3 rotate-90 opacity-80" aria-hidden="true" />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={scrollToAccountDetails}
                  className="rounded-full border-white/30 bg-white/10 px-4 text-xs font-semibold text-white hover:bg-white/20 hover:text-white shadow-none"
                >
                  View Account Details
                </Button>

                <Button
                  type="button"
                  size="sm"
                  onClick={() => setIsFundModalOpen(true)}
                  className="rounded-full bg-[#7A1F3D] hover:bg-[#681933] px-5 text-xs font-bold text-white shadow-sm"
                >
                  + Add Money
                </Button>
              </div>
            </div>
          </div>

          {/* Filter Pills: All / Money In / Money Out */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-semibold transition-colors",
                activeFilter === "all"
                  ? "bg-[#5C142B] text-white dark:bg-[#7A1F3D]"
                  : "bg-surface text-muted-foreground hover:bg-muted border border-border/70"
              )}
            >
              All ({allTxs.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("in")}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-semibold transition-colors",
                activeFilter === "in"
                  ? "bg-[#5C142B] text-white dark:bg-[#7A1F3D]"
                  : "bg-surface text-muted-foreground hover:bg-muted border border-border/70"
              )}
            >
              Money In ({moneyInTxs.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("out")}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-semibold transition-colors",
                activeFilter === "out"
                  ? "bg-[#5C142B] text-white dark:bg-[#7A1F3D]"
                  : "bg-surface text-muted-foreground hover:bg-muted border border-border/70"
              )}
            >
              Money Out ({moneyOutTxs.length})
            </button>
          </div>

          {/* Search Transactions Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 rounded-xl bg-surface pl-10 text-xs sm:text-sm border-border/80"
            />
          </div>

          {/* Recent Transactions List / Empty State */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground sm:text-base">
                Recent Transactions
              </h2>
              <Link
                href={ROUTES.TRANSACTIONS}
                className="text-xs font-semibold text-primary hover:underline"
              >
                View All
              </Link>
            </div>

            {filteredTxs.length === 0 ? (
              /* Empty state matching the reference screenshot */
              <Card className="rounded-2xl border-border/70 p-10 text-center shadow-xs">
                <CardContent className="flex flex-col items-center justify-center p-0">
                  <div className="flex size-14 items-center justify-center rounded-2xl border border-border/70 bg-muted/40 text-muted-foreground">
                    <FolderOpen className="size-7 stroke-[1.5]" />
                  </div>
                  <h3 className="mt-4 text-sm font-bold text-foreground">
                    No transactions recorded yet
                  </h3>
                  <p className="mt-1 max-w-sm text-xs text-muted-foreground leading-relaxed">
                    When you fund your wallet or purchase digital services, records will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              /* Transactions list */
              <div className="divide-y divide-border/50 rounded-2xl border border-border/70 bg-card overflow-hidden shadow-xs">
                {filteredTxs.slice(0, 5).map((tx) => {
                  const isCredit = tx.direction === "credit";
                  const formattedAmount = formatCurrency(tx.amount, tx.currency);

                  return (
                    <button
                      key={tx.id}
                      type="button"
                      onClick={() => setSelectedTx(tx)}
                      className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex size-9 items-center justify-center rounded-xl",
                            isCredit
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          )}
                        >
                          <WalletIcon className="size-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground sm:text-sm line-clamp-1">
                            {tx.description}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {formatDate(tx.created_at)} • Ref: {tx.reference}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p
                          className={cn(
                            "text-xs font-bold sm:text-sm",
                            isCredit
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-foreground"
                          )}
                        >
                          {isCredit ? `+${formattedAmount}` : `-${formattedAmount}`}
                        </p>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {tx.type.replace(/_/g, " ")}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right / Sidebar Column */}
        <div className="space-y-5 lg:col-span-5 xl:col-span-4">
          {/* Display Currency Widget */}
          <Card className="rounded-2xl border-border/80 shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground">
                  DISPLAY CURRENCY
                </span>
                <p className="mt-0.5 text-xs font-bold text-foreground">
                  Nigerian Naira (₦)
                </p>
              </div>
              <div className="rounded-full bg-muted/80 border border-border px-3 py-1 text-xs font-bold text-foreground">
                {data.wallet.currency || "NGN"}
              </div>
            </CardContent>
          </Card>

          {/* Wallet Account Details Card */}
          <WalletAccountDetailsCard
            id="wallet-account-details"
            accountDetails={data.account_details}
          />

          {/* Quick Actions Card */}
          <Card className="rounded-2xl border-border/80 shadow-xs">
            <CardContent className="p-4 space-y-2.5">
              <span className="text-xs font-bold text-foreground">
                Quick Actions
              </span>

              {/* Fund Wallet Action */}
              <Button
                type="button"
                onClick={() => setIsFundModalOpen(true)}
                className="w-full justify-between rounded-xl bg-[#7A1F3D] hover:bg-[#631830] text-white font-bold h-11 px-4 shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <WalletIcon className="size-4" />
                  <span className="text-xs">Fund Wallet</span>
                </div>
                <ChevronRight className="size-4 opacity-75" />
              </Button>

              {/* View Statement Action */}
              <Button
                asChild
                variant="outline"
                className="w-full justify-between rounded-xl border-border/80 hover:bg-muted/40 font-semibold h-11 px-4 text-foreground shadow-none"
              >
                <Link href={ROUTES.TRANSACTIONS}>
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-muted-foreground" />
                    <span className="text-xs">View Statement</span>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Trust / Security Card */}
          <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-muted/20 p-4">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Shield className="size-4.5" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">
                Your Wallet is Secure
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground leading-relaxed">
                All transactions are protected with industry-standard security and recorded on an immutable ledger.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        transaction={selectedTx}
        open={Boolean(selectedTx)}
        onOpenChange={(open) => !open && setSelectedTx(null)}
      />

      {/* Fund Wallet Modal */}
      <FundWalletModal
        open={isFundModalOpen}
        onOpenChange={setIsFundModalOpen}
        accountDetails={data.account_details}
      />
    </div>
  );
}
