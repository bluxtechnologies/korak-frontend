"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  ShieldCheck,
  Check,
  ArrowRight,
  ExternalLink,
  Users,
  Calendar,
  Lock,
  Layers,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/formatters";
import { ROUTES } from "@/config/navigation";
import {
  getAvailableAccounts,
  buySocialAccount,
} from "./api";
import { MaskedDeliverableCard } from "./MaskedDeliverableCard";
import type { SocialAccountProduct, SocialPlatform } from "./types";
import type { OrderRecord } from "@/features/orders/api";

const PLATFORM_FILTERS: { id: string; label: string }[] = [
  { id: "all", label: "All Platforms" },
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
  { id: "x_twitter", label: "X (Twitter)" },
  { id: "youtube", label: "YouTube" },
  { id: "telegram", label: "Telegram" },
];

export function BuyAccountView() {
  const [accounts, setAccounts] = React.useState<SocialAccountProduct[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [selectedPlatform, setSelectedPlatform] = React.useState("all");

  // Purchase modal states
  const [selectedProduct, setSelectedProduct] =
    React.useState<SocialAccountProduct | null>(null);
  const [isPurchasing, setIsPurchasing] = React.useState(false);
  const [completedOrder, setCompletedOrder] = React.useState<OrderRecord | null>(
    null
  );
  const [termsAccepted, setTermsAccepted] = React.useState(false);

  const fetchAccounts = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAvailableAccounts({
        platform: selectedPlatform,
        search,
      });
      setAccounts(data);
    } catch {
      toast.error("Failed to load available accounts");
    } finally {
      setLoading(false);
    }
  }, [selectedPlatform, search]);

  React.useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleOpenPurchase = (product: SocialAccountProduct) => {
    setSelectedProduct(product);
    setCompletedOrder(null);
    setTermsAccepted(false);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
    setCompletedOrder(null);
    setIsPurchasing(false);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedProduct) return;
    if (!termsAccepted) {
      toast.error("Please accept the account transfer agreement terms");
      return;
    }

    setIsPurchasing(true);
    try {
      const idempotencyKey = `buy_acc_${selectedProduct.id}_${Date.now()}`;
      const order = await buySocialAccount({
        product_id: selectedProduct.id,
        idempotency_key: idempotencyKey,
      });
      setCompletedOrder(order);
      toast.success("Account purchased successfully! Deliverables ready.");
      // Refresh list to reflect sold/reserved
      fetchAccounts();
    } catch {
      toast.error("Transaction failed. Please check your wallet balance.");
    } finally {
      setIsPurchasing(false);
    }
  };

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toLocaleString();
  };

  return (
    <div className="space-y-6" data-testid="buy-account-view">
      {/* Sub-navigation bar between Buy and Boost */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="default"
            size="sm"
            className="text-xs font-semibold"
          >
            <Link href={ROUTES.SOCIAL_MEDIA_BUY}>Buy Verified Accounts</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="text-xs font-semibold"
          >
            <Link href={ROUTES.SOCIAL_MEDIA_BOOST}>Boost & Engagement</Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-4 text-primary" />
          <span>Escrow Protected • 24hr Transfer Guarantee</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {PLATFORM_FILTERS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedPlatform(p.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedPlatform === p.id
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by handle or niche..."
            className="h-9 pl-9 text-xs"
          />
        </div>
      </div>

      {/* Account Listings Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-64 animate-pulse rounded-xl border border-border/60 bg-muted/20"
            />
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Users className="mx-auto size-10 text-muted-foreground/40" />
          <h3 className="mt-3 text-sm font-semibold text-foreground">
            No accounts match your criteria
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Try adjusting your search query or selecting a different platform.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 transition-colors hover:border-border/80"
              data-testid={`account-card-${acc.id}`}
            >
              <div>
                {/* Header row */}
                <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[11px] font-semibold">
                      {acc.platform_label}
                    </Badge>
                    {acc.is_verified && (
                      <Badge variant="success" className="text-[10px]">
                        Verified
                      </Badge>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    Est. {acc.creation_year}
                  </span>
                </div>

                {/* Handle & Niche */}
                <div className="mt-3">
                  <h4 className="font-mono text-base font-bold text-foreground">
                    @{acc.handle}
                  </h4>
                  <p className="mt-0.5 text-xs font-medium text-primary">
                    {acc.niche}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {acc.description}
                  </p>
                </div>

                {/* Metric Strip */}
                <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg border border-border/50 bg-muted/20 p-2.5 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-medium">
                      Audience
                    </span>
                    <p className="font-mono font-bold text-foreground">
                      {formatFollowers(acc.followers_count)}
                    </p>
                  </div>
                  <div className="border-l border-border/50">
                    <span className="text-[10px] text-muted-foreground uppercase font-medium">
                      Account Age
                    </span>
                    <p className="font-mono font-bold text-foreground">
                      {new Date().getFullYear() - acc.creation_year} yrs
                    </p>
                  </div>
                </div>
              </div>

              {/* Price & Action */}
              <div className="mt-5 border-t border-border/50 pt-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Price
                    </span>
                    <p className="font-mono text-base font-black text-foreground">
                      {formatCurrency(acc.price, acc.currency)}
                    </p>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleOpenPurchase(acc)}
                    className="gap-1 text-xs font-semibold"
                    data-testid={`buy-button-${acc.id}`}
                  >
                    <span>Inspect & Buy</span>
                    <ArrowRight className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Purchase & Fulfillment Modal */}
      <Dialog
        open={Boolean(selectedProduct)}
        onOpenChange={(open) => {
          if (!open) handleCloseModal();
        }}
      >
        <DialogContent className="max-w-lg rounded-xl p-6" data-testid="buy-account-modal">
          <DialogHeader className="border-b border-border/60 pb-3">
            <DialogTitle className="text-base font-bold">
              {completedOrder ? "Order Fulfilled" : "Purchase Social Media Account"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {completedOrder
                ? "Your order has been completed and debited from your wallet."
                : "Review account deliverables, transfer guarantee, and wallet debit."}
            </DialogDescription>
          </DialogHeader>

          {selectedProduct && !completedOrder && (
            <div className="space-y-4">
              {/* Account summary banner */}
              <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-primary">
                      {selectedProduct.platform_label}
                    </span>
                    <h3 className="font-mono text-lg font-bold text-foreground">
                      @{selectedProduct.handle}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {selectedProduct.niche} • {formatFollowers(selectedProduct.followers_count)} Followers
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-muted-foreground uppercase">
                      Total Cost
                    </span>
                    <p className="font-mono text-xl font-black text-foreground">
                      {formatCurrency(selectedProduct.price, selectedProduct.currency)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Delivery specifications */}
              <div className="space-y-2 rounded-lg border border-border/60 p-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Delivery Speed</span>
                  <span className="font-medium text-foreground">Instant Digital Handover</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Security Email</span>
                  <span className="font-mono text-foreground">{selectedProduct.masked_recovery}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Audit Protection</span>
                  <span className="font-medium text-foreground">Encrypted with Audited Reveal</span>
                </div>
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start gap-2.5 rounded-lg border border-border/50 bg-muted/10 p-3 text-xs cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="size-4 rounded border-border text-primary focus:ring-primary mt-0.5"
                  data-testid="terms-checkbox"
                />
                <span className="text-muted-foreground leading-relaxed">
                  I agree to change login credentials immediately upon handover. I understand credential reveals are logged for security auditing per Doc 12.
                </span>
              </label>

              {/* Action buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCloseModal}
                  disabled={isPurchasing}
                  className="text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleConfirmPurchase}
                  disabled={isPurchasing || !termsAccepted}
                  className="gap-1.5 text-xs font-bold"
                  data-testid="confirm-purchase-button"
                >
                  {isPurchasing ? "Securing Transfer..." : "Confirm & Pay"}
                </Button>
              </div>
            </div>
          )}

          {/* After purchase: Render Masked Deliverables Card */}
          {completedOrder && selectedProduct && (
            <div className="space-y-4">
              <MaskedDeliverableCard
                orderId={completedOrder.id}
                accountHandle={selectedProduct.handle}
                maskedLogin={selectedProduct.masked_login}
                maskedRecovery={selectedProduct.masked_recovery}
              />

              <div className="flex justify-between items-center pt-2 border-t border-border/50">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="gap-1 text-xs font-semibold"
                >
                  <Link href={ROUTES.ORDERS}>
                    <span>View in Orders</span>
                    <ExternalLink className="size-3" />
                  </Link>
                </Button>

                <Button
                  type="button"
                  size="sm"
                  onClick={handleCloseModal}
                  className="text-xs font-semibold"
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
