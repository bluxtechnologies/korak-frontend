import { describe, expect, it } from "vitest";
import {
  ALL_NAV_ITEMS,
  BOTTOM_NAV_ITEMS,
  DASHBOARD_NAV,
  MAIN_NAV_ITEMS,
  NAV_ICON_STROKE_WIDTH,
  ROUTES,
  USER_MENU_ITEMS,
  getBreadcrumbs,
  hasActiveChild,
  isNavItemActive,
} from "./navigation";

describe("Navigation Configuration (F5.1: src/config/navigation.ts)", () => {
  describe("Single source routes and definitions", () => {
    it("uses valid kebab-case paths across all routes", () => {
      for (const route of Object.values(ROUTES)) {
        expect(route).toMatch(/^\/[a-z0-9\-/]*$/);
        expect(route).not.toContain("_");
      }
    });

    it("has exact 7 main items in the specified order with correct hrefs", () => {
      expect(MAIN_NAV_ITEMS).toHaveLength(7);

      const expectedMain = [
        { label: "Overview", href: "/overview" },
        { label: "Wallet", href: "/wallet" },
        { label: "Airtime", href: "/airtime" },
        { label: "Data", href: "/data" },
        { label: "Numbers Activation", href: "/numbers" },
        { label: "Orders", href: "/orders" },
        { label: "Transactions", href: "/transactions" },
      ];

      MAIN_NAV_ITEMS.forEach((item, index) => {
        expect(item.label).toBe(expectedMain[index].label);
        expect(item.href).toBe(expectedMain[index].href);
        expect(item.icon).toBeDefined();
      });
    });

    it("has exact 3 bottom items in the specified order with correct hrefs", () => {
      expect(BOTTOM_NAV_ITEMS).toHaveLength(3);

      const expectedBottom = [
        { label: "Profile", href: "/profile" },
        { label: "Support", href: "/support" },
        { label: "Settings", href: "/settings" },
      ];

      BOTTOM_NAV_ITEMS.forEach((item, index) => {
        expect(item.label).toBe(expectedBottom[index].label);
        expect(item.href).toBe(expectedBottom[index].href);
        expect(item.icon).toBeDefined();
      });
    });

    it("uses locked stroke width about 1.75 across icons", () => {
      expect(NAV_ICON_STROKE_WIDTH).toBe(1.75);
    });

    it("contains total 10 navigation items in DASHBOARD_NAV and ALL_NAV_ITEMS", () => {
      expect(DASHBOARD_NAV.main).toBe(MAIN_NAV_ITEMS);
      expect(DASHBOARD_NAV.bottom).toBe(BOTTOM_NAV_ITEMS);
      expect(ALL_NAV_ITEMS).toHaveLength(10);
    });

    it("aligns user menu links with customer routes", () => {
      const hrefs = USER_MENU_ITEMS.map((item) => item.href);
      expect(hrefs).toContain(ROUTES.PROFILE);
      expect(hrefs).toContain(ROUTES.SETTINGS);
    });
  });

  describe("Active state matching", () => {
    it("matches dashboard and overview routes", () => {
      expect(isNavItemActive("/dashboard", "/dashboard")).toBe(true);
      expect(isNavItemActive("/dashboard", "/overview")).toBe(true);
      expect(isNavItemActive("/dashboard", "/airtime")).toBe(false);
    });

    it("matches exact routes and sub-paths for services", () => {
      expect(isNavItemActive("/airtime", "/airtime")).toBe(true);
      expect(isNavItemActive("/wallet", "/wallet")).toBe(true);
      expect(isNavItemActive("/transactions", "/transactions/txn_123")).toBe(
        true
      );
      expect(isNavItemActive("/transactions", "/orders")).toBe(false);
    });

    it("supports child active matching via hasActiveChild", () => {
      const parentItem = {
        label: "Services",
        href: "/services",
        icon: MAIN_NAV_ITEMS[0].icon,
        children: [
          {
            label: "Child 1",
            href: "/services/child1",
            icon: MAIN_NAV_ITEMS[0].icon,
          },
        ],
      };

      expect(hasActiveChild(parentItem, "/services/child1")).toBe(true);
      expect(hasActiveChild(parentItem, "/dashboard")).toBe(false);
    });
  });

  describe("Breadcrumb resolution", () => {
    it("returns single Overview crumb when on /dashboard or /overview", () => {
      expect(getBreadcrumbs("/dashboard")).toEqual([
        { label: "Overview", href: ROUTES.OVERVIEW, isCurrent: true },
      ]);
      expect(getBreadcrumbs("/overview")).toEqual([
        { label: "Overview", href: ROUTES.OVERVIEW, isCurrent: true },
      ]);
    });

    it("resolves top-level customer routes with Overview parent", () => {
      expect(getBreadcrumbs("/airtime")).toEqual([
        { label: "Overview", href: ROUTES.OVERVIEW, isCurrent: false },
        { label: "Airtime", href: ROUTES.AIRTIME, isCurrent: true },
      ]);

      expect(getBreadcrumbs("/wallet")).toEqual([
        { label: "Overview", href: ROUTES.OVERVIEW, isCurrent: false },
        { label: "Wallet", href: ROUTES.WALLET, isCurrent: true },
      ]);
    });

    it("resolves sub-routes preserving parent route", () => {
      expect(getBreadcrumbs("/transactions/txn_01JABC")).toEqual([
        { label: "Overview", href: ROUTES.OVERVIEW, isCurrent: false },
        { label: "Transactions", href: ROUTES.TRANSACTIONS, isCurrent: false },
        { label: "txn_01JABC", isCurrent: true },
      ]);
    });
  });
});
