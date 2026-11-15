import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ClosingCtaSection } from "./ClosingCtaSection";
import { GUEST_CONTENT } from "@/config/guest-content";

describe("ClosingCtaSection", () => {
  it("renders the closing cta heading and description", () => {
    render(<ClosingCtaSection />);
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: GUEST_CONTENT.closingCta.title,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(GUEST_CONTENT.closingCta.description)
    ).toBeInTheDocument();
  });

  it("renders primary 'Register' and secondary 'Log in' action buttons", () => {
    render(<ClosingCtaSection />);
    const registerBtn = screen.getByRole("link", { name: /register/i });
    const loginBtn = screen.getByRole("link", { name: /log in/i });

    expect(registerBtn).toHaveAttribute("href", "/register");
    expect(loginBtn).toHaveAttribute("href", "/login");
  });
});
