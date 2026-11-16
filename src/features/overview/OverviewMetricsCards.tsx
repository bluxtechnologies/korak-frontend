"use client";

import * as React from "react";
import Link from "next/link";
import { Hash, PackageCheck, ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/navigation";
import type { OverviewMetrics } from "./api";

export interface OverviewMetricsCardsProps {
  metrics: OverviewMetrics;
}

export function OverviewMetricsCards({ metrics }: OverviewMetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 h-full">
      {/* 1. Active Numbers / Virtual Verifications Card */}
      <Card className="rounded-2xl border-border/80 p-5 shadow-xs flex flex-col justify-between hover:border-border transition-all">
        <CardContent className="p-0 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Hash className="size-4.5" />
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
              <span>Online</span>
            </div>
          </div>

          <div>
            <span className="text-xs font-medium text-muted-foreground">
              Active Numbers
            </span>
            <div className="mt-1 font-mono text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {metrics.active_services_count} <span className="text-xs font-sans font-medium text-muted-foreground">Active</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Temporary & rental numbers receiving SMS verification codes in real-time.
            </p>
          </div>

          <Button asChild variant="outline" size="sm" className="w-full justify-between rounded-xl text-xs font-semibold h-9 shadow-none">
            <Link href={ROUTES.RENT_NUMBERS}>
              <span>Rent New Number</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* 2. Completed Orders Card */}
      <Card className="rounded-2xl border-border/80 p-5 shadow-xs flex flex-col justify-between hover:border-border transition-all">
        <CardContent className="p-0 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <PackageCheck className="size-4.5" />
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
              <Sparkles className="size-3" />
              <span>Fulfilled</span>
            </div>
          </div>

          <div>
            <span className="text-xs font-medium text-muted-foreground">
              Completed Services
            </span>
            <div className="mt-1 font-mono text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {metrics.completed_orders_count} <span className="text-xs font-sans font-medium text-muted-foreground">Orders</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Lifetime completed mobile data, airtime VTU, and verification deliveries.
            </p>
          </div>

          <Button asChild variant="outline" size="sm" className="w-full justify-between rounded-xl text-xs font-semibold h-9 shadow-none">
            <Link href={ROUTES.ORDERS}>
              <span>View All Orders</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
