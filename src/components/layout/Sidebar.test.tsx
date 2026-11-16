import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Sparkles } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { type NavItem } from "@/config/navigation";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));

describe("Sidebar Component (F5.1 & F5.2)", () => {
  beforeEach(() => {
    // Reset cookie to expanded state before each test
    document.cookie = "sidebar:state=true; path=/";
  });

  it("renders all 7 main items and 2 bottom items in the specified order with correct hrefs", () => {
    render(<Sidebar pathname="/dashboard" />);

    // Brand header
    expect(screen.getByText("Korak Digitals")).toBeInTheDocument();
    expect(screen.getByText("K")).toBeInTheDocument();

    const links = screen.getAllByRole("link");
    const hrefs = links.map((l) => l.getAttribute("href"));

    // Check main section items (in order)
    expect(hrefs).toContain("/overview");
    expect(hrefs).toContain("/wallet");
    expect(hrefs).toContain("/airtime");
    expect(hrefs).toContain("/data");
    expect(hrefs).toContain("/numbers");
    expect(hrefs).toContain("/orders");
    expect(hrefs).toContain("/transactions");

    // Check bottom section items (in order)
    expect(hrefs).toContain("/profile");
    expect(hrefs).toContain("/settings");

    // Verify ordering
    const linkTexts = links
      .map((l) => l.textContent?.trim())
      .filter((t): t is string => Boolean(t && t !== "Korak Digitals" && t !== "K"));

    const expectedOrder = [
      "Overview",
      "Wallet",
      "Airtime",
      "Data",
      "Numbers Activation",
      "Orders",
      "Transactions",
      "Profile",
      "Settings",
    ];

    let lastIdx = -1;
    for (const expected of expectedOrder) {
      const idx = linkTexts.findIndex(
        (t, i) => i > lastIdx && t.includes(expected)
      );
      expect(idx).toBeGreaterThan(lastIdx);
      lastIdx = idx;
    }
  });

  it("renders a 1px divider separating the main and bottom sections", () => {
    const { container } = render(<Sidebar pathname="/dashboard" />);
    const separator = container.querySelector("[data-sidebar='separator']");
    expect(separator).toBeInTheDocument();
    expect(separator?.className).toContain("bg-sidebar-border");
    expect(separator?.className).toContain("h-px");
  });

  it("marks the active item with font-semibold, primary styling, and aria-current='page'", () => {
    render(<Sidebar pathname="/wallet" />);

    const walletLink = screen.getByRole("link", { name: /^wallet$/i });
    const overviewLink = screen.getByRole("link", { name: /^overview$/i });

    expect(walletLink).toHaveAttribute("aria-current", "page");
    expect(walletLink).toHaveAttribute("data-active", "true");
    expect(walletLink.className).toContain("text-primary");
    expect(walletLink.className).toContain("font-semibold");
    expect(walletLink.className).toContain("bg-primary/10");

    expect(overviewLink).not.toHaveAttribute("aria-current");
    expect(overviewLink).toHaveAttribute("data-active", "false");
  });

  it("toggles width between 272px and 72px and persists the state to cookie", async () => {
    const user = userEvent.setup();
    render(<Sidebar pathname="/dashboard" />);

    const aside = screen.getByLabelText("Sidebar navigation");
    expect(aside).toHaveStyle({ width: "272px" });
    expect(aside).toHaveAttribute("data-state", "expanded");

    // Click collapse button
    const collapseBtn = screen.getByRole("button", {
      name: /collapse sidebar/i,
    });
    await user.click(collapseBtn);

    expect(aside).toHaveStyle({ width: "72px" });
    expect(aside).toHaveAttribute("data-state", "collapsed");
    expect(document.cookie).toContain("sidebar:state=false");

    // Click expand button
    const expandBtn = screen.getByRole("button", { name: /expand sidebar/i });
    await user.click(expandBtn);

    expect(aside).toHaveStyle({ width: "272px" });
    expect(aside).toHaveAttribute("data-state", "expanded");
    expect(document.cookie).toContain("sidebar:state=true");
  });

  it("renders tooltips when collapsed on hover/focus", () => {
    const { container } = render(<Sidebar collapsed pathname="/dashboard" />);

    const aside = screen.getByLabelText("Sidebar navigation");
    expect(aside).toHaveAttribute("data-state", "collapsed");

    // In collapsed mode, menu buttons have tooltips attached
    const menuLinks = container.querySelectorAll(
      "[data-sidebar='menu-button']"
    );
    expect(menuLinks.length).toBe(9);
  });

  it("renders user initials, name and email when expanded, and avatar only when collapsed", () => {
    const testUser = { name: "Collins Okeke", email: "collins@example.test" };
    const { rerender } = render(
      <Sidebar user={testUser} pathname="/dashboard" />
    );

    // Expanded: shows name, email, initials, and kebab button
    expect(screen.getByText("Collins Okeke")).toBeInTheDocument();
    expect(screen.getByText("collins@example.test")).toBeInTheDocument();
    expect(screen.getByText("CO")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /user options menu/i })
    ).toBeInTheDocument();

    // Collapsed: shows only avatar button
    rerender(<Sidebar user={testUser} collapsed pathname="/dashboard" />);
    expect(screen.queryByText("Collins Okeke")).not.toBeInTheDocument();
    expect(screen.queryByText("collins@example.test")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /user menu for collins okeke/i })
    ).toBeInTheDocument();
  });

  it("kebab button opens the menu containing 'Log out' and clicking it calls onLogout", async () => {
    const user = userEvent.setup();
    const handleLogout = vi.fn();
    render(<Sidebar onLogout={handleLogout} pathname="/dashboard" />);

    const menuTrigger = screen.getByRole("button", {
      name: /user options menu/i,
    });
    await user.click(menuTrigger);

    const logoutItem = await screen.findByRole("menuitem", {
      name: /log out/i,
    });
    expect(logoutItem).toBeInTheDocument();

    await user.click(logoutItem);
    expect(handleLogout).toHaveBeenCalledTimes(1);
  });

  it("keyboard navigation: can tab through items, expand/collapse with toggle, open user menu", async () => {
    const user = userEvent.setup();
    const handleLogout = vi.fn();
    render(<Sidebar onLogout={handleLogout} pathname="/dashboard" />);

    // Tab through header link and collapse toggle
    await user.tab();
    expect(
      screen.getByRole("link", { name: /korak digitals overview/i })
    ).toHaveFocus();

    await user.tab();
    const collapseToggle = screen.getByRole("button", {
      name: /collapse sidebar/i,
    });
    expect(collapseToggle).toHaveFocus();

    // Press Enter to collapse
    await user.keyboard("{Enter}");
    const aside = screen.getByLabelText("Sidebar navigation");
    expect(aside).toHaveAttribute("data-state", "collapsed");
  });

  it("child item fixture renders inline sub-items when expanded and flyout when collapsed", async () => {
    const user = userEvent.setup();
    const fixtureItems: NavItem[] = [
      {
        label: "Services",
        href: "/services",
        icon: Sparkles,
        children: [
          { label: "Sub Service A", href: "/services/a", icon: Sparkles },
          { label: "Sub Service B", href: "/services/b", icon: Sparkles },
        ],
      },
    ];

    // Expanded: toggle disclosure opens inline list
    const { rerender } = render(
      <Sidebar items={fixtureItems} bottomItems={[]} pathname="/services" />
    );

    const parentBtn = screen.getByRole("button", { name: /services/i });
    expect(parentBtn).toBeInTheDocument();
    await user.click(parentBtn);

    expect(
      screen.getByRole("link", { name: /sub service a/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /sub service b/i })
    ).toBeInTheDocument();

    // Collapsed: clicking opens flyout dropdown menu
    rerender(
      <Sidebar
        collapsed
        items={fixtureItems}
        bottomItems={[]}
        pathname="/services"
      />
    );

    const collapsedTrigger = screen.getByRole("button", {
      name: /services/i,
    });
    await user.click(collapsedTrigger);

    expect(
      await screen.findByRole("menuitem", { name: /sub service a/i })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("menuitem", { name: /sub service b/i })
    ).toBeInTheDocument();
  });

  it("accessibility check: has valid landmark and accessible labels in expanded and collapsed modes", () => {
    const { rerender } = render(<Sidebar pathname="/dashboard" />);
    const aside = screen.getByLabelText("Sidebar navigation");
    expect(aside.tagName).toBe("ASIDE");

    // All buttons have accessible labels
    const buttons = screen.getAllByRole("button");
    for (const button of buttons) {
      expect(
        button.getAttribute("aria-label") ||
          button.getAttribute("title") ||
          button.textContent
      ).toBeTruthy();
    }

    // Collapsed mode check
    rerender(<Sidebar collapsed pathname="/dashboard" />);
    const collapsedButtons = screen.getAllByRole("button");
    for (const button of collapsedButtons) {
      expect(
        button.getAttribute("aria-label") ||
          button.getAttribute("title") ||
          button.textContent
      ).toBeTruthy();
    }
  });
});
