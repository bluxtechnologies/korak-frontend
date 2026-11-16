"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  Phone,
  Wifi,
  Smartphone,
  LayoutGrid,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { NAV_ICON_STROKE_WIDTH, ROUTES } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { MOTION_VARIANTS } from "@/lib/motion";

export interface PopularServiceItem {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

const DEFAULT_POPULAR_SERVICES: PopularServiceItem[] = [
  {
    id: "airtime",
    title: "Airtime",
    description: "Recharge across all major networks",
    href: ROUTES.AIRTIME,
    icon: Phone,
  },
  {
    id: "data",
    title: "Data",
    description: "Affordable SME & direct bundles",
    href: ROUTES.DATA,
    icon: Wifi,
  },
  {
    id: "activation",
    title: "Activation",
    description: "Virtual numbers & OTP verifications",
    href: ROUTES.NUMBERS_OTP,
    icon: Smartphone,
  },
  {
    id: "more",
    title: "More",
    description: "Explore all digital services",
    href: ROUTES.SERVICES,
    icon: LayoutGrid,
  },
];

export interface QuickServiceShortcutsProps {
  services?: PopularServiceItem[];
  className?: string;
}

/**
 * PopularServices / QuickServiceShortcuts (F12.4).
 * Clean 4-card horizontal grid (2-column on mobile, 4-column on desktop).
 * Displays Airtime, Data, Activation, and More with compact icons,
 * descriptions, and subtle navigation indicators.
 *
 * Design system rules (Doc 05):
 * - 10px radius (rounded-md), no pill shapes.
 * - Semantic tokens only.
 * - Lucide icons with locked 1.75 stroke width.
 * - Near-zero shadows.
 */
export function QuickServiceShortcuts({
  services = DEFAULT_POPULAR_SERVICES,
  className,
}: QuickServiceShortcutsProps) {
  return (
    <section
      className={cn("space-y-3.5", className)}
      data-testid="quick-service-shortcuts"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-foreground text-base font-semibold sm:text-lg">
            What do you need today?
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Quick access to our most popular services.
          </p>
        </div>

        <Link
          href={ROUTES.SERVICES}
          className="text-primary flex shrink-0 items-center gap-1 text-xs font-semibold hover:underline"
        >
          <span>See all</span>
          <ArrowRight className="size-3.5" strokeWidth={NAV_ICON_STROKE_WIDTH} aria-hidden="true" />
        </Link>
      </div>

      {/* 4-Column Horizontal Grid (2-column on mobile) with Staggered Motion */}
      <motion.div
        variants={MOTION_VARIANTS.staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4"
      >
        {services.map((item) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.id}
              variants={MOTION_VARIANTS.staggerItem}
              whileHover={{ y: -2, transition: { duration: 0.14 } }}
              whileTap={{ scale: 0.99 }}
            >
              <Link
                href={item.href}
                className="group focus-visible:ring-ring rounded-md focus-visible:ring-1 focus-visible:outline-none block h-full"
              >
                <Card className="border-border hover:border-primary/40 hover:bg-muted/30 flex h-full flex-col justify-between rounded-md border p-4 transition-all sm:p-5">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-md sm:size-10">
                        <Icon
                          className="size-4.5 shrink-0 sm:size-5"
                          strokeWidth={NAV_ICON_STROKE_WIDTH}
                          aria-hidden="true"
                        />
                      </div>
                      <ChevronRight
                        className="text-muted-foreground/50 group-hover:text-primary size-4 transition-all group-hover:translate-x-0.5"
                        strokeWidth={NAV_ICON_STROKE_WIDTH}
                        aria-hidden="true"
                      />
                    </div>

                    <h3 className="text-foreground mt-3 text-sm leading-tight font-semibold">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground mt-1 line-clamp-1 text-xs leading-snug">
                      {item.description}
                    </p>
                  </div>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
