"use client";

import * as React from "react";
import {
  Shield,
  Server,
  Zap,
  Check,
  ChevronRight,
  Sparkles,
  Lock,
  Globe2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  type VpnServerNode,
  type VpnSubscription,
  purchaseVpnNode,
} from "./api";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { formatNaira } from "@/lib/formatters";

interface VpnNodeSelectorCardProps {
  nodes: VpnServerNode[];
  onSubscriptionCreated: (newSub: VpnSubscription) => void;
  userBalance?: number;
}

interface DurationTier {
  months: number;
  label: string;
  price: number; // in Naira
  discountPercent?: number;
  savings?: number;
  badge?: string;
}

const DURATION_TIERS: DurationTier[] = [
  {
    months: 1,
    label: "1 Month",
    price: 3500,
  },
  {
    months: 3,
    label: "3 Months",
    price: 9450,
    discountPercent: 10,
    savings: 1050,
    badge: "10% OFF",
  },
  {
    months: 6,
    label: "6 Months",
    price: 17850,
    discountPercent: 15,
    savings: 3150,
    badge: "15% OFF",
  },
  {
    months: 12,
    label: "12 Months",
    price: 31500,
    discountPercent: 25,
    savings: 10500,
    badge: "BEST VALUE (25% OFF)",
  },
];

