"use client";

import * as React from "react";
import { AlertCircle, RefreshCw, Lock, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { ForbiddenCard } from "@/components/shared/ForbiddenCard";
import { ApiClientError } from "@/lib/api/client";
import { getSafeErrorMessage } from "@/lib/api/errors";

interface ErrorBoundaryProps {
  error: Error & { digest?: string; statusCode?: number; errorCode?: string };
  reset: () => void;
}

/**
 * Dashboard Error Boundary (F11.4).
 * Safely handles 401, 403, 423, 429, and unexpected errors without leaking internals (Doc 04 §4).
 */
export default function DashboardError({ error, reset }: ErrorBoundaryProps) {
  React.useEffect(() => {
    // In production, log to monitoring per Doc 19; avoid console.log in committed code
  }, [error]);

  const isApiError = error instanceof ApiClientError;
  const statusCode = isApiError ? error.status : error.statusCode;
  const errorCode = isApiError ? error.code : error.errorCode;

  // 1. 403 Forbidden State: show clear no-access state per Doc 04 §4
  if (statusCode === 403 || errorCode === "forbidden") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-6">
        <ForbiddenCard />
      </div>
    );
  }

  // 2. 423 Account Locked State per Doc 04 §4
  if (statusCode === 423 || errorCode === "account_locked") {
    return (
      <div className="mx-auto my-12 max-w-lg p-6">
        <Alert variant="destructive" className="space-y-3">
          <div className="flex items-center gap-2 font-semibold">
            <Lock className="size-5 shrink-0" aria-hidden="true" />
            <span>Account Locked</span>
          </div>
          <p className="text-sm">
            Your account is temporarily locked. Please contact support to regain access.
          </p>
        </Alert>
      </div>
    );
  }

  // 3. 429 Throttled / Rate Limited State per Doc 04 §4
  if (statusCode === 429 || errorCode === "throttled") {
    return (
      <div className="mx-auto my-12 max-w-lg p-6">
        <Alert variant="warning" className="space-y-3">
          <div className="flex items-center gap-2 font-semibold">
            <Clock className="size-5 shrink-0" aria-hidden="true" />
            <span>Request Throttled</span>
          </div>
          <p className="text-sm">
            Too many requests. Please wait a moment before trying again.
          </p>
          <div className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => reset()}
              className="inline-flex items-center gap-2"
            >
              <RefreshCw className="size-3.5" aria-hidden="true" />
              <span>Try Again</span>
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  // 4. Default safe error boundary for unexpected errors
  const safeMessage = getSafeErrorMessage(error);

  return (
    <div className="mx-auto my-12 max-w-lg p-6 text-center">
      <div className="bg-destructive/10 text-destructive mx-auto mb-4 flex size-12 items-center justify-center rounded-full">
        <AlertCircle className="size-6" aria-hidden="true" />
      </div>

      <h2 className="text-foreground text-xl font-semibold tracking-tight">
        Something went wrong
      </h2>

      <p className="text-muted-foreground mt-2 text-sm">
        {safeMessage}
      </p>

      <div className="mt-6 flex justify-center">
        <Button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center gap-2"
        >
          <RefreshCw className="size-4" aria-hidden="true" />
          <span>Try Again</span>
        </Button>
      </div>
    </div>
  );
}
