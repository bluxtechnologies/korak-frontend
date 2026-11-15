import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DashboardShell, useAuthUser } from "./DashboardShell";
import type { AuthUser } from "@/features/auth/api";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/overview",
}));

// Mock auth API
vi.mock("@/features/auth/api", () => ({
  logout: vi.fn(),
}));
import { logout } from "@/features/auth/api";
const mockLogout = vi.mocked(logout);

// Mock sonner
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), info: vi.fn(), error: vi.fn() },
}));
import { toast } from "sonner";

const mockUser: AuthUser = {
  id: "u_456",
  name: "Amara Nwosu",
  email: "amara@example.com",
  username: "amara",
  email_verified_at: "2026-01-01T00:00:00Z",
  created_at: "2026-01-01T00:00:00Z",
};

function TestConsumer() {
  const user = useAuthUser();
  return <div data-testid="consumer-user-name">{user.name}</div>;
}

describe("DashboardShell (F11.2 & F11.3)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders child content and provides user through useAuthUser context", () => {
    render(
      <DashboardShell user={mockUser}>
        <TestConsumer />
      </DashboardShell>
    );

    expect(screen.getByTestId("consumer-user-name")).toHaveTextContent("Amara Nwosu");
    expect(screen.getAllByText("Amara Nwosu").length).toBeGreaterThanOrEqual(1);
  });

  it("throws error when useAuthUser is rendered outside DashboardShell", () => {
    // Suppress console.error in React for expected boundary failure
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow(
      "useAuthUser must be used within a DashboardShell"
    );
    spy.mockRestore();
  });

  it("executes logout flow when user clicks sign out", async () => {
    const user = userEvent.setup();
    mockLogout.mockResolvedValueOnce({ message: "Signed out" });

    render(
      <DashboardShell user={mockUser}>
        <div>Dashboard Content</div>
      </DashboardShell>
    );

    // Open Topbar user menu
    const menuTrigger = screen.getByRole("button", { name: /user menu/i });
    await user.click(menuTrigger);

    // Click Sign out
    const logoutBtn = screen.getByRole("menuitem", { name: /sign out|log out/i });
    await user.click(logoutBtn);

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalledTimes(1);
      expect(toast.success).toHaveBeenCalledWith("You have been signed out.");
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  }, 15000);

  it("handles logout failure gracefully and still redirects to /login", async () => {
    const user = userEvent.setup();
    mockLogout.mockRejectedValueOnce(new Error("Network disconnect"));

    render(
      <DashboardShell user={mockUser}>
        <div>Dashboard Content</div>
      </DashboardShell>
    );

    const menuTrigger = screen.getByRole("button", { name: /user menu/i });
    await user.click(menuTrigger);

    const logoutBtn = screen.getByRole("menuitem", { name: /sign out|log out/i });
    await user.click(logoutBtn);

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalledTimes(1);
      expect(toast.info).toHaveBeenCalledWith("Session ended.");
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });
});
