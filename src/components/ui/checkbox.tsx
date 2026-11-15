import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer border-input focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/20 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground size-5 shrink-0 rounded-md border shadow-none transition-[border-color,background-color,box-shadow,transform] duration-150 ease-out motion-safe:active:scale-95 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn(
        "flex items-center justify-center text-current motion-safe:data-[state=checked]:animate-in motion-safe:data-[state=checked]:zoom-in-75 duration-150 ease-out"
      )}
    >
      <Check className="size-3.5 stroke-[3]" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
