import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PasswordInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  /** Optional custom accessible label for the reveal button */
  toggleLabel?: string;
}

/**
 * Accessible PasswordInput component with reveal toggle.
 * Follows Doc 05 §8 ("Sensitive values hidden by default with an explicit reveal")
 * and Doc 09 §6 ("Password inputs hidden by default with a reveal toggle").
 */
const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, disabled, toggleLabel, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    const toggleVisibility = () => {
      setShowPassword((prev) => !prev);
    };

    const actionLabel =
      toggleLabel ?? (showPassword ? "Hide password" : "Show password");

    return (
      <div className="relative flex w-full items-center">
        <input
          ref={ref}
          type={showPassword ? "text" : "password"}
          disabled={disabled}
          className={cn(
            "border-input text-foreground placeholder:text-muted-foreground aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/20 flex h-11 w-full rounded-md border bg-transparent py-2.5 pr-11 pl-4 text-base sm:text-sm shadow-none transition-[border-color,box-shadow,color] duration-150 focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/20 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        />
        <button
          type="button"
          onClick={toggleVisibility}
          disabled={disabled}
          aria-label={actionLabel}
          aria-pressed={showPassword}
          className="text-muted-foreground hover:text-foreground focus-visible:ring-primary/20 focus-visible:border-primary absolute top-1/2 right-1.5 -translate-y-1/2 rounded-md p-2 transition-colors focus-visible:ring-4 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
        >
          {showPassword ? (
            <EyeOff className="size-4" aria-hidden="true" />
          ) : (
            <Eye className="size-4" aria-hidden="true" />
          )}
        </button>
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
