"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/navigation";
import { cn } from "@/lib/utils";

export interface NeedHelpCardProps {
  className?: string;
}

/**
 * NeedHelpCard (Support Column).
 * Minimal, classy support card with white background, subtle border,
 * support icon, 'Need help?' heading, description, Contact Support button, and Help Center link.
 */
export function NeedHelpCard({ className }: NeedHelpCardProps) {
  return (
    <div
      className={cn(
        "border-border/80 bg-card flex min-h-[120px] flex-col justify-between rounded-2xl border p-5 shadow-xs sm:p-6 lg:min-h-[220px]",
        className
      )}
      data-testid="need-help-card"
    >
      {/* Top Header / Content */}
      <div className="flex items-center justify-between gap-3 lg:block">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#7A1F3D]/10 text-[#7A1F3D] dark:bg-[#7A1F3D]/25 dark:text-[#E892A8]">
            <Headphones className="size-5 shrink-0" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h3 className="text-foreground text-sm font-bold sm:text-base">
              Need help?
            </h3>
            <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
              We&apos;re here to help with your digital services.
            </p>
          </div>
        </div>

        {/* Mobile / Tablet Contact Support Pill Button (inline) */}
        <div className="shrink-0 lg:hidden">
          <Button
            asChild
            size="sm"
            className="h-8 rounded-full bg-[#7A1F3D] px-3.5 text-xs font-semibold text-white shadow-xs transition-transform hover:bg-[#60142D] active:scale-[0.98]"
          >
            <Link href={ROUTES.SUPPORT} className="flex items-center gap-1">
              <span>Contact Support</span>
              <ArrowRight className="size-3" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Desktop Actions in Column Layout */}
      <div className="mt-4 hidden flex-col gap-2.5 lg:flex">
        <Button
          asChild
          className="h-9 w-full rounded-full bg-[#7A1F3D] text-xs font-semibold text-white shadow-xs transition-transform hover:bg-[#60142D] active:scale-[0.98] sm:text-sm"
        >
          <Link
            href={ROUTES.SUPPORT}
            className="flex items-center justify-center gap-1.5"
          >
            <span>Contact Support</span>
            <ArrowRight className="size-3.5" aria-hidden="true" />
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
