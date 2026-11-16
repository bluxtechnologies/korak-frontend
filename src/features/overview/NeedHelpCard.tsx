"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NAV_ICON_STROKE_WIDTH, ROUTES } from "@/config/navigation";
import { cn } from "@/lib/utils";

export interface NeedHelpCardProps {
  className?: string;
}

/**
 * NeedHelpCard (Support Column).
 * Minimal, classy support card with card surface, subtle border,
 * support icon, 'Need help?' heading, description, Contact Support button, and Help Center link.
 *
 * Design system rules (Doc 05):
 * - 10px radius (rounded-md), no pill shapes.
 * - Semantic tokens only.
 * - Lucide icons with locked 1.75 stroke width.
 * - Near-zero shadows.
 */
export function NeedHelpCard({ className }: NeedHelpCardProps) {
  return (
    <div
      className={cn(
        "border-border bg-card flex min-h-[120px] flex-col justify-between rounded-md border p-5 sm:p-6 lg:min-h-[220px]",
        className
      )}
      data-testid="need-help-card"
    >
      {/* Top Header / Content */}
      <div className="flex items-center justify-between gap-3 lg:block">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-md">
            <Headphones className="size-5 shrink-0" strokeWidth={NAV_ICON_STROKE_WIDTH} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h3 className="text-foreground text-sm font-semibold sm:text-base">
              Need help?
            </h3>
            <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
              We&apos;re here to help with your digital services.
            </p>
          </div>
        </div>

        {/* Mobile / Tablet Contact Support Button (inline) */}
        <div className="shrink-0 lg:hidden">
          <Button
            asChild
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 rounded-md px-3 text-xs font-semibold"
          >
            <Link href={ROUTES.SUPPORT} className="flex items-center gap-1">
              <span>Contact Support</span>
              <ArrowRight className="size-3" strokeWidth={NAV_ICON_STROKE_WIDTH} aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Desktop Actions in Column Layout */}
      <div className="mt-4 hidden flex-col gap-2.5 lg:flex">
        <Button
          asChild
          className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 w-full rounded-md text-xs font-semibold sm:text-sm"
        >
          <Link
            href={ROUTES.SUPPORT}
            className="flex items-center justify-center gap-1.5"
          >
            <span>Contact Support</span>
            <ArrowRight className="size-3.5" strokeWidth={NAV_ICON_STROKE_WIDTH} aria-hidden="true" />
          </Link>
        </Button>

        <Link
          href={ROUTES.SUPPORT}
          className="text-muted-foreground hover:text-foreground py-1 text-center text-xs font-medium transition-colors"
        >
          Help Center
        </Link>
      </div>
    </div>
  );
}
