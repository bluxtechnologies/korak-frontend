import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SecurityTrustSection } from "./SecurityTrustSection";
import { GUEST_CONTENT } from "@/config/guest-content";

describe("SecurityTrustSection", () => {
  it("renders the section h2 heading and description", () => {
    render(<SecurityTrustSection />);
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: GUEST_CONTENT.security.sectionTitle,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(GUEST_CONTENT.security.sectionDescription)
    ).toBeInTheDocument();
  });

  it("renders exactly three protections matching Doc 08", () => {
    render(<SecurityTrustSection />);
    const expectedTitles = [
      "Verification on new devices",
      "Protection against repeated login attempts",
      "Sensitive details hidden by default",
    ];

    expectedTitles.forEach((title) => {
      expect(
        screen.getByRole("heading", { level: 3, name: title })
      ).toBeInTheDocument();
    });
  });

  it("does not use forbidden security marketing buzzwords", () => {
    render(<SecurityTrustSection />);
    const region = screen.getByRole("region", { name: /security/i });
    const text = region.textContent?.toLowerCase() ?? "";

    expect(text).not.toContain("bank-grade");
    expect(text).not.toContain("bank grade");
    expect(text).not.toContain("100% safe");
    expect(text).not.toContain("100% secure");
    expect(text).not.toContain("unbreakable");
    expect(text).not.toContain("military-grade");
  });
});
