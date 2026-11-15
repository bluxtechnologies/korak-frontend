"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ROUTES } from "@/config/navigation";
import { Clock } from "lucide-react";
import { getSafeRedirectPath } from "./LoginForm";

export interface SessionExpiredCardProps {
  initialIntended?: string | null;
}

export function SessionExpiredCard({ initialIntended }: SessionExpiredCardProps) {
  const searchParams = useSearchParams();
  const rawIntended = initialIntended ?? searchParams?.get("intended") ?? null;
  const safeIntended = getSafeRedirectPath(rawIntended);
  const hasIntended = safeIntended !== ROUTES.OVERVIEW;

  const loginHref = hasIntended
    ? `${ROUTES.LOGIN}?intended=${encodeURIComponent(safeIntended)}`
    : ROUTES.LOGIN;

  return (
    <div className="space-y-6 text-center" role="region" aria-label="Session expired notification">
      {/* Icon badge */}
      <div className="bg-muted text-muted-foreground mx-auto flex size-12 items-center justify-center rounded-full">
        <Clock className="size-6 text-primary" aria-hidden />
      </div>

      <div className="space-y-2">
        <h1 className="text-foreground text-xl font-semibold tracking-tight">
          Session expired
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Your session has timed out due to inactivity, or you were signed out.
          Please sign in again to continue your work.
        </p>
      </div>

      {hasIntended && (
        <p className="text-muted-foreground bg-muted/50 rounded-md border border-border/50 px-3 py-2 text-xs">
          We&apos;ll return you to your previous page (
          <code className="text-foreground font-mono">{safeIntended}</code>
          ) after you sign in.
        </p>
      )}

      <div className="space-y-3 pt-2">
        <Link
          href={loginHref}
          className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring block w-full rounded-md py-2.5 text-center text-sm font-medium transition-colors focus-visible:ring-1 focus-visible:outline-none"
        >
          Sign in again
        </Link>

        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring block text-center text-xs transition-colors focus-visible:ring-1 focus-visible:outline-none"
        >
          Return to home
        </Link>
      </div>
    </div>
  );
}
