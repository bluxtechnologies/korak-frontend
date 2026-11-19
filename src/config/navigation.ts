import {
  Headphones,
  LayoutDashboard,
  MessageSquareText,
  Package,
  ReceiptText,
  Settings,
  Smartphone,
  UserRound,
  Wallet,
  Wifi,
  type LucideIcon,
} from "lucide-react";

/**
 * Standard Lucide icon stroke width for consistent sidebar and navigation styling.
 * Locked per F5.1 specification: about 1.75.
 */
export const NAV_ICON_STROKE_WIDTH = 1.75;

/**
 * Navigation item specification for F5.1.
 * Typed single source of truth for the dashboard sidebar and breadcrumbs.
 * Supports up to one optional nesting level (children) for future expansion.
 * No permission logic is attached here (roles are OPEN per Doc 13).
 */
export interface NavItem {
  id?: string;
  label: string;
  href: string;
  icon: LucideIcon;
  children?: NavItem[];
}

/**
 * Single source of truth for application route paths.
 * Route segments use kebab-case per docs/09-frontend-standards.md §11.
 */
export const ROUTES = {
  // Public guest routes (landing & legal)
  HOME: "/",
  PRIVACY: "/privacy",
  TERMS: "/terms",

  // Customer dashboard routes (F5.1 order)
  DASHBOARD: "/overview",
  OVERVIEW: "/overview",
  WALLET: "/wallet",
  AIRTIME: "/airtime",
  DATA: "/data",
  NUMBERS: "/numbers",
  ORDERS: "/orders",
  TRANSACTIONS: "/transactions",
  PROFILE: "/profile",
  SETTINGS: "/settings",
  MENU: "/menu",

  // Additional feature routes
  NOTIFICATIONS: "/notifications",
  SERVICES: "/services",
  VPN: "/vpn",
  VPN_LOGS: "/vpn/logs",
  SOCIAL_MEDIA_BUY: "/social-media/buy",
  SOCIAL_MEDIA_BOOST: "/social-media/boost",
  SUPPORT: "/support",
  NUMBERS_OTP: "/numbers/otp",
  RENT_NUMBERS: "/numbers/rent",

  // Auth routes (not displayed in authenticated sidebar navigation)
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  VERIFY_DEVICE: "/verify-device",
  SESSION_EXPIRED: "/session-expired",
} as const;

/**
 * Flat main section navigation items (F5.1).
 * Exactly 7 items in specified order.
 */
export const MAIN_NAV_ITEMS: NavItem[] = [
  {
    id: "overview",
    label: "Overview",
    href: ROUTES.OVERVIEW,
    icon: LayoutDashboard,
  },
  {
    id: "wallet",
    label: "Wallet",
    href: ROUTES.WALLET,
    icon: Wallet,
  },
  {
    id: "airtime",
    label: "Airtime",
    href: ROUTES.AIRTIME,
    icon: Smartphone,
  },
  {
    id: "data",
    label: "Data",
    href: ROUTES.DATA,
    icon: Wifi,
  },
  {
    id: "numbers",
    label: "Numbers Activation",
    href: ROUTES.NUMBERS,
    icon: MessageSquareText,
  },
  {
    id: "orders",
    label: "Orders",
    href: ROUTES.ORDERS,
    icon: Package,
  },
  {
    id: "transactions",
    label: "Transactions",
    href: ROUTES.TRANSACTIONS,
    icon: ReceiptText,
  },
];

/**
 * Bottom section navigation items (F5.1), placed after a 1px divider.
 * Profile, Support, Settings.
 */
export const BOTTOM_NAV_ITEMS: NavItem[] = [
  {
    id: "profile",
    label: "Profile",
    href: ROUTES.PROFILE,
    icon: UserRound,
  },
  {
    id: "support",
    label: "Support",
    href: ROUTES.SUPPORT,
    icon: Headphones,
  },
  {
    id: "settings",
    label: "Settings",
    href: ROUTES.SETTINGS,
    icon: Settings,
  },
];

export interface DashboardNavConfig {
  main: NavItem[];
  bottom: NavItem[];
}

export const DASHBOARD_NAV: DashboardNavConfig = {
  main: MAIN_NAV_ITEMS,
  bottom: BOTTOM_NAV_ITEMS,
};

export const ALL_NAV_ITEMS: NavItem[] = [
  ...MAIN_NAV_ITEMS,
  ...BOTTOM_NAV_ITEMS,
];

/**
 * Determines whether a given navigation item is active for the current pathname.
 */
export function isNavItemActive(href: string, pathname: string): boolean {
  if (href === "/overview" || href === "/dashboard") {
    return (
      pathname === "/dashboard" ||
      pathname === "/overview" ||
      pathname === "/dashboard/" ||
      pathname === "/overview/"
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Checks whether any child of a navigation item matches the pathname.
 */
export function hasActiveChild(item: NavItem, pathname: string): boolean {
  if (!item.children || item.children.length === 0) return false;
  return item.children.some((child) => isNavItemActive(child.href, pathname));
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrent: boolean;
}

/**
 * Helper to build breadcrumb trails for current routes.
 */
export function getBreadcrumbs(
  pathname: string,
  options?: { detailLabel?: string }
): BreadcrumbItem[] {
  const normalized = pathname.replace(/\/$/, "") || "/";
  if (normalized === "/dashboard" || normalized === "/overview") {
    return [{ label: "Overview", href: ROUTES.OVERVIEW, isCurrent: true }];
  }

  const crumbs: BreadcrumbItem[] = [
    { label: "Overview", href: ROUTES.OVERVIEW, isCurrent: false },
  ];

  // Check matching main or bottom nav item
  const found = ALL_NAV_ITEMS.find((item) =>
    normalized === item.href || normalized.startsWith(`${item.href}/`)
  );

  if (found) {
    if (normalized === found.href) {
      crumbs.push({ label: found.label, href: found.href, isCurrent: true });
    } else {
      crumbs.push({ label: found.label, href: found.href, isCurrent: false });
      // Nested sub-path
      const subpath =
        options?.detailLabel ?? normalized.slice(found.href.length + 1);
      crumbs.push({ label: subpath, isCurrent: true });
    }
  } else {
    crumbs.push({
      label: options?.detailLabel ?? normalized.replace(/^\//, ""),
      isCurrent: true,
    });
  }

  return crumbs;
}

// User menu items for Topbar compatibility
export const USER_MENU_ITEMS: NavItem[] = [
  {
    id: "profile",
    label: "Profile",
    href: ROUTES.PROFILE,
    icon: UserRound,
  },
  {
    id: "settings",
    label: "Settings",
    href: ROUTES.SETTINGS,
    icon: Settings,
  },
];

// Compatibility interface for legacy sections if needed
export interface NavSection {
  id: string;
  label?: string;
  items: NavItem[];
}

export const SIDEBAR_NAV_SECTIONS: NavSection[] = [
  {
    id: "main",
    items: MAIN_NAV_ITEMS,
  },
  {
    id: "bottom",
    items: BOTTOM_NAV_ITEMS,
  },
];

export function filterNavigationByAbilities(
  sections: NavSection[],
  _abilities?: readonly string[]
): NavSection[] {
  // Roles and abilities are OPEN per Doc 13; no filtering is applied
  return sections;
}
