import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GuestNavbar } from "./GuestNavbar";
import { ThemeProvider } from "@/components/shared/theme-provider";

function renderWithTheme(ui: React.ReactElement) {
  return render(
    <ThemeProvider attribute="class" defaultTheme="light">
      {ui}
    </ThemeProvider>
  );
}

describe("GuestNavbar", () => {
  it("renders the brand logo linking to home", () => {
    renderWithTheme(<GuestNavbar />);
    const brandLink = screen.getByRole("link", { name: /korak digitals/i });
    expect(brandLink).toHaveAttribute("href", "/");
  });

  it("renders navigation jump links to sections", () => {
    renderWithTheme(<GuestNavbar />);
    expect(screen.getByRole("link", { name: "Services" })).toHaveAttribute("href", "#services");
    expect(screen.getByRole("link", { name: "How it works" })).toHaveAttribute("href", "#how-it-works");
    expect(screen.getByRole("link", { name: "Security & Trust" })).toHaveAttribute("href", "#security");
  });

  it("renders auth action links for Log in and Create account", () => {
    renderWithTheme(<GuestNavbar />);
    const loginLinks = screen.getAllByRole("link", { name: "Log in" });
    const registerLinks = screen.getAllByRole("link", { name: "Create account" });

    expect(loginLinks[0]).toHaveAttribute("href", "/login");
    expect(registerLinks[0]).toHaveAttribute("href", "/register");
  });
});
