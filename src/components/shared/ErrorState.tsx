import * as React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSafeErrorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Caught error (automatically mapped via getSafeErrorMessage so raw internals never render) */
  error?: unknown;
  /** Explicit safe UI message override */
  message?: string;
  /** Heading displayed above the error description */
  title?: string;
  /** Callback triggered when user clicks retry; button is shown when supplied */
  onRetry?: () => void;
  retryLabel?: string;
  isRetrying?: boolean;
  /** Renders a 1px neutral card border around the error panel */
  bordered?: boolean;
}

export function ErrorState({
  error,
  message,
  title = "Something went wrong",
  onRetry,
  retryLabel = "Try again",
  isRetrying = false,
  bordered = true,
  className,
  ...props
}: ErrorStateProps) {
  const safeMessage =
    message ?? getSafeErrorMessage(error, "Unable to load data right now.");

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center px-6 py-12 text-center",
        bordered && "border-border bg-card rounded-md border shadow-none",
        className
      )}
      {...props}
    >
      <div
        aria-hidden="true"
        className="border-destructive-border bg-destructive-surface text-destructive mb-4 flex h-11 w-11 items-center justify-center rounded-md border"
      >
        <AlertCircle className="h-5 w-5" />
      </div>

      <h3 className="text-foreground text-base font-semibold">{title}</h3>

      <p className="text-muted-foreground mt-1 max-w-md text-sm">
        {safeMessage}
      </p>

      {onRetry && (
        <div className="mt-5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRetry}
            isLoading={isRetrying}
          >
            {retryLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
