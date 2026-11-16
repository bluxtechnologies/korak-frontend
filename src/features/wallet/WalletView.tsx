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
  Info,
  Search,
  ShieldCheck,
  Wallet as WalletIcon,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROUTES, NAV_ICON_STROKE_WIDTH } from "@/config/navigation";
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

interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
  rateToNgn: number; // 1 Foreign = X NGN
}

const SUPPORTED_CURRENCIES: CurrencyOption[] = [
  { code: "NGN", name: "Nigerian Naira", symbol: "₦", rateToNgn: 1 },
  { code: "USD", name: "US Dollar", symbol: "$", rateToNgn: 1500 },
  { code: "GBP", name: "British Pound", symbol: "£", rateToNgn: 1950 },
  { code: "EUR", name: "Euro", symbol: "€", rateToNgn: 1650 },
];

export function WalletView({ initialData, className }: WalletViewProps) {
  const [data] = React.useState<WalletPageData>(initialData);
  const [isMasked, setIsMasked] = React.useState(false);
  const [activeFilter, setActiveFilter] = React.useState<"all" | "in" | "out">("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedTx, setSelectedTx] = React.useState<TransactionRecord | null>(null);
  const [isFundModalOpen, setIsFundModalOpen] = React.useState(false);
  const [selectedCurrencyCode, setSelectedCurrencyCode] = React.useState("NGN");

  const toggleMask = () => setIsMasked((prev) => !prev);

  // Active currency details
  const activeCurrency =
    SUPPORTED_CURRENCIES.find((c) => c.code === selectedCurrencyCode) ||
    SUPPORTED_CURRENCIES[0];

  // Primary balance display
  const displayBalance = isMasked
    ? maskCurrency(data.wallet.currency)
    : formatCurrency(data.wallet.balance, data.wallet.currency);

  const balanceInMajorNgn = data.wallet.balance / 100;

  // Estimated USD conversion
  const estimatedUsd = isMasked
    ? "••••"
    : (balanceInMajorNgn / 1500).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

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

  // Transaction counts for filter pills
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
      {/* 1. Page Introduction */}
      <div>
        <Link
          href={ROUTES.SERVICES}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" strokeWidth={NAV_ICON_STROKE_WIDTH} />
          <span>Back to Services</span>
        </Link>

        <div className="mt-2.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Wallet
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Manage your wallet balance, check live converted rates, and review past transaction receipts.
          </p>
        </div>
      </div>

      {/* 2. Main 2-Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: Larger (lg:col-span-7 xl:col-span-8) */}
        <div className="space-y-6 lg:col-span-7 xl:col-span-8">
          {/* Main Wallet Balance Card (Burgundy) */}
          <div
            className="relative overflow-hidden rounded-[10px] bg-[#7A1F3D] dark:bg-[#5C142B] p-6 text-white shadow-none sm:p-7 transition-colors"
            data-testid="wallet-main-balance-card"
          >
            {/* Subtle Decorative Wave Background Pattern */}
            <svg
              className="pointer-events-none absolute inset-0 size-full opacity-10"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 800 400"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M 0,200 C 200,140 400,260 800,180 L 800,400 L 0,400 Z"
                fill="currentColor"
              />
              <path
                d="M 0,260 C 250,210 500,320 800,240 L 800,400 L 0,400 Z"
                fill="currentColor"
                opacity="0.5"
              />
            </svg>

            {/* Top Row: Available Balance + Eye Toggle + Top Right Wallet Icon */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-white/90 sm:text-sm">
                  Available Balance
                </span>
                <button
                  type="button"
                  onClick={toggleMask}
                  aria-label={isMasked ? "Show balance" : "Hide balance"}
                  className="inline-flex size-6 items-center justify-center rounded-[6px] text-white/80 hover:bg-white/15 hover:text-white transition-colors focus:outline-none"
                >
                  {isMasked ? (
                    <Eye className="size-3.5" strokeWidth={NAV_ICON_STROKE_WIDTH} aria-hidden="true" />
                  ) : (
                    <EyeOff className="size-3.5" strokeWidth={NAV_ICON_STROKE_WIDTH} aria-hidden="true" />
                  )}
                </button>
              </div>

              {/* Wallet Icon Badge */}
              <div className="flex size-8 items-center justify-center rounded-[8px] border border-white/20 bg-white/10 text-white/95">
                <WalletIcon className="size-4" strokeWidth={NAV_ICON_STROKE_WIDTH} aria-hidden="true" />
              </div>
            </div>

            {/* Middle: Prominent Balance Display */}
            <div className="relative z-10 mt-6 sm:mt-7">
              <div
                className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl"
                data-testid="wallet-large-balance"
              >
                {displayBalance}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-white/75">
                <span className="inline-flex items-center gap-1">
                  <span>≈ ${estimatedUsd} USD (Estimated)</span>
                  <Info className="size-3 text-white/60" strokeWidth={NAV_ICON_STROKE_WIDTH} aria-hidden="true" />
                </span>
                <span className="text-white/40">•</span>
                <span className="text-white/70 font-medium">
                  {updatedTimeLabel}
                </span>
              </div>
            </div>

            {/* Bottom Row: Currency Indicator + Action Buttons */}
            <div className="relative z-10 mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-white/15 pt-5 sm:mt-8">
              {/* Currency Pill */}
              <div className="inline-flex items-center gap-1.5 rounded-[8px] bg-white/15 px-3 py-1 text-xs font-semibold text-white">
                <span>{data.wallet.currency || "NGN"}</span>
                <ChevronRight className="size-3 rotate-90 opacity-70" strokeWidth={NAV_ICON_STROKE_WIDTH} aria-hidden="true" />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={scrollToAccountDetails}
                  className="rounded-[8px] border border-white/30 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition-colors focus:outline-none"
                >
                  View Account Details
                </button>

                <Button
                  type="button"
                  size="sm"
                  onClick={() => setIsFundModalOpen(true)}
                  className="rounded-[8px] bg-white text-[#7A1F3D] hover:bg-white/90 px-4 text-xs font-bold shadow-none transition-colors"
                >
                  + Add Money
                </Button>
              </div>
            </div>
          </div>

          {/* Transaction Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              aria-label={`All (${allTxs.length})`}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold transition-colors",
                activeFilter === "all"
                  ? "bg-[#7A1F3D] text-white dark:bg-[#7A1F3D]"
                  : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <span>All</span>
              <span
                className={cn(
                  "inline-flex size-4 items-center justify-center rounded-full text-[10px]",
                  activeFilter === "all"
                    ? "bg-white/20 text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {allTxs.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("in")}
              aria-label={`Money In (${moneyInTxs.length})`}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold transition-colors",
                activeFilter === "in"
                  ? "bg-[#7A1F3D] text-white dark:bg-[#7A1F3D]"
                  : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <span>Money In</span>
              <span
                className={cn(
                  "inline-flex size-4 items-center justify-center rounded-full text-[10px]",
                  activeFilter === "in"
                    ? "bg-white/20 text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {moneyInTxs.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("out")}
              aria-label={`Money Out (${moneyOutTxs.length})`}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold transition-colors",
                activeFilter === "out"
                  ? "bg-[#7A1F3D] text-white dark:bg-[#7A1F3D]"
                  : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <span>Money Out</span>
              <span
                className={cn(
                  "inline-flex size-4 items-center justify-center rounded-full text-[10px]",
                  activeFilter === "out"
                    ? "bg-white/20 text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {moneyOutTxs.length}
              </span>
            </button>
          </div>

          {/* Transaction Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" strokeWidth={NAV_ICON_STROKE_WIDTH} />
            <Input
              type="search"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 rounded-full border border-border bg-card pl-10 text-xs sm:text-sm placeholder:text-muted-foreground"
            />
          </div>

          {/* Recent Transactions Section */}
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
              /* Clean Empty State Matching Screenshot */
              <Card className="rounded-[10px] border border-border bg-card p-12 text-center shadow-none">
                <CardContent className="flex flex-col items-center justify-center p-0">
                  <div className="flex size-12 items-center justify-center rounded-[8px] border border-border bg-muted/40 text-muted-foreground">
                    <FolderOpen className="size-6" strokeWidth={NAV_ICON_STROKE_WIDTH} />
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-foreground">
                    No transactions recorded yet
                  </h3>
                  <p className="mt-1 max-w-sm text-xs text-muted-foreground leading-relaxed">
                    When you fund your wallet or purchase digital services, records will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              /* Structured Transaction Rows */
              <div className="divide-y divide-border/60 rounded-[10px] border border-border bg-card overflow-hidden shadow-none">
                {filteredTxs.slice(0, 5).map((tx) => {
                  const isCredit = tx.direction === "credit";
                  const formattedAmount = formatCurrency(tx.amount, tx.currency);

                  return (
                    <button
                      key={tx.id}
                      type="button"
                      onClick={() => setSelectedTx(tx)}
                      className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/20 transition-colors focus:outline-none"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex size-9 shrink-0 items-center justify-center rounded-[8px]",
                            isCredit
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {isCredit ? (
                            <ArrowDownLeft className="size-4" strokeWidth={NAV_ICON_STROKE_WIDTH} />
                          ) : (
                            <ArrowUpRight className="size-4" strokeWidth={NAV_ICON_STROKE_WIDTH} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-foreground sm:text-sm truncate">
                            {tx.description}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {formatDate(tx.created_at)} • Ref: {tx.reference}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 pl-3">
                        <p
                          className={cn(
                            "font-mono text-xs font-bold sm:text-sm",
                            isCredit
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-foreground"
                          )}
                        >
                          {isCredit ? `+${formattedAmount}` : `-${formattedAmount}`}
                        </p>
                        <Badge variant="outline" className="text-[10px] uppercase font-medium mt-0.5">
                          {tx.status}
                        </Badge>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Smaller (lg:col-span-5 xl:col-span-4) */}
        <div className="space-y-5 lg:col-span-5 xl:col-span-4">
          {/* C. Display Currency Card */}
          <Card className="rounded-[10px] border border-border bg-card shadow-none">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground">
                  DISPLAY CURRENCY
                </span>
                <p className="mt-0.5 text-xs font-bold text-foreground">
                  {activeCurrency.name} ({activeCurrency.symbol})
                </p>
              </div>

              {/* Currency Selector Dropdown */}
              <div className="relative">
                <select
                  value={selectedCurrencyCode}
                  onChange={(e) => setSelectedCurrencyCode(e.target.value)}
                  className="appearance-none rounded-[8px] border border-border bg-muted/30 px-3 py-1.5 pr-7 text-xs font-bold text-foreground hover:bg-muted/60 focus:outline-none cursor-pointer"
                  aria-label="Select display currency"
                >
                  {SUPPORTED_CURRENCIES.map((curr) => (
                    <option key={curr.code} value={curr.code}>
                      {curr.code}
                    </option>
                  ))}
                </select>
                <ChevronRight
                  className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 rotate-90 text-muted-foreground"
                  strokeWidth={NAV_ICON_STROKE_WIDTH}
                  aria-hidden="true"
                />
              </div>
            </CardContent>
          </Card>

          {/* D. Wallet Account Details Panel */}
          <WalletAccountDetailsCard
            id="wallet-account-details"
            accountDetails={data.account_details}
          />

          {/* E. Quick Actions Card */}
          <Card className="rounded-[10px] border border-border bg-card shadow-none">
            <CardContent className="p-4 space-y-3">
              <span className="text-xs font-bold text-foreground">
                Quick Actions
              </span>

              {/* Fund Wallet Action Row */}
              <button
                type="button"
                onClick={() => setIsFundModalOpen(true)}
                className="w-full flex items-center justify-between rounded-[8px] bg-[#7A1F3D] hover:bg-[#681933] text-white font-bold h-11 px-4 shadow-none transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <WalletIcon className="size-4" strokeWidth={NAV_ICON_STROKE_WIDTH} />
                  <span className="text-xs">Fund Wallet</span>
                </div>
                <ChevronRight className="size-4 opacity-80" strokeWidth={NAV_ICON_STROKE_WIDTH} />
              </button>

              {/* View Statement Action Row */}
              <Link
                href={ROUTES.TRANSACTIONS}
                className="w-full flex items-center justify-between rounded-[8px] border border-border hover:bg-muted/30 font-semibold h-11 px-4 text-foreground shadow-none transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="size-4 text-muted-foreground" strokeWidth={NAV_ICON_STROKE_WIDTH} />
                  <span className="text-xs">View Statement</span>
                </div>
                <ChevronRight className="size-4 text-muted-foreground" strokeWidth={NAV_ICON_STROKE_WIDTH} />
              </Link>
            </CardContent>
          </Card>

          {/* F. Wallet Security Information Component */}
          <div className="flex items-start gap-3 rounded-[10px] border border-border bg-muted/20 p-4">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-[6px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mt-0.5">
              <ShieldCheck className="size-4" strokeWidth={NAV_ICON_STROKE_WIDTH} />
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
