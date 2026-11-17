"use client";

import * as React from "react";
import {
  ShieldCheck,
  Server,
  FileText,
  Activity,
  Lock,
  Globe2,
  Gauge,
} from "lucide-react";
import {
  type VpnServerNode,
  type VpnSubscription,
  type VpnSessionLog,
  getVpnNodes,
  getActiveVpnSubscription,
  getVpnSessionLogs,
} from "./api";
import { motion } from "motion/react";
import { VpnActiveConsole } from "./VpnActiveConsole";
import { VpnNodeSelectorCard } from "./VpnNodeSelectorCard";
import { VpnLogsView } from "./VpnLogsView";

interface VpnViewProps {
  initialTab?: "manager" | "logs";
  initialNodes?: VpnServerNode[];
  initialSubscription?: VpnSubscription | null;
  initialLogs?: VpnSessionLog[];
  userBalance?: number;
}

export function VpnView({
  initialTab = "manager",
  initialNodes = [],
  initialSubscription = null,
  initialLogs = [],
  userBalance = 150000,
}: VpnViewProps) {
  const [activeTab, setActiveTab] = React.useState<"manager" | "logs">(
    initialTab
  );
  const [nodes, setNodes] = React.useState<VpnServerNode[]>(initialNodes);
  const [subscription, setSubscription] =
    React.useState<VpnSubscription | null>(initialSubscription);
  const [logs, setLogs] = React.useState<VpnSessionLog[]>(initialLogs);
  const [isLoading, setIsLoading] = React.useState(
    initialNodes.length === 0 && !initialSubscription
  );

  React.useEffect(() => {
    async function loadData() {
      try {
        const [fetchedNodes, fetchedSub, fetchedLogs] = await Promise.all([
          getVpnNodes(),
          getActiveVpnSubscription(),
          getVpnSessionLogs(),
        ]);
        setNodes(fetchedNodes);
        setSubscription(fetchedSub);
        setLogs(fetchedLogs);
      } catch {
        // Handled via defaults in api.ts
      } finally {
        setIsLoading(false);
      }
    }

    if (initialNodes.length === 0 && !initialSubscription) {
      loadData();
    }
  }, [initialNodes.length, initialSubscription]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2.5">
            <ShieldCheck className="size-6 text-brand" />
            Dedicated VPN Service
          </h1>
          <p className="text-xs md:text-sm text-text-secondary mt-1">
            Provision dedicated 10 Gbps WireGuard & OpenVPN tunnels with static residential egress IPs.
          </p>
        </div>

        {/* Tab Switcher with Spring Sliding Pill Indicator */}
        <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-md border border-border-subtle shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("manager")}
            className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm text-xs font-semibold transition-colors ${
              activeTab === "manager"
                ? "text-brand"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {activeTab === "manager" && (
              <motion.span
                layoutId="vpnActiveTabPill"
                className="absolute inset-0 rounded-sm bg-bg-surface shadow-xs"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
            <Server className="size-3.5 relative z-10" />
            <span className="relative z-10">VPN Console</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("logs")}
            className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm text-xs font-semibold transition-colors ${
              activeTab === "logs"
                ? "text-brand"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {activeTab === "logs" && (
              <motion.span
                layoutId="vpnActiveTabPill"
                className="absolute inset-0 rounded-sm bg-bg-surface shadow-xs"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
            <Activity className="size-3.5 relative z-10" />
            <span className="relative z-10">Session Logs</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === "manager" ? (
        <div className="space-y-6">
          {/* Active Subscription Console (if any) */}
          {subscription && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  Active Dedicated Tunnel
                </span>
              </div>
              <VpnActiveConsole
                subscription={subscription}
                onSubscriptionUpdated={setSubscription}
              />
            </div>
          )}

          {/* Provision New Node Card */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                {subscription ? "Provision Additional Node" : "Select Node & Activate"}
              </span>
            </div>
            <VpnNodeSelectorCard
              nodes={nodes}
              userBalance={userBalance}
              onSubscriptionCreated={(newSub) => {
                setSubscription(newSub);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </div>

          {/* Value Props & Trust Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border-subtle">
            <div className="rounded-md border border-border-subtle bg-bg-surface p-4 flex items-start gap-3">
              <div className="size-8 rounded-md bg-brand-subtle flex items-center justify-center text-brand shrink-0">
                <Globe2 className="size-4" />
              </div>
              <div>
                <h2 className="text-xs font-semibold text-text-primary">
                  Static Residential Egress
                </h2>
                <p className="text-[11px] text-text-muted mt-0.5">
                  Single-tenant IP address not shared with any other customer, preventing CAPTCHAs.
                </p>
              </div>
            </div>

            <div className="rounded-md border border-border-subtle bg-bg-surface p-4 flex items-start gap-3">
              <div className="size-8 rounded-md bg-brand-subtle flex items-center justify-center text-brand shrink-0">
                <Gauge className="size-4" />
              </div>
              <div>
                <h2 className="text-xs font-semibold text-text-primary">
                  10 Gbps Unthrottled Ports
                </h2>
                <p className="text-[11px] text-text-muted mt-0.5">
                  Ultra-low ping ChaCha20-Poly1305 encryption tuned for high throughput.
                </p>
              </div>
            </div>

            <div className="rounded-md border border-border-subtle bg-bg-surface p-4 flex items-start gap-3">
              <div className="size-8 rounded-md bg-brand-subtle flex items-center justify-center text-brand shrink-0">
                <Lock className="size-4" />
              </div>
              <div>
                <h2 className="text-xs font-semibold text-text-primary">
                  Strict Zero-Logs Policy
                </h2>
                <p className="text-[11px] text-text-muted mt-0.5">
                  RAM-only diskless servers ensure zero session payload or browsing telemetry is stored.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <VpnLogsView initialLogs={logs} />
      )}
    </div>
  );
}
