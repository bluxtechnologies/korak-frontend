"use client";

import * as React from "react";
import { Phone, Wifi, ShieldCheck, Wallet } from "lucide-react";
import { NAV_ICON_STROKE_WIDTH } from "@/config/navigation";
import { cn } from "@/lib/utils";

/**
 * Common Floating Card Wrapper
 * Strictly adheres to KORAK Design System (Doc 05):
 * - Burgundy (#7A1F3D) primary accents
 * - 10-12px rounded corners (rounded-xl)
 * - Clean neutral card surface with subtle border
 * - No loud neon colors or oversized badges
 */
interface BaseFloatingCardProps {
  className?: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  subtitle: string;
  status: string;
  statusVariant?: "default" | "success";
  ariaLabel: string;
  animationClass?: string;
}

function BaseFloatingCard({
  className,
  icon: Icon,
  title,
  subtitle,
  status,
  statusVariant = "default",
  ariaLabel,
  animationClass = "animate-float-1",
}: BaseFloatingCardProps) {
  return (
    <div
      role="status"
      aria-label={ariaLabel}
      className={cn(
        "group flex items-center gap-3 rounded-xl border border-border/80 bg-card/95 px-3.5 py-3 shadow-md shadow-black/4 ring-1 ring-black/5 dark:ring-white/10 backdrop-blur-md transition-all duration-300 hover:scale-102 hover:border-primary/40 select-none",
        animationClass,
        className
      )}
    >
      {/* KORAK Burgundy Icon Container */}
      <div
        className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/15"
        aria-hidden="true"
      >
        <Icon className="size-4" strokeWidth={NAV_ICON_STROKE_WIDTH} />
      </div>

      {/* Relatable Service Details */}
      <div className="min-w-0 pr-1 text-left">
        <div className="flex items-center gap-2">
          <p className="text-xs sm:text-sm font-bold text-foreground tracking-tight font-mono truncate">
            {title}
          </p>
          <span
            className={cn(
              "text-[10px] font-semibold px-1.5 py-0.5 rounded-md shrink-0 border",
              statusVariant === "success"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                : "bg-muted text-muted-foreground border-border/60"
            )}
          >
            {status}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

/**
 * 1. Top-Left Floating Card: Mobile Airtime Recharge
 */
export function FloatingTopUpCard({ className }: { className?: string }) {
  return (
    <BaseFloatingCard
      className={className}
      icon={Phone}
      title="₦2,000 Airtime"
      subtitle="MTN · 0803 *** 4567"
      status="Delivered"
      statusVariant="success"
      ariaLabel="Airtime recharge delivered"
      animationClass="animate-float-1"
    />
  );
}

/**
 * 2. Top-Right Floating Card: Cellular Data Package
 */
export function FloatingDataBundleCard({ className }: { className?: string }) {
  return (
    <BaseFloatingCard
      className={className}
      icon={Wifi}
      title="10GB Data Bundle"
      subtitle="Airtel SME · Corporate Plan"
      status="Active"
      statusVariant="success"
      ariaLabel="Data bundle activated"
      animationClass="animate-float-2"
    />
  );
}

/**
 * 3. Bottom-Left Floating Card: Virtual Number for SMS Verification
 */
export function FloatingVirtualNumberCard({ className }: { className?: string }) {
  return (
    <BaseFloatingCard
      className={className}
      icon={ShieldCheck}
      title="Virtual Number"
      subtitle="WhatsApp Verification · US (+1)"
      status="Verified"
      statusVariant="default"
      ariaLabel="Virtual number verified"
      animationClass="animate-float-3"
    />
  );
}

/**
 * 4. Bottom-Right Floating Card: Instant Wallet Funding
 */
export function FloatingWalletFundingCard({ className }: { className?: string }) {
  return (
    <BaseFloatingCard
      className={className}
      icon={Wallet}
      title="+₦15,000.00"
      subtitle="Instant Wallet Credit · Paga"
      status="Credited"
      statusVariant="success"
      ariaLabel="Wallet funded successfully"
      animationClass="animate-float-4"
    />
  );
}
