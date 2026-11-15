"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, LayoutGrid, Phone, TrendingUp, Wifi } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ROUTES } from "@/config/navigation";
import { cn } from "@/lib/utils";

interface ShortcutItem {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
}

const SHORTCUTS: ShortcutItem[] = [
  {
    id: "airtime",
    title: "Airtime",
    description: "Buy airtime for any network",
    href: ROUTES.AIRTIME,
    icon: Phone,
    iconBg: "bg-rose-500/10",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
  {
    id: "data",
    title: "Data",
    description: "Get data for browsing, streaming and more",
    href: ROUTES.DATA,
    icon: Wifi,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    id: "social",
    title: "Social",
    description: "Social accounts, boosting and more",
    href: ROUTES.SOCIAL_MEDIA_BUY,
    icon: TrendingUp,
    iconBg: "bg-pink-500/10",
    iconColor: "text-pink-600 dark:text-pink-400",
  },
  {
    id: "more",
    title: "More",
    description: "Explore all services",
    href: ROUTES.AIRTIME,
    icon: LayoutGrid,
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
];

export interface QuickServiceShortcutsProps {
  className?: string;
}

export function QuickServiceShortcuts({
  className,
}: QuickServiceShortcutsProps) {
  return (
    <section className={cn("space-y-3.5", className)} data-testid="quick-service-shortcuts">
      <div>
        <h2 className="text-base font-bold text-foreground sm:text-lg">
          What do you need today?
        </h2>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Quick access to our most popular services.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SHORTCUTS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              className="group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-2xl"
            >
              <Card className="flex h-full flex-col justify-between rounded-2xl border border-border/70 p-5 transition-all hover:border-border hover:shadow-xs group-hover:bg-muted/30">
                <div>
                  <div
                    className={cn(
                      "flex size-10 items-center justify-center rounded-full transition-transform group-hover:scale-105",
                      item.iconBg,
                      item.iconColor
                    )}
                  >
                    <Icon className="size-4.5" />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-snug">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 flex items-center text-muted-foreground transition-colors group-hover:text-foreground">
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
