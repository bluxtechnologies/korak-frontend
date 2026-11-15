import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-150 ease-out motion-safe:enabled:active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-none",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/20 shadow-none",
        outline:
          "border border-border bg-transparent hover:bg-muted text-foreground shadow-none",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-none",
        ghost: "hover:bg-muted text-foreground shadow-none",
        link: "text-primary underline-offset-4 hover:underline shadow-none focus-visible:ring-0",
      },
      size: {
        default: "h-11 px-5 py-2.5 text-sm sm:text-base rounded-md",
        sm: "h-9 px-3.5 text-xs rounded-md",
        lg: "h-12 px-6 text-base rounded-md",
        icon: "h-11 w-11 p-0 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        {...props}
      >
        {isLoading && (
          <Loader2 className="animate-spin" data-testid="button-spinner" />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
