"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import {
  type NavItem,
  type NavSection,
  NAV_ICON_STROKE_WIDTH,
  ROUTES,
  SIDEBAR_NAV_SECTIONS,
  USER_MENU_ITEMS,
} from "@/config/navigation";
import { Button } from "@/components/ui/button";
import { BrandLogoIcon } from "@/components/shared/BrandLogo";
import { cn } from "@/lib/utils";
import { Sidebar } from "./Sidebar";
import { Topbar, type TopbarUser } from "./Topbar";
import { MobileBottomNav } from "./MobileBottomNav";

export interface AppShellProps {
  children: React.ReactNode;
  /** Authenticated customer details for topbar user menu */
  user?: TopbarUser | null;
  /** Unread notification badge count when using default bell link */
  unreadCount?: number;
  /** Custom notifications dropdown widget (F14) */
  notificationsSlot?: React.ReactNode;
  /** Additional content placed beside mobile menu trigger in Topbar left slot */
  topbarLeftSlot?: React.ReactNode;
  /** Sidebar navigation sections override */
  sections?: NavSection[];
  /** Granted user abilities for permission-aware navigation */
  abilities?: readonly string[];
  /** User dropdown menu items override */
  menuItems?: NavItem[];
  /** Optional pathname override (defaults to Next.js usePathname) */
  pathname?: string;
  /** Logout handler passed to Topbar user menu */
  onLogout?: () => void | Promise<void>;
  /** Pending state while logout request executes */
  isLoggingOut?: boolean;
  /** Initial desktop sidebar collapsed state */
  defaultSidebarCollapsed?: boolean;
  className?: string;
}

/**
 * AppShell Component (F5).
 * Primary application shell wrapping customer dashboard views.
 *
 * Responsive behavior (F5.5):
 * - Desktop (>= md): Persistent collapsible desktop sidebar (F5.2) + Topbar (F5.3).
 * - Mobile (< md): Topbar + Persistent bottom navigation (MobileBottomNav) with
 *   an app-like Menu page (/menu) rather than modal bottom sheets/drawers.
 */
export function AppShell({
  children,
  user,
  unreadCount = 0,
  notificationsSlot,
  topbarLeftSlot,
  sections: _sections = SIDEBAR_NAV_SECTIONS,
  abilities: _abilities,
  menuItems = USER_MENU_ITEMS,
  pathname: pathnameProp,
  onLogout,
  isLoggingOut = false,
  defaultSidebarCollapsed = false,
  className,
}: AppShellProps) {
  const routerPathname = usePathname();
  const currentPath = pathnameProp ?? routerPathname ?? ROUTES.OVERVIEW;

  const isMenuPage = currentPath === ROUTES.MENU;

  const mobileTopbarLeft = (
    <div className="flex items-center gap-2.5">
      <Button
        asChild
        variant="ghost"
        size="icon"
        aria-label={isMenuPage ? "Back to Dashboard" : "Open Menu Page"}
        className="text-muted-foreground hover:text-foreground h-9 w-9 rounded-md md:hidden"
      >
        <Link href={isMenuPage ? ROUTES.OVERVIEW : ROUTES.MENU}>
          <Menu className="size-5" strokeWidth={NAV_ICON_STROKE_WIDTH} aria-hidden="true" />
        </Link>
      </Button>

      <Link
        href={ROUTES.OVERVIEW}
        aria-label="Korak Digitals Home"
        className="focus-visible:ring-ring flex items-center gap-2 rounded-md focus-visible:ring-1 focus-visible:outline-none md:hidden"
      >
        <BrandLogoIcon className="h-7 w-7 shrink-0" />
        <span className="text-foreground text-sm font-semibold tracking-tight">
          Korak Digitals
        </span>
      </Link>

      {topbarLeftSlot}
    </div>
  );

  return (
    <div
      className={cn(
        "bg-background text-foreground flex min-h-screen w-full",
        className
      )}
    >
      {/* Persistent collapsible desktop sidebar (>= md) */}
      <div className="hidden shrink-0 md:block">
        <div className="sticky top-0 h-screen">
          <Sidebar
            className="h-full"
            defaultCollapsed={defaultSidebarCollapsed}
            user={user ? { name: user.name, email: user.email ?? "" } : null}
            onLogout={onLogout}
            pathname={currentPath}
          />
        </div>
      </div>

      {/* Main application column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          user={user}
          unreadCount={unreadCount}
          notificationsSlot={notificationsSlot}
          menuItems={menuItems}
          onLogout={onLogout}
          isLoggingOut={isLoggingOut}
          leftSlot={mobileTopbarLeft}
          className="sticky top-0 z-30"
        />

        <main className="flex-1 pb-20 md:pb-0">{children}</main>
      </div>

      {/* Mobile Bottom Navigation (< md) linking directly to /menu */}
      <MobileBottomNav currentPath={currentPath} />
    </div>
  );
}
