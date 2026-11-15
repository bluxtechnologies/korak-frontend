"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface DataTablePaginationProps {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  onPageChange: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
  perPageOptions?: number[];
  className?: string;
}

const DEFAULT_PER_PAGE_OPTIONS = [10, 15, 25, 50];

export function DataTablePagination({
  currentPage,
  lastPage,
  perPage,
  total,
  onPageChange,
  onPerPageChange,
  perPageOptions = DEFAULT_PER_PAGE_OPTIONS,
  className,
}: DataTablePaginationProps) {
  const safeLastPage = Math.max(1, lastPage);
  const safeCurrentPage = Math.min(Math.max(1, currentPage), safeLastPage);
  const canPrevious = safeCurrentPage > 1;
  const canNext = safeCurrentPage < safeLastPage;

  const startItem = total === 0 ? 0 : (safeCurrentPage - 1) * perPage + 1;
  const endItem = Math.min(safeCurrentPage * perPage, total);

  return (
    <div
      className={cn(
        "text-muted-foreground flex flex-col gap-3 px-1 py-2 text-sm sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="text-xs sm:text-sm">
        {total === 0
          ? "Showing 0 results"
          : `Showing ${startItem}–${endItem} of ${total}`}
      </div>

      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
        {onPerPageChange && (
          <div className="flex items-center gap-2">
            <span className="text-xs whitespace-nowrap sm:text-sm">
              Rows per page
            </span>
            <Select
              value={String(perPage)}
              onValueChange={(value) => onPerPageChange(Number(value))}
            >
              <SelectTrigger
                aria-label="Rows per page"
                className="bg-card h-8 w-[70px]"
              >
                <SelectValue placeholder={String(perPage)} />
              </SelectTrigger>
              <SelectContent align="end">
                {perPageOptions.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center gap-3">
          <span className="text-foreground text-xs font-medium whitespace-nowrap sm:text-sm">
            Page {safeCurrentPage} of {safeLastPage}
          </span>

          <nav aria-label="Pagination" className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="hidden h-8 w-8 sm:inline-flex"
              onClick={() => onPageChange(1)}
              disabled={!canPrevious}
              aria-label="Go to first page"
            >
              <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(safeCurrentPage - 1)}
              disabled={!canPrevious}
              aria-label="Go to previous page"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(safeCurrentPage + 1)}
              disabled={!canNext}
              aria-label="Go to next page"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="hidden h-8 w-8 sm:inline-flex"
              onClick={() => onPageChange(safeLastPage)}
              disabled={!canNext}
              aria-label="Go to last page"
            >
              <ChevronsRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </nav>
        </div>
      </div>
    </div>
  );
}
