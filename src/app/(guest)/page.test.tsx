import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import GuestHomePage from "./page";
import { GUEST_CONTENT } from "@/config/guest-content";

describe("GuestHomePage (F7A.2)", () => {
  it("renders with a single h1 across the entire page", () => {
    render(<GuestHomePage />);
    const h1Headings = screen.getAllByRole("heading", { level: 1 });
    expect(h1Headings).toHaveLength(1);
    expect(h1Headings[0]).toHaveTextContent(GUEST_CONTENT.hero.h1);
  });

  it("renders all five sections in exact sequence", () => {
    const { container } = render(<GuestHomePage />);
    const sections = container.querySelectorAll("section");
    expect(sections).toHaveLength(5);

    // Section 1: Hero
    expect(sections[0]).toHaveAttribute("aria-labelledby", "hero-heading");

    // Section 2: Services
    expect(sections[1]).toHaveAttribute("id", "services");
    expect(sections[1]).toHaveAttribute("aria-labelledby", "services-heading");

    // Section 3: How it works
    expect(sections[2]).toHaveAttribute("id", "how-it-works");
    expect(sections[2]).toHaveAttribute("aria-labelledby", "how-it-works-heading");

    // Section 4: Security and trust
    expect(sections[3]).toHaveAttribute("id", "security");
    expect(sections[3]).toHaveAttribute("aria-labelledby", "security-heading");

    // Section 5: Closing CTA
    expect(sections[4]).toHaveAttribute("aria-labelledby", "cta-heading");
  });

  it("does not include an FAQ section or statistics strip", () => {
    render(<GuestHomePage />);
    expect(screen.queryByText(/frequently asked questions/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/faq/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/active customers/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/uptime/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/orders completed/i)).not.toBeInTheDocument();
  });

  it("maintains a strictly valid heading order without skipping levels", () => {
    const { container } = render(<GuestHomePage />);
    const headings = Array.from(
      container.querySelectorAll("h1, h2, h3, h4, h5, h6")
    ).map((el) => ({
      level: parseInt(el.tagName.replace("H", ""), 10),
      text: el.textContent?.trim(),
    }));

    // First heading is h1
    expect(headings[0].level).toBe(1);

    // No level is skipped (e.g. h1 directly to h3 without an h2)
    for (let i = 1; i < headings.length; i++) {
      const prevLevel = headings[i - 1].level;
      const currLevel = headings[i].level;
      expect(currLevel - prevLevel).toBeLessThanOrEqual(1);
    }
  });
});
