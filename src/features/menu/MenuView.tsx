"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { showToast } from "@/components/ui/sonner";
import {
  Bell,
  ChevronRight,
  HelpCircle,
  LayoutDashboard,
  Loader2,
  LogOut,
  MessageSquareText,
  Package,
  ReceiptText,
  Settings,
  ShieldCheck,
  Smartphone,
  UserRound,
  Wallet,
  Wifi,
} from "lucide-react";
import { NAV_ICON_STROKE_WIDTH, ROUTES } from "@/config/navigation";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuthUser } from "@/components/layout/DashboardShell";
import { logout } from "@/features/auth/api";
import { cn } from "@/lib/utils";

function getUserInitials(name?: string): string {
  if (!name || !name.trim()) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 1).toUpperCase();
  }
  return `${parts[0].slice(0, 1)}${parts[parts.length - 1].slice(0, 1)}`.toUpperCase();
}

export interface MenuViewProps {
  walletBalance?: string;
  className?: string;
}

/**
 * MenuView Component (F5.5).
 * Native-app-style full menu page providing mobile-first navigation across all
 * services and account actions. Replaces modal drawers / bottom sheets on small screens.
 *
 * Design system rules (Doc 05):
 * - 10px radius (rounded-md), no pill shapes.
 * - 1px neutral borders (border-border).
 * - Lucide icons with locked 1.75 stroke width.
 * - No status dots or heavy shadows.
 */
