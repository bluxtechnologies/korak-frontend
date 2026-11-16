import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ROUTES } from "@/config/navigation";
import { Topbar } from "./Topbar";

describe("Topbar Component (F5.3)", () => {
  it("renders default notifications link with unread count", () => {
    render(<Topbar unreadCount={5} />);

    const bellLink = screen.getByRole("link", {
      name: /notifications \(5 unread\)/i,
    });
    expect(bellLink).toHaveAttribute("href", ROUTES.NOTIFICATIONS);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("does not render unread badge when unreadCount is 0", () => {
    render(<Topbar unreadCount={0} />);

    const bellLink = screen.getByRole("link", {
      name: /^notifications$/i,
    });
    expect(bellLink).toHaveAttribute("href", ROUTES.NOTIFICATIONS);
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("caps unread count display at 99+", () => {
    render(<Topbar unreadCount={142} />);
    expect(screen.getByText("99+")).toBeInTheDocument();
  });

  it("renders custom notificationsSlot and leftSlot when provided", () => {
    render(
      <Topbar
        leftSlot={<button type="button">Menu Trigger</button>}
        notificationsSlot={<button type="button">Custom Bell Widget</button>}
      />
    );

    expect(
      screen.getByRole("button", { name: /menu trigger/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /custom bell widget/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /notifications/i })
    ).not.toBeInTheDocument();
  });

  it("renders global search input and live wallet balance link", () => {
    render(<Topbar walletBalance="₦15,000.00" />);

    expect(
      screen.getByRole("textbox", { name: /search for services/i })
    ).toBeInTheDocument();

    const walletLink = screen.getByRole("link", {
      name: /wallet balance: ₦15,000\.00/i,
    });
    expect(walletLink).toHaveAttribute("href", ROUTES.WALLET);
    expect(screen.getByText("₦15,000.00")).toBeInTheDocument();
  });

  it("renders custom walletSlot when provided", () => {
    render(
      <Topbar
        walletSlot={<div data-testid="custom-wallet">Custom Balance</div>}
      />
    );

    expect(screen.getByTestId("custom-wallet")).toHaveTextContent(
      "Custom Balance"
    );
    expect(
      screen.queryByRole("link", { name: /wallet balance/i })
    ).not.toBeInTheDocument();
  });

  it("renders fallback initials and icon when no user or name is given", () => {
    render(<Topbar user={null} />);

    const trigger = screen.getByRole("button", { name: /user menu/i });
    expect(trigger).toBeInTheDocument();
    expect(screen.getByText("Account")).toBeInTheDocument();
  });

  it("displays user name and initials, opens menu with profile/settings links, and fires onLogout", async () => {
    const user = userEvent.setup();
    const handleLogout = vi.fn();

    render(
      <Topbar
        user={{ name: "Collins Okeke", email: "collins@example.com" }}
        onLogout={handleLogout}
      />
    );

    expect(screen.getByText("CO")).toBeInTheDocument();
    const trigger = screen.getByRole("button", { name: /user menu/i });
    expect(trigger).toBeInTheDocument();

    await user.click(trigger);

    expect(screen.getByText("collins@example.com")).toBeInTheDocument();

    const profileItem = screen.getByRole("menuitem", { name: /profile/i });
    expect(profileItem).toHaveAttribute("href", ROUTES.PROFILE);

    const settingsItem = screen.getByRole("menuitem", { name: /settings/i });
    expect(settingsItem).toHaveAttribute("href", ROUTES.SETTINGS);

    const logoutItem = screen.getByRole("menuitem", { name: /log out/i });
    await user.click(logoutItem);

    expect(handleLogout).toHaveBeenCalledTimes(1);
  });

  it("shows loading state and prevents duplicate calls while isLoggingOut is true", async () => {
    const user = userEvent.setup();
    const handleLogout = vi.fn();

    render(
      <Topbar
        user={{ name: "Collins", username: "collins" }}
        onLogout={handleLogout}
        isLoggingOut
      />
    );

    await user.click(screen.getByRole("button", { name: /user menu/i }));

    expect(screen.getByText("@collins")).toBeInTheDocument();
    const logoutItem = screen.getByRole("menuitem", {
      name: /logging out\.\.\./i,
    });
    expect(logoutItem).toHaveAttribute("aria-disabled", "true");

    await user.click(logoutItem);
    expect(handleLogout).not.toHaveBeenCalled();
  });

  it("does not render any dot indicator inside the avatar or buttons (Doc 05 compliance)", () => {
    const { container } = render(
      <Topbar
        user={{ name: "Collins Okeke", email: "collins@example.com" }}
        unreadCount={3}
      />
    );

    // Verify there are no online/status indicator dots (e.g. bg-emerald-500 or rounded-full absolute dots)
    const emeraldDots = container.querySelectorAll(".bg-emerald-500");
    expect(emeraldDots.length).toBe(0);

    const roundedFulls = container.querySelectorAll(".rounded-full");
    expect(roundedFulls.length).toBe(0);
  });
});
