"use client";

import * as React from "react";
import {
  Shield,
  Copy,
  Check,
  Download,
  QrCode,
  RefreshCw,
  Server,
  Activity,
  Globe2,
  Lock,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  type VpnSubscription,
  buildWireguardConfig,
  regenerateVpnKeys,
} from "./api";
import { VpnQrModal } from "./VpnQrModal";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

interface VpnActiveConsoleProps {
  subscription: VpnSubscription;
  onSubscriptionUpdated?: (updated: VpnSubscription) => void;
}

export function VpnActiveConsole({
  subscription: initialSubscription,
  onSubscriptionUpdated,
}: VpnActiveConsoleProps) {
  const [prevInitialSub, setPrevInitialSub] = React.useState(initialSubscription);
  const [sub, setSub] = React.useState<VpnSubscription>(initialSubscription);
  if (prevInitialSub !== initialSubscription) {
    setPrevInitialSub(initialSubscription);
    setSub(initialSubscription);
  }
  const [qrOpen, setQrOpen] = React.useState(false);
  const [isRegenerating, setIsRegenerating] = React.useState(false);
  const [regenConfirmOpen, setRegenConfirmOpen] = React.useState(false);
  const [copiedIp, setCopiedIp] = React.useState(false);
  const [copiedEndpoint, setCopiedEndpoint] = React.useState(false);

  const copyToClipboard = async (text: string, type: "ip" | "endpoint") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "ip") {
        setCopiedIp(true);
        setTimeout(() => setCopiedIp(false), 2000);
      } else {
        setCopiedEndpoint(true);
        setTimeout(() => setCopiedEndpoint(false), 2000);
      }
      toast.success(`Copied ${type === "ip" ? "Dedicated IP" : "Endpoint"} to clipboard`);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleDownloadConf = () => {
    try {
      const config = buildWireguardConfig(sub);
      const blob = new Blob([config], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `korak-${sub.node.id}.conf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`Configuration file korak-${sub.node.id}.conf downloaded`);
    } catch {
      toast.error("Failed to download WireGuard configuration file");
    }
  };

  const handleConfirmRegenerate = async () => {
    try {
      setIsRegenerating(true);
      const updated = await regenerateVpnKeys(sub.id);
      setSub(updated);
      onSubscriptionUpdated?.(updated);
      setRegenConfirmOpen(false);
      toast.success("Client keys regenerated. Existing tunnel configs must be updated.");
    } catch {
      toast.error("Failed to regenerate encryption keys");
    } finally {
      setIsRegenerating(false);
    }
  };

  // Format bandwidth nicely (e.g. 15.2 GB)
  const formattedBandwidth = React.useMemo(() => {
    const gb = (sub.bytes_transferred / (1024 * 1024 * 1024)).toFixed(1);
    return `${gb} GB`;
  }, [sub.bytes_transferred]);

  return (
    <div className="rounded-md border border-border-subtle bg-bg-surface overflow-hidden shadow-xs">
      {/* Top Banner / Header */}
      <div className="border-b border-border-subtle bg-slate-900 text-white p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start md:items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-white/10 text-white border border-white/10">
              <Shield className="size-6 text-brand" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <span>{sub.node.flag}</span>
                  <span>{sub.node.name}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active Tunnel
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <span>Reference: <span className="font-mono text-slate-300">{sub.reference}</span></span>
                <span>•</span>
                <span>Protocol: <span className="font-mono uppercase text-slate-300">{sub.protocol}</span> (ChaCha20-Poly1305)</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setQrOpen(true)}
              className="bg-white/5 border-white/15 text-white hover:bg-white/10 text-xs font-medium h-9"
            >
              <QrCode className="size-3.5 mr-1.5" />
              Setup on Phone
            </Button>

            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleDownloadConf}
              className="bg-brand hover:bg-brand-hover text-brand-foreground text-xs font-medium h-9"
            >
              <Download className="size-3.5 mr-1.5" />
              Download .conf
            </Button>
          </div>
        </div>
      </div>

      {/* Grid of Tunnel Details & Real-Time Stats */}
      <div className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Dedicated Egress IP */}
        <div className="rounded-md border border-border-subtle bg-slate-50 dark:bg-slate-900/40 p-4">
          <div className="flex items-center justify-between text-xs text-text-muted mb-1.5">
            <span className="flex items-center gap-1.5 font-medium">
              <Globe2 className="size-3.5 text-brand" />
              Dedicated Egress IP
            </span>
            <button
              type="button"
              onClick={() => copyToClipboard(sub.dedicated_ip, "ip")}
              aria-label="Copy dedicated IP"
              className="text-text-muted hover:text-text-primary transition-colors"
            >
              {copiedIp ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
            </button>
          </div>
          <div className="text-lg font-mono font-bold text-text-primary tracking-tight">
            {sub.dedicated_ip}
          </div>
          <p className="text-[11px] text-text-muted mt-1">
            Static clean residential egress IP
          </p>
        </div>

        {/* 2. Connection Endpoint */}
        <div className="rounded-md border border-border-subtle bg-slate-50 dark:bg-slate-900/40 p-4">
          <div className="flex items-center justify-between text-xs text-text-muted mb-1.5">
            <span className="flex items-center gap-1.5 font-medium">
              <Server className="size-3.5 text-brand" />
              Server Endpoint
            </span>
            <button
              type="button"
              onClick={() => copyToClipboard(sub.node.endpoint, "endpoint")}
              aria-label="Copy server endpoint"
              className="text-text-muted hover:text-text-primary transition-colors"
            >
              {copiedEndpoint ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
            </button>
          </div>
          <div className="text-sm font-mono font-bold text-text-primary truncate">
            {sub.node.endpoint}
          </div>
          <p className="text-[11px] text-text-muted mt-1 flex items-center gap-1.5">
            <span>Latency: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{sub.node.ping_ms}ms</strong></span>
            <span>•</span>
            <span>Port: <strong className="font-mono">{sub.node.port}</strong></span>
          </p>
        </div>

        {/* 3. Bandwidth Consumed */}
        <div className="rounded-md border border-border-subtle bg-slate-50 dark:bg-slate-900/40 p-4">
          <div className="flex items-center justify-between text-xs text-text-muted mb-1.5">
            <span className="flex items-center gap-1.5 font-medium">
              <Activity className="size-3.5 text-brand" />
              Data Transferred
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              Unlimited
            </span>
          </div>
          <div className="text-lg font-mono font-bold text-text-primary tracking-tight">
            {formattedBandwidth}
          </div>
          <p className="text-[11px] text-text-muted mt-1">
            10 Gbps unthrottled fiber backbone
          </p>
        </div>

        {/* 4. Plan Expiry & Key Management */}
        <div className="rounded-md border border-border-subtle bg-slate-50 dark:bg-slate-900/40 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-text-muted mb-1.5">
              <span className="flex items-center gap-1.5 font-medium">
                <Lock className="size-3.5 text-brand" />
                Subscription Expiry
              </span>
            </div>
            <div className="text-sm font-semibold text-text-primary">
              {new Date(sub.expires_at).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </div>
          </div>
          <div className="pt-2 flex items-center justify-between border-t border-border-subtle/60 mt-2">
            <button
              type="button"
              onClick={() => setRegenConfirmOpen(true)}
              className="text-[11px] text-brand hover:underline flex items-center gap-1 font-medium"
            >
              <RefreshCw className="size-3" />
              Regenerate Client Keys
            </button>
          </div>
        </div>
      </div>

      {/* WireGuard QR Code Modal */}
      <VpnQrModal
        subscription={sub}
        open={qrOpen}
        onOpenChange={setQrOpen}
      />

      {/* Regenerate Keys Confirmation Dialog */}
      <ConfirmDialog
        open={regenConfirmOpen}
        onOpenChange={setRegenConfirmOpen}
        title="Regenerate WireGuard Keys?"
        description="Regenerating keys will invalidate your current WireGuard configuration file and active sessions. You will need to re-download or scan the new QR code to reconnect."
        confirmText="Regenerate Keys"
        variant="destructive"
        isLoading={isRegenerating}
        onConfirm={handleConfirmRegenerate}
      />
    </div>
  );
}
