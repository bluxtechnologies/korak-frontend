import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HeroSection } from "./HeroSection";

describe("HeroSection (Phase 02 — Atmospheric Refinement & Relatable Floating Proof)", () => {
  it("renders a single h1 heading with the headline", () => {
    render(<HeroSection />);
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(/everything you need/i);
    expect(headings[0]).toHaveTextContent(/all in one place/i);
  });

  it("renders the refined eyebrow badge pill with pulsing indicator", () => {
    render(<HeroSection />);
    expect(screen.getByText("YOUR DIGITAL WORLD, SIMPLIFIED")).toBeInTheDocument();
  });

  it("renders the supporting description text", () => {
    render(<HeroSection />);
    expect(
      screen.getByText(
        "Access digital services, manage your wallet and complete everyday transactions seamlessly with KORAK."
      )
    ).toBeInTheDocument();
  });

  it("renders primary 'Get Started' and secondary 'Explore Services' CTAs", () => {
    render(<HeroSection />);
    const primaryBtn = screen.getByRole("link", { name: /get started/i });
    const secondaryBtn = screen.getByRole("link", { name: /explore services/i });

    expect(primaryBtn).toHaveAttribute("href", "/register");
    expect(secondaryBtn).toHaveAttribute("href", "#services");
  });

  it("ensures the oversized product showcase mockup is removed", () => {
    render(<HeroSection />);
    expect(
      screen.queryByRole("region", {
        name: "KORAK Application Interface Preview",
      })
    ).not.toBeInTheDocument();
  });

  it("renders the subtle background grid and ambient lighting layers", () => {
    render(<HeroSection />);
    expect(screen.getByTestId("hero-grid-pattern")).toBeInTheDocument();
    expect(screen.getByTestId("hero-ambient-glow")).toBeInTheDocument();
  });

  it("renders the streamlined trust strip", () => {
    render(<HeroSection />);
    expect(screen.getByText("Instant Automated Dispatch")).toBeInTheDocument();
    expect(screen.getByText("Bank-Grade Encryption")).toBeInTheDocument();
    expect(screen.getByText("Unified Digital Wallet")).toBeInTheDocument();
  });

  it("renders the four corner floating service cards authentic to KORAK", () => {
    render(<HeroSection />);

    // 1. Top-Left: Airtime Recharge
    expect(screen.getByText("₦2,000 Airtime")).toBeInTheDocument();
    expect(screen.getByText("MTN · 0803 *** 4567")).toBeInTheDocument();
    expect(screen.getByText("Delivered")).toBeInTheDocument();

    // 2. Top-Right: Cellular Data Package
    expect(screen.getByText("10GB Data Bundle")).toBeInTheDocument();
    expect(screen.getByText("Airtel SME · Corporate Plan")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();

    // 3. Bottom-Left: Virtual Number
    expect(screen.getByText("Virtual Number")).toBeInTheDocument();
    expect(screen.getByText("WhatsApp Verification · US (+1)")).toBeInTheDocument();
    expect(screen.getByText("Verified")).toBeInTheDocument();

    // 4. Bottom-Right: Instant Wallet Funding
    expect(screen.getByText("+₦15,000.00")).toBeInTheDocument();
    expect(screen.getByText("Instant Wallet Credit · Paga")).toBeInTheDocument();
    expect(screen.getByText("Credited")).toBeInTheDocument();
  });
});
