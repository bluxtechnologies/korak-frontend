import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { SessionExpiredCard } from "./SessionExpiredCard";

// ---------------------------------------------------------------------------
// Mock next/navigation
// ---------------------------------------------------------------------------
let mockSearchParams = new URLSearchParams();
vi.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams,
}));

describe("SessionExpiredCard (F9.3)", () => {
  beforeEach(() => {
    mockSearchParams = new URLSearchParams();
  });

  it("renders heading, description, and default sign in button when no intended param is provided", () => {
    render(<SessionExpiredCard />);

    expect(
      screen.getByRole("heading", { name: /session expired/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/your session has timed out/i)
    ).toBeInTheDocument();

    const signInLink = screen.getByRole("link", { name: /sign in again/i });
    expect(signInLink).toHaveAttribute("href", "/login");

    const homeLink = screen.getByRole("link", { name: /return to home/i });
    expect(homeLink).toHaveAttribute("href", "/");
  });

  it("preserves safe intended destination in the sign in link and displays destination indicator", () => {
    mockSearchParams = new URLSearchParams({ intended: "/orders/ord_123" });

    render(<SessionExpiredCard />);

    const signInLink = screen.getByRole("link", { name: /sign in again/i });
    expect(signInLink).toHaveAttribute(
      "href",
      "/login?intended=%2Forders%2Ford_123"
    );

    expect(
      screen.getByText(/we'll return you to your previous page/i)
    ).toBeInTheDocument();
    expect(screen.getByText("/orders/ord_123")).toBeInTheDocument();
  });

  it("sanitizes open redirects and falls back to plain login link", () => {
    mockSearchParams = new URLSearchParams({ intended: "https://attacker.com/steal" });

    render(<SessionExpiredCard />);

    const signInLink = screen.getByRole("link", { name: /sign in again/i });
    expect(signInLink).toHaveAttribute("href", "/login");
    expect(
      screen.queryByText(/we'll return you to your previous page/i)
    ).not.toBeInTheDocument();
  });

  it("rejects protocol-relative open redirect (//evil.com)", () => {
    mockSearchParams = new URLSearchParams({ intended: "//evil.com" });

    render(<SessionExpiredCard />);

    const signInLink = screen.getByRole("link", { name: /sign in again/i });
    expect(signInLink).toHaveAttribute("href", "/login");
  });
});
