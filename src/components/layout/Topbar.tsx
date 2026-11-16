"use client";

import * as React from "react";
import Link from "next/link";
import {
  Bell,
  ChevronDown,
  Loader2,
  LogOut,
  Search,
  UserRound,
  Wallet,
} from "lucide-react";
import {
  NAV_ICON_STROKE_WIDTH,
  type NavItem,
  ROUTES,
  USER_MENU_ITEMS,
} from "@/config/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface TopbarUser {
  name: string;
  email?: string;
  username?: string;
}

export interface TopbarProps {
  /** Authenticated customer identity for displaying user info in menu */
  user?: TopbarUser | null;
  /** Optional custom slot rendered on the left (e.g. mobile drawer trigger) */
  leftSlot?: React.ReactNode;
  /** Optional custom notifications widget (used by F14 NotificationBell) */
  notificationsSlot?: React.ReactNode;
  /** Optional custom wallet widget/pill */
  walletSlot?: React.ReactNode;
  /** Wallet balance string displayed in the wallet pill (defaults to ₦0.00) */
  walletBalance?: string;
  /** Unread notification count shown in the default notifications button */
  unreadCount?: number;
  /** Links rendered inside the user menu (defaults to USER_MENU_ITEMS) */
  menuItems?: NavItem[];
  /** Callback triggered when the user clicks Log out */
  onLogout?: () => void | Promise<void>;
  /** Disables the logout menu item and shows spinner feedback while signing out */
  isLoggingOut?: boolean;
  className?: string;
}

function getUserInitials(name?: string): string {
  if (!name || !name.trim()) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 1).toUpperCase();
  }
  return `${parts[0].slice(0, 1)}${parts[parts.length - 1].slice(0, 1)}`.toUpperCase();
}

/**
 * Topbar Component (F5.3).
 * Clean, fintech-style application top navigation bar.
 * Contains search input, wallet balance slot, notifications slot, and user menu
 * with profile and coordinated logout flow.
 *
 * Design system rules (Doc 05):
 * - 64px height (h-16) aligned seamlessly with sidebar header.
 * - Global radius token (10px / rounded-md), no pill shapes.
 * - No status dots on avatar or badges (text-only unread badge).
 * - Lucide icons with locked 1.75 stroke width.
 * - No heavy shadows or glow effects.
 */
export function Topbar({
  user,
  leftSlot,
  notificationsSlot,
  walletSlot,
  walletBalance = "₦0.00",
  unreadCount = 0,
  menuItems = USER_MENU_ITEMS,
  onLogout,
  isLoggingOut = false,
  className,
}: TopbarProps) {
  const initials = getUserInitials(user?.name || user?.username);
  const displayName = user?.name || user?.username || "Account";
  const displaySecondary =
    user?.email || (user?.username ? `@${user.username}` : undefined);

  const formattedUnread = unreadCount > 99 ? "99+" : String(unreadCount);

  return (
    <header
      className={cn(
        "border-border bg-background text-foreground sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b px-4 sm:px-6",
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        {leftSlot}

        {/* Global Search Input */}
        <div className="border-border bg-muted/40 text-muted-foreground hover:border-border/80 focus-within:border-ring focus-within:ring-ring hidden h-9 w-60 items-center gap-2 rounded-md border px-3 text-xs transition-colors focus-within:ring-1 sm:flex md:w-72 lg:w-80">
          <Search
            className="text-muted-foreground size-4 shrink-0"
            strokeWidth={NAV_ICON_STROKE_WIDTH}
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="Search for services..."
            aria-label="Search for services"
            className="text-foreground placeholder:text-muted-foreground w-full bg-transparent text-sm focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Live Wallet Balance */}
        {walletSlot !== undefined ? (
          walletSlot
        ) : (
          <Link
            href={ROUTES.WALLET}
            aria-label={`Wallet balance: ${walletBalance}`}
            className="border-border bg-card hover:bg-muted/60 text-foreground focus-visible:ring-ring hidden h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors sm:flex focus-visible:ring-1 focus-visible:outline-none"
          >
            <Wallet
              className="text-muted-foreground size-4 shrink-0"
              strokeWidth={NAV_ICON_STROKE_WIDTH}
              aria-hidden="true"
            />
            <span>{walletBalance}</span>
          </Link>
        )}

        {/* Notifications slot */}
        {notificationsSlot !== undefined ? (
          notificationsSlot
        ) : (
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground relative h-9 w-9 rounded-md"
          >
            <Link
              href={ROUTES.NOTIFICATIONS}
              aria-label={
                unreadCount > 0
                  ? `Notifications (${unreadCount} unread)`
                  : "Notifications"
              }
            >
              <Bell
                className="size-4 shrink-0"
                strokeWidth={NAV_ICON_STROKE_WIDTH}
                aria-hidden="true"
              />
              {unreadCount > 0 && (
                <span
                  aria-hidden="true"
                  className="bg-primary text-primary-foreground absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-sm px-1 text-[10px] leading-none font-semibold"
                >
                  {formattedUnread}
                </span>
              )}
            </Link>
          </Button>
        )}

        {/* User dropdown menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              aria-label="User menu"
              className="text-foreground hover:bg-muted/60 focus-visible:ring-ring h-9 gap-2.5 rounded-md px-2 text-sm font-medium transition-colors focus-visible:ring-1"
            >
              <span
                aria-hidden="true"
                className="bg-primary text-primary-foreground flex size-7 shrink-0 items-center justify-center rounded-[5px] text-xs font-semibold"
              >
                {initials || (
                  <UserRound
                    className="text-primary-foreground size-4"
                    strokeWidth={NAV_ICON_STROKE_WIDTH}
                    aria-hidden="true"
                  />
                )}
              </span>
              <span className="hidden max-w-[140px] truncate font-medium sm:inline">
                {displayName}
              </span>
              <ChevronDown
                className="text-muted-foreground size-4 shrink-0"
                strokeWidth={NAV_ICON_STROKE_WIDTH}
                aria-hidden="true"
              />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-foreground truncate text-sm font-medium">
                  {displayName}
                </p>
                {displaySecondary && (
                  <p className="text-muted-foreground truncate text-xs">
                    {displaySecondary}
                  </p>
                )}
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <DropdownMenuItem
                  key={item.id ?? item.href}
                  asChild
                  className="focus:bg-muted focus:text-foreground cursor-pointer"
                >
                  <Link href={item.href ?? ROUTES.PROFILE}>
                    {Icon && (
                      <Icon
                        className="text-muted-foreground mr-2 size-4"
                        strokeWidth={NAV_ICON_STROKE_WIDTH}
                        aria-hidden="true"
                      />
                    )}
                    <span>{item.label}</span>
                  </Link>
                </DropdownMenuItem>
              );
            })}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              disabled={isLoggingOut}
              onSelect={(event) => {
                if (isLoggingOut) {
                  event.preventDefault();
                  return;
                }
                void onLogout?.();
              }}
              className="text-destructive focus:bg-destructive-surface focus:text-destructive cursor-pointer"
            >
              {isLoggingOut ? (
                <Loader2
                  className="mr-2 size-4 animate-spin"
                  strokeWidth={NAV_ICON_STROKE_WIDTH}
                  aria-hidden="true"
                />
              ) : (
                <LogOut
                  className="mr-2 size-4"
                  strokeWidth={NAV_ICON_STROKE_WIDTH}
                  aria-hidden="true"
                />
              )}
              <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
