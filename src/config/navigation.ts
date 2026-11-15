import {
  Bell,
  Clock,
  Globe,
  Hash,
  Headphones,
  Home,
  LayoutGrid,
  Phone,
  ReceiptText,
  Settings,
  Share2,
  Shield,
  TrendingUp,
  User,
  Users,
  Wallet,
  Wifi,
  type LucideIcon,
} from "lucide-react";

/**
 * Single source of truth for application route paths.
 * Route segments use kebab-case per docs/09-frontend-standards.md §11.
 */
export const ROUTES = {
  // Public guest routes (landing & legal)
  HOME: "/",
  PRIVACY: "/privacy",
  TERMS: "/terms",
  // Customer dashboard routes
  OVERVIEW: "/overview",
  SERVICES: "/services",
  AIRTIME: "/airtime",
  DATA: "/data",
  VPN: "/vpn",
  VPN_LOGS: "/vpn/logs",
  SOCIAL_MEDIA_BUY: "/social-media/buy",
  SOCIAL_MEDIA_BOOST: "/social-media/boost",
  ORDERS: "/orders",
  TRANSACTIONS: "/transactions",
  WALLET: "/wallet",
  SUPPORT: "/support",
  NOTIFICATIONS: "/notifications",
  SETTINGS: "/settings",
  PROFILE: "/profile",
  // Auth routes (not displayed in authenticated sidebar navigation)
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  VERIFY_DEVICE: "/verify-device",
  SESSION_EXPIRED: "/session-expired",
} as const;

export interface NavItem {
  id: string;
  label: string;
  href?: string;
  icon?: LucideIcon;
  exact?: boolean;
  requiredAbility?: string;
  detailLabel?: string;
  children?: NavItem[];
}

