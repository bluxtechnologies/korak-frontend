"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface SearchInputProps {
  /** Controlled search string */
  value?: string;
  /** Uncontrolled initial search string */
  defaultValue?: string;
  /** Fired after debounce when typing, or immediately on clear / Enter */
  onSearchChange: (value: string) => void;
  /** Debounce delay in milliseconds (defaults to 300ms; set 0 for immediate) */
  debounceMs?: number;
  placeholder?: string;
  ariaLabel?: string;
  disabled?: boolean;
  className?: string;
}

export function SearchInput({
  value,
  defaultValue = "",
  onSearchChange,
  debounceMs = 300,
  placeholder = "Search...",
  ariaLabel = "Search",
  disabled = false,
  className,
}: SearchInputProps) {
  const [inputValue, setInputValue] = React.useState(value ?? defaultValue);
  const [prevValueProp, setPrevValueProp] = React.useState(value);

  // Sync local draft when controlled value changes externally (e.g. "Reset filters")
  if (value !== prevValueProp) {
    setPrevValueProp(value);
    if (value !== undefined) {
      setInputValue(value);
    }
  }

  const inputRef = React.useRef<HTMLInputElement>(null);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPendingTimer = React.useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  React.useEffect(() => {
    return () => clearPendingTimer();
  }, [clearPendingTimer]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    setInputValue(nextValue);
    clearPendingTimer();

    if (debounceMs <= 0) {
      onSearchChange(nextValue);
      return;
    }

    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      onSearchChange(nextValue);
    }, debounceMs);
  };

  const handleClear = () => {
    clearPendingTimer();
    setInputValue("");
    onSearchChange("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      clearPendingTimer();
      onSearchChange(inputValue);
    } else if (event.key === "Escape" && inputValue.length > 0) {
      event.preventDefault();
      handleClear();
    }
  };

  return (
    <div className={cn("relative flex items-center", className)}>
      <Search
        className="text-muted-foreground pointer-events-none absolute left-3 h-4 w-4"
        aria-hidden="true"
      />
      <Input
        ref={inputRef}
        type="search"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label={ariaLabel}
        disabled={disabled}
        className="pr-9 pl-9 [&::-webkit-search-cancel-button]:hidden"
      />
      {inputValue.length > 0 && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring absolute right-2 flex h-6 w-6 items-center justify-center rounded-md transition-colors focus-visible:ring-1 focus-visible:outline-none"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