export function MenuView({
  walletBalance = "₦0.00",
  className,
}: MenuViewProps) {
  const user = useAuthUser();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const initials = getUserInitials(user?.name || user?.username);
  const displayName = user?.name || user?.username || "Account";
  const displaySecondary =
    user?.email || (user?.username ? `@${user.username}` : undefined);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
      showToast.success(
        "Signed Out",
        "You have been successfully signed out of your account."
      );
    } catch {
      showToast.error(
        "Session Ended",
        "Your session has ended. Please sign in again to continue."
      );
    } finally {
      router.push(ROUTES.LOGIN);
    }
  };

  const services = [
    {
      label: "Dashboard",
      description: "Overview and quick shortcuts",
      href: ROUTES.DASHBOARD,
      icon: LayoutDashboard,
    },
    {
      label: "Airtime",
      description: "Recharge any network",
      href: ROUTES.AIRTIME,
      icon: Smartphone,
    },
    {
      label: "Mobile Data",
      description: "Data bundles and subscriptions",
      href: ROUTES.DATA,
      icon: Wifi,
    },
    {
      label: "Numbers Activation",
      description: "Virtual numbers for verification",
      href: ROUTES.NUMBERS,
      icon: MessageSquareText,
    },
    {
      label: "Orders",
      description: "Track and review past orders",
      href: ROUTES.ORDERS,
      icon: Package,
    },
    {
      label: "Transactions",
      description: "History and payment receipts",
      href: ROUTES.TRANSACTIONS,
      icon: ReceiptText,
    },
    {
      label: "VPN Service",
      description: "Secure WireGuard configs",
      href: ROUTES.VPN,
      icon: ShieldCheck,
    },
  ];

  const accountLinks = [
    {
      label: "Profile",
      description: "Personal info and security credentials",
      href: ROUTES.PROFILE,
      icon: UserRound,
    },
    {
      label: "Settings",
      description: "App preferences and password",
      href: ROUTES.SETTINGS,
      icon: Settings,
    },
    {
      label: "Notifications",
      description: "System alerts and receipts",
      href: ROUTES.NOTIFICATIONS,
      icon: Bell,
    },
    {
      label: "Support",
      description: "Help center and FAQs",
      href: ROUTES.SUPPORT,
      icon: HelpCircle,
    },
  ];

  return (
    <PageContainer maxWidth="narrow" className={cn("space-y-6 pb-24", className)}>
      <PageHeader
        title="Menu"
        description="All digital services and account navigation."
        bordered={false}
      />

      {/* Customer Identity Card */}
      <div className="border-border bg-card flex items-center justify-between gap-4 rounded-md border p-4">
        <div className="flex min-w-0 items-center gap-3">
          <div
            aria-hidden="true"
            className="bg-primary text-primary-foreground flex size-12 shrink-0 items-center justify-center rounded-[5px] text-sm font-semibold"
          >
            {initials || (
              <UserRound
                className="size-6 text-white"
                strokeWidth={NAV_ICON_STROKE_WIDTH}
              />
            )}
          </div>
          <div className="min-w-0 space-y-0.5">
            <h2 className="text-foreground truncate text-base font-semibold">
              {displayName}
            </h2>
            {displaySecondary && (
              <p className="text-muted-foreground truncate text-xs">
                {displaySecondary}
              </p>
            )}
          </div>
        </div>

        <Button asChild variant="outline" size="sm" className="shrink-0 rounded-md">
          <Link href={ROUTES.PROFILE}>View Profile</Link>
        </Button>
      </div>

      {/* Wallet Balance Card */}
      <div className="border-border bg-muted/40 flex items-center justify-between gap-3 rounded-md border p-3.5">
        <div className="flex items-center gap-2.5">
          <div className="border-border bg-card flex size-9 items-center justify-center rounded-md border">
            <Wallet
              className="text-muted-foreground size-4.5"
              strokeWidth={NAV_ICON_STROKE_WIDTH}
              aria-hidden="true"
            />
          </div>
          <div>
            <p className="text-muted-foreground text-xs font-normal">Wallet Balance</p>
            <p className="text-foreground text-sm font-semibold">{walletBalance}</p>
          </div>
        </div>
        <Button asChild variant="ghost" size="sm" className="text-primary hover:text-primary gap-1 text-xs font-medium">
          <Link href={ROUTES.WALLET}>
            <span>View Wallet</span>
            <ChevronRight className="size-3.5" strokeWidth={NAV_ICON_STROKE_WIDTH} />
          </Link>
        </Button>
      </div>

      {/* Digital Services Section */}
      <div className="space-y-2">
        <h3 className="text-muted-foreground px-1 text-xs font-semibold uppercase tracking-wider">
          Services
        </h3>
        <div className="border-border bg-card divide-border divide-y rounded-md border">
          {services.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="hover:bg-muted/50 focus-visible:ring-ring flex items-center justify-between gap-3 p-3.5 transition-colors focus-visible:ring-1 focus-visible:outline-none"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="border-border bg-muted/50 flex size-9 shrink-0 items-center justify-center rounded-md border">
                    <Icon
                      className="text-foreground size-4.5 shrink-0"
                      strokeWidth={NAV_ICON_STROKE_WIDTH}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-foreground truncate text-sm font-medium">
                      {item.label}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">
                      {item.description}
                    </p>
                  </div>
                </div>
                <ChevronRight
                  className="text-muted-foreground size-4 shrink-0"
                  strokeWidth={NAV_ICON_STROKE_WIDTH}
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Account & Settings Section */}
      <div className="space-y-2">
        <h3 className="text-muted-foreground px-1 text-xs font-semibold uppercase tracking-wider">
          Account & Preferences
        </h3>
        <div className="border-border bg-card divide-border divide-y rounded-md border">
          {accountLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="hover:bg-muted/50 focus-visible:ring-ring flex items-center justify-between gap-3 p-3.5 transition-colors focus-visible:ring-1 focus-visible:outline-none"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="border-border bg-muted/50 flex size-9 shrink-0 items-center justify-center rounded-md border">
                    <Icon
                      className="text-foreground size-4.5 shrink-0"
                      strokeWidth={NAV_ICON_STROKE_WIDTH}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-foreground truncate text-sm font-medium">
                      {item.label}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">
                      {item.description}
                    </p>
                  </div>
                </div>
                <ChevronRight
                  className="text-muted-foreground size-4 shrink-0"
                  strokeWidth={NAV_ICON_STROKE_WIDTH}
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Sign Out Action */}
      <div className="pt-2">
        <Button
          type="button"
          variant="outline"
          disabled={isLoggingOut}
          onClick={handleLogout}
          className="border-border hover:border-destructive/30 hover:bg-destructive-surface text-destructive hover:text-destructive h-11 w-full justify-center gap-2 rounded-md font-medium"
        >
          {isLoggingOut ? (
            <Loader2
              className="size-4 animate-spin"
              strokeWidth={NAV_ICON_STROKE_WIDTH}
              aria-hidden="true"
            />
          ) : (
            <LogOut
              className="size-4"
              strokeWidth={NAV_ICON_STROKE_WIDTH}
              aria-hidden="true"
            />
          )}
          <span>{isLoggingOut ? "Signing out..." : "Log out"}</span>
        </Button>
      </div>
    </PageContainer>
  );
}
