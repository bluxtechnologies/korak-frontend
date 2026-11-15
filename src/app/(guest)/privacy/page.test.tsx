import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PrivacyPage from "./page";
import { GUEST_CONTENT } from "@/config/guest-content";

describe("PrivacyPage (F7A.3)", () => {
  it("renders a single h1 heading matching the privacy policy title", () => {
    render(<PrivacyPage />);
    const h1Headings = screen.getAllByRole("heading", { level: 1 });
    expect(h1Headings).toHaveLength(1);
    expect(h1Headings[0]).toHaveTextContent(GUEST_CONTENT.privacyPolicy.title);
  });

  it("renders the 'Draft, pending legal review' banner when legalReviewed is false", () => {
    render(<PrivacyPage />);
    const banner = screen.getByTestId("legal-draft-banner");
    expect(banner).toBeInTheDocument();
    expect(banner).toHaveTextContent(/draft, pending legal review/i);
  });

  it("renders an accessible table of contents anchor list linking to all privacy sections", () => {
    render(<PrivacyPage />);
    const nav = screen.getByRole("navigation", { name: /table of contents/i });
    expect(nav).toBeInTheDocument();

    GUEST_CONTENT.privacyPolicy.sections.forEach((sec) => {
      const link = screen.getByRole("link", { name: sec.title });
      expect(link).toHaveAttribute("href", `#${sec.id}`);
    });
  });

  it("renders logical h2 section headings", () => {
    render(<PrivacyPage />);
    const h2Headings = screen.getAllByRole("heading", { level: 2 });
    expect(h2Headings.length).toBe(GUEST_CONTENT.privacyPolicy.sections.length);
  });
});
