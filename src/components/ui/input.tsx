import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "border-input text-foreground file:text-foreground placeholder:text-muted-foreground aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/20 flex h-11 w-full rounded-md border bg-transparent px-4 py-2.5 text-base sm:text-sm shadow-none transition-[border-color,box-shadow,color] duration-150 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/20 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
