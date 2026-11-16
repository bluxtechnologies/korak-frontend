"use client";

import * as React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Menu,
  ReceiptText,
  Wallet,
} from "lucide-react";
import { NAV_ICON_STROKE_WIDTH, ROUTES } from "@/config/navigation";
import { cn } from "@/lib/utils";

export interface MobileBottomNavProps {
  currentPath: string;
  className?: string;
}

/**
 * MobileBottomNav Component (F5.5).
 * Persistent mobile bottom navigation bar with 4 app-like tabs:
 * 1. Home (/overview)
 * 2. Wallet (/wallet)
 * 3. Transactions (/transactions)
 * 4. Menu (/menu) — Dedicated app-like menu page replacing modal drawers.
 *
 * Design system rules (Doc 05):
 * - Exactly 4 tabs: Home, Wallet, Transactions, Menu.
 * - No pill dots or glow effects.
 * - 1.75 icon stroke width.
 * - WCAG AA contrast.
 */
export function MobileBottomNav({
  currentPath,
  className,
}: MobileBottomNavProps) {
  const isHome =
    currentPath === ROUTES.OVERVIEW ||
    currentPath === ROUTES.DASHBOARD ||
    currentPath === "/";

  const isWallet =
    currentPath.startsWith(ROUTES.WALLET) ||
    currentPath.startsWith("/user/wallet");

  const isTransactions = currentPath.startsWith(ROUTES.TRANSACTIONS);

  const isMenu =
    currentPath === ROUTES.MENU ||
    currentPath.startsWith(`${ROUTES.MENU}/`);

  const navItems = [
    {
      label: "Home",
      href: ROUTES.OVERVIEW,
      icon: LayoutDashboard,
      isActive: isHome,
    },
    {
      label: "Wallet",
      href: ROUTES.WALLET,
      icon: Wallet,
      isActive: isWallet,
    },
    {
      label: "Transactions",
      href: ROUTES.TRANSACTIONS,
      icon: ReceiptText,
      isActive: isTransactions,
    },
    {
      label: "Menu",
      href: ROUTES.MENU,
      icon: Menu,
      isActive: isMenu,
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className={cn(
        "border-border bg-background pb-safe fixed right-0 bottom-0 left-0 z-40 flex h-16 items-center justify-around border-t px-2 md:hidden",
        className
      )}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.label}
            href={item.href}
            aria-current={item.isActive ? "page" : undefined}
            className={cn(
              "focus-visible:ring-ring flex flex-1 flex-col items-center justify-center gap-1 py-1 text-[11px] font-medium transition-colors focus-visible:ring-1 focus-visible:outline-none",
              item.isActive
                ? "text-primary font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon
              className="size-5 shrink-0"
              strokeWidth={item.isActive ? 2 : NAV_ICON_STROKE_WIDTH}
              aria-hidden="true"
            />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
