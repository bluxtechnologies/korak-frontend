"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/navigation";

export interface ForbiddenCardProps {
  title?: string;
  description?: string;
  className?: string;
}

/**
 * Access Denied (403 Forbidden) state component (F11.4).
 * Follows Doc 04 §4: "show a clear 'no access' state; never a redirect loop".
 */
export function ForbiddenCard({
  title = "Access Denied",
  description = "You do not have permission to view this page or perform this action.",
  className,
}: ForbiddenCardProps) {
  return (
    <div
      role="region"
      aria-label="Access denied notice"
      className={`mx-auto flex max-w-md flex-col items-center justify-center p-8 text-center ${className ?? ""}`}
    >
      <div className="bg-destructive/10 text-destructive mb-4 flex size-14 items-center justify-center rounded-full">
        <ShieldAlert className="size-7" aria-hidden="true" />
      </div>

      <h1 className="text-foreground text-2xl font-bold tracking-tight">
        {title}
      </h1>

      <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
        {description}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button asChild variant="default" size="default">
          <Link href={ROUTES.OVERVIEW} className="inline-flex items-center gap-2">
            <Home className="size-4" aria-hidden="true" />
            <span>Return to Overview</span>
          </Link>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="default"
          onClick={() => {
            if (typeof window !== "undefined" && window.history.length > 1) {
              window.history.back();
            }
          }}
          className="inline-flex items-center gap-2"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          <span>Go Back</span>
        </Button>
      </div>
    </div>
  );
}
