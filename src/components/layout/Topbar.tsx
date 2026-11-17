"use client";

import * as React from "react";
import Link from "next/link";
import {
  Bell,
  ChevronDown,
  ChevronRight,
  Headphones,
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
 * - Global radius token (8px-12px / rounded-lg / rounded-md), no pill shapes on topbar buttons.
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
        <div className="border-border bg-muted/40 text-muted-foreground hover:border-border/80 focus-within:border-ring focus-within:ring-ring hidden h-9 w-60 items-center gap-2 rounded-lg border px-3 text-xs transition-colors focus-within:ring-1 sm:flex md:w-72 lg:w-80">
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
            className="border-border bg-card hover:bg-muted/60 text-foreground focus-visible:ring-ring hidden h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors sm:flex focus-visible:ring-1 focus-visible:outline-none"
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
            className="text-muted-foreground hover:text-foreground relative h-9 w-9 rounded-lg"
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
              className="group text-foreground hover:bg-muted/70 focus-visible:ring-ring h-10 gap-2.5 rounded-xl px-2.5 text-sm font-medium transition-all focus-visible:ring-1 border border-transparent hover:border-border/60 data-[state=open]:bg-muted/80 data-[state=open]:border-border/80"
            >
              <span
                aria-hidden="true"
                className="bg-gradient-to-br from-[#7A1F3D] to-[#5C142B] text-white flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold shadow-xs ring-1 ring-black/10"
              >
                {initials || (
                  <UserRound
                    className="text-white size-4"
                    strokeWidth={NAV_ICON_STROKE_WIDTH}
                    aria-hidden="true"
                  />
                )}
              </span>
              <span className="hidden max-w-[140px] truncate font-semibold sm:inline text-xs sm:text-sm">
                {displayName}
              </span>
              <ChevronDown
                className="text-muted-foreground size-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
                strokeWidth={NAV_ICON_STROKE_WIDTH}
                aria-hidden="true"
              />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-72 rounded-2xl border border-border/70 bg-card/95 backdrop-blur-xl p-2.5 shadow-2xl shadow-black/12 ring-1 ring-black/5 dark:ring-white/8"
          >
            {/* 1. Rich User Identity Header Card */}
            <DropdownMenuLabel className="p-0 font-normal mb-2">
              <div className="bg-gradient-to-br from-[#7A1F3D]/8 to-[#7A1F3D]/3 rounded-xl p-3 border border-[#7A1F3D]/15 space-y-2.5">
                <div className="flex items-center gap-3">
                  <div
                    aria-hidden="true"
                    className="bg-gradient-to-br from-[#7A1F3D] to-[#5C142B] text-white flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold shadow-sm ring-1 ring-black/10"
                  >
                    {initials || (
                      <UserRound
                        className="text-white size-4"
                        strokeWidth={NAV_ICON_STROKE_WIDTH}
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <p className="text-foreground truncate text-sm font-bold leading-tight">
                        {displayName}
                      </p>
                      <span className="text-[10px] font-semibold text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-md shrink-0">
                        Active
                      </span>
                    </div>
                    {displaySecondary && (
                      <p className="text-muted-foreground truncate text-xs mt-0.5">
                        {displaySecondary}
                      </p>
                    )}
                  </div>
                </div>

                {/* Quick Live Wallet Balance Glance */}
                <div className="flex items-center justify-between pt-2 border-t border-[#7A1F3D]/15 text-xs">
                  <span className="text-muted-foreground text-[11px] font-medium flex items-center gap-1.5">
                    <Wallet
                      className="size-3.5 text-muted-foreground"
                      strokeWidth={NAV_ICON_STROKE_WIDTH}
                      aria-hidden="true"
                    />
                    <span>Wallet Balance</span>
                  </span>
                  <Link
                    href={ROUTES.WALLET}
                    className="font-bold text-foreground text-xs hover:text-primary transition-colors"
                  >
                    {walletBalance}
                  </Link>
                </div>
              </div>
            </DropdownMenuLabel>

            {/* 2. Menu Navigation Items */}
            <div className="space-y-0.5">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <DropdownMenuItem
                    key={item.id ?? item.href}
                    asChild
                    className="focus:bg-muted/80 focus:text-foreground cursor-pointer rounded-xl px-3 py-2.5 text-xs sm:text-sm font-medium transition-all group flex items-center justify-between"
                  >
                    <Link
                      href={item.href ?? ROUTES.PROFILE}
                      className="flex items-center justify-between w-full"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {Icon && (
                          <div className="flex size-7 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground group-hover:bg-[#7A1F3D]/10 group-hover:text-[#7A1F3D] dark:group-hover:text-[#E892A8] transition-colors shrink-0">
                            <Icon
                              className="size-4"
                              strokeWidth={NAV_ICON_STROKE_WIDTH}
                              aria-hidden="true"
                            />
                          </div>
                        )}
                        <span className="truncate">{item.label}</span>
                      </div>
                      <ChevronRight
                        className="size-3.5 text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all"
                        strokeWidth={NAV_ICON_STROKE_WIDTH}
                        aria-hidden="true"
                      />
                    </Link>
                  </DropdownMenuItem>
                );
              })}

              {/* Help & Support Quick Item */}
              <DropdownMenuItem
                asChild
                className="focus:bg-muted/80 focus:text-foreground cursor-pointer rounded-xl px-3 py-2.5 text-xs sm:text-sm font-medium transition-all group flex items-center justify-between"
              >
                <Link
                  href={ROUTES.SUPPORT}
                  className="flex items-center justify-between w-full"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground group-hover:bg-[#7A1F3D]/10 group-hover:text-[#7A1F3D] dark:group-hover:text-[#E892A8] transition-colors shrink-0">
                      <Headphones
                        className="size-4"
                        strokeWidth={NAV_ICON_STROKE_WIDTH}
                        aria-hidden="true"
                      />
                    </div>
                    <span className="truncate">Help & Support</span>
                  </div>
                  <ChevronRight
                    className="size-3.5 text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all"
                    strokeWidth={NAV_ICON_STROKE_WIDTH}
                    aria-hidden="true"
                  />
                </Link>
              </DropdownMenuItem>
            </div>

            <DropdownMenuSeparator className="my-1.5 bg-border/60" />

            {/* 3. Refined Log Out Action */}
            <DropdownMenuItem
              disabled={isLoggingOut}
              onSelect={(event) => {
                if (isLoggingOut) {
                  event.preventDefault();
                  return;
                }
                void onLogout?.();
              }}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer rounded-xl px-3 py-2.5 text-xs sm:text-sm font-medium transition-all group flex items-center gap-2.5"
            >
              <div className="flex size-7 items-center justify-center rounded-lg bg-destructive/10 text-destructive group-hover:bg-destructive/20 transition-colors shrink-0">
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
              </div>
              <span className="font-semibold">
                {isLoggingOut ? "Logging out..." : "Log out"}
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
