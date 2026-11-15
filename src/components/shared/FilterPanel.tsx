"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { SearchInput } from "./SearchInput";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterDefinition {
  /** API filter field key (mapped to `filter[key]` per Doc 06 §6) */
  key: string;
  /** Accessible filter label */
  label: string;
  /** Label shown when no filter value is selected (defaults to `All ${label}`) */
  allLabel?: string;
  options: FilterOption[];
}

export type FilterValues = Record<string, string | undefined>;

const ALL_SENTINEL = "__all__";

/**
 * Converts a FilterValues record into Laravel API `filter[key]` query params
 * per docs/06-api-standards.md §6, omitting empty or undefined entries.
 */
export function toApiFilterParams(
  values: FilterValues
): Record<string, string> {
  const params: Record<string, string> = {};
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value.trim() !== "") {
      params[`filter[${key}]`] = value;
    }
  }
  return params;
}

export interface FilterPanelProps {
  /** Controlled search string (renders SearchInput when onSearchChange is provided) */
  search?: string;
  /** Callback invoked when search query updates */
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  debounceMs?: number;
  /** Filter dropdown definitions */
  filters?: FilterDefinition[];
  /** Current active filter map */
  values?: FilterValues;
  /** Callback when any filter value changes */
  onValuesChange?: (values: FilterValues) => void;
  /** Optional explicit reset callback; defaults to clearing filters and search */
  onReset?: () => void;
  /** Additional toolbar actions rendered on the right */
  actions?: React.ReactNode;
  className?: string;
}

export function FilterPanel({
  search = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  debounceMs,
  filters = [],
  values = {},
  onValuesChange,
  onReset,
  actions,
  className,
}: FilterPanelProps) {
  const activeFilterCount = Object.values(values).filter(
    (v) => v !== undefined && v.trim() !== ""
  ).length;
  const hasSearch = search.trim().length > 0;
  const hasAnyActive = activeFilterCount > 0 || hasSearch;

  const handleSelectChange = (key: string, nextValue: string) => {
    if (!onValuesChange) return;
    const nextValues = { ...values };
    if (nextValue === ALL_SENTINEL) {
      delete nextValues[key];
    } else {
      nextValues[key] = nextValue;
    }
    onValuesChange(nextValues);
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
      return;
    }
    onValuesChange?.({});
    onSearchChange?.("");
  };

  return (
    <div
      role="region"
      aria-label="Search and filters"
      className={cn(
        "border-border bg-card flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
        {onSearchChange && (
          <SearchInput
            value={search}
            onSearchChange={onSearchChange}
            placeholder={searchPlaceholder}
            debounceMs={debounceMs}
            className="w-full sm:w-64"
          />
        )}

        {filters.map((filter) => {
          const currentValue = values[filter.key];
          const selectValue =
            currentValue && currentValue.trim() !== ""
              ? currentValue
              : ALL_SENTINEL;
          const allText = filter.allLabel ?? `All ${filter.label}`;

          return (
            <Select
              key={filter.key}
              value={selectValue}
              onValueChange={(next) => handleSelectChange(filter.key, next)}
            >
              <SelectTrigger
                aria-label={filter.label}
                className="bg-background w-full sm:w-44"
              >
                <SelectValue placeholder={allText} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_SENTINEL}>{allText}</SelectItem>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        })}

        {activeFilterCount > 0 && (
          <Badge variant="secondary" className="self-start sm:self-center">
            {activeFilterCount} active
          </Badge>
        )}

        {hasAnyActive && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-muted-foreground hover:text-foreground self-start sm:self-center"
          >
            Clear filters
          </Button>
        )}
      </div>

      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
