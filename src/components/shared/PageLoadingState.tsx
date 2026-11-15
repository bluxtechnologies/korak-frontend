import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { cn } from "@/lib/utils";

export interface PageLoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether to show a breadcrumb skeleton line above the title */
  showBreadcrumb?: boolean;
  /** Whether to show an action button placeholder in the header */
  showAction?: boolean;
  /** Number of summary/metric cards in the top grid (0 to hide) */
  summaryCards?: number;
  /** Primary body skeleton style: 'table', 'cards', or 'content' */
  bodyType?: "table" | "cards" | "content";
  /** Number of rows if bodyType === 'table' */
  tableRows?: number;
  /** Number of columns if bodyType === 'table' */
  tableColumns?: number;
}

/**
 * Standard page-level loading skeleton matching the dashboard layout and tokens.
 * Suitable for Next.js loading.tsx boundaries and React Suspense fallbacks.
 */
export function PageLoadingState({
  showBreadcrumb = true,
  showAction = true,
  summaryCards = 0,
  bodyType = "table",
  tableRows = 5,
  tableColumns = 5,
  className,
  ...props
}: PageLoadingStateProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading page content"
      className={cn("w-full space-y-6", className)}
      {...props}
    >
      {/* Page Header Skeleton */}
      <div className="border-border space-y-3 border-b pb-5">
        {showBreadcrumb && (
          <Skeleton className="h-3.5 w-36 rounded-md" aria-hidden="true" />
        )}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-7 w-48 rounded-md" aria-hidden="true" />
            <Skeleton className="h-4 w-72 rounded-md" aria-hidden="true" />
          </div>
          {showAction && (
            <Skeleton className="h-9 w-28 rounded-md" aria-hidden="true" />
          )}
        </div>
      </div>

      {/* Summary Cards Skeleton (optional) */}
      {summaryCards > 0 && (
        <div
          className={cn(
            "grid gap-4",
            summaryCards === 2 && "grid-cols-1 sm:grid-cols-2",
            summaryCards === 3 && "grid-cols-1 sm:grid-cols-3",
            summaryCards >= 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          )}
        >
          {Array.from({ length: summaryCards }).map((_, i) => (
            <div
              key={`card-skel-${i}`}
              className="border-border space-y-3 rounded-md border p-4"
            >
              <Skeleton className="h-3.5 w-24 rounded-md" aria-hidden="true" />
              <Skeleton className="h-6 w-32 rounded-md" aria-hidden="true" />
            </div>
          ))}
        </div>
      )}

      {/* Main Body Skeleton */}
      {bodyType === "table" && (
        <TableSkeleton rows={tableRows} columns={tableColumns} />
      )}

      {bodyType === "cards" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={`content-card-skel-${i}`}
              className="border-border space-y-3 rounded-md border p-5"
            >
              <Skeleton className="h-5 w-40 rounded-md" aria-hidden="true" />
              <Skeleton className="h-4 w-full rounded-md" aria-hidden="true" />
              <Skeleton className="h-4 w-2/3 rounded-md" aria-hidden="true" />
            </div>
          ))}
        </div>
      )}

      {bodyType === "content" && (
        <div className="border-border space-y-4 rounded-md border p-6">
          <Skeleton className="h-5 w-48 rounded-md" aria-hidden="true" />
          <Skeleton className="h-4 w-full rounded-md" aria-hidden="true" />
          <Skeleton className="h-4 w-5/6 rounded-md" aria-hidden="true" />
          <Skeleton className="h-4 w-3/4 rounded-md" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}
