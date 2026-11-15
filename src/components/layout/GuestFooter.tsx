import * as React from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { GUEST_CONTENT } from "@/config/guest-content";
import { cn } from "@/lib/utils";

export function GuestFooter({ className }: { className?: string }) {
  const footer = GUEST_CONTENT.footer;

  return (
    <footer className={cn("border-t border-border bg-background", className)}>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <BrandLogo href="/" />
            <p className="max-w-sm text-xs text-muted-foreground leading-relaxed">
              {footer.description}
            </p>
          </div>

          {/* Platform Navigation */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Platform
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="#services"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {footer.links.services}
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {footer.links.howItWorks}
                </a>
              </li>
              <li>
                <a
                  href="#security"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {footer.links.security}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Account */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Legal & Account
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {footer.links.terms}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {footer.links.privacy}
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {footer.links.login}
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {footer.links.register}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>{footer.copyright}</p>
          <p className="text-[11px] text-muted-foreground/80">
            Fintech Architecture · Strict Security Standards
          </p>
        </div>
      </div>
    </footer>
  );
}
