import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ServicesBentoSection, KORAK_SERVICES } from "./ServicesBentoSection";

describe("ServicesBentoSection (Section 02 Bento Grid)", () => {
  it("renders the section with id='services' and correct aria-labelledby", () => {
    const { container } = render(<ServicesBentoSection />);
    const section = container.querySelector("section#services");
    expect(section).toBeInTheDocument();
    expect(section).toHaveAttribute("aria-labelledby", "services-section-heading");
  });

  it("renders the centered section header with eyebrow, H2 heading, and description", () => {
    render(<ServicesBentoSection />);
    expect(screen.getByText("EVERYDAY DIGITAL SERVICES")).toBeInTheDocument();

    const h2 = screen.getByRole("heading", {
      level: 2,
      name: "Everyday Digital Services for Everyone",
    });
    expect(h2).toBeInTheDocument();
    expect(h2).toHaveAttribute("id", "services-section-heading");

    expect(
      screen.getByText(/KORAK brings your essential digital services together/i)
    ).toBeInTheDocument();
  });

  it("renders the featured burgundy card with transaction proof and Explore Services CTA", () => {
    render(<ServicesBentoSection />);
    expect(screen.getByText("DIGITAL SERVICES FOR EVERYDAY LIFE")).toBeInTheDocument();

    const featuredH3 = screen.getByRole("heading", {
      level: 3,
      name: "Everything you need, in one place.",
    });
    expect(featuredH3).toBeInTheDocument();

    // Transaction element
    expect(screen.getByText("₦10,000.00")).toBeInTheDocument();
    expect(screen.getByText("Electricity Token Generated")).toBeInTheDocument();
    expect(screen.getByText("Success")).toBeInTheDocument();

    // Explore Services CTA
    const ctaLink = screen.getByRole("link", { name: /explore services/i });
    expect(ctaLink).toBeInTheDocument();
    expect(ctaLink).toHaveAttribute("href", "/register");
  });

  it("renders all four service cards with required titles, descriptions, and links", () => {
    render(<ServicesBentoSection />);

    KORAK_SERVICES.forEach((service) => {
      const cardTitle = screen.getByRole("heading", {
        level: 3,
        name: service.title,
      });
      expect(cardTitle).toBeInTheDocument();

      expect(screen.getByText(service.description)).toBeInTheDocument();
    });

    const getStartedLinks = screen.getAllByRole("link", { name: /get started/i });
    expect(getStartedLinks).toHaveLength(4);

    // Relatable tags check
    expect(screen.getByText("MTN")).toBeInTheDocument();
    expect(screen.getByText("Airtel")).toBeInTheDocument();
    expect(screen.getByText("AEDC")).toBeInTheDocument();
    expect(screen.getByText("WhatsApp")).toBeInTheDocument();
  });

  it("ensures strict heading hierarchy starting at H2 without skipping levels", () => {
    const { container } = render(<ServicesBentoSection />);
    const headings = Array.from(
      container.querySelectorAll("h1, h2, h3, h4, h5, h6")
    ).map((el) => parseInt(el.tagName.replace("H", ""), 10));

    // Section title is H2
    expect(headings[0]).toBe(2);

    // All card titles are H3
    headings.slice(1).forEach((level) => {
      expect(level).toBe(3);
    });
  });

  it("filters service cards when clicking category tabs and restores all on clicking All Services", async () => {
    const user = userEvent.setup();
    render(<ServicesBentoSection />);

    // Click "Bills & Utilities" tab
    const billsTab = screen.getByRole("button", { name: "Bills & Utilities" });
    await user.click(billsTab);

    // Only "Digital Payments / Bills" card title should be shown
    expect(
      screen.getByRole("heading", { level: 3, name: "Digital Payments / Bills" })
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.queryByRole("heading", { level: 3, name: "Airtime & Mobile Data" })
      ).not.toBeInTheDocument();
    });

    // "Show All Services" button is now visible
    const showAllBtn = screen.getByRole("button", { name: /show all services/i });
    await user.click(showAllBtn);

    // All 4 services should be visible again
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { level: 3, name: "Airtime & Mobile Data" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { level: 3, name: "Digital Payments / Bills" })
      ).toBeInTheDocument();
    });
  });

  it("renders the SaaS trust & metrics infrastructure strip", () => {
    render(<ServicesBentoSection />);

    expect(screen.getByText("Sub-Second Dispatch")).toBeInTheDocument();
    expect(screen.getByText("Verified Non-VoIP")).toBeInTheDocument();
    expect(screen.getByText("Global eSIM Roaming")).toBeInTheDocument();
    expect(screen.getByText("Bank-Grade Ledger")).toBeInTheDocument();
  });
});
