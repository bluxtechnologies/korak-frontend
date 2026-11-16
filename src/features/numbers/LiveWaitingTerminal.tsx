"use client";

import * as React from "react";
import {
  Copy,
  Check,
  Clock,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
  MessageSquare,
  Sparkles,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ActiveOtpOrder } from "./api";

export interface LiveWaitingTerminalProps {
  order: ActiveOtpOrder;
  onCancelOrder?: (orderId: string) => Promise<void>;
  onReceiveCode?: (code: string, fullText: string) => void;
  onOrderCompleted?: () => void;
  className?: string;
}

export function LiveWaitingTerminal({
  order: initialOrder,
  onCancelOrder,
  onReceiveCode,
  onOrderCompleted,
  className,
}: LiveWaitingTerminalProps) {
  const [order, setOrder] = React.useState<ActiveOtpOrder>(initialOrder);
  const [hasCopiedPhone, setHasCopiedPhone] = React.useState(false);
  const [hasCopiedCode, setHasCopiedCode] = React.useState(false);
  const [isCancelling, setIsCancelling] = React.useState(false);

  // Time remaining calculation (derived from current timestamp state)
  const [now, setNow] = React.useState(() => Date.now());

  // Sync if initialOrder changes to a different order
  const [prevId, setPrevId] = React.useState(initialOrder.id);
  if (prevId !== initialOrder.id) {
    setPrevId(initialOrder.id);
    setOrder(initialOrder);
  }

  const expiresAt = new Date(order.expires_at).getTime();
  const secondsRemaining = Math.max(0, Math.floor((expiresAt - now) / 1000));

  // Countdown timer
  React.useEffect(() => {
    if (order.status !== "waiting") return;

    const interval = setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (expiresAt - current <= 0) {
        clearInterval(interval);
        setOrder((curr) => ({ ...curr, status: "timeout" }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, order.status]);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const progressPercent = Math.max(0, Math.min(100, (secondsRemaining / order.duration_seconds) * 100));

  const handleCopyPhone = async () => {
    try {
      await navigator.clipboard.writeText(order.phone_number);
      setHasCopiedPhone(true);
      toast.success("Phone number copied!");
      setTimeout(() => setHasCopiedPhone(false), 2000);
    } catch {
      toast.error("Could not copy phone number");
    }
  };

  const handleCopyCode = async () => {
    if (!order.sms_code) return;
    try {
      await navigator.clipboard.writeText(order.sms_code);
      setHasCopiedCode(true);
      toast.success("Verification code copied!");
      setTimeout(() => setHasCopiedCode(false), 2000);
    } catch {
      toast.error("Could not copy verification code");
    }
  };

  const handleSimulateArrival = () => {
    const randomCode = `${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}`;
    const fullText = `Your ${order.platform.name} verification code is ${randomCode}. Valid for 10 minutes.`;

    setOrder((prev) => ({
      ...prev,
      status: "received",
      sms_code: randomCode,
      full_sms_text: fullText,
    }));

    onReceiveCode?.(randomCode, fullText);
    toast.success(`New SMS received from ${order.platform.name}!`);
  };

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      if (onCancelOrder) {
        await onCancelOrder(order.id);
      }
      setOrder((prev) => ({ ...prev, status: "cancelled" }));
      toast.success("Order cancelled and refunded.");
    } catch {
      toast.error("Could not cancel order");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <Card
      className={cn("overflow-hidden rounded-2xl border-border/80 shadow-md", className)}
      data-testid="live-waiting-terminal"
    >
      {/* Terminal Header */}
      <CardHeader className="border-b border-border/70 bg-muted/20 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl" role="img" aria-label={order.country.name}>
              {order.country.flag}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-bold text-foreground">
                  {order.platform.name} Verification Line
                </CardTitle>
                <Badge variant="outline" className="font-mono text-[10px]">
                  {order.reference}
                </Badge>
              </div>
              <CardDescription className="text-xs text-muted-foreground">
                {order.country.name} · {order.country.dial_code}
              </CardDescription>
            </div>
          </div>

          {/* Status Indicator */}
          {order.status === "waiting" && (
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              <span>Waiting for SMS…</span>
            </div>
          )}

          {order.status === "received" && (
            <Badge variant="success" className="gap-1 px-3 py-1 text-xs">
              <CheckCircle2 className="size-3.5" />
              <span>SMS Code Received</span>
            </Badge>
          )}

          {order.status === "cancelled" && (
            <Badge variant="destructive" className="gap-1 px-3 py-1 text-xs">
              <XCircle className="size-3.5" />
              <span>Cancelled & Refunded</span>
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        {/* 1. Phone Number Display Console */}
        <div className="rounded-xl border border-border/80 bg-surface p-4 text-center sm:p-5">
          <span className="text-xs font-medium text-muted-foreground">
            Your Dedicated Temporary Phone Number
          </span>

          <div className="mt-2 flex items-center justify-center gap-3">
            <span
              className="font-mono text-2xl font-black tracking-wider text-foreground sm:text-3xl"
              data-testid="terminal-phone-number"
            >
              {order.phone_number}
            </span>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyPhone}
              aria-label="Copy phone number"
              className="h-9 gap-1.5 rounded-xl border-border/80 px-3 text-xs font-semibold"
            >
              {hasCopiedPhone ? (
                <>
                  <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5 text-muted-foreground" />
                  <span>Copy</span>
                </>
              )}
            </Button>
          </div>

          <p className="mt-2 text-[11px] text-muted-foreground">
            Enter this number in {order.platform.name} when prompted for phone verification.
          </p>
        </div>

        {/* 2. Received SMS Code Area (If Received) */}
        {order.status === "received" && order.sms_code && (
          <div
            className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.04] p-5 text-center shadow-xs dark:bg-emerald-500/[0.08]"
            data-testid="received-sms-box"
          >
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <Sparkles className="size-4" />
              <span>Verification Code Received</span>
            </div>

            <div className="my-3 flex items-center justify-center gap-3">
              <span
                className="font-mono text-4xl font-extrabold tracking-widest text-foreground sm:text-5xl"
                data-testid="received-sms-code"
              >
                {order.sms_code}
              </span>
              <Button
                type="button"
                onClick={handleCopyCode}
                className="h-11 rounded-xl bg-primary px-5 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/95"
              >
                {hasCopiedCode ? (
                  <>
                    <Check className="size-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-4" />
                    <span>Copy Code</span>
                  </>
                )}
              </Button>
            </div>

            {order.full_sms_text && (
              <div className="mx-auto mt-3 max-w-md rounded-xl border border-border/70 bg-surface p-3 text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Original SMS Payload
                </span>
                <p className="mt-1 font-mono text-xs text-foreground leading-relaxed">
                  {order.full_sms_text}
                </p>
              </div>
            )}
          </div>
        )}

        {/* 3. Waiting & Timer Progress Bar */}
        {order.status === "waiting" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="size-3.5 text-primary" />
                <span>Time Remaining</span>
              </div>
              <span
                className="font-mono text-sm font-bold text-foreground"
                data-testid="terminal-timer"
              >
                {timeFormatted}
              </span>
            </div>

            <div
              role="progressbar"
              aria-valuenow={Math.round(progressPercent)}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-2 w-full overflow-hidden rounded-full bg-muted/60"
            >
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Auto-polling incoming SMS via telecommunication gateway</span>
              <span>100% money-back guarantee if no SMS arrives</span>
            </div>
          </div>
        )}

        {/* 4. Terminal Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4">
          <div className="flex items-center gap-2">
            {order.status === "waiting" && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isCancelling}
                className="h-9 gap-1.5 rounded-xl border-border/80 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/30"
              >
                <XCircle className="size-3.5" />
                <span>{isCancelling ? "Cancelling…" : "Cancel & Refund"}</span>
              </Button>
            )}

            {/* Dev Simulator Trigger */}
            {order.status === "waiting" && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleSimulateArrival}
                className="h-9 gap-1 text-[11px] text-muted-foreground hover:text-primary"
                title="Simulate SMS reception for testing"
              >
                <Sparkles className="size-3 text-primary" />
                <span>Simulate Arrival</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {order.status !== "waiting" && onOrderCompleted && (
              <Button
                type="button"
                onClick={onOrderCompleted}
                className="h-9 rounded-xl bg-primary text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/95"
              >
                Order Another Number
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
