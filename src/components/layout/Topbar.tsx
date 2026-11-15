"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, ChevronDown, Loader2, LogOut, Search, User } from "lucide-react";
import { type NavItem, ROUTES, USER_MENU_ITEMS } from "@/config/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
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

export function Topbar({
  user,
  leftSlot,
  notificationsSlot,
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
        "border-border/70 bg-background/85 text-foreground sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-4 border-b px-4 backdrop-blur-md sm:px-6",
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        {leftSlot}

        {/* Global Search / Command Menu Shortcut */}
        <div className="hidden md:flex items-center gap-2 rounded-lg border border-border/70 bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground hover:border-border transition-colors w-56 lg:w-72">
          <Search className="size-3.5 text-muted-foreground" aria-hidden="true" />
          <span className="truncate">Search services, orders, vpn...</span>
          <kbd className="ml-auto pointer-events-none inline-flex h-4 select-none items-center rounded border border-border/70 bg-card px-1.5 font-mono text-[9px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notifications slot */}
        {notificationsSlot !== undefined ? (
          notificationsSlot
        ) : (
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground relative h-9 w-9"
          >
            <Link
              href={ROUTES.NOTIFICATIONS}
              aria-label={
                unreadCount > 0
                  ? `Notifications (${unreadCount} unread)`
                  : "Notifications"
              }
            >
              <Bell className="h-4 w-4" aria-hidden="true" />
              {unreadCount > 0 && (
                <span
                  aria-hidden="true"
                  className="bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-md px-1 text-[10px] leading-none font-semibold"
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
              className="text-foreground hover:bg-muted/70 h-9 gap-2.5 rounded-lg px-2 text-sm font-medium transition-colors"
            >
              <span
                aria-hidden="true"
                className="relative flex size-7 shrink-0 items-center justify-center rounded-full border border-border/80 bg-primary/10 text-primary text-xs font-semibold shadow-xs"
              >
                {initials || (
                  <User className="text-primary size-3.5" />
                )}
                <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full border-2 border-card bg-emerald-500" />
              </span>
              <span className="hidden max-w-[140px] truncate sm:inline">
                {displayName}
              </span>
              <ChevronDown
                className="text-muted-foreground size-3.5"
                aria-hidden="true"
              />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-0.5">
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
                  key={item.id}
                  asChild
                  className="focus:bg-muted focus:text-foreground cursor-pointer"
                >
                  <Link href={item.href ?? ROUTES.PROFILE}>
                    {Icon && (
                      <Icon
                        className="text-muted-foreground mr-2 h-4 w-4"
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
                  className="mr-2 h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
              )}
              <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
