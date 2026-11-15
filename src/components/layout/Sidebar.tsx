"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  Monitor,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Shield,
  Sun,
} from "lucide-react";
import {
  filterNavigationByAbilities,
  hasActiveChild,
  isNavItemActive,
  type NavItem,
  type NavSection,
  ROUTES,
  SIDEBAR_NAV_SECTIONS,
} from "@/config/navigation";
import { Button } from "@/components/ui/button";
import { BrandLogoIcon } from "@/components/shared/BrandLogo";
import { useTheme } from "@/components/shared/theme-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const emptySubscribe = () => () => {};

function SidebarThemeSelector({ isCollapsed }: { isCollapsed: boolean }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const activeTheme = mounted ? (theme ?? "system") : "system";
  const themeLabel =
    activeTheme === "system"
      ? "System"
      : activeTheme === "dark"
        ? "Dark"
        : "Light";

  const isDark =
    mounted && (resolvedTheme === "dark" || activeTheme === "dark");
  const ThemeIcon = !mounted ? Monitor : isDark ? Moon : Sun;

  if (isCollapsed) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            aria-label={`Theme: ${themeLabel}`}
          >
            <ThemeIcon className="size-4" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-36">
          <DropdownMenuItem onClick={() => setTheme("system")}>
            <Monitor className="mr-2 size-3.5" />
            <span>System</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("light")}>
            <Sun className="mr-2 size-3.5" />
            <span>Light</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")}>
            <Moon className="mr-2 size-3.5" />
            <span>Dark</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-lg border border-border/70 bg-muted/30 px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          aria-label={`Theme: ${themeLabel}`}
        >
          <span className="flex items-center gap-2">
            <ThemeIcon className="size-3.5 shrink-0" aria-hidden="true" />
            <span>Theme: {themeLabel}</span>
          </span>
          <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="mr-2 size-3.5" />
          <span>System</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 size-3.5" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 size-3.5" />
          <span>Dark</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export interface SidebarProps {
  /** Controlled collapsed state for desktop icon rail mode */
  collapsed?: boolean;
  /** Uncontrolled initial collapsed state */
  defaultCollapsed?: boolean;
  /** Callback invoked when collapse state changes */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Override navigation sections (defaults to customer SIDEBAR_NAV_SECTIONS) */
  sections?: NavSection[];
  /** Granted user abilities for permission-aware filtering */
  abilities?: readonly string[];
  /** Optional pathname override (defaults to Next.js usePathname) */
  pathname?: string;
  /** Callback fired after clicking a navigation link (e.g. to close mobile drawer) */
  onNavigate?: () => void;
  /** Whether to show the desktop collapse/expand button */
  showCollapseToggle?: boolean;
  className?: string;
}

