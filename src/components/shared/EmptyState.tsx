import * as React from "react";
import { Inbox, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional Lucide icon displayed above the heading (defaults to Inbox) */
  icon?: LucideIcon;
  /** Concise empty state heading */
  title: string;
  /** Helpful explanation of why the view is empty or what to do next */
  description?: string;
  /** Next-action button or link rendered below the explanation */
  action?: React.ReactNode;
  /** Renders a 1px neutral card border around the panel */
  bordered?: boolean;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  bordered = true,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-12 text-center",
        bordered && "border-border bg-card rounded-md border shadow-none",
        className
      )}
      {...props}
    >
      <div
        aria-hidden="true"
        className="border-border bg-surface text-muted-foreground mb-4 flex h-11 w-11 items-center justify-center rounded-md border"
      >
        <Icon className="h-5 w-5" />
      </div>

      <h3 className="text-foreground text-base font-semibold">{title}</h3>

      {description && (
        <p className="text-muted-foreground mt-1 max-w-sm text-sm">
          {description}
        </p>
      )}

      {action && <div className="mt-5 flex items-center gap-2">{action}</div>}
    </div>
  );
}
