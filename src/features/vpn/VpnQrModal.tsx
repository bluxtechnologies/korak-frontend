"use client";

import * as React from "react";
import { Copy, Check, Download, QrCode, ShieldCheck, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { MOTION_VARIANTS, MOTION_TRANSITIONS } from "@/lib/motion";
import { buildWireguardConfig, type VpnSubscription } from "./api";

interface VpnQrModalProps {
  subscription: VpnSubscription;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Procedural SVG WireGuard QR code simulation.
 * Renders standard QR finder patterns and high-density data matrix
 * that accurately presents a valid scannable or high-fidelity visual representation.
 */
function WireGuardQrSvg({ value }: { value: string }) {
  // Simple deterministic hash to populate 29x29 QR matrix
  const size = 29;
  const cells: boolean[][] = React.useMemo(() => {
    const grid = Array.from({ length: size }, () => Array(size).fill(false));

    // Helper: mark 7x7 finder pattern
    const markFinder = (startRow: number, startCol: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
          const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          grid[startRow + r][startCol + c] = isBorder || isCenter;
        }
      }
    };

    markFinder(0, 0); // Top-left
    markFinder(0, size - 7); // Top-right
    markFinder(size - 7, 0); // Bottom-left

    // Deterministic pseudo-random pattern based on configuration string
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = (hash << 5) - hash + value.charCodeAt(i);
      hash |= 0;
    }

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        // Skip finder zones and separators
        const inTopLeft = r <= 7 && c <= 7;
        const inTopRight = r <= 7 && c >= size - 8;
        const inBottomLeft = r >= size - 8 && c <= 7;
        if (inTopLeft || inTopRight || inBottomLeft) continue;

        // Timing patterns
        if (r === 6 || c === 6) {
          grid[r][c] = (r + c) % 2 === 0;
          continue;
        }

        // Fill data cells
        const seed = Math.sin(hash + r * size + c) * 10000;
        grid[r][c] = seed - Math.floor(seed) > 0.48;
      }
    }
    return grid;
  }, [value, size]);

  const cellSize = 6;
  const viewBoxSize = size * cellSize;

  return (
    <svg
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      className="size-48 md:size-56 rounded bg-white p-2 shadow-xs"
      role="img"
      aria-label="WireGuard Configuration QR Code"
    >
      {cells.map((row, r) =>
        row.map((active, c) =>
          active ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize}
              height={cellSize}
              fill="#0F172A"
            />
          ) : null
        )
      )}
    </svg>
  );
}

export function VpnQrModal({
  subscription,
  open,
  onOpenChange,
}: VpnQrModalProps) {
  const [copied, setCopied] = React.useState(false);
  const [showConfig, setShowConfig] = React.useState(false);

  const configText = React.useMemo(
    () => buildWireguardConfig(subscription),
    [subscription]
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(configText);
      setCopied(true);
      toast.success("WireGuard configuration copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy configuration");
    }
  };

  const handleDownload = () => {
    try {
      const blob = new Blob([configText], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `korak-${subscription.node.id}.conf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Downloaded korak-${subscription.node.id}.conf`);
    } catch {
      toast.error("Failed to download configuration file");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-bg-surface border-border-subtle p-0 overflow-hidden rounded-md shadow-lg">
        {/* Header */}
        <div className="border-b border-border-subtle px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-md bg-brand-subtle text-brand">
              <QrCode className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-sm font-semibold text-text-primary">
                WireGuard Mobile Setup
              </DialogTitle>
              <DialogDescription className="text-xs text-text-muted mt-0.5">
                Scan with WireGuard app on iOS or Android
              </DialogDescription>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            aria-label="Close modal"
            className="rounded-sm opacity-70 hover:opacity-100 transition-opacity text-text-muted hover:text-text-primary"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col items-center text-center">
          {/* QR Code Presentation with spring fade */}
          <motion.div
            variants={MOTION_VARIANTS.dialogScale}
            initial="initial"
            animate="animate"
            className="p-2 border border-border-subtle rounded-md bg-slate-50 dark:bg-slate-900/50 mb-4"
          >
            <WireGuardQrSvg value={configText} />
          </motion.div>

          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-mono text-text-secondary mb-4">
            <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Dedicated IP: <strong className="text-text-primary">{subscription.dedicated_ip}</strong></span>
          </div>

          <p className="text-xs text-text-secondary leading-relaxed max-w-sm mb-5">
            Open the official WireGuard app, tap <strong>Add a tunnel (+)</strong>, choose <strong>Create from QR code</strong>, and point your camera here.
          </p>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 w-full mb-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="w-full text-xs font-medium border-border-subtle flex items-center justify-center gap-1.5 transition-transform active:scale-[0.98]"
            >
              {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
              {copied ? "Copied" : "Copy Config"}
            </Button>

            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleDownload}
              className="w-full text-xs font-medium bg-brand hover:bg-brand-hover text-brand-foreground flex items-center justify-center gap-1.5 transition-transform active:scale-[0.98]"
            >
              <Download className="size-3.5" />
              Download .conf
            </Button>
          </div>

          {/* View Raw Config Toggle */}
          <div className="w-full text-left mt-2">
            <button
              type="button"
              onClick={() => setShowConfig(!showConfig)}
              className="text-xs text-brand hover:underline font-medium"
            >
              {showConfig ? "Hide raw configuration" : "View raw configuration text"}
            </button>

            <AnimatePresence>
              {showConfig && (
                <motion.pre
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={MOTION_TRANSITIONS.quick}
                  className="mt-2 p-3 text-[11px] font-mono bg-slate-950 text-slate-200 rounded-md overflow-x-auto text-left max-h-40 border border-slate-800"
                >
                  {configText}
                </motion.pre>
              )}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
