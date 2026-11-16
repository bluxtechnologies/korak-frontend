"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  EllipsisVertical,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

import {
  BOTTOM_NAV_ITEMS,
  isNavItemActive,
  MAIN_NAV_ITEMS,
  NAV_ICON_STROKE_WIDTH,
  type NavItem,
  ROUTES,
} from "@/config/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarSeparator,
  useSidebar,
  useSidebarSafe,
} from "@/components/ui/sidebar";

export interface SidebarUser {
  name: string;
  email: string;
}

export interface SidebarProps {
  /** Authenticated user details. Defaults to stub user if null/omitted. */
  user?: SidebarUser | null;
  /** Logout callback */
  onLogout?: () => void | Promise<void>;
  /** Optional override for main navigation items */
  items?: NavItem[];
  /** Optional override for bottom navigation items */
  bottomItems?: NavItem[];
  /** Optional current pathname override */
  pathname?: string;
  /** Optional callback fired on link navigation */
  onNavigate?: () => void;
  /** Optional controlled collapsed state */
  collapsed?: boolean;
  /** Optional default collapsed state */
  defaultCollapsed?: boolean;
  /** Optional collapsed change listener */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Backwards compatibility prop for sections */
  sections?: unknown;
  /** Backwards compatibility prop for abilities */
  abilities?: readonly string[];
  /** Backwards compatibility prop for showCollapseToggle */
  showCollapseToggle?: boolean;
  className?: string;
}

function getInitials(name?: string, email?: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    if (parts[0].length >= 2) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return parts[0].toUpperCase();
  }
  if (email) {
    return email.slice(0, 2).toUpperCase();
  }
  return "KD";
}

