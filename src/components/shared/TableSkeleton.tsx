import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface TableSkeletonProps {
  /** Number of columns to display */
  columns?: number;
  /** Number of placeholder body rows to display */
  rows?: number;
  /** Whether to render a placeholder header row */
  showHeader?: boolean;
  /** Screen reader label */
  ariaLabel?: string;
  className?: string;
}

export function TableSkeleton({
  columns = 4,
  rows = 5,
  showHeader = true,
  ariaLabel = "Loading table data",
  className,
}: TableSkeletonProps) {
  const safeColumns = Math.max(1, columns);
  const safeRows = Math.max(1, rows);

  return (
    <div
      role="status"
      aria-label={ariaLabel}
      aria-busy="true"
      className={cn(
        "border-border bg-card overflow-hidden rounded-md border shadow-none",
        className
      )}
    >
      <span className="sr-only">{ariaLabel}</span>
      <Table>
        {showHeader && (
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {Array.from({ length: safeColumns }).map((_, colIdx) => (
                <TableHead key={`skeleton-head-${colIdx}`}>
                  <Skeleton className="h-3.5 w-20" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
        )}

        <TableBody>
          {Array.from({ length: safeRows }).map((_, rowIdx) => (
            <TableRow
              key={`skeleton-row-${rowIdx}`}
              className="hover:bg-transparent"
            >
              {Array.from({ length: safeColumns }).map((_, colIdx) => (
                <TableCell key={`skeleton-cell-${rowIdx}-${colIdx}`}>
                  <Skeleton className="h-4 w-full max-w-[160px]" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
