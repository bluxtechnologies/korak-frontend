"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Globe,
  PhoneCall,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { NAV_ICON_STROKE_WIDTH } from "@/config/navigation";
import { cn } from "@/lib/utils";

export interface ServiceCardItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  href: string;
  badge?: string;
  tags: string[];
  highlight: string;
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
  },
];

export interface ServicesBentoSectionProps {
  className?: string;
  eyebrow?: string;
  heading?: string;
  description?: string;
}

/**
 * ServicesBentoSection (Section 02)
 *
 * Implements the Bento Grid strictly adhering to KORAK Design System (Doc 05):
 * - Character: Sleek, clean, classic, elegant, professional, spacious fintech software.
 * - Borders define structure; shadows barely exist.
 * - Radius Locked: 10px (--radius: 10px). No pill shapes, no dots inside badges.
 * - Primary color (#7A1F3D) used strategically for brand presence, accents, and key CTA.
 * - Relatable, tangible fintech content (authentic telecommunication carriers, electricity discos, OTP platforms).
 * - No gradients, no glassmorphism, no decorative clutter.
 */
export function ServicesBentoSection({
  className,
  eyebrow = "EVERYDAY DIGITAL SERVICES",
  heading = "Everyday Digital Services for Everyone",
  description = "KORAK brings your essential digital services together. Recharge connectivity, settle utility bills, verify global accounts, and fund your wallet seamlessly.",
}: ServicesBentoSectionProps) {
  return (
    <section
      id="services"
      aria-labelledby="services-section-heading"
      className={cn(
        "relative bg-[#FAF9F8] dark:bg-[#09090b] py-16 sm:py-20 lg:py-24 transition-colors border-t border-border",
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* =========================================================================
            1. CENTERED SECTION INTRODUCTION
            ========================================================================= */}
        <div className="mx-auto max-w-3xl text-center mb-12 sm:mb-14 lg:mb-16">
          {/* Eyebrow Label: Strict 10px radius, text-only, no dot, no pill */}
          <div className="mb-3 inline-flex items-center rounded-[10px] border border-border bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary select-none">
            <span>{eyebrow}</span>
          </div>

          {/* Strong, Concise Heading (H2) */}
          <h2
            id="services-section-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-[1.12] text-balance mb-4"
          >
            {heading}
          </h2>

          {/* Supporting Paragraph */}
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed text-pretty max-w-2xl mx-auto">
            {description}
          </p>
        </div>

        {/* =========================================================================
            2. ASYMMETRIC BENTO GRID (1 Featured Card Left + 2x2 Grid Right)
            ========================================================================= */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8 items-stretch">
          {/* -----------------------------------------------------------------------
              LEFT: Featured Burgundy Brand Card (Spans 5 cols on lg, full height)
              ----------------------------------------------------------------------- */}
          <div className="lg:col-span-5 flex">
            <div className="group relative flex flex-col justify-between rounded-[10px] bg-[#7A1F3D] p-6 sm:p-8 text-white border border-[#7A1F3D] w-full transition-colors">
              {/* Top Details */}
              <div className="relative z-10 space-y-4">
                {/* Featured Eyebrow: 10px radius, text-only, no dot */}
                <div className="inline-flex items-center rounded-[10px] border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white select-none">
                  <span>DIGITAL SERVICES FOR EVERYDAY LIFE</span>
                </div>

                {/* Featured Title */}
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
                  Everything you need, in one place.
                </h3>

                {/* Featured Description */}
                <p className="text-sm sm:text-base text-white/80 leading-relaxed">
                  Manage your everyday digital payments, mobile services and other
                  digital essentials through one convenient platform.
                </p>

                {/* Relatable Core Offerings Checklist */}
                <div className="pt-2 space-y-2.5 text-xs sm:text-sm text-white/90">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="size-4 text-emerald-300 shrink-0" />
                    <span>Automated Airtime & High-Speed Data Bundles</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="size-4 text-emerald-300 shrink-0" />
                    <span>Prepaid Electricity Tokens with Instant Generation</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="size-4 text-emerald-300 shrink-0" />
                    <span>Dedicated Non-VoIP International OTP Numbers</span>
                  </div>
                </div>
              </div>

              {/* Bottom Details: Compact Illustrative Transaction Element & CTA */}
              <div className="relative z-10 mt-8 space-y-4 pt-4 border-t border-white/15">
                {/* Illustrative Product Interface Element (Fintech Receipt) */}
                <div
                  aria-label="Recent transaction illustration"
                  className="rounded-[10px] border border-white/15 bg-black/25 p-3.5 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between text-[11px] text-white/70">
                    <span className="font-mono uppercase tracking-wider">Automated Dispatch</span>
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-[6px]">
                      Success
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-sm sm:text-base font-bold text-white tracking-tight">
                        ₦10,000.00
                      </p>
                      <p className="text-xs text-white/80">
                        Electricity Token Generated
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-[10px] text-white/70">Prepaid Meter Token</p>
                      <p className="font-mono text-xs font-semibold text-emerald-300 tracking-wider">
                        4821 - 0912 - 8831 - 2049
                      </p>
                    </div>
                  </div>
                </div>

                {/* Featured CTA Button */}
                <Link
                  href="/register"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-white px-6 py-3 text-sm font-semibold text-[#7A1F3D] transition-colors hover:bg-neutral-100 active:scale-[0.98] select-none"
                >
                  <span>Explore Services</span>
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>

          {/* -----------------------------------------------------------------------
              RIGHT: 2x2 Service Cards Grid (Spans 7 cols on lg)
              ----------------------------------------------------------------------- */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 items-stretch">
            {KORAK_SERVICES.map((service) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.id}
                  className="group relative flex flex-col justify-between rounded-[10px] border border-border bg-card p-5 sm:p-6 transition-colors hover:border-primary/40"
                >
                  {/* Card Content Area */}
                  <div>
                    {/* Card Header & Icon */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex size-10 items-center justify-center rounded-[10px] border border-border bg-surface text-primary">
                        <Icon
                          className="size-5"
                          strokeWidth={NAV_ICON_STROKE_WIDTH}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        {service.badge && (
                          <span className="text-[11px] font-medium text-muted-foreground bg-muted/60 border border-border px-2.5 py-0.5 rounded-[10px]">
                            {service.badge}
                          </span>
                        )}
                        <ArrowUpRight
                          className="size-4 text-muted-foreground transition-colors group-hover:text-primary"
                          aria-hidden="true"
                        />
                      </div>
                    </div>

                    {/* Card Title */}
                    <h3 className="text-lg font-bold tracking-tight text-foreground mb-1.5 group-hover:text-primary transition-colors">
                      {service.title}
                    </h3>

                    {/* Card Description */}
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4">
                      {service.description}
                    </p>

                    {/* Relatable Service Provider Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-3">
                      {service.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-[6px] border border-border/80 bg-secondary px-2 py-0.5 text-[10px] font-medium text-foreground select-none"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Key Concrete Highlight Feature */}
                    <div className="text-[11px] font-medium text-primary flex items-center gap-1.5">
                      <span className="size-1 rounded-full bg-primary" aria-hidden="true" />
                      <span>{service.highlight}</span>
                    </div>
                  </div>

                  {/* Card Bottom Action */}
                  <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-xs font-semibold text-primary">
                    <Link
                      href={service.href}
                      className="inline-flex items-center gap-1.5 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-[6px]"
                    >
                      <span>Get Started</span>
                      <ArrowRight className="size-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
