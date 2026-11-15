import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GuestFooter } from "./GuestFooter";

describe("GuestFooter", () => {
  it("renders copyright notice and brand mark", () => {
    render(<GuestFooter />);
    expect(screen.getByText(/2026 korak digitals\. all rights reserved\./i)).toBeInTheDocument();
  });

  it("renders links to terms of service and privacy policy", () => {
    render(<GuestFooter />);
    expect(screen.getByRole("link", { name: /terms of service/i })).toHaveAttribute("href", "/terms");
    expect(screen.getByRole("link", { name: /privacy policy/i })).toHaveAttribute("href", "/privacy");
  });

  it("renders navigation and auth links", () => {
    render(<GuestFooter />);
    expect(screen.getByRole("link", { name: "Services" })).toHaveAttribute("href", "#services");
    expect(screen.getByRole("link", { name: "How it works" })).toHaveAttribute("href", "#how-it-works");
    expect(screen.getByRole("link", { name: "Security & Trust" })).toHaveAttribute("href", "#security");
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: "Create account" })).toHaveAttribute("href", "/register");
  });
});