function SidebarInner({
  user = { name: "Jane Doe", email: "user@example.test" },
  onLogout,
  items = MAIN_NAV_ITEMS,
  bottomItems = BOTTOM_NAV_ITEMS,
  pathname: pathnameProp,
  onNavigate,
  collapsed: controlledCollapsed,
  onCollapsedChange,
  showCollapseToggle = true,
  className,
}: SidebarProps) {
  const routerPathname = usePathname();
  const currentPath = pathnameProp ?? routerPathname ?? ROUTES.OVERVIEW;
  const { state, toggleSidebar: ctxToggleSidebar, setOpen } = useSidebar();

  const isCollapsed =
    controlledCollapsed !== undefined
      ? controlledCollapsed
      : state === "collapsed";

  const toggleSidebar = React.useCallback(() => {
    if (controlledCollapsed !== undefined) {
      onCollapsedChange?.(!controlledCollapsed);
    } else {
      ctxToggleSidebar();
      onCollapsedChange?.(state !== "collapsed");
    }
  }, [controlledCollapsed, onCollapsedChange, ctxToggleSidebar, state]);

  React.useEffect(() => {
    if (controlledCollapsed !== undefined) {
      setOpen(!controlledCollapsed);
    }
  }, [controlledCollapsed, setOpen]);

  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>(
    {}
  );

  const toggleGroup = (itemLabel: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [itemLabel]: !prev[itemLabel],
    }));
  };

  const initials = getInitials(user?.name, user?.email);

  const renderNavItem = (item: NavItem) => {
    const active = isNavItemActive(item.href, currentPath);
    const hasChildren = Boolean(item.children && item.children.length > 0);
    const isGroupOpen = Boolean(openGroups[item.label]);
    const Icon = item.icon;

    // Collapsed rail with nested children: Flyout dropdown menu fixture support
    if (isCollapsed && hasChildren) {
      return (
        <SidebarMenuItem key={item.label}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                isActive={active}
                tooltip={item.label}
                aria-label={item.label}
                className="h-10 rounded-[5px]"
              >
                <Icon
                  className="size-5 shrink-0"
                  strokeWidth={NAV_ICON_STROKE_WIDTH}
                  aria-hidden="true"
                />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="right"
              align="start"
              className="w-48 rounded-[5px] p-1"
            >
              <div className="border-b border-border/70 px-2.5 py-1.5 text-xs font-semibold text-muted-foreground">
                {item.label}
              </div>
              {item.children!.map((child) => {
                const childActive = isNavItemActive(child.href, currentPath);
                return (
                  <DropdownMenuItem
                    key={child.href}
                    asChild
                    className={cn(
                      "rounded-[5px] text-xs cursor-pointer",
                      childActive && "bg-primary/10 text-primary font-semibold"
                    )}
                  >
                    <Link
                      href={child.href}
                      onClick={onNavigate}
                      aria-current={childActive ? "page" : undefined}
                    >
                      {child.label}
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      );
    }

    // Expanded with nested children: Disclosure inline list
    if (!isCollapsed && hasChildren) {
      return (
        <SidebarMenuItem key={item.label}>
          <SidebarMenuButton
            onClick={() => toggleGroup(item.label)}
            isActive={active}
            className="h-10 justify-between px-3 rounded-[5px] text-sm font-medium"
          >
            <span className="flex items-center gap-3 truncate">
              <Icon
                className="size-5 shrink-0"
                strokeWidth={NAV_ICON_STROKE_WIDTH}
                aria-hidden="true"
              />
              <span className="truncate">{item.label}</span>
            </span>
            {isGroupOpen ? (
              <ChevronDown
                className="size-4 shrink-0 text-muted-foreground"
                strokeWidth={NAV_ICON_STROKE_WIDTH}
              />
            ) : (
              <ChevronRight
                className="size-4 shrink-0 text-muted-foreground"
                strokeWidth={NAV_ICON_STROKE_WIDTH}
              />
            )}
          </SidebarMenuButton>
          {isGroupOpen && (
            <SidebarMenuSub className="my-1 space-y-1">
              {item.children!.map((child) => {
                const childActive = isNavItemActive(child.href, currentPath);
                return (
                  <SidebarMenuSubItem key={child.href}>
                    <SidebarMenuSubButton
                      asChild
                      isActive={childActive}
                      className="rounded-[5px] text-xs"
                    >
                      <Link
                        href={child.href}
                        onClick={onNavigate}
                        aria-current={childActive ? "page" : undefined}
                      >
                        {child.label}
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                );
              })}
            </SidebarMenuSub>
          )}
        </SidebarMenuItem>
      );
    }

    // Standard leaf navigation link
    return (
      <SidebarMenuItem key={item.label}>
        <SidebarMenuButton
          asChild
          isActive={active}
          tooltip={item.label}
          className={cn(
            "h-10 rounded-[5px] text-sm font-medium transition-colors",
            active
              ? "bg-primary/10 text-primary font-semibold hover:bg-primary/15"
              : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground font-normal"
          )}
        >
          <Link
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className="flex items-center gap-3 px-3"
          >
            <Icon
              className={cn(
                "size-5 shrink-0",
                active ? "text-primary" : "text-muted-foreground"
              )}
              strokeWidth={NAV_ICON_STROKE_WIDTH}
              aria-hidden="true"
            />
            {!isCollapsed && <span className="truncate">{item.label}</span>}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <ShadcnSidebar
      collapsible="icon"
      className={cn(
        "h-full border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
        className
      )}
    >
      {/* 1. Header (64px high) */}
      <SidebarHeader className="h-16 shrink-0 border-b border-sidebar-border p-0">
        {!isCollapsed ? (
          <div className="flex h-16 w-full items-center justify-between px-3">
            <Link
              href={ROUTES.OVERVIEW}
              onClick={onNavigate}
              aria-label="Korak Digitals Overview"
              className="flex items-center gap-2.5 rounded-[5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-[5px] bg-primary text-primary-foreground font-bold text-base select-none">
                K
              </div>
              <span className="truncate text-sm font-semibold tracking-tight text-foreground">
                Korak Digitals
              </span>
            </Link>
            {showCollapseToggle && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                aria-label="Collapse sidebar"
                className="size-8 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground rounded-[5px]"
              >
                <PanelLeftClose
                  className="size-4"
                  strokeWidth={NAV_ICON_STROKE_WIDTH}
                  aria-hidden="true"
                />
              </Button>
            )}
          </div>
        ) : (
          <div className="flex h-16 w-full flex-col items-center justify-center gap-1 py-1">
            <Link
              href={ROUTES.OVERVIEW}
              onClick={onNavigate}
              aria-label="Korak Digitals Overview"
              className="rounded-[5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-[5px] bg-primary text-primary-foreground font-bold text-sm select-none">
                K
              </div>
            </Link>
            {showCollapseToggle && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                aria-label="Expand sidebar"
                className="size-6 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground rounded-[5px]"
              >
                <PanelLeftOpen
                  className="size-3.5"
                  strokeWidth={NAV_ICON_STROKE_WIDTH}
                  aria-hidden="true"
                />
              </Button>
            )}
          </div>
        )}
      </SidebarHeader>

      {/* 2. Main Navigation, 3. 1px Divider, 4. Bottom Navigation */}
      <SidebarContent className="p-0">
        <SidebarGroup className="p-3">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {items.map(renderNavItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="mx-3 my-0 h-px bg-sidebar-border shrink-0" />

        <SidebarGroup className="p-3">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {bottomItems.map(renderNavItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* 5. User Card at the very bottom */}
      <SidebarFooter className="p-3 mt-auto">
        {!isCollapsed ? (
          <div className="flex w-full items-center justify-between gap-3 rounded-[5px] border border-sidebar-border bg-sidebar p-3">
            <div className="flex min-w-0 items-center gap-3">
              <div
                aria-label="User avatar"
                className="flex size-9 shrink-0 items-center justify-center rounded-[5px] bg-muted text-xs font-semibold text-foreground select-none"
              >
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground leading-tight">
                  {user?.name ?? "Account"}
                </p>
                <p className="truncate text-xs text-muted-foreground leading-tight mt-0.5">
                  {user?.email ?? ""}
                </p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="User options menu"
                  className="size-8 shrink-0 rounded-[5px] text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                >
                  <EllipsisVertical
                    className="size-4"
                    strokeWidth={NAV_ICON_STROKE_WIDTH}
                    aria-hidden="true"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                side="top"
                className="w-36 rounded-[5px] p-1"
              >
                <DropdownMenuItem
                  onClick={onLogout}
                  className="cursor-pointer rounded-[5px] text-xs font-medium text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <LogOut
                    className="mr-2 size-3.5"
                    strokeWidth={NAV_ICON_STROKE_WIDTH}
                  />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex w-full justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label={`User menu for ${user?.name ?? "Account"}`}
                  className="flex size-9 shrink-0 items-center justify-center rounded-[5px] bg-muted text-xs font-semibold text-foreground outline-none transition-all hover:ring-2 hover:ring-sidebar-ring focus-visible:ring-2 focus-visible:ring-sidebar-ring select-none"
                >
                  {initials}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                side="right"
                className="w-36 rounded-[5px] p-1"
              >
                <DropdownMenuItem
                  onClick={onLogout}
                  className="cursor-pointer rounded-[5px] text-xs font-medium text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <LogOut
                    className="mr-2 size-3.5"
                    strokeWidth={NAV_ICON_STROKE_WIDTH}
                  />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </SidebarFooter>
    </ShadcnSidebar>
  );
}

export function Sidebar(props: SidebarProps) {
  // If rendered inside a SidebarProvider, render directly.
  // Otherwise, wrap in a local SidebarProvider so tests and standalone usage work seamlessly.
  return (
    <SidebarWrapper {...props}>
      <SidebarInner {...props} />
    </SidebarWrapper>
  );
}

function SidebarWrapper({
  children,
  defaultCollapsed,
  collapsed,
  className,
}: SidebarProps & { children: React.ReactNode }) {
  const context = useSidebarSafe();
  if (context) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider
      className={cn("h-full", className)}
      open={collapsed !== undefined ? !collapsed : undefined}
      defaultOpen={
        defaultCollapsed === undefined && collapsed === undefined
          ? true
          : !(defaultCollapsed || collapsed)
      }
    >
      {children}
    </SidebarProvider>
  );
}
