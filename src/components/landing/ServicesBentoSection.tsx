"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Copy,
  Globe,
  Lock,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { NAV_ICON_STROKE_WIDTH } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { showToast } from "@/components/ui/sonner";

export interface ServiceCardItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  href: string;
  badge?: string;
  tags: string[];
  highlight: string;
  category?: string;
  metric?: string;
}

export const KORAK_SERVICES: ServiceCardItem[] = [
  {
    id: "airtime-data",
    title: "Airtime & Mobile Data",
    description:
      "Direct VTU airtime recharge and high-speed SME/corporate data bundles delivered instantly at direct wholesale rates.",
    icon: PhoneCall,
    href: "/register",
    badge: "Instant Delivery",
    tags: ["MTN", "Airtel", "Glo", "9mobile"],
    highlight: "Wholesale SME & Corporate Data",
    category: "telecom",
    metric: "< 3s Delivery",
  },
  {
    id: "bills-utilities",
    title: "Digital Payments / Bills",
    description:
      "Pay prepaid and postpaid electricity tokens across AEDC, EKEDC, IKEDC, and renew cable TV subscriptions with zero delays.",
    icon: Zap,
    href: "/register",
    badge: "24/7 Automated",
    tags: ["AEDC", "EKEDC", "IKEDC", "DStv", "GOtv"],
    highlight: "Instant 20-Digit Token Dispatch",
    category: "utilities",
    metric: "Zero Delay",
  },
  {
    id: "virtual-numbers",
    title: "Numbers & Activations",
    description:
      "Dedicated international non-VoIP virtual numbers for instant SMS OTP verification across global services and apps.",
    icon: ShieldCheck,
    href: "/register",
    badge: "High Deliverability",
    tags: ["WhatsApp", "Telegram", "Google", "OpenAI"],
    highlight: "US, UK & 40+ Countries",
    category: "identity",
    metric: "99.4% OTP Success",
  },
  {
    id: "social-esim",
    title: "Social Growth & Digital Services",
    description:
      "Worldwide eSIM data roaming connectivity and verified audience engagement packages for modern digital brands.",
    icon: Globe,
    href: "/register",
    badge: "Global Connectivity",
    tags: ["Instagram", "TikTok", "X / Twitter", "eSIM Roaming"],
    highlight: "150+ Countries Seamless Roaming",
    category: "global",
    metric: "Worldwide Roaming",
  },
];

export interface ServicesBentoSectionProps {
  className?: string;
  eyebrow?: string;
  heading?: string;
  description?: string;
}

const CATEGORY_TABS = [
  { id: "all", label: "All Services" },
  { id: "airtime-data", label: "Airtime & Data" },
  { id: "bills-utilities", label: "Bills & Utilities" },
  { id: "virtual-numbers", label: "Virtual Numbers" },
  { id: "social-esim", label: "Social & eSIM" },
] as const;

/**
 * ServicesBentoSection (Section 02)
 *
 * Redesigned into a high-end, sleek SaaS service showcase:
 * - Clean all-round layout with breathable whitespace, subtle depth, and balanced visual weight.
 * - Multi-layered deep obsidian-burgundy hero card with ambient light (replaces the heavy, flat solid paint block).
 * - Interactive category switcher with smooth animated pill indicator.
 * - Refined, uncluttered SaaS product cards with fluid hover transitions and micro-interaction details.
 * - Interactive live token dispatch terminal with copy feedback.
 * - Enterprise infrastructure trust strip highlighting real-time API reliability.
 */
