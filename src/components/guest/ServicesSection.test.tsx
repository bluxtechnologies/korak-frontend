import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ServicesSection } from "./ServicesSection";
import { GUEST_CONTENT } from "@/config/guest-content";

describe("ServicesSection", () => {
  it("renders an h2 heading for the services section", () => {
    render(<ServicesSection />);
    const heading = screen.getByRole("heading", {
      level: 2,
      name: GUEST_CONTENT.services.sectionTitle,
    });
    expect(heading).toBeInTheDocument();
  });

  it("renders exactly five service cards with required titles", () => {
    render(<ServicesSection />);
    const expectedTitles = [
      "Airtime",
      "Data",
      "VPN",
      "Buy social media accounts",
      "Boost social media accounts",
    ];

    expectedTitles.forEach((title) => {
      expect(screen.getByRole("heading", { level: 3, name: title })).toBeInTheDocument();
    });
  });

  it("renders neutral draft descriptions without speed claims or prices", () => {
    render(<ServicesSection />);
    const containerText = screen.getByRole("region", { name: /services/i }).textContent?.toLowerCase() ?? "";

    expect(containerText).not.toContain("fastest");
    expect(containerText).not.toContain("instant");
    expect(containerText).not.toContain("$");
    expect(containerText).not.toContain("usd");
    expect(containerText).not.toContain("price");
  });
});
