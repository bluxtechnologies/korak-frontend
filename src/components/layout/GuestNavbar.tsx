"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Button } from "@/components/ui/button";
import { GUEST_CONTENT } from "@/config/guest-content";
import { cn } from "@/lib/utils";

export function GuestNavbar({ className }: { className?: string }) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const nav = GUEST_CONTENT.navigation;

  const navLinks = [
    { label: nav.servicesLabel, href: "#services" },
    { label: nav.howItWorksLabel, href: "#how-it-works" },
    { label: nav.securityLabel, href: "#security" },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-sm",
        className
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <BrandLogo href="/" />
          {/* Desktop Nav Links */}
          <nav
            className="hidden md:flex items-center gap-6"
            aria-label="Guest page navigation"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Right Actions: Theme Toggle + Auth buttons */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">{nav.loginLabel}</Link>
          </Button>
          <Button variant="default" size="sm" asChild>
            <Link href="/register">{nav.registerLabel}</Link>
          </Button>
        </div>

        {/* Mobile Hamburger & Theme Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="border-b border-border bg-background px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2 pt-2 border-t border-border">
              <Button variant="outline" size="sm" asChild className="w-full">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  {nav.loginLabel}
                </Link>
              </Button>
              <Button variant="default" size="sm" asChild className="w-full">
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  {nav.registerLabel}
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
