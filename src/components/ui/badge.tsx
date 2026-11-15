import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-ring select-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-none",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground shadow-none",
        destructive:
          "border-destructive-border bg-destructive-surface text-destructive shadow-none",
        outline: "border-border text-foreground bg-transparent shadow-none",
        info: "border-info-border bg-info-surface text-info shadow-none",
        success:
          "border-success-border bg-success-surface text-success shadow-none",
        warning:
          "border-warning-border bg-warning-surface text-warning shadow-none",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
