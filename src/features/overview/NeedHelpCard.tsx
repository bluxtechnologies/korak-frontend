"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ROUTES } from "@/config/navigation";
import { cn } from "@/lib/utils";

export interface NeedHelpCardProps {
  className?: string;
}

export function NeedHelpCard({ className }: NeedHelpCardProps) {
  return (
    <Card
      className={cn(
        "flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-6 shadow-xs",
        className
      )}
      data-testid="need-help-card"
    >
      <div>
        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Headphones className="size-5 shrink-0" aria-hidden="true" />
        </div>
        <h3 className="mt-4 text-base font-bold text-foreground sm:text-lg">
          Need help?
        </h3>
        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
          We&apos;re here to help with your digital services.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-2.5">
        <Button
          asChild
          className="h-10 w-full rounded-lg bg-[#7A1F3D] text-xs font-semibold text-white shadow-xs hover:bg-[#60142D] sm:text-sm"
        >
          <Link href={ROUTES.SETTINGS}>Contact Support</Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className="h-9 w-full rounded-lg border-border/70 text-xs font-medium text-foreground hover:bg-muted sm:text-sm"
        >
          <Link
            href={ROUTES.SETTINGS}
            className="flex items-center justify-center gap-1.5"
          >
            <span>Help Center</span>
            <ArrowRight className="size-3.5 text-muted-foreground" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}
