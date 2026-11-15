import { describe, expect, it } from "vitest";
import {
  filterNavigationByAbilities,
  findActiveNavItem,
  getBreadcrumbs,
  hasActiveChild,
  isNavItemActive,
  type NavSection,
  ROUTES,
  SIDEBAR_NAV_SECTIONS,
  USER_MENU_ITEMS,
} from "./navigation";

describe("Navigation Configuration (config/navigation)", () => {
  describe("Single source routes and definitions", () => {
    it("uses valid kebab-case paths across all routes", () => {
      for (const route of Object.values(ROUTES)) {
        expect(route.startsWith("/")).toBe(true);
        expect(route).toBe(route.toLowerCase());
        expect(route).not.toContain("_");
      }
    });

    it("includes all required customer navigation items", () => {
      const allLabels = SIDEBAR_NAV_SECTIONS.flatMap((section) =>
        section.items.flatMap((item) => [
          item.label,
          ...(item.children?.map((child) => child.label) ?? []),
        ])
      );

      expect(allLabels).toContain("Account Overview");
      expect(allLabels).toContain("Airtime");
      expect(allLabels).toContain("Data");
      expect(allLabels).toContain("VPN");
      expect(allLabels).toContain("Buy VPN");
      expect(allLabels).toContain("VPN Logs");
      expect(allLabels).toContain("Social Media");
      expect(allLabels).toContain("Buy Account");
      expect(allLabels).toContain("Boost Account");
      expect(allLabels).toContain("Orders");
      expect(allLabels).toContain("Transactions");
      expect(allLabels).toContain("Notifications");
      expect(allLabels).toContain("Settings");
      expect(allLabels).toContain("Profile");
    });

    it("aligns user menu links with customer routes", () => {
      const hrefs = USER_MENU_ITEMS.map((item) => item.href);
      expect(hrefs).toContain(ROUTES.PROFILE);
      expect(hrefs).toContain(ROUTES.SETTINGS);
    });
  });

  describe("Active state matching", () => {
    it("matches overview exactly without matching unrelated paths", () => {
      const overviewItem = SIDEBAR_NAV_SECTIONS[0].items[0];
      expect(isNavItemActive(overviewItem, "/overview")).toBe(true);
      expect(isNavItemActive(overviewItem, "/overview/")).toBe(true);
      expect(isNavItemActive(overviewItem, "/overview/stats")).toBe(false);
      expect(isNavItemActive(overviewItem, "/orders")).toBe(false);
    });

    it("matches nested detail paths to parent section when exact is not set", () => {
      const ordersItem = findActiveNavItem("/orders/ord_123");
      expect(ordersItem?.id).toBe("orders");

      const txItem = findActiveNavItem("/transactions/txn_456");
      expect(txItem?.id).toBe("transactions");
    });

    it("distinguishes nested siblings correctly (/vpn vs /vpn/logs)", () => {
      const vpnGroup = SIDEBAR_NAV_SECTIONS[1].items.find(
        (i) => i.id === "vpn"
      )!;
      const buyVpnItem = vpnGroup.children![0];
      const vpnLogsItem = vpnGroup.children![1];

      expect(isNavItemActive(buyVpnItem, "/vpn")).toBe(true);
      expect(isNavItemActive(buyVpnItem, "/vpn/logs")).toBe(false);
      expect(isNavItemActive(vpnLogsItem, "/vpn/logs")).toBe(true);

      expect(hasActiveChild(vpnGroup, "/vpn")).toBe(true);
      expect(hasActiveChild(vpnGroup, "/vpn/logs")).toBe(true);
      expect(hasActiveChild(vpnGroup, "/airtime")).toBe(false);
    });
  });

  describe("Breadcrumb resolution", () => {
    it("returns single Overview crumb when on /overview", () => {
      expect(getBreadcrumbs("/overview")).toEqual([
        { label: "Overview", href: ROUTES.OVERVIEW, isCurrent: true },
      ]);
    });

    it("resolves top-level customer service routes with Overview parent", () => {
      expect(getBreadcrumbs("/airtime")).toEqual([
        { label: "Overview", href: ROUTES.OVERVIEW, isCurrent: false },
        { label: "Airtime", href: ROUTES.AIRTIME, isCurrent: true },
      ]);
    });

    it("resolves nested group routes preserving group hierarchy", () => {
      expect(getBreadcrumbs("/vpn/logs")).toEqual([
        { label: "Overview", href: ROUTES.OVERVIEW, isCurrent: false },
        { label: "VPN", href: undefined, isCurrent: false },
        { label: "VPN Logs", href: ROUTES.VPN_LOGS, isCurrent: true },
      ]);

      expect(getBreadcrumbs("/social-media/boost")).toEqual([
        { label: "Overview", href: ROUTES.OVERVIEW, isCurrent: false },
        { label: "Social Media", href: undefined, isCurrent: false },
        {
          label: "Boost Account",
          href: ROUTES.SOCIAL_MEDIA_BOOST,
          isCurrent: true,
        },
      ]);
    });

    it("resolves dynamic detail routes with default or overridden detail labels", () => {
      expect(getBreadcrumbs("/orders/ord_01JABC")).toEqual([
        { label: "Overview", href: ROUTES.OVERVIEW, isCurrent: false },
        { label: "Orders", href: ROUTES.ORDERS, isCurrent: false },
        {
          label: "Order Details",
          href: "/orders/ord_01JABC",
          isCurrent: true,
        },
      ]);

      expect(
        getBreadcrumbs("/orders/ord_01JABC", {
          detailLabel: "Order #ord_01JABC",
        })
      ).toEqual([
        { label: "Overview", href: ROUTES.OVERVIEW, isCurrent: false },
        { label: "Orders", href: ROUTES.ORDERS, isCurrent: false },
        {
          label: "Order #ord_01JABC",
          href: "/orders/ord_01JABC",
          isCurrent: true,
        },
      ]);
    });
  });

  describe("Permission-aware filtering", () => {
    const restrictedSections: NavSection[] = [
      {
        id: "main",
        label: "Main",
        items: [
          { id: "public", label: "Public", href: "/public" },
          {
            id: "restricted",
            label: "Restricted",
            href: "/restricted",
            requiredAbility: "view_reports",
          },
          {
            id: "group",
            label: "Group",
            children: [
              {
                id: "child-restricted",
                label: "Child Restricted",
                href: "/group/child",
                requiredAbility: "manage_group",
              },
            ],
          },
        ],
      },
    ];

    it("hides items requiring abilities when abilities are missing (deny by default)", () => {
      const filtered = filterNavigationByAbilities(restrictedSections);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].items.map((i) => i.id)).toEqual(["public"]);
    });

    it("shows items whose requiredAbility is present", () => {
      const filtered = filterNavigationByAbilities(restrictedSections, [
        "view_reports",
      ]);
      expect(filtered[0].items.map((i) => i.id)).toEqual([
        "public",
        "restricted",
      ]);
    });

    it("reveals group when nested child ability is granted or wildcard '*' is present", () => {
      const filtered = filterNavigationByAbilities(restrictedSections, ["*"]);
      expect(filtered[0].items.map((i) => i.id)).toEqual([
        "public",
        "restricted",
        "group",
      ]);
      expect(filtered[0].items[2].children).toHaveLength(1);
    });
  });
});
