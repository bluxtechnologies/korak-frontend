"use client";

import * as React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSafeErrorMessage } from "@/lib/api/errors";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const safeMessage = getSafeErrorMessage(error);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center p-6 text-center font-sans antialiased">
        <div className="bg-destructive/10 text-destructive mx-auto mb-4 flex size-14 items-center justify-center rounded-full">
          <AlertCircle className="size-7" aria-hidden="true" />
        </div>

        <h1 className="text-foreground text-2xl font-bold tracking-tight">
          Application Error
        </h1>

        <p className="text-muted-foreground mt-2 max-w-md text-sm">
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
      </body>
    </html>
  );
}
