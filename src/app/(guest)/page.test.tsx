import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import GuestHomePage from "./page";

describe("GuestHomePage (Phase 01)", () => {
  it("renders with a single h1 across the entire page", () => {
    render(<GuestHomePage />);
    const h1Headings = screen.getAllByRole("heading", { level: 1 });
    expect(h1Headings).toHaveLength(1);
    expect(h1Headings[0]).toHaveTextContent(/everything you need/i);
  });

  it("renders the hero section with aria-labelledby attribute", () => {
    const { container } = render(<GuestHomePage />);
    const heroSection = container.querySelector("section");
    expect(heroSection).toBeInTheDocument();
    expect(heroSection).toHaveAttribute("aria-labelledby", "hero-heading");
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

    // No level is skipped
    for (let i = 1; i < headings.length; i++) {
      const prevLevel = headings[i - 1].level;
      const currLevel = headings[i].level;
      expect(currLevel - prevLevel).toBeLessThanOrEqual(1);
    }
  });
});
