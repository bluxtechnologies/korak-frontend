import * as React from "react";
import Link from "next/link";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import {
  type BreadcrumbItem as NavBreadcrumbItem,
  getBreadcrumbs,
} from "@/config/navigation";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Compound Primitive Components
// ---------------------------------------------------------------------------

export const BreadcrumbRoot = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"nav">
>(({ className, ...props }, ref) => (
  <nav
    ref={ref}
    aria-label="Breadcrumb"
    className={cn("w-full", className)}
    {...props}
  />
));
BreadcrumbRoot.displayName = "BreadcrumbRoot";

export const BreadcrumbList = React.forwardRef<
  HTMLOListElement,
  React.ComponentPropsWithoutRef<"ol">
>(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    className={cn(
      "text-muted-foreground flex flex-wrap items-center gap-1.5 text-xs",
      className
    )}
    {...props}
  />
));
BreadcrumbList.displayName = "BreadcrumbList";

export const BreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn("inline-flex items-center gap-1.5", className)}
    {...props}
  />
));
BreadcrumbItem.displayName = "BreadcrumbItem";

export interface BreadcrumbLinkProps extends React.ComponentPropsWithoutRef<
  typeof Link
> {
  asChild?: boolean;
}

export const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  BreadcrumbLinkProps
>(({ className, href, ...props }, ref) => (
  <Link
    ref={ref}
    href={href}
    className={cn(
      "hover:text-foreground focus-visible:ring-ring rounded-md transition-colors focus-visible:ring-1 focus-visible:outline-none",
      className
    )}
    {...props}
  />
));
BreadcrumbLink.displayName = "BreadcrumbLink";

export const BreadcrumbPage = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span">
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    role="link"
    aria-disabled="true"
    aria-current="page"
    className={cn("text-foreground font-medium", className)}
    {...props}
  />
));
BreadcrumbPage.displayName = "BreadcrumbPage";

export const BreadcrumbSeparator = ({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"li">) => (
  <li
    role="presentation"
    aria-hidden="true"
    className={cn("text-muted-foreground [&>svg]:size-3.5", className)}
    {...props}
  >
    {children ?? <ChevronRight className="size-3.5 shrink-0" />}
  </li>
);
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

export const BreadcrumbEllipsis = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"span">) => (
  <span
    role="presentation"
    aria-hidden="true"
    className={cn("flex h-4 w-4 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="size-3.5" />
    <span className="sr-only">More</span>
  </span>
);
BreadcrumbEllipsis.displayName = "BreadcrumbEllipsis";

// ---------------------------------------------------------------------------
// Convenience High-Level Component
// ---------------------------------------------------------------------------

export interface BreadcrumbProps extends React.ComponentPropsWithoutRef<"nav"> {
  /** Explicit array of breadcrumb items */
  items?: NavBreadcrumbItem[];
  /** Optional pathname from which to auto-derive breadcrumbs via getBreadcrumbs */
  pathname?: string;
  /** Custom label when the route is a dynamic/detail child (e.g. "Order #1234") */
  detailLabel?: string;
  /** Children for compound composition */
  children?: React.ReactNode;
}

/**
 * Standard Breadcrumb component for customer dashboard pages.
 * Supports both high-level `items` array / `pathname` and compound child composition.
 */
export function Breadcrumb({
  items,
  pathname,
  detailLabel,
  className,
  children,
  ...props
}: BreadcrumbProps) {
  // If compound children are provided, render as primitive root
  if (children) {
    return (
      <BreadcrumbRoot className={className} {...props}>
        {children}
      </BreadcrumbRoot>
    );
  }

  // Derive breadcrumbs from items prop or pathname
  const resolvedItems: NavBreadcrumbItem[] =
    items ?? (pathname ? getBreadcrumbs(pathname, { detailLabel }) : []);

  if (resolvedItems.length === 0) {
    return null;
  }

  return (
    <BreadcrumbRoot className={className} {...props}>
      <BreadcrumbList>
        {resolvedItems.map((item, index) => {
          const isFirst = index === 0;
          return (
            <React.Fragment key={`${item.label}-${index}`}>
              {!isFirst && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {item.isCurrent || !item.href ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </BreadcrumbRoot>
  );
}