export function ServicesBentoSection({
  className,
  eyebrow = "EVERYDAY DIGITAL SERVICES",
  heading = "Everyday Digital Services for Everyone",
  description = "KORAK brings your essential digital services together. Recharge connectivity, settle utility bills, verify global accounts, and fund your wallet seamlessly.",
}: ServicesBentoSectionProps) {
  const [selectedCategory, setSelectedCategory] =
    React.useState<string>("all");
  const [copiedToken, setCopiedToken] = React.useState(false);

  const handleCopyToken = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText("4821091288312049");
        setCopiedToken(true);
        showToast.success(
          "Token Copied",
          "Electricity token copied to clipboard: 4821-0912-8831-2049"
        );
        setTimeout(() => setCopiedToken(false), 2000);
      }
    } catch {
      showToast.error("Copy Failed", "Please manually highlight the token.");
    }
  };

  const displayedServices =
    selectedCategory === "all"
      ? KORAK_SERVICES
      : KORAK_SERVICES.filter((s) => s.id === selectedCategory);

  return (
    <section
      id="services"
      aria-labelledby="services-section-heading"
      className={cn(
        "relative overflow-hidden bg-[#FAF9F8] dark:bg-[#09090b] py-20 sm:py-28 lg:py-32 transition-colors border-t border-border scroll-mt-20",
        className
      )}
    >
      {/* =========================================================================
          BACKGROUND ATMOSPHERIC GLOW & SUBTLE GRID LAYER
          ========================================================================= */}
      <div className="pointer-events-none absolute inset-0 select-none overflow-hidden">
        {/* Subtle grid pattern */}
        <svg
          className="absolute inset-0 h-full w-full stroke-neutral-900/[0.04] dark:stroke-white/[0.04] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_20%,black_30%,transparent_80%)]"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="services-grid"
              width="48"
              height="48"
              patternUnits="userSpaceOnUse"
            >
              <path d="M.5 48V.5H48" fill="none" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" strokeWidth="0" fill="url(#services-grid)" />
        </svg>

        {/* Ambient top radial burgundy wash */}
        <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[400px] w-[800px] rounded-full bg-gradient-to-b from-[#7A1F3D]/[0.08] to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* =========================================================================
            1. SECTION INTRODUCTION
            ========================================================================= */}
        <div className="mx-auto max-w-3xl text-center mb-10 sm:mb-14">
          {/* Eyebrow Label: Sleek SaaS pill with pulsing indicator */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.06] px-3.5 py-1 text-xs font-semibold tracking-wider text-primary select-none">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            <span>{eyebrow}</span>
          </div>

          {/* Heading (H2) with clean typography and comfortable line height */}
          <h2
            id="services-section-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.14] text-balance mb-4"
          >
            {heading}
          </h2>

          {/* Supporting Paragraph */}
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed text-pretty max-w-2xl mx-auto">
            {description}
          </p>

          {/* Interactive Category Tabs Filter (SaaS Experience) */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {CATEGORY_TABS.map((tab) => {
              const isActive = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedCategory(tab.id)}
                  className={cn(
                    "relative rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold transition-all duration-200 select-none",
                    isActive
                      ? "text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeCategoryPill"
                      className="absolute inset-0 rounded-full bg-[#7A1F3D]"
                      transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            2. MODERN SAAS BENTO GRID (Deep Obsidian-Burgundy Hero + Refined 2x2 Cards)
            ========================================================================= */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8 items-stretch">
          {/* -----------------------------------------------------------------------
              LEFT: Deep Obsidian-Burgundy Hero Card (Spans 5 cols on lg)
              ----------------------------------------------------------------------- */}
          <div className="lg:col-span-5 flex">
            <div className="group relative flex flex-col justify-between rounded-[16px] bg-gradient-to-br from-[#1E0713] via-[#2A091A] to-[#14030B] p-7 sm:p-9 text-white border border-[#7A1F3D]/35 shadow-[0_20px_50px_rgba(26,5,15,0.25)] w-full overflow-hidden transition-all duration-300 hover:border-[#7A1F3D]/60 hover:shadow-[0_24px_60px_rgba(122,31,61,0.2)]">
              {/* Soft interior ambient radial glow */}
              <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-gradient-to-br from-[#7A1F3D]/45 via-[#A32A52]/20 to-transparent blur-3xl" />
              <div className="pointer-events-none absolute -left-16 -bottom-16 size-60 rounded-full bg-[#7A1F3D]/25 blur-2xl" />

              {/* Top Details */}
              <div className="relative z-10 space-y-4">
                {/* Featured Eyebrow: Frosted glass badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-rose-200 select-none">
                  <Sparkles className="size-3 text-rose-300" />
                  <span>DIGITAL SERVICES FOR EVERYDAY LIFE</span>
                </div>

                {/* Featured Title */}
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                  Everything you need, in one place.
                </h3>

                {/* Featured Description */}
                <p className="text-sm sm:text-base text-white/80 leading-relaxed font-normal">
                  Manage your everyday digital payments, mobile services and other
                  digital essentials through one convenient platform.
                </p>

                {/* Core Offerings Checklist with Glowing Icons */}
                <div className="pt-2 space-y-3 text-xs sm:text-sm text-white/90">
                  <div className="flex items-center gap-3">
                    <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                      <CheckCircle2 className="size-3.5" />
                    </div>
                    <span>Automated Airtime & High-Speed Data Bundles</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                      <CheckCircle2 className="size-3.5" />
                    </div>
                    <span>Prepaid Electricity Tokens with Instant Generation</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                      <CheckCircle2 className="size-3.5" />
                    </div>
                    <span>Dedicated Non-VoIP International OTP Numbers</span>
                  </div>
                </div>
              </div>

              {/* Bottom Details: Live Product Interface Mockup (Fintech Terminal) & CTA */}
              <div className="relative z-10 mt-8 space-y-4 pt-4 border-t border-white/15">
                {/* Live SaaS Micro-Terminal Card */}
                <div
                  aria-label="Recent transaction illustration"
                  className="rounded-[12px] border border-white/15 bg-white/[0.06] backdrop-blur-md p-4 flex flex-col gap-2.5 transition-all duration-200 hover:bg-white/[0.09]"
                >
                  <div className="flex items-center justify-between text-[11px] text-white/70">
                    <div className="flex items-center gap-1.5 font-mono uppercase tracking-wider text-[10px] text-white/80">
                      <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Automated Dispatch</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      <Check className="size-2.5" />
                      <span>Success</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-mono text-base sm:text-lg font-bold text-white tracking-tight">
                        ₦10,000.00
                      </p>
                      <p className="text-xs text-white/80 mt-0.5">
                        Electricity Token Generated
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-mono text-[10px] text-white/60">Prepaid Meter Token</p>
                      <button
                        type="button"
                        onClick={handleCopyToken}
                        title="Click to copy token"
                        className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-emerald-300 tracking-wider mt-0.5 bg-black/40 hover:bg-black/60 px-2.5 py-1 rounded-[6px] border border-white/10 transition-colors cursor-pointer"
                      >
                        <span>4821 - 0912 - 8831 - 2049</span>
                        {copiedToken ? (
                          <Check className="size-3 text-emerald-400" />
                        ) : (
                          <Copy className="size-3 text-white/60 hover:text-white" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Featured CTA Button */}
                <Link
                  href="/register"
                  className="group/cta inline-flex w-full items-center justify-center gap-2 rounded-[12px] bg-white px-6 py-3.5 text-sm font-bold text-[#7A1F3D] shadow-md transition-all duration-200 hover:bg-neutral-100 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] select-none"
                >
                  <span>Explore Services</span>
                  <ArrowRight
                    className="size-4 transition-transform duration-200 group-hover/cta:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </div>
          </div>

          {/* -----------------------------------------------------------------------
              RIGHT: Refined 2x2 Service Cards Grid (Spans 7 cols on lg)
              ----------------------------------------------------------------------- */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 items-stretch">
            <AnimatePresence mode="popLayout">
              {displayedServices.map((service) => {
                const Icon = service.icon;
                return (
                  <motion.div
                    key={service.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="group relative flex flex-col justify-between rounded-[16px] border border-border/80 bg-card/80 dark:bg-card/40 backdrop-blur-xs p-6 sm:p-7 transition-all duration-300 hover:border-primary/50 hover:shadow-[0_16px_36px_rgba(122,31,61,0.06)] hover:-translate-y-1"
                  >
                    {/* Top Content Area */}
                    <div>
                      {/* Card Header & Icon */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex size-11 items-center justify-center rounded-[12px] border border-primary/10 bg-primary/[0.08] text-primary transition-all duration-300 group-hover:scale-105 group-hover:bg-primary group-hover:text-white group-hover:border-primary">
                          <Icon
                            className="size-5"
                            strokeWidth={NAV_ICON_STROKE_WIDTH}
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          {service.badge && (
                            <span className="text-[11px] font-semibold text-muted-foreground bg-muted/60 border border-border/70 px-2.5 py-0.5 rounded-full">
                              {service.badge}
                            </span>
                          )}
                          <div className="flex size-7 items-center justify-center rounded-full text-muted-foreground/60 transition-all duration-200 group-hover:text-primary group-hover:bg-primary/10">
                            <ArrowUpRight
                              className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                              aria-hidden="true"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Card Title */}
                      <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground mb-2 transition-colors group-hover:text-primary">
                        {service.title}
                      </h3>

                      {/* Card Description */}
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-5">
                        {service.description}
                      </p>

                      {/* Relatable Service Provider Tags */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-4">
                        {service.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-[6px] border border-border/70 bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-foreground/85 transition-colors hover:bg-muted select-none"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Key Concrete Highlight Feature */}
                      <div className="inline-flex items-center gap-2 rounded-[8px] bg-primary/[0.04] border border-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
                        <span className="size-1.5 rounded-full bg-primary animate-pulse" aria-hidden="true" />
                        <span>{service.highlight}</span>
                      </div>
                    </div>

                    {/* Card Bottom Action */}
                    <div className="mt-6 pt-4 border-t border-border/70 flex items-center justify-between text-xs font-bold text-primary">
                      <Link
                        href={service.href}
                        className="group/link inline-flex items-center gap-1.5 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-[6px]"
                      >
                        <span>Get Started</span>
                        <ArrowRight
                          className="size-3.5 transition-transform duration-200 group-hover/link:translate-x-1"
                          aria-hidden="true"
                        />
                      </Link>
                      {service.metric && (
                        <span className="text-[10px] font-mono font-semibold tracking-wider uppercase text-muted-foreground/70">
                          {service.metric}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* If a category is filtered, provide a clean shortcut to reset to all */}
            {selectedCategory !== "all" && (
              <div className="sm:col-span-2 flex items-center justify-center pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors py-2 px-4 rounded-full border border-border bg-card/60"
                >
                  <span>Show All Services</span>
                  <ArrowRight className="size-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* =========================================================================
            3. SAAS INFRASTRUCTURE & TRUST METRICS STRIP
            ========================================================================= */}
        <div className="mt-12 sm:mt-16 rounded-[14px] border border-border/70 bg-card/60 backdrop-blur-sm p-6 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-primary/10 text-primary">
                <Zap className="size-4" strokeWidth={NAV_ICON_STROKE_WIDTH} />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Sub-Second Dispatch</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Automated API delivery across all major telecom carriers and DISCOs.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-primary/10 text-primary">
                <ShieldCheck className="size-4" strokeWidth={NAV_ICON_STROKE_WIDTH} />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Verified Non-VoIP</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Physical SIM routes guaranteeing 99.4% OTP deliverability for accounts.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-primary/10 text-primary">
                <Globe className="size-4" strokeWidth={NAV_ICON_STROKE_WIDTH} />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Global eSIM Roaming</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Seamless cellular roaming coverage across 150+ countries worldwide.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-primary/10 text-primary">
                <Lock className="size-4" strokeWidth={NAV_ICON_STROKE_WIDTH} />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Bank-Grade Ledger</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Double-entry immutable ledger with real-time automated receipt webhooks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
