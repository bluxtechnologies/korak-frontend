import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ROUTES } from "@/config/navigation";
import { MenuView } from "./MenuView";
import type { AuthUser } from "@/features/auth/api";

const mockUser: AuthUser = {
  id: "usr_test_123",
  name: "Obaseki Collins",
  username: "obasekicollins",
  email: "collins@korakdigital.com",
  email_verified_at: "2026-01-01T00:00:00Z",
  created_at: "2026-01-01T00:00:00Z",
};

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockLogout = vi.fn();
vi.mock("@/features/auth/api", () => ({
  logout: () => mockLogout(),
}));

vi.mock("@/components/layout/DashboardShell", () => ({
  useAuthUser: () => mockUser,
}));

describe("MenuView Component (F5.5)", () => {
  it("renders customer identity, initials, and email", () => {
    render(<MenuView walletBalance="₦25,000.00" />);

    expect(screen.getByText("Obaseki Collins")).toBeInTheDocument();
    expect(screen.getByText("collins@korakdigital.com")).toBeInTheDocument();
    expect(screen.getByText("OC")).toBeInTheDocument();
    expect(screen.getByText("₦25,000.00")).toBeInTheDocument();
  });

  it("renders all digital service links with correct hrefs", () => {
    render(<MenuView />);

    expect(screen.getByRole("link", { name: /dashboard/i })).toHaveAttribute(
      "href",
      ROUTES.DASHBOARD
    );
    expect(screen.getByRole("link", { name: /airtime/i })).toHaveAttribute(
      "href",
      ROUTES.AIRTIME
    );
    expect(screen.getByRole("link", { name: /mobile data/i })).toHaveAttribute(
      "href",
      ROUTES.DATA
    );
    expect(
      screen.getByRole("link", { name: /numbers activation/i })
    ).toHaveAttribute("href", ROUTES.NUMBERS);
    expect(screen.getByRole("link", { name: /orders/i })).toHaveAttribute(
      "href",
      ROUTES.ORDERS
    );
    expect(screen.getByRole("link", { name: /transactions/i })).toHaveAttribute(
      "href",
      ROUTES.TRANSACTIONS
    );
    expect(screen.getByRole("link", { name: /vpn service/i })).toHaveAttribute(
      "href",
      ROUTES.VPN
    );
  });

  it("renders account and support links", () => {
    render(<MenuView />);

    expect(screen.getByRole("link", { name: /view profile/i })).toHaveAttribute(
      "href",
      ROUTES.PROFILE
    );
    expect(screen.getByRole("link", { name: /^settings/i })).toHaveAttribute(
      "href",
      ROUTES.SETTINGS
    );
    expect(
      screen.getByRole("link", { name: /^notifications/i })
    ).toHaveAttribute("href", ROUTES.NOTIFICATIONS);
    expect(screen.getByRole("link", { name: /^support/i })).toHaveAttribute(
      "href",
      ROUTES.SUPPORT
    );
  });

  it("triggers logout and redirects to /login on sign out click", async () => {
    const user = userEvent.setup();
    mockLogout.mockResolvedValueOnce({ message: "Signed out" });

    render(<MenuView />);

    const logoutBtn = screen.getByRole("button", { name: /log out/i });
    await user.click(logoutBtn);

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith(ROUTES.LOGIN);
    });
  });

  it("does not render forbidden pill shapes or status dots (Doc 05 compliance)", () => {
    const { container } = render(<MenuView />);

    const roundedFulls = container.querySelectorAll(".rounded-full");
    expect(roundedFulls.length).toBe(0);

    const emeraldDots = container.querySelectorAll(".bg-emerald-500");
    expect(emeraldDots.length).toBe(0);
  });
});
