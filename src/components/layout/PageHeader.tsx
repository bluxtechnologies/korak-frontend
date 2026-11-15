import * as React from "react";
import { type BreadcrumbItem } from "@/config/navigation";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { cn } from "@/lib/utils";

export interface PageHeaderProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "title"
> {
  /** Primary page heading rendered as an h1 */
  title: React.ReactNode;
  /** Optional muted subtitle below the title */
  description?: React.ReactNode;
  /** Custom breadcrumb node (e.g. shared Breadcrumb component) */
  breadcrumb?: React.ReactNode;
  /** Breadcrumb items resolved via getBreadcrumbs when no custom breadcrumb node is passed */
  breadcrumbs?: BreadcrumbItem[];
  /** Primary action slot aligned on the right on larger viewports */
  action?: React.ReactNode;
  /** Renders a subtle 1px bottom border separating the header from content */
  bordered?: boolean;
}

export function PageHeader({
  title,
  description,
  breadcrumb,
  breadcrumbs,
  action,
  bordered = true,
  className,
  ...props
}: PageHeaderProps) {
  const hasBuiltInBreadcrumbs =
    breadcrumb === undefined && breadcrumbs && breadcrumbs.length > 0;

  return (
    <div
      className={cn(
        "space-y-3",
        bordered && "border-border border-b pb-5",
        className
      )}
      {...props}
    >
      {breadcrumb !== undefined
        ? breadcrumb
        : hasBuiltInBreadcrumbs && <Breadcrumb items={breadcrumbs} />}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            {title}
          </h1>
          {description && (
            <div className="text-muted-foreground text-sm font-normal">
              {description}
            </div>
          )}
        </div>

        {action && (
          <div className="flex shrink-0 items-center gap-2">{action}</div>
        )}
      </div>
    </div>
  );
}