export interface NavSection {
  id: string;
  label?: string;
  items: NavItem[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrent: boolean;
}

/**
 * Customer dashboard navigation sections.
 * Structured into OVERVIEW, SERVICES, and ACCOUNT groups
 * matching the production dashboard layout design reference.
 */
export const SIDEBAR_NAV_SECTIONS: NavSection[] = [
  {
    id: "overview",
    label: "Overview",
    items: [
      {
        id: "overview",
        label: "Home",
        href: ROUTES.OVERVIEW,
        icon: Home,
        exact: true,
      },
      {
        id: "services-index",
        label: "Services",
        href: ROUTES.AIRTIME,
        icon: LayoutGrid,
      },
    ],
  },
  {
    id: "services",
    label: "Services",
    items: [
      {
        id: "numbers-otp",
        label: "Numbers (OTP)",
        href: ROUTES.AIRTIME,
        icon: Hash,
      },
      {
        id: "rent-numbers",
        label: "Rent Numbers",
        href: ROUTES.AIRTIME,
        icon: Clock,
      },
      {
        id: "data",
        label: "Mobile Data",
        href: ROUTES.DATA,
        icon: Wifi,
      },
      {
        id: "airtime",
        label: "Airtime",
        href: ROUTES.AIRTIME,
        icon: Phone,
      },
      {
        id: "social-growth",
        label: "Social Growth",
        href: ROUTES.SOCIAL_MEDIA_BOOST,
        icon: TrendingUp,
      },
      {
        id: "social-accounts",
        label: "Social Accounts",
        href: ROUTES.SOCIAL_MEDIA_BUY,
        icon: Users,
      },
      {
        id: "vpn",
        label: "VPN",
        icon: Shield,
        children: [
          {
            id: "vpn-buy",
            label: "Buy VPN",
            href: ROUTES.VPN,
            exact: true,
          },
          {
            id: "vpn-logs",
            label: "VPN Logs",
            href: ROUTES.VPN_LOGS,
          },
        ],
      },
      {
        id: "esim",
        label: "eSIM",
        href: ROUTES.AIRTIME,
        icon: Globe,
      },
    ],
  },
  {
    id: "account",
    label: "Account",
    items: [
      {
        id: "transactions",
        label: "Transactions",
        href: ROUTES.TRANSACTIONS,
        icon: ReceiptText,
        detailLabel: "Transaction Details",
      },
      {
        id: "wallet",
        label: "Wallet",
        href: ROUTES.OVERVIEW,
        icon: Wallet,
      },
      {
        id: "support",
        label: "Support",
        href: ROUTES.SETTINGS,
        icon: Headphones,
      },
      {
        id: "settings",
        label: "Settings",
        href: ROUTES.SETTINGS,
        icon: Settings,
      },
    ],
  },
];

/**
 * Top bar user dropdown menu links derived from the same route registry.
 */
export const USER_MENU_ITEMS: NavItem[] = [
  {
    id: "user-profile",
    label: "Profile",
    href: ROUTES.PROFILE,
    icon: User,
  },
  {
    id: "user-settings",
    label: "Settings",
    href: ROUTES.SETTINGS,
    icon: Settings,
  },
];

function normalizePath(path: string): string {
  if (!path || path === "/") return "/";
  return path.replace(/\/+$/, "");
}

function matchRoute(href: string, pathname: string, exact = false): boolean {
  const normalizedHref = normalizePath(href);
  const normalizedPath = normalizePath(pathname);

  if (exact || normalizedHref === "/") {
    return normalizedPath === normalizedHref;
  }

  return (
    normalizedPath === normalizedHref ||
    normalizedPath.startsWith(`${normalizedHref}/`)
  );
}

/**
 * Checks whether a single nav item directly matches the active pathname.
 */
export function isNavItemActive(item: NavItem, pathname: string): boolean {
  if (!item.href) {
    return false;
  }
  return matchRoute(item.href, pathname, item.exact);
}

/**
 * Checks whether any descendant of a parent nav item matches the active pathname.
 */
export function hasActiveChild(item: NavItem, pathname: string): boolean {
  if (!item.children || item.children.length === 0) {
    return false;
  }
  return item.children.some(
    (child) =>
      isNavItemActive(child, pathname) || hasActiveChild(child, pathname)
  );
}

/**
 * Filters navigation sections according to granted user abilities.
 * Items with a `requiredAbility` are excluded unless matched (deny by default).
 */
export function filterNavigationByAbilities(
  sections: NavSection[],
  abilities?: readonly string[]
): NavSection[] {
  const hasAbility = (required?: string): boolean => {
    if (!required) return true;
    if (!abilities || abilities.length === 0) return false;
    return abilities.includes("*") || abilities.includes(required);
  };

  const filterItems = (items: NavItem[]): NavItem[] => {
    return items.reduce<NavItem[]>((acc, item) => {
      if (!hasAbility(item.requiredAbility)) {
        return acc;
      }

      if (item.children) {
        const filteredChildren = filterItems(item.children);
        if (filteredChildren.length === 0 && !item.href) {
          return acc;
        }
        acc.push({ ...item, children: filteredChildren });
      } else {
        acc.push(item);
      }

      return acc;
    }, []);
  };

  return sections
    .map((section) => ({
      ...section,
      items: filterItems(section.items),
    }))
    .filter((section) => section.items.length > 0);
}

interface MatchedPathTrail {
  trail: NavItem[];
  matchedItem: NavItem;
}

function findMatchedTrail(
  items: NavItem[],
  pathname: string,
  ancestors: NavItem[] = []
): MatchedPathTrail | null {
  for (const item of items) {
    const currentTrail = [...ancestors, item];

    // Prefer deeper child match first
    if (item.children && item.children.length > 0) {
      const childMatch = findMatchedTrail(
        item.children,
        pathname,
        currentTrail
      );
      if (childMatch) {
        return childMatch;
      }
    }

    if (isNavItemActive(item, pathname)) {
      return { trail: currentTrail, matchedItem: item };
    }
  }

  return null;
}

/**
 * Returns the deepest matching NavItem for a given pathname.
 */
export function findActiveNavItem(
  pathname: string,
  sections: NavSection[] = SIDEBAR_NAV_SECTIONS
): NavItem | null {
  for (const section of sections) {
    const match = findMatchedTrail(section.items, pathname);
    if (match) {
      return match.matchedItem;
    }
  }
  return null;
}

/**
 * Resolves the breadcrumb trail for any pathname using SIDEBAR_NAV_SECTIONS.
 * Prepends Account Overview as the root dashboard crumb and handles nested detail routes.
 */
export function getBreadcrumbs(
  pathname: string,
  options?: {
    detailLabel?: string;
    sections?: NavSection[];
  }
): BreadcrumbItem[] {
  const normalizedPath = normalizePath(pathname);
  const sections = options?.sections ?? SIDEBAR_NAV_SECTIONS;

  const overviewRoot: BreadcrumbItem = {
    label: "Overview",
    href: ROUTES.OVERVIEW,
    isCurrent: normalizedPath === normalizePath(ROUTES.OVERVIEW),
  };

  if (overviewRoot.isCurrent) {
    return [overviewRoot];
  }

  let match: MatchedPathTrail | null = null;
  for (const section of sections) {
    match = findMatchedTrail(section.items, normalizedPath);
    if (match) break;
  }

  if (!match) {
    return [{ ...overviewRoot, isCurrent: false }];
  }

  const matchedHref = match.matchedItem.href
    ? normalizePath(match.matchedItem.href)
    : null;
  const isDetailRoute =
    matchedHref !== null &&
    normalizedPath !== matchedHref &&
    normalizedPath.startsWith(`${matchedHref}/`);

  const trailCrumbs: BreadcrumbItem[] = match.trail.map((item, idx) => {
    const isLastMatched = idx === match.trail.length - 1;
    return {
      label: item.label,
      href: item.href,
      isCurrent: isLastMatched && !isDetailRoute,
    };
  });

  if (isDetailRoute) {
    trailCrumbs.push({
      label: options?.detailLabel ?? match.matchedItem.detailLabel ?? "Details",
      href: normalizedPath,
      isCurrent: true,
    });
  }

  return [{ ...overviewRoot, isCurrent: false }, ...trailCrumbs];
}
