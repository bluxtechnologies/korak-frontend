"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface OtpInputProps {
  id?: string;
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  hasError?: boolean;
  "aria-describedby"?: string;
  className?: string;
}

export function OtpInput({
  id,
  length = 6,
  value = "",
  onChange,
  disabled = false,
  autoFocus = true,
  hasError = false,
  "aria-describedby": ariaDescribedBy,
  className,
}: OtpInputProps) {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // Array of digits according to length
  const digits = React.useMemo(() => {
    const chars = value.split("");
    return Array.from({ length }, (_, i) => chars[i] || "");
  }, [value, length]);

  // Auto focus first input on mount
  React.useEffect(() => {
    if (autoFocus && inputRefs.current[0] && !disabled) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus, disabled]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const rawVal = e.target.value;
    if (!rawVal) {
      // Empty input
      const newDigits = [...digits];
      newDigits[index] = "";
      onChange(newDigits.join(""));
      return;
    }

    // Only allow single digit / numeric input
    const char = rawVal.replace(/\D/g, "").slice(-1);
    if (!char) return;

    const newDigits = [...digits];
    newDigits[index] = char;
    const nextValue = newDigits.join("");
    onChange(nextValue);

    // Auto-advance to next input
    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      inputRefs.current[index + 1]?.select();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        // Move back and delete previous
        e.preventDefault();
        const newDigits = [...digits];
        newDigits[index - 1] = "";
        onChange(newDigits.join(""));
        inputRefs.current[index - 1]?.focus();
      } else if (digits[index]) {
        // Delete current
        e.preventDefault();
        const newDigits = [...digits];
        newDigits[index] = "";
        onChange(newDigits.join(""));
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
      inputRefs.current[index - 1]?.select();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
      inputRefs.current[index + 1]?.select();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text/plain").replace(/\D/g, "");
    if (!pasted) return;

    const pastedDigits = pasted.slice(0, length);
    onChange(pastedDigits);

    // Focus last filled index or next available slot
    const nextFocusIndex = Math.min(pastedDigits.length, length - 1);
    inputRefs.current[nextFocusIndex]?.focus();
  };

  return (
    <div
      id={id}
      role="group"
      aria-label="Verification code"
      aria-describedby={ariaDescribedBy}
      className={cn("flex items-center justify-between gap-2 sm:gap-3", className)}
    >
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          autoComplete={index === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${index + 1} of ${length}`}
          aria-invalid={hasError}
          disabled={disabled}
          value={digits[index]}
          onChange={(e) => handleInputChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={cn(
            "size-11 sm:size-12 rounded-md border text-center font-mono text-lg font-semibold tracking-normal shadow-none transition-colors",
            "bg-background text-foreground",
            "focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
            hasError
              ? "border-destructive text-destructive focus-visible:border-destructive focus-visible:ring-destructive"
              : "border-input"
          )}
        />
      ))}
    </div>
  );
}