export function Sidebar({
  collapsed: controlledCollapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  sections = SIDEBAR_NAV_SECTIONS,
  abilities,
  pathname: pathnameProp,
  onNavigate,
  showCollapseToggle = true,
  className,
}: SidebarProps) {
  const routerPathname = usePathname();
  const currentPath = pathnameProp ?? routerPathname ?? ROUTES.OVERVIEW;

  const [internalCollapsed, setInternalCollapsed] =
    React.useState(defaultCollapsed);
  const isCollapsed = controlledCollapsed ?? internalCollapsed;

  const setCollapsed = React.useCallback(
    (next: boolean) => {
      if (controlledCollapsed === undefined) {
        setInternalCollapsed(next);
      }
      onCollapsedChange?.(next);
    },
    [controlledCollapsed, onCollapsedChange]
  );

  const visibleSections = React.useMemo(
    () => filterNavigationByAbilities(sections, abilities),
    [sections, abilities]
  );

  // Track manually toggled nested groups; active child groups default to open per path
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>(
    {}
  );
  const [pathToggles, setPathToggles] = React.useState<{
    path: string;
    overrides: Record<string, boolean>;
  }>({ path: currentPath, overrides: {} });

  const isGroupOpen = React.useCallback(
    (item: NavItem): boolean => {
      if (hasActiveChild(item, currentPath)) {
        if (
          pathToggles.path === currentPath &&
          item.id in pathToggles.overrides
        ) {
          return Boolean(pathToggles.overrides[item.id]);
        }
        return true;
      }
      return Boolean(openGroups[item.id]);
    },
    [currentPath, openGroups, pathToggles]
  );

  const toggleGroup = (item: NavItem) => {
    if (isCollapsed) {
      setCollapsed(false);
      setOpenGroups((prev) => ({ ...prev, [item.id]: true }));
      if (hasActiveChild(item, currentPath)) {
        setPathToggles((prev) => ({
          path: currentPath,
          overrides: {
            ...(prev.path === currentPath ? prev.overrides : {}),
            [item.id]: true,
          },
        }));
      }
      return;
    }

    const nextOpen = !isGroupOpen(item);
    setOpenGroups((prev) => ({ ...prev, [item.id]: nextOpen }));
    if (hasActiveChild(item, currentPath)) {
      setPathToggles((prev) => ({
        path: currentPath,
        overrides: {
          ...(prev.path === currentPath ? prev.overrides : {}),
          [item.id]: nextOpen,
        },
      }));
    }
  };

  const renderLeafLink = (item: NavItem, isChild = false) => {
    const active = isNavItemActive(item, currentPath);
    const Icon = item.icon;
    const href = item.href ?? ROUTES.OVERVIEW;

    return (
      <Link
        key={item.id}
        href={href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        aria-label={isCollapsed ? item.label : undefined}
        title={isCollapsed ? item.label : undefined}
        className={cn(
          "focus-visible:ring-ring flex items-center gap-3 rounded-lg text-sm transition-all focus-visible:ring-1 focus-visible:outline-none",
          isCollapsed && !isChild
            ? "mx-auto h-9 w-9 justify-center px-0"
            : isChild
              ? "py-2 pr-3 pl-9 text-xs"
              : "px-3 py-2",
          active
            ? "bg-primary/10 text-primary font-medium hover:bg-primary/15"
            : "text-muted-foreground hover:bg-muted/70 hover:text-foreground font-normal"
        )}
      >
        {Icon && (
          <Icon
            className={cn(
              "h-4 w-4 shrink-0 transition-transform",
              active ? "text-primary" : "text-muted-foreground"
            )}
            aria-hidden="true"
          />
        )}
        {(!isCollapsed || isChild) && (
          <span className="truncate">{item.label}</span>
        )}
      </Link>
    );
  };

  const renderGroupItem = (item: NavItem) => {
    const isChildActive = hasActiveChild(item, currentPath);
    const isOpen = isGroupOpen(item);
    const Icon = item.icon;
    const submenuId = `sidebar-submenu-${item.id}`;

    return (
      <div key={item.id} className="space-y-1">
        <button
          type="button"
          onClick={() => toggleGroup(item)}
          aria-expanded={!isCollapsed && isOpen}
          aria-controls={!isCollapsed ? submenuId : undefined}
          aria-label={isCollapsed ? item.label : undefined}
          title={isCollapsed ? item.label : undefined}
          className={cn(
            "focus-visible:ring-ring flex w-full items-center rounded-md text-sm transition-colors focus-visible:ring-1 focus-visible:outline-none",
            isCollapsed
              ? "mx-auto h-9 w-9 justify-center px-0"
              : "justify-between px-3 py-2",
            isChildActive
              ? "bg-muted text-primary font-medium"
              : "text-muted-foreground hover:bg-muted hover:text-foreground font-normal"
          )}
        >
          <span className="flex min-w-0 items-center gap-3">
            {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />}
            {!isCollapsed && <span className="truncate">{item.label}</span>}
          </span>
          {!isCollapsed &&
            (isOpen ? (
              <ChevronDown
                className="text-muted-foreground h-4 w-4 shrink-0"
                aria-hidden="true"
              />
            ) : (
              <ChevronRight
                className="text-muted-foreground h-4 w-4 shrink-0"
                aria-hidden="true"
              />
            ))}
        </button>

        {!isCollapsed && isOpen && item.children && (
          <div id={submenuId} className="space-y-1">
            {item.children.map((child) => renderLeafLink(child, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      aria-label="Sidebar navigation"
      data-collapsed={isCollapsed ? "true" : "false"}
      className={cn(
        "border-border/70 bg-card/60 text-foreground flex h-full flex-col border-r backdrop-blur-md transition-[width] duration-150",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Brand header & desktop collapse toggle */}
      <div
        className={cn(
          "border-border/70 flex h-14 shrink-0 items-center border-b px-3",
          isCollapsed ? "justify-center" : "justify-between"
        )}
      >
        <Link
          href={ROUTES.OVERVIEW}
          onClick={onNavigate}
          aria-label="Korak Digitals Home"
          className={cn(
            "focus-visible:ring-ring flex items-center gap-2.5 rounded-lg focus-visible:ring-1 focus-visible:outline-none",
            isCollapsed && "justify-center"
          )}
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-card shadow-xs">
            <BrandLogoIcon className="h-5 w-5 shrink-0" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-foreground text-sm font-bold tracking-tight">
                Korak Digitals
              </span>
              <span className="text-muted-foreground flex items-center gap-1 text-[10px] font-medium">
                <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                Verified Portal
              </span>
            </div>
          )}
        </Link>

        {showCollapseToggle && !isCollapsed && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(true)}
            aria-label="Collapse sidebar"
            aria-expanded="true"
            className="text-muted-foreground hover:text-foreground h-8 w-8"
          >
            <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </div>

      {/* Expand button below header when collapsed */}
      {showCollapseToggle && isCollapsed && (
        <div className="border-border/70 flex justify-center border-b py-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(false)}
            aria-label="Expand sidebar"
            aria-expanded="false"
            className="text-muted-foreground hover:text-foreground h-8 w-8"
          >
            <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      )}

      {/* Navigation Sections */}
      <nav
        aria-label="Primary navigation"
        className="flex-1 space-y-5 overflow-y-auto px-2.5 py-4"
      >
        {visibleSections.map((section, idx) => (
          <div
            key={section.id}
            className={cn(
              "space-y-1",
              isCollapsed && idx > 0 && "border-border/70 border-t pt-4"
            )}
          >
            {section.label && !isCollapsed && (
              <div className="text-muted-foreground/80 px-3 pb-1 text-[11px] font-semibold tracking-wider uppercase">
                {section.label}
              </div>
            )}

            <div className="space-y-1">
              {section.items.map((item) =>
                item.children && item.children.length > 0
                  ? renderGroupItem(item)
                  : renderLeafLink(item)
              )}
            </div>
          </div>
        ))}
      </nav>

      {/* Sidebar Footer with Trust Badge & Theme Selector */}
      {!isCollapsed ? (
        <div className="mt-auto space-y-2.5 border-t border-border/70 p-3">
          {/* Secure & Reliable Card */}
          <div className="rounded-xl border border-border/70 bg-primary/[0.04] p-3 text-xs dark:bg-primary/[0.08]">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Shield className="size-3.5" aria-hidden="true" />
              </div>
              <span className="font-semibold text-foreground text-xs">
                Secure & Reliable
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Your transactions are always protected with Korak.
            </p>
          </div>

          {/* Theme Selector */}
          <SidebarThemeSelector isCollapsed={false} />
        </div>
      ) : (
        <div className="mt-auto flex flex-col items-center gap-2 border-t border-border/70 py-3">
          <SidebarThemeSelector isCollapsed={true} />
        </div>
      )}
    </aside>
  );
}
