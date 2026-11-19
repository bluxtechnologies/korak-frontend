import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LandingNavbar } from "./LandingNavbar";

describe("LandingNavbar (Phase 01)", () => {
  it("renders KORAK brand logo linking to home", () => {
    render(<LandingNavbar />);
    const logoLink = screen.getByRole("link", { name: /korak digitals home/i });
    expect(logoLink).toBeInTheDocument();
    expect(logoLink).toHaveAttribute("href", "/");
  });

  it("renders all four desktop navigation links in exact order", () => {
    render(<LandingNavbar />);
    const nav = screen.getByRole("navigation", { name: "Main Navigation" });
    expect(nav).toBeInTheDocument();

    const expectedLinks = [
      { text: "Home", href: "/" },
      { text: "Services", href: "#services" },
      { text: "How It Works", href: "#how-it-works" },
      { text: "Pricing", href: "#pricing" },
    ];

    expectedLinks.forEach(({ text, href }) => {
      const link = screen.getByRole("link", { name: text });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", href);
    });
  });

  it("renders Log In text link and Get Started primary CTA", () => {
    render(<LandingNavbar />);
    const loginLink = screen.getAllByRole("link", { name: /log in/i })[0];
    const getStartedBtn = screen.getAllByRole("link", { name: /get started/i })[0];

    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute("href", "/login");

    expect(getStartedBtn).toBeInTheDocument();
    expect(getStartedBtn).toHaveAttribute("href", "/register");
  });

  it("supports mobile navigation toggle and keyboard dismissal", () => {
    render(<LandingNavbar />);

    const menuTrigger = screen.getByRole("button", {
      name: /open navigation menu/i,
    });
    expect(menuTrigger).toHaveAttribute("aria-expanded", "false");

    // Open mobile menu
    fireEvent.click(menuTrigger);
    expect(menuTrigger).toHaveAttribute("aria-expanded", "true");

    const mobileDialog = screen.getByRole("dialog", {
      name: "Mobile Navigation",
    });
    expect(mobileDialog).toBeInTheDocument();

    // Dismiss with Escape key
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Mobile Navigation" })).not.toBeInTheDocument();
  });
});
