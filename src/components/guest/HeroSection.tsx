"use client";

import * as React from "react";
import { CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import { HeroActions } from "@/components/landing/HeroActions";
import {
  FloatingTopUpCard,
  FloatingDataBundleCard,
  FloatingVirtualNumberCard,
  FloatingWalletFundingCard,
} from "@/components/landing/HeroFloatingStats";
import { cn } from "@/lib/utils";

export interface HeroSectionProps {
  className?: string;
  eyebrow?: string;
  headline?: string;
  support?: string;
  primaryCtaText?: string;
  primaryCtaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
}

/**
 * HeroSection (Phase 02 — Atmospheric Refinement & Relatable Floating Proof)
 *
 * Minimal Editorial SaaS + Premium Fintech hero section:
 * 1. Warm soft foundation (#FAF9F8) replacing stark plain white.
 * 2. Subtle, fine 40px grid background with radial edge fade.
 * 3. Multi-layered ambient burgundy radial glow for atmospheric depth (z-0 stacking).
 * 4. 4 Corner Floating Service Cards strictly aligned to KORAK branding & real services:
 *    - Top-Left: MTN Airtime Recharge (₦2,000 Delivered)
 *    - Top-Right: Airtel 10GB Data Package (Active)
 *    - Bottom-Left: Virtual Number for SMS OTP (Verified)
 *    - Bottom-Right: Instant Wallet Funding (+₦15,000.00 Credited)
 * 5. Purposeful staggered entrance animations for all content layers.
 * 6. Dominant, confident headline typography with generous whitespace.
 * 7. Clean, streamlined trust strip without layout collision.
 */
export function HeroSection({
  className,
  eyebrow = "YOUR DIGITAL WORLD, SIMPLIFIED",
  headline = "Everything you need.\nAll in one place.",
  support = "Access digital services, manage your wallet and complete everyday transactions seamlessly with KORAK.",
  primaryCtaText = "Get Started",
  primaryCtaHref = "/register",
  secondaryCtaText = "Explore Services",
  secondaryCtaHref = "#services",
}: HeroSectionProps) {
  const headlineParts = headline.split("\n");

  return (
    <section
      aria-labelledby="hero-heading"
      className={cn(
        "relative overflow-hidden bg-[#FAF9F8] dark:bg-[#09090b] pt-20 pb-24 sm:pt-28 sm:pb-32 lg:pt-36 lg:pb-40 text-center transition-colors min-h-[660px]",
        className
      )}
    >
      {/* =========================================================================
          BACKGROUND DECORATIVE LAYER (Stacking Context: z-0)
          ========================================================================= */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none">
        {/* Layer 1: Subtle Fine 40px Grid Pattern with Radial Edge Fade */}
        <svg
          data-testid="hero-grid-pattern"
          className="absolute inset-0 h-full w-full stroke-neutral-900/[0.07] dark:stroke-white/[0.07] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_35%,black_25%,transparent_80%)] [-webkit-mask-image:radial-gradient(ellipse_75%_65%_at_50%_35%,black_25%,transparent_80%)]"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="hero-grid-40"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path d="M.5 40V.5H40" fill="none" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" strokeWidth="0" fill="url(#hero-grid-40)" />
        </svg>

        {/* Layer 2: Core Burgundy Radial Glow (Directly behind the headline) */}
        <div
          data-testid="hero-ambient-glow"
          className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[680px] sm:h-[550px] sm:w-[920px] lg:h-[620px] lg:w-[1100px] rounded-full bg-gradient-to-tr from-[#7A1F3D]/28 via-[#7A1F3D]/14 to-transparent blur-[85px] sm:blur-[120px] lg:blur-[150px] animate-hero-glow"
        />

        {/* Layer 3: Diffused Depth Wash (Warm burgundy/neutral wash below headline) */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/3 h-[320px] w-[500px] sm:h-[420px] sm:w-[720px] rounded-full bg-[#7A1F3D]/10 dark:bg-[#7A1F3D]/15 blur-[70px] sm:blur-[110px] animate-hero-drift"
        />

        {/* Layer 4: Top Shimmer (Atmospheric gradient below navbar) */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-[#7A1F3D]/[0.08] via-[#7A1F3D]/[0.02] to-transparent"
        />
      </div>

      {/* =========================================================================
          FLOATING SERVICE PROOF CORNERS (Relatable to KORAK's Core Products)
          ========================================================================= */}
      <div className="pointer-events-none absolute inset-0 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 1. Top-Left: Mobile Airtime Recharge */}
        <div className="hidden lg:flex pointer-events-auto absolute left-4 xl:left-8 2xl:left-12 top-16 lg:top-24">
          <FloatingTopUpCard />
        </div>

        {/* 2. Top-Right: Cellular Data Package */}
        <div className="hidden lg:flex pointer-events-auto absolute right-4 xl:right-8 2xl:right-12 top-16 lg:top-24">
          <FloatingDataBundleCard />
        </div>

        {/* 3. Bottom-Left: Virtual Verification Number */}
        <div className="hidden lg:flex pointer-events-auto absolute left-4 xl:left-8 2xl:left-12 bottom-14 lg:bottom-20">
          <FloatingVirtualNumberCard />
        </div>

        {/* 4. Bottom-Right: Instant Wallet Funding */}
        <div className="hidden lg:flex pointer-events-auto absolute right-4 xl:right-8 2xl:right-12 bottom-14 lg:bottom-20">
          <FloatingWalletFundingCard />
        </div>
      </div>

      {/* =========================================================================
          HERO CONTENT CONTAINER (Stacking Context: z-10)
          ========================================================================= */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 1. Refined Eyebrow Badge (Staggered Entrance: Delay 50ms) */}
        <div className="mb-5 sm:mb-6 flex justify-center hero-animate-eyebrow">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-white/85 dark:bg-card/85 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary backdrop-blur-md select-none shadow-xs hover:border-primary/40 transition-colors">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            <span>{eyebrow}</span>
          </div>
        </div>

        {/* 2. Dominant Main Headline (Staggered Entrance: Delay 150ms) */}
        <h1
          id="hero-heading"
          className="hero-animate-headline text-5xl sm:text-6xl md:text-7xl lg:text-[76px] xl:text-[84px] font-extrabold tracking-tight text-foreground leading-[1.05] sm:leading-[1.02] max-w-4xl lg:max-w-5xl mx-auto mb-6 sm:mb-8 text-balance select-none"
        >
          {headlineParts.map((part, index) => (
            <React.Fragment key={index}>
              {index > 0 && <br className="hidden sm:inline" />}
              <span>{part}</span>
            </React.Fragment>
          ))}
        </h1>

        {/* 3. Supporting Description (Staggered Entrance: Delay 250ms) */}
        <p className="hero-animate-support text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10 sm:mb-12 text-pretty">
          {support}
        </p>

        {/* 4. Call-To-Action Actions (Staggered Entrance: Delay 350ms) */}
        <div className="hero-animate-ctas mb-10 sm:mb-14 flex justify-center">
          <HeroActions
            primaryText={primaryCtaText}
            primaryHref={primaryCtaHref}
            secondaryText={secondaryCtaText}
            secondaryHref={secondaryCtaHref}
          />
        </div>

        {/* 5. Streamlined Trust Strip (Eliminating Bottom Collisions) */}
        <div className="hero-animate-trust flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-muted-foreground select-none">
          <span className="flex items-center gap-1.5 font-medium">
            <Zap className="size-3.5 text-primary" />
            <span>Instant Automated Dispatch</span>
          </span>
          <span className="hidden sm:inline text-border/80">•</span>
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="size-3.5 text-primary" />
            <span>Bank-Grade Encryption</span>
          </span>
          <span className="hidden sm:inline text-border/80">•</span>
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="size-3.5 text-primary" />
            <span>Unified Digital Wallet</span>
          </span>
        </div>
      </div>
    </section>
  );
}
