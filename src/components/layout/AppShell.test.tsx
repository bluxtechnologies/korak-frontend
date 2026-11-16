import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ROUTES } from "@/config/navigation";
import { AppShell } from "./AppShell";

vi.mock("next/navigation", () => ({
  usePathname: () => "/overview",
}));

describe("AppShell & Responsive Mobile Navigation (F5.5)", () => {
  it("renders persistent desktop sidebar, topbar, and main children", () => {
    render(
      <AppShell
        user={{ name: "Collins Okeke", email: "collins@example.com" }}
        unreadCount={3}
        pathname={ROUTES.OVERVIEW}
      >
        <div>Dashboard Body</div>
      </AppShell>
    );

    expect(screen.getByRole("main")).toHaveTextContent("Dashboard Body");
    expect(screen.getByLabelText("Sidebar navigation")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /notifications \(3 unread\)/i })
    ).toBeInTheDocument();
    expect(screen.getAllByText("CO")[0]).toBeInTheDocument();
  }, 15000);

  it("renders mobile navigation bar linking directly to /menu without modal drawer", () => {
    render(
      <AppShell pathname={ROUTES.OVERVIEW}>
        <div>Content</div>
      </AppShell>
    );

    const mobileNav = screen.getByRole("navigation", {
      name: /mobile navigation/i,
    });
    expect(mobileNav).toBeInTheDocument();

    // Verify 4 tabs in mobile navigation
    const homeTab = within(mobileNav).getByRole("link", { name: /^home$/i });
    expect(homeTab).toHaveAttribute("href", ROUTES.OVERVIEW);
    expect(homeTab).toHaveAttribute("aria-current", "page");

    const walletTab = within(mobileNav).getByRole("link", { name: /^wallet$/i });
    expect(walletTab).toHaveAttribute("href", ROUTES.WALLET);

    const transactionsTab = within(mobileNav).getByRole("link", {
      name: /^transactions$/i,
    });
    expect(transactionsTab).toHaveAttribute("href", ROUTES.TRANSACTIONS);

    const menuTab = within(mobileNav).getByRole("link", { name: /^menu$/i });
    expect(menuTab).toHaveAttribute("href", ROUTES.MENU);

    // Verify NO modal drawer / dialog is mounted
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("mobile topbar trigger links directly to /menu instead of opening a drawer", () => {
    render(
      <AppShell pathname={ROUTES.OVERVIEW}>
        <div>Content</div>
      </AppShell>
    );

    const mobileMenuTrigger = screen.getByRole("link", {
      name: /open menu page/i,
    });
    expect(mobileMenuTrigger).toHaveAttribute("href", ROUTES.MENU);
  });

  it("mobile topbar trigger links back to overview when already on /menu", () => {
    render(
      <AppShell pathname={ROUTES.MENU}>
        <div>Menu Content</div>
      </AppShell>
    );

    const backTrigger = screen.getByRole("link", {
      name: /back to dashboard/i,
    });
    expect(backTrigger).toHaveAttribute("href", ROUTES.OVERVIEW);
  });
});
