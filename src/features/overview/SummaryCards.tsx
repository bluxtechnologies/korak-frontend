"use client";

import * as React from "react";
import Link from "next/link";
import { Radio, ShoppingBag, UserCheck, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/config/navigation";
import { useAuthUser } from "@/components/layout/DashboardShell";
import { WalletSummaryCard } from "./WalletSummaryCard";
import type { OverviewMetrics, WalletSummary } from "./api";

export interface SummaryCardsProps {
  wallet: WalletSummary;
  metrics: OverviewMetrics;
  onTopUpClick?: () => void;
  className?: string;
}

/**
 * SummaryCards (F12.1).
 * Overview metrics grid adhering strictly to Doc 05 §2 tokens:
 * 10px radius, 1px neutral borders, no heavy shadows, and text-only badges.
 */
export function SummaryCards({
  wallet,
  metrics,
  onTopUpClick,
  className,
}: SummaryCardsProps) {
  let currentUser: { name?: string; email?: string } | null = null;
  try {
    // Gracefully handle context if mounted in tests or standalone
    // eslint-disable-next-line react-hooks/rules-of-hooks
    currentUser = useAuthUser();
  } catch {
    currentUser = null;
  }

  return (
    <div
      className={
        className ?? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      }
      data-testid="overview-summary-cards"
    >
      {/* 1. Wallet Balance Card (F12.2) */}
      <WalletSummaryCard wallet={wallet} onTopUpClick={onTopUpClick} />

      {/* 2. Active Services Card */}
      <Card data-testid="active-services-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <div
              aria-hidden="true"
              className="border-border bg-surface text-primary flex h-8 w-8 items-center justify-center rounded-md border"
            >
              <Radio className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-muted-foreground text-sm font-medium">
                Active Services
              </CardTitle>
              <CardDescription className="text-xs">
                Data plans & VPN tunnels
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          <div className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
            {metrics.active_services_count}{" "}
            <span className="text-muted-foreground text-sm font-normal">
              active
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-xs">
            {metrics.active_services_count > 0
              ? "All subscribed network services operational"
              : "No active service packages currently"}
          </p>
        </CardContent>

        <CardFooter className="border-border/60 border-t pt-2">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary hover:bg-surface h-8 w-full justify-between px-2 text-xs font-medium"
          >
            <Link href={ROUTES.AIRTIME}>
              <span>Manage services</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardFooter>
      </Card>

      {/* 3. Recent Orders Metric Card */}
      <Card data-testid="orders-metric-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <div
              aria-hidden="true"
              className="border-border bg-surface text-primary flex h-8 w-8 items-center justify-center rounded-md border"
            >
              <ShoppingBag className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-muted-foreground text-sm font-medium">
                Total Orders
              </CardTitle>
              <CardDescription className="text-xs">
                Completed deliveries
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          <div className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
            {metrics.completed_orders_count}
          </div>
          <p className="text-muted-foreground mt-1 text-xs">
            {metrics.pending_orders_count > 0
              ? `${metrics.pending_orders_count} order pending fulfillment`
              : "All past orders fulfilled"}
          </p>
        </CardContent>

        <CardFooter className="border-border/60 border-t pt-2">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary hover:bg-surface h-8 w-full justify-between px-2 text-xs font-medium"
          >
            <Link href={ROUTES.ORDERS}>
              <span>View all orders</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardFooter>
      </Card>

      {/* 4. Account Standing Card */}
      <Card data-testid="account-standing-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <div
              aria-hidden="true"
              className="border-border bg-surface text-primary flex h-8 w-8 items-center justify-center rounded-md border"
            >
              <UserCheck className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-muted-foreground text-sm font-medium">
                Account Status
              </CardTitle>
              <CardDescription className="text-xs">
                Verification & standing
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          <div className="flex items-center gap-2">
            <Badge variant="success">Active</Badge>
            <Badge variant="secondary">Verified</Badge>
          </div>
          <p className="text-muted-foreground mt-2 truncate text-xs">
            {currentUser?.email ?? "Standard customer access"}
          </p>
        </CardContent>

        <CardFooter className="border-border/60 border-t pt-2">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary hover:bg-surface h-8 w-full justify-between px-2 text-xs font-medium"
          >
            <Link href={ROUTES.PROFILE}>
              <span>Profile settings</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
