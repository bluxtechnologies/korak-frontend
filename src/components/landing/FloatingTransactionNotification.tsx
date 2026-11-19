"use client";

import * as React from "react";
import { CheckCircle2, ArrowDownLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FloatingTransactionNotificationProps {
  className?: string;
  title?: string;
  service?: string;
  network?: string;
  amount?: string;
  status?: string;
}

/**
 * FloatingTransactionNotification (Phase 01)
 *
 * Compact floating confirmation badge overlapping the product mockup.
 * Inspired by Formcarry's secondary floating visual accent.
 * Demonstrates real customer value (instant airtime recharge & wallet debit)
 * with minimal, sophisticated typography and subtle elevation.
 */
export function FloatingTransactionNotification({
  className,
  title = "Payment successful",
  service = "Airtime purchase",
  network = "MTN • 0803 *** 4567",
  amount = "-₦1,000.00",
  status = "Success",
}: FloatingTransactionNotificationProps) {
  return (
    <aside
      aria-label="Transaction notification highlight"
      className={cn(
        "group relative flex items-center gap-3.5 rounded-2xl border border-border/80 bg-card/95 p-3.5 sm:p-4 text-left shadow-xl shadow-black/8 ring-1 ring-black/5 dark:ring-white/10 backdrop-blur-md transition-transform duration-300 hover:-translate-y-0.5",
        className
      )}
    >
      {/* Icon container */}
      <div
        className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20"
        aria-hidden="true"
      >
        <CheckCircle2 className="size-5" strokeWidth={2} />
      </div>

      {/* Details */}
      <div className="min-w-0 pr-2">
        <div className="flex items-center gap-2">
          <p className="text-xs sm:text-sm font-bold text-foreground tracking-tight">
            {title}
          </p>
          <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
            {status}
          </span>
        </div>
        <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 truncate">
          {service} · <span className="font-mono">{network}</span>
        </p>
      </div>

      {/* Amount indicator */}
      <div className="ml-auto text-right shrink-0 pl-1">
        <p className="font-mono text-xs sm:text-sm font-bold text-foreground">
          {amount}
        </p>
        <span className="text-[10px] text-muted-foreground flex items-center justify-end gap-0.5 mt-0.5">
          <ArrowDownLeft className="size-3 text-emerald-500" />
          <span>Instant</span>
        </span>
      </div>
    </aside>
  );
}
