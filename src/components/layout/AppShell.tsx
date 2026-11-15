"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import {
  type NavItem,
  type NavSection,
  ROUTES,
  SIDEBAR_NAV_SECTIONS,
  USER_MENU_ITEMS,
} from "@/config/navigation";
import { Button } from "@/components/ui/button";
import { BrandLogoIcon } from "@/components/shared/BrandLogo";
import { cn } from "@/lib/utils";
import { Sidebar } from "./Sidebar";
import { Topbar, type TopbarUser } from "./Topbar";

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

export function AppShell({
  children,
  user,
  unreadCount = 0,
  notificationsSlot,
  topbarLeftSlot,
  sections = SIDEBAR_NAV_SECTIONS,
  abilities,
  menuItems = USER_MENU_ITEMS,
  pathname: pathnameProp,
  onLogout,
  isLoggingOut = false,
  defaultSidebarCollapsed = false,
  className,
}: AppShellProps) {
  const routerPathname = usePathname();
  const currentPath = pathnameProp ?? routerPathname ?? ROUTES.OVERVIEW;

  // Ties drawer open state to currentPath so any route navigation auto-closes the drawer cleanly
  const [drawerState, setDrawerState] = React.useState<{
    open: boolean;
    path: string;
  }>({ open: false, path: currentPath });

  const isMobileDrawerOpen =
    drawerState.open && drawerState.path === currentPath;

  const setMobileDrawerOpen = React.useCallback(
    (open: boolean) => {
      setDrawerState({ open, path: currentPath });
    },
    [currentPath]
  );

  const mobileTopbarLeft = (
    <div className="flex items-center gap-2.5">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setMobileDrawerOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={isMobileDrawerOpen}
        aria-controls="mobile-navigation-drawer"
        className="text-muted-foreground hover:text-foreground h-9 w-9 md:hidden"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
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
      {/* Persistent collapsible desktop sidebar */}
      <div className="hidden shrink-0 md:block">
        <div className="sticky top-0 h-screen">
          <Sidebar
            defaultCollapsed={defaultSidebarCollapsed}
            sections={sections}
            abilities={abilities}
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

        <main className="flex-1">{children}</main>
      </div>

      {/* Responsive mobile navigation drawer (< md) */}
      <DialogPrimitive.Root
        open={isMobileDrawerOpen}
        onOpenChange={setMobileDrawerOpen}
      >
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50 transition-opacity md:hidden" />
          <DialogPrimitive.Content
            id="mobile-navigation-drawer"
            className="border-border bg-surface data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col border-r shadow-lg duration-150 focus:outline-none md:hidden"
          >
            <DialogPrimitive.Title className="sr-only">
              Navigation menu
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">
              Primary customer dashboard navigation
            </DialogPrimitive.Description>

            <Sidebar
              collapsed={false}
              showCollapseToggle={false}
              sections={sections}
              abilities={abilities}
              pathname={currentPath}
              onNavigate={() => setMobileDrawerOpen(false)}
              className="w-full border-r-0"
            />

            <DialogPrimitive.Close asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Close navigation menu"
                className="text-muted-foreground hover:text-foreground absolute top-3 right-3 h-8 w-8"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </div>
  );
}
