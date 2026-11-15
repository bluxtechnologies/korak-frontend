import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ROUTES, type NavSection } from "@/config/navigation";
import { Sidebar } from "./Sidebar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/overview",
}));

describe("Sidebar Component (F5.2)", () => {
  it("renders Korak Digitals branding and primary navigation links", () => {
    render(<Sidebar pathname={ROUTES.OVERVIEW} />);

    expect(screen.getByText("Korak Digitals")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /account overview/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /airtime/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /data/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /orders/i })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /transactions/i })
    ).toBeInTheDocument();
  });

  it("marks active route with aria-current='page' and primary background", () => {
    render(<Sidebar pathname={ROUTES.AIRTIME} />);

    const airtimeLink = screen.getByRole("link", { name: /airtime/i });
    const overviewLink = screen.getByRole("link", {
      name: /account overview/i,
    });

    expect(airtimeLink).toHaveAttribute("aria-current", "page");
    expect(airtimeLink.className).toContain("bg-primary");
    expect(overviewLink).not.toHaveAttribute("aria-current");
  });

  it("highlights Orders link when viewing an order detail route", () => {
    render(<Sidebar pathname="/orders/ord_12345" />);

    const ordersLink = screen.getByRole("link", { name: /orders/i });
    expect(ordersLink).toHaveAttribute("aria-current", "page");
  });

  it("toggles nested navigation groups and auto-expands active child group", () => {
    const { rerender } = render(<Sidebar pathname={ROUTES.VPN_LOGS} />);

    // VPN group should automatically expand because /vpn/logs is active
    const vpnButton = screen.getByRole("button", { name: /vpn/i });
    expect(vpnButton).toHaveAttribute("aria-expanded", "true");

    const vpnLogsLink = screen.getByRole("link", { name: /vpn logs/i });
    const buyVpnLink = screen.getByRole("link", { name: /buy vpn/i });
    expect(vpnLogsLink).toHaveAttribute("aria-current", "page");
    expect(buyVpnLink).not.toHaveAttribute("aria-current");

    // User can manually collapse VPN group while staying on /vpn/logs
    fireEvent.click(vpnButton);
    expect(vpnButton).toHaveAttribute("aria-expanded", "false");

    // Navigating to a sibling route re-expands the group automatically
    rerender(<Sidebar pathname={ROUTES.VPN} />);
    expect(vpnButton).toHaveAttribute("aria-expanded", "true");

    // Social Media group should initially be collapsed
    const socialButton = screen.getByRole("button", { name: /social media/i });
    expect(socialButton).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.queryByRole("link", { name: /buy account/i })
    ).not.toBeInTheDocument();

    // Clicking Social Media opens it
    fireEvent.click(socialButton);
    expect(socialButton).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByRole("link", { name: /buy account/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /boost account/i })
    ).toBeInTheDocument();
  });

  it("collapses into icon rail and expands back when toggle button is clicked", () => {
    render(<Sidebar pathname={ROUTES.OVERVIEW} />);

    const aside = screen.getByLabelText("Sidebar navigation");
    expect(aside).toHaveAttribute("data-collapsed", "false");

    const collapseBtn = screen.getByRole("button", {
      name: /collapse sidebar/i,
    });
    fireEvent.click(collapseBtn);

    expect(aside).toHaveAttribute("data-collapsed", "true");
    expect(screen.queryByText("Korak Digitals")).not.toBeInTheDocument();

    const expandBtn = screen.getByRole("button", { name: /expand sidebar/i });
    fireEvent.click(expandBtn);

    expect(aside).toHaveAttribute("data-collapsed", "false");
    expect(screen.getByText("Korak Digitals")).toBeInTheDocument();
  });

  it("expands sidebar and opens nested group when clicking a group icon while collapsed", () => {
    render(<Sidebar defaultCollapsed pathname={ROUTES.OVERVIEW} />);

    const aside = screen.getByLabelText("Sidebar navigation");
    expect(aside).toHaveAttribute("data-collapsed", "true");

    const socialGroupBtn = screen.getByRole("button", {
      name: /social media/i,
    });
    fireEvent.click(socialGroupBtn);

    expect(aside).toHaveAttribute("data-collapsed", "false");
    expect(
      screen.getByRole("link", { name: /buy account/i })
    ).toBeInTheDocument();
  });

  it("supports controlled collapsed prop and onCollapsedChange callback", () => {
    const onCollapsedChange = vi.fn();
    render(
      <Sidebar
        collapsed={false}
        onCollapsedChange={onCollapsedChange}
        pathname={ROUTES.OVERVIEW}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /collapse sidebar/i }));
    expect(onCollapsedChange).toHaveBeenCalledWith(true);
  });

  it("calls onNavigate callback when a link is clicked", () => {
    const onNavigate = vi.fn();
    render(<Sidebar pathname={ROUTES.OVERVIEW} onNavigate={onNavigate} />);

    fireEvent.click(screen.getByRole("link", { name: /airtime/i }));
    expect(onNavigate).toHaveBeenCalledTimes(1);
  });

  it("filters navigation items according to user abilities", () => {
    const customSections: NavSection[] = [
      {
        id: "test",
        items: [
          { id: "open", label: "Open Link", href: "/open" },
          {
            id: "protected",
            label: "Protected Link",
            href: "/protected",
            requiredAbility: "manage_billing",
          },
        ],
      },
    ];

    const { rerender } = render(
      <Sidebar sections={customSections} abilities={[]} pathname="/open" />
    );

    expect(
      screen.getByRole("link", { name: /open link/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /protected link/i })
    ).not.toBeInTheDocument();

    rerender(
      <Sidebar
        sections={customSections}
        abilities={["manage_billing"]}
        pathname="/open"
      />
    );

    expect(
      screen.getByRole("link", { name: /protected link/i })
    ).toBeInTheDocument();
  });
});