export function VpnNodeSelectorCard({
  nodes,
  onSubscriptionCreated,
  userBalance = 150000,
}: VpnNodeSelectorCardProps) {
  const [selectedNodeId, setSelectedNodeId] = React.useState<string>(
    nodes[0]?.id || "node_lon01"
  );
  const [protocol, setProtocol] = React.useState<"wireguard" | "openvpn">(
    "wireguard"
  );
  const [selectedTier, setSelectedTier] = React.useState<DurationTier>(
    DURATION_TIERS[0]
  );
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [pin, setPin] = React.useState("");
  const [pinError, setPinError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const selectedNode = React.useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) || nodes[0],
    [nodes, selectedNodeId]
  );

  const hasSufficientBalance = userBalance >= selectedTier.price;

  const handleStartPurchase = () => {
    if (!hasSufficientBalance) {
      toast.error(
        `Insufficient wallet balance. You need ${formatNaira(
          selectedTier.price
        )}, but have ${formatNaira(userBalance)}.`
      );
      return;
    }
    setPin("");
    setPinError(null);
    setConfirmOpen(true);
  };

  const handleConfirmPurchase = async () => {
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setPinError("Please enter your 4-digit transaction PIN");
      return;
    }

    try {
      setIsSubmitting(true);
      const newSub = await purchaseVpnNode({
        node_id: selectedNode.id,
        protocol,
        months: selectedTier.months,
        pin,
      });
      toast.success(
        `Dedicated VPN node assigned for ${selectedNode.city}! Configuration ready.`
      );
      onSubscriptionCreated(newSub);
      setConfirmOpen(false);
    } catch {
      toast.error("Failed to provision VPN node. Please verify your PIN and balance.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Server Node Selection Grid */}
      <div className="rounded-md border border-border-subtle bg-bg-surface p-5 md:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
              <Server className="size-4 text-brand" />
              1. Select Dedicated High-Speed Node
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Dedicated single-tenant egress node with static residential IP allocation
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            All 6 Core Nodes Online (10 Gbps)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {nodes.map((node) => {
            const isSelected = node.id === selectedNodeId;
            return (
              <button
                key={node.id}
                type="button"
                onClick={() => setSelectedNodeId(node.id)}
                className={`relative flex flex-col justify-between p-4 rounded-md border text-left transition-all ${
                  isSelected
                    ? "border-brand bg-brand-subtle/40 ring-1 ring-brand shadow-xs"
                    : "border-border-subtle bg-bg-surface hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl" role="img" aria-label={node.country}>
                        {node.flag}
                      </span>
                      <div>
                        <div className="text-sm font-semibold text-text-primary leading-tight">
                          {node.city}
                        </div>
                        <div className="text-[11px] text-text-muted">
                          {node.country}
                        </div>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      <Zap className="size-2.5" />
                      {node.ping_ms}ms
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-text-secondary truncate bg-slate-100 dark:bg-slate-800/80 px-2 py-1 rounded">
                    {node.endpoint}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-border-subtle/80 flex items-center justify-between text-[11px] text-text-muted">
                  <span>{node.bandwidth_gbps} Gbps Port</span>
                  <span className="font-mono uppercase text-[10px]">
                    {node.protocols.join(" / ")}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Protocol Selection & Duration Tier */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Protocol Choice */}
        <div className="rounded-md border border-border-subtle bg-bg-surface p-5 md:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-text-primary flex items-center gap-2 mb-1">
              <Shield className="size-4 text-brand" />
              2. Choose Tunnel Protocol
            </h2>
            <p className="text-xs text-text-muted mb-4">
              Cryptographic encapsulation protocol for client-to-node tunnels
            </p>

            <div className="space-y-3">
              {/* WireGuard */}
              <button
                type="button"
                aria-label="Select WireGuard protocol"
                onClick={() => setProtocol("wireguard")}
                className={`w-full flex items-start gap-3 p-3.5 rounded-md border text-left transition-all ${
                  protocol === "wireguard"
                    ? "border-brand bg-brand-subtle/40 ring-1 ring-brand"
                    : "border-border-subtle bg-bg-surface hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div
                  className={`flex size-5 shrink-0 rounded-full border items-center justify-center mt-0.5 ${
                    protocol === "wireguard"
                      ? "border-brand bg-brand text-white"
                      : "border-slate-300 dark:border-slate-600"
                  }`}
                >
                  {protocol === "wireguard" && <Check className="size-3" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-text-primary">
                      WireGuard
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-brand text-white">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">
                    ChaCha20-Poly1305 encryption. Modern, ultra-low latency, and instant reconnects.
                  </p>
                </div>
              </button>

              {/* OpenVPN */}
              <button
                type="button"
                aria-label="Select OpenVPN protocol"
                onClick={() => setProtocol("openvpn")}
                className={`w-full flex items-start gap-3 p-3.5 rounded-md border text-left transition-all ${
                  protocol === "openvpn"
                    ? "border-brand bg-brand-subtle/40 ring-1 ring-brand"
                    : "border-border-subtle bg-bg-surface hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div
                  className={`flex size-5 shrink-0 rounded-full border items-center justify-center mt-0.5 ${
                    protocol === "openvpn"
                      ? "border-brand bg-brand text-white"
                      : "border-slate-300 dark:border-slate-600"
                  }`}
                >
                  {protocol === "openvpn" && <Check className="size-3" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-text-primary">
                      OpenVPN
                    </span>
                    <span className="text-[10px] text-text-muted">
                      TCP / UDP AES-256
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Broad hardware firewall traversal and router compatibility.
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Duration Tier & Pricing */}
        <div className="rounded-md border border-border-subtle bg-bg-surface p-5 md:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-text-primary flex items-center gap-2 mb-1">
              <Sparkles className="size-4 text-brand" />
              3. Subscription Duration
            </h2>
            <p className="text-xs text-text-muted mb-4">
              Commit longer for lower monthly rates and dedicated IP reservation
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              {DURATION_TIERS.map((tier) => {
                const isSelected = tier.months === selectedTier.months;
                return (
                  <button
                    key={tier.months}
                    type="button"
                    onClick={() => setSelectedTier(tier)}
                    className={`p-3 rounded-md border text-left flex flex-col justify-between transition-all ${
                      isSelected
                        ? "border-brand bg-brand-subtle/40 ring-1 ring-brand"
                        : "border-border-subtle bg-bg-surface hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-text-primary">
                          {tier.label}
                        </span>
                        {tier.badge && (
                          <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                            {tier.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-mono font-bold text-text-primary mt-1">
                        {formatNaira(tier.price)}
                      </div>
                    </div>
                    {tier.savings ? (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
                        Save {formatNaira(tier.savings)}
                      </span>
                    ) : (
                      <span className="text-[10px] text-text-muted mt-2">
                        Standard rate
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Checkout Action Summary */}
          <div className="mt-5 pt-4 border-t border-border-subtle">
            <div className="flex items-center justify-between text-xs text-text-secondary mb-2">
              <span>Total Payable</span>
              <span className="text-base font-mono font-bold text-text-primary">
                {formatNaira(selectedTier.price)}
              </span>
            </div>
            <Button
              type="button"
              variant="default"
              size="lg"
              onClick={handleStartPurchase}
              disabled={!hasSufficientBalance}
              className="w-full bg-brand hover:bg-brand-hover text-brand-foreground font-semibold rounded-md h-10 shadow-xs"
            >
              <span>Provision {selectedNode.city} Dedicated VPN</span>
              <ChevronRight className="size-4 ml-1" />
            </Button>
            {!hasSufficientBalance && (
              <p className="text-[11px] text-error mt-1.5 text-center">
                Insufficient balance. Please top up your wallet.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation & PIN Modal */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirm Dedicated VPN Order"
        description="Verify your order details and enter your 4-digit PIN to activate your dedicated VPN tunnel."
        confirmText="Authorize & Provision"
        variant="default"
        isLoading={isSubmitting}
        onConfirm={handleConfirmPurchase}
      >
        <div className="space-y-4 py-2">
          {/* Order Summary breakdown */}
          <div className="rounded-md border border-border-subtle bg-slate-50 dark:bg-slate-900/50 p-3 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Dedicated Node</span>
              <span className="font-semibold text-text-primary flex items-center gap-1">
                <span>{selectedNode.flag}</span>
                <span>{selectedNode.name}</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Protocol</span>
              <span className="font-mono uppercase text-text-primary">
                {protocol}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Duration</span>
              <span className="font-semibold text-text-primary">
                {selectedTier.label}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-border-subtle/80 pt-2 font-semibold">
              <span className="text-text-primary">Total Debit</span>
              <span className="font-mono text-base text-brand">
                {formatNaira(selectedTier.price)}
              </span>
            </div>
          </div>

          {/* 4-digit PIN Input */}
          <div>
            <label
              htmlFor="vpn-pin-input"
              className="block text-xs font-semibold text-text-primary mb-1.5"
            >
              Transaction PIN
            </label>
            <div className="relative">
              <Input
                id="vpn-pin-input"
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value.replace(/\D/g, ""));
                  setPinError(null);
                }}
                placeholder="••••"
                className="font-mono text-center tracking-widest text-lg h-11 border-border-subtle rounded-md"
              />
            </div>
            {pinError && (
              <p className="text-xs text-error mt-1">{pinError}</p>
            )}
          </div>
        </div>
      </ConfirmDialog>
    </div>
  );
}
