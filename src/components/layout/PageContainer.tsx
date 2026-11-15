import * as React from "react";
import { cn } from "@/lib/utils";

const MAX_WIDTH_CLASSES = {
  narrow: "max-w-3xl",
  default: "max-w-7xl",
  wide: "max-w-screen-2xl",
  full: "max-w-full",
} as const;

export interface PageContainerProps extends React.HTMLAttributes<HTMLElement> {
  /** Constrains content width cleanly across screen sizes */
  maxWidth?: keyof typeof MAX_WIDTH_CLASSES;
  /** Semantic element wrapper (defaults to 'div' when placed inside an outer <main>) */
  as?: "div" | "main" | "section";
}

export function PageContainer({
  maxWidth = "default",
  as: Component = "div",
  className,
  children,
  ...props
}: PageContainerProps) {
  return (
    <Component
      className={cn(
        "mx-auto w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8",
        MAX_WIDTH_CLASSES[maxWidth],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
