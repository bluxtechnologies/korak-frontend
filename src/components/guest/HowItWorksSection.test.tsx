import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HowItWorksSection } from "./HowItWorksSection";
import { GUEST_CONTENT } from "@/config/guest-content";

describe("HowItWorksSection", () => {
  it("renders the section h2 heading and description", () => {
    render(<HowItWorksSection />);
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: GUEST_CONTENT.howItWorks.sectionTitle,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(GUEST_CONTENT.howItWorks.sectionDescription)
    ).toBeInTheDocument();
  });

  it("renders exactly three steps in order with titles and draft copy", () => {
    render(<HowItWorksSection />);
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("02")).toBeInTheDocument();
    expect(screen.getByText("03")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { level: 3, name: "Create an account" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: "Add funds to your wallet" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 3,
        name: "Choose a service and place your order",
      })
    ).toBeInTheDocument();
  });

  it("does not name specific payment methods in step descriptions", () => {
    render(<HowItWorksSection />);
    const region = screen.getByRole("region", { name: /how it works/i });
    const text = region.textContent?.toLowerCase() ?? "";

    expect(text).not.toContain("paystack");
    expect(text).not.toContain("flutterwave");
    expect(text).not.toContain("stripe");
    expect(text).not.toContain("paypal");
    expect(text).not.toContain("mastercard");
    expect(text).not.toContain("visa");
    expect(text).not.toContain("credit card");
  });
});
