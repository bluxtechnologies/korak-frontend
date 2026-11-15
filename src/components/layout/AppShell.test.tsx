import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ROUTES } from "@/config/navigation";
import { AppShell } from "./AppShell";

vi.mock("next/navigation", () => ({
  usePathname: () => "/overview",
}));

describe("AppShell & Responsive Mobile Drawer (F5.5)", () => {
  it("renders persistent sidebar, topbar, and main children", () => {
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
    expect(screen.getByText("CO")).toBeInTheDocument();
  });

  it("opens mobile navigation drawer via menu trigger and closes with close button", async () => {
    const user = userEvent.setup();
    render(
      <AppShell pathname={ROUTES.OVERVIEW}>
        <div>Content</div>
      </AppShell>
    );

    const openBtn = screen.getByRole("button", {
      name: /open navigation menu/i,
    });
    expect(openBtn).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(openBtn);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(openBtn).toHaveAttribute("aria-expanded", "true");

    const closeBtn = within(dialog).getByRole("button", {
      name: /close navigation menu/i,
    });
    await user.click(closeBtn);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(openBtn).toHaveAttribute("aria-expanded", "false");
  });

  it("closes mobile navigation drawer when pressing Escape", async () => {
    const user = userEvent.setup();
    render(
      <AppShell pathname={ROUTES.OVERVIEW}>
        <div>Content</div>
      </AppShell>
    );

    await user.click(
      screen.getByRole("button", { name: /open navigation menu/i })
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes mobile drawer when clicking a navigation link inside the drawer", async () => {
    const user = userEvent.setup();
    render(
      <AppShell pathname={ROUTES.OVERVIEW}>
        <div>Content</div>
      </AppShell>
    );

    await user.click(
      screen.getByRole("button", { name: /open navigation menu/i })
    );
    const dialog = screen.getByRole("dialog");

    const airtimeLink = within(dialog).getByRole("link", { name: /airtime/i });
    await user.click(airtimeLink);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("auto-closes mobile drawer when pathname changes", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <AppShell pathname={ROUTES.OVERVIEW}>
        <div>Overview</div>
      </AppShell>
    );

    await user.click(
      screen.getByRole("button", { name: /open navigation menu/i })
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    rerender(
      <AppShell pathname={ROUTES.ORDERS}>
        <div>Orders</div>
      </AppShell>
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
