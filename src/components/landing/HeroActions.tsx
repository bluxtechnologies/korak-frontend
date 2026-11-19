"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface HeroActionsProps {
  className?: string;
  primaryText?: string;
  primaryHref?: string;
  secondaryText?: string;
  secondaryHref?: string;
}

/**
 * HeroActions (Phase 01)
 *
 * Implements the two centered CTA actions defined in the hero specification:
 * 1. Primary: "Get Started" (KORAK burgundy background, white text, 10px radius)
 * 2. Secondary: "Explore Services" (neutral border/background, dark text)
 * Both navigate to valid, functional destinations.
 */
export function HeroActions({
  className,
  primaryText = "Get Started",
  primaryHref = "/register",
  secondaryText = "Explore Services",
  secondaryHref = "#services",
}: HeroActionsProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 w-full sm:w-auto",
        className
      )}
    >
      {/* Primary CTA */}
      <Button
        asChild
        size="lg"
        className="h-12 w-full sm:w-auto px-8 text-sm sm:text-base font-semibold rounded-[10px] bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm"
      >
        <Link href={primaryHref}>
          <span>{primaryText}</span>
          <ArrowRight className="ml-2 size-4" aria-hidden="true" />
        </Link>
      </Button>

      {/* Secondary CTA */}
      <Button
        asChild
        variant="outline"
        size="lg"
        className="h-12 w-full sm:w-auto px-8 text-sm sm:text-base font-semibold rounded-[10px] border-border bg-card/80 text-foreground hover:bg-muted hover:border-border/80 active:scale-[0.98] transition-all"
      >
        <Link href={secondaryHref}>{secondaryText}</Link>
      </Button>
    </div>
  );
}
