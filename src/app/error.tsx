"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSafeErrorMessage } from "@/lib/api/errors";
import { ROUTES } from "@/config/navigation";

interface RootErrorProps {
  error: Error & { digest?: string; statusCode?: number; errorCode?: string };
  reset: () => void;
}

/**
 * Root Error Boundary (Next.js App Router).
 * Catches errors from root-level segments and layouts, including (dashboard)/layout.tsx.
 * Provides a user-friendly UI without leaking internal details per Doc 06 §5 / Doc 09 §8.
 */
export default function RootError({ error, reset }: RootErrorProps) {
  React.useEffect(() => {
    // In production, log error to monitoring per Doc 19
  }, [error]);

  const safeMessage = getSafeErrorMessage(error);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="bg-destructive/10 text-destructive mx-auto mb-4 flex size-14 items-center justify-center rounded-full">
        <AlertCircle className="size-7" aria-hidden="true" />
      </div>

      <h1 className="text-foreground text-2xl font-bold tracking-tight">
        Something went wrong
      </h1>

      <p className="text-muted-foreground mt-2 max-w-md text-sm">
        {safeMessage}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center gap-2"
        >
          <RefreshCw className="size-4" aria-hidden="true" />
          <span>Try Again</span>
        </Button>

        <Button asChild variant="outline">
          <Link href={ROUTES.HOME} className="inline-flex items-center gap-2">
            <Home className="size-4" aria-hidden="true" />
            <span>Go Home</span>
          </Link>
        </Button>

        <Button asChild variant="ghost">
          <Link href={ROUTES.LOGIN} className="inline-flex items-center gap-2">
            <LogIn className="size-4" aria-hidden="true" />
            <span>Sign In</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
