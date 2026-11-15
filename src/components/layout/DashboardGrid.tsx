import * as React from "react";
import { cn } from "@/lib/utils";

const GRID_COLUMN_CLASSES = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
} as const;

const GRID_GAP_CLASSES = {
  sm: "gap-3 sm:gap-4",
  md: "gap-4 sm:gap-6",
  lg: "gap-6 sm:gap-8",
} as const;

export interface DashboardGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of responsive grid columns on desktop viewports */
  columns?: keyof typeof GRID_COLUMN_CLASSES;
  /** Spacing between grid cards/panels */
  gap?: keyof typeof GRID_GAP_CLASSES;
}

export function DashboardGrid({
  columns = 3,
  gap = "md",
  className,
  children,
  ...props
}: DashboardGridProps) {
  return (
    <div
      className={cn(
        "grid",
        GRID_COLUMN_CLASSES[columns],
        GRID_GAP_CLASSES[gap],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
