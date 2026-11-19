"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface NavLinkItem {
  label: string;
  href: string;
}

export const LANDING_NAV_LINKS: NavLinkItem[] = [
  { label: "Home", href: "/" },
  { label: "Services", href: "#services" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
];

export interface LandingNavbarProps {
  className?: string;
  navLinks?: NavLinkItem[];
  loginHref?: string;
  registerHref?: string;
}

/**
 * LandingNavbar (Phase 01)
 *
 * Minimal Editorial SaaS + Premium Fintech navigation bar.
 * Follows Formcarry's clean horizontal layout with KORAK's burgundy identity:
 * - Left: Official KORAK brand logo
 * - Center: Evenly spaced, restrained typography links (Home, Services, How It Works, Pricing)
 * - Right: Account actions (text "Log In" + primary burgundy "Get Started" CTA)
 * - Mobile: Accessible slide-down menu with touch-friendly 44px hit targets.
 */
export function LandingNavbar({
  className,
  navLinks = LANDING_NAV_LINKS,
  loginHref = "/login",
  registerHref = "/register",
}: LandingNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState<string>("/");

  // Listen to Escape key to close mobile menu
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  // Prevent background scroll when mobile menu is open
  React.useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-border/70 bg-[#FAF9F8]/90 dark:bg-[#09090b]/90 backdrop-blur-md transition-colors",
        className
      )}
    >
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Logo */}
        <div className="flex items-center">
          <BrandLogo
            href="/"
            variant="full"
            size="md"
            priority={true}
            className="hover:opacity-90 transition-opacity"
          />
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav
          className="hidden md:flex items-center gap-8"
          aria-label="Main Navigation"
        >
          {navLinks.map((link) => {
            const isActive = activeSection === link.href;
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setActiveSection(link.href)}
                className={cn(
                  "text-sm font-medium transition-colors duration-150 select-none",
                  isActive
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:text-primary dark:hover:text-primary"
                )}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        {/* Right: Account actions & Theme Toggle */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Link
            href={loginHref}
            className="px-3.5 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-lg"
          >
            Log In
          </Link>
          <Button
            asChild
            size="sm"
            className="h-10 px-5 text-sm font-semibold rounded-[10px] bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all shadow-xs"
          >
            <Link href={registerHref}>Get Started</Link>
          </Button>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            className="flex size-10 items-center justify-center rounded-lg border border-border/80 bg-background text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer / Panel */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
          className="fixed inset-x-0 top-18 z-50 border-b border-border bg-background/98 p-6 shadow-2xl backdrop-blur-xl md:hidden animate-in slide-in-from-top-2 duration-200"
        >
          <nav className="flex flex-col gap-4" aria-label="Mobile Navigation Links">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center rounded-lg px-3 py-2.5 text-base font-medium text-foreground hover:bg-muted hover:text-primary transition-colors"
              >
                {link.label}
              </a>
            ))}

            <div className="my-2 h-px w-full bg-border/80" />

            {/* Mobile Account actions */}
            <div className="flex flex-col gap-3 pt-1">
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full justify-center h-11 text-sm font-semibold rounded-[10px] border-border"
              >
                <Link href={loginHref} onClick={() => setMobileMenuOpen(false)}>
                  Log In
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="w-full justify-center h-11 text-sm font-semibold rounded-[10px] bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all shadow-xs"
              >
                <Link href={registerHref} onClick={() => setMobileMenuOpen(false)}>
                  Get Started
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
