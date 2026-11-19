"use client";

import * as React from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Eye,
  Lock,
  Phone,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Wifi,
} from "lucide-react";
import { FloatingTransactionNotification } from "./FloatingTransactionNotification";
import { NAV_ICON_STROKE_WIDTH } from "@/config/navigation";
import { cn } from "@/lib/utils";

export interface HeroProductShowcaseProps {
  className?: string;
}

/**
 * HeroProductShowcase (Phase 01)
 *
 * Implements the layered composition inspired by Formcarry:
 * 1. Soft abstract geometric background plate (subtle burgundy-tinted neutral surface).
 * 2. High-fidelity KORAK application dashboard mockup (browser window with Mac controls).
 * 3. Floating transaction notification badge for added depth and proof-of-value.
 */
export function HeroProductShowcase({ className }: HeroProductShowcaseProps) {
  return (
    <div
      className={cn(
        "relative mx-auto mt-12 sm:mt-16 lg:mt-20 w-full max-w-5xl",
        className
      )}
    >
      {/* A. Soft Abstract Geometric Background Shape (Formcarry-inspired background stage) */}
      <div
        aria-hidden="true"
        className="absolute inset-x-2 -top-6 -bottom-6 sm:inset-x-6 sm:-top-10 sm:-bottom-10 lg:inset-x-10 lg:-top-12 lg:-bottom-12 -z-10 rounded-[32px] sm:rounded-[44px] lg:rounded-[56px] border border-[#7A1F3D]/10 bg-gradient-to-b from-[#7A1F3D]/[0.03] via-[#FAF9F8] to-[#7A1F3D]/[0.06] dark:from-[#7A1F3D]/[0.08] dark:via-[#111113] dark:to-[#7A1F3D]/[0.12] shadow-sm transform-gpu"
      />

      {/* Floating Transaction Notification Badge (Formcarry-inspired accent) */}
      <div className="absolute -top-6 right-4 sm:-top-8 sm:right-8 lg:-top-10 lg:right-12 z-20 max-w-[280px] sm:max-w-xs animate-in fade-in-50 zoom-in-95 duration-500">
        <FloatingTransactionNotification />
      </div>

      {/* B. Main Application Window Mockup */}
      <div
        role="region"
        aria-label="KORAK Application Interface Preview"
        className="overflow-hidden rounded-2xl sm:rounded-3xl border border-border/90 bg-card text-foreground shadow-2xl shadow-black/8 ring-1 ring-black/5 dark:ring-white/10"
      >
        {/* macOS Style Window Title Bar */}
        <div className="flex h-11 items-center justify-between border-b border-border/70 bg-muted/40 px-4 select-none">
          {/* Traffic light window controls */}
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-[#ef4444]/80 inline-block" />
            <span className="size-3 rounded-full bg-[#f59e0b]/80 inline-block" />
            <span className="size-3 rounded-full bg-[#10b981]/80 inline-block" />
          </div>

          {/* Browser address / security pill */}
          <div className="flex items-center gap-1.5 rounded-md border border-border/60 bg-background/90 px-3 py-1 text-[11px] font-mono text-muted-foreground shadow-2xs">
            <Lock className="size-3 text-emerald-600 dark:text-emerald-400" />
            <span className="tracking-tight text-foreground font-semibold">app.korak.ng</span>
            <span className="text-muted-foreground/60">/dashboard</span>
          </div>

          {/* Minimal live status indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Services</span>
          </div>
        </div>

        {/* Dashboard Content Container */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-background/50">
          {/* Greeting Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/50">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold text-foreground">
                  Good morning, Collins
                </span>
                <span className="text-sm">👋</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Your digital services, all in one place.
              </p>
            </div>

            {/* Quick search input mockup */}
            <div className="hidden sm:flex items-center gap-2 rounded-lg border border-border/70 bg-card px-3 py-1.5 text-xs text-muted-foreground w-56 shadow-2xs">
              <Search className="size-3.5" />
              <span>Search services...</span>
            </div>
          </div>

          {/* 1. Wallet Balance Card (KORAK Burgundy Brand Identity) */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#7A1F3D] via-[#6e1935] to-[#551025] p-5 sm:p-6 text-white shadow-md">
            {/* Subtle decorative brand watermark */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-6 -bottom-10 size-48 rounded-full border-[24px] border-white/[0.04]"
            />

            <div className="flex items-center justify-between text-xs font-semibold tracking-wider uppercase text-white/80">
              <span className="flex items-center gap-1.5">
                <span>WALLET BALANCE</span>
              </span>
              <button
                type="button"
                aria-label="Toggle balance visibility"
                className="flex size-7 items-center justify-center rounded-lg bg-white/10 text-white/90 hover:bg-white/20 transition-colors"
              >
                <Eye className="size-3.5" />
              </button>
            </div>

            <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
              <span className="font-mono text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
                ₦45,250.00
              </span>
              <span className="text-xs font-medium text-white/70">
                ≈ $30.17 USD · Updated today
              </span>
            </div>

            {/* Wallet Actions */}
            <div className="mt-5 sm:mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-xs font-bold text-[#7A1F3D] shadow-sm hover:bg-white/95 transition-all active:scale-[0.98]"
              >
                <Plus className="size-3.5 stroke-[2.5]" />
                <span>Add Money</span>
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/15 transition-all"
              >
                <RefreshCw className="size-3.5" />
                <span>View History</span>
              </button>
            </div>
          </div>

          {/* 2. Popular Services Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold text-foreground">
                What do you need today?
              </h3>
              <span className="text-[11px] font-semibold text-primary">
                Quick Access
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Service 1: Airtime */}
              <div className="flex flex-col rounded-xl border border-border/70 bg-card p-3.5 transition-colors hover:border-primary/40 shadow-2xs">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2.5">
                  <Phone className="size-4" strokeWidth={NAV_ICON_STROKE_WIDTH} />
                </div>
                <span className="text-xs font-bold text-foreground">Airtime</span>
                <span className="text-[11px] text-muted-foreground mt-0.5">
                  Instant recharge
                </span>
              </div>

              {/* Service 2: Data Bundle */}
              <div className="flex flex-col rounded-xl border border-border/70 bg-card p-3.5 transition-colors hover:border-primary/40 shadow-2xs">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2.5">
                  <Wifi className="size-4" strokeWidth={NAV_ICON_STROKE_WIDTH} />
                </div>
                <span className="text-xs font-bold text-foreground">Data Bundles</span>
                <span className="text-[11px] text-muted-foreground mt-0.5">
                  SME & direct
                </span>
              </div>

              {/* Service 3: Virtual Numbers */}
              <div className="flex flex-col rounded-xl border border-border/70 bg-card p-3.5 transition-colors hover:border-primary/40 shadow-2xs">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2.5">
                  <ShieldCheck className="size-4" strokeWidth={NAV_ICON_STROKE_WIDTH} />
                </div>
                <span className="text-xs font-bold text-foreground">Activation</span>
                <span className="text-[11px] text-muted-foreground mt-0.5">
                  SMS OTP numbers
                </span>
              </div>

              {/* Service 4: Social / eSIM */}
              <div className="flex flex-col rounded-xl border border-border/70 bg-card p-3.5 transition-colors hover:border-primary/40 shadow-2xs">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2.5">
                  <Sparkles className="size-4" strokeWidth={NAV_ICON_STROKE_WIDTH} />
                </div>
                <span className="text-xs font-bold text-foreground">eSIM & More</span>
                <span className="text-[11px] text-muted-foreground mt-0.5">
                  Growth & connect
                </span>
              </div>
            </div>
          </div>

          {/* 3. Recent Transactions Table */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-foreground">
                Recent Transactions
              </span>
              <span className="text-xs font-semibold text-primary">View All</span>
            </div>

            <div className="divide-y divide-border/60 rounded-xl border border-border/80 bg-card overflow-hidden text-xs shadow-2xs">
              {/* Row 1 */}
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <ArrowUpRight className="size-3.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Airtime Purchase</p>
                    <p className="text-[11px] text-muted-foreground">MTN · 0803 *** 4567</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-foreground">-₦1,000.00</p>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    Success
                  </span>
                </div>
              </div>

              {/* Row 2 */}
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <ArrowUpRight className="size-3.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Data Purchase (10GB)</p>
                    <p className="text-[11px] text-muted-foreground">Airtel Corporate</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-foreground">-₦2,500.00</p>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    Success
                  </span>
                </div>
              </div>

              {/* Row 3 */}
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <ArrowDownLeft className="size-3.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Wallet Funding</p>
                    <p className="text-[11px] text-muted-foreground">Bank Transfer · Paga</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400">+₦10,000.00</p>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    Success
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
