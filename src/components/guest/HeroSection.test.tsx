import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HeroSection } from "./HeroSection";
import { GUEST_CONTENT } from "@/config/guest-content";

describe("HeroSection", () => {
  it("renders a single h1 heading with the draft copy", () => {
    render(<HeroSection />);
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(GUEST_CONTENT.hero.h1);
  });

  it("renders one supporting line of text", () => {
    render(<HeroSection />);
    expect(screen.getByText(GUEST_CONTENT.hero.support)).toBeInTheDocument();
  });

  it("renders primary 'Create account' and secondary 'Log in' buttons linking to respective routes", () => {
    render(<HeroSection />);
    const createBtn = screen.getByRole("link", { name: /create account/i });
    const loginBtn = screen.getByRole("link", { name: /log in/i });

    expect(createBtn).toHaveAttribute("href", "/register");
    expect(loginBtn).toHaveAttribute("href", "/login");
  });

  it("renders the neutral bordered photo placeholder block for hero image", () => {
    render(<HeroSection />);
    const placeholder = screen.getByTestId("guest-photo-placeholder");
    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toHaveTextContent("Hero Photo Slot");
    expect(placeholder).toHaveTextContent("1280x800");
  });
});
