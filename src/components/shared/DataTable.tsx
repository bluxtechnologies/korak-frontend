"use client";

import * as React from "react";
import {
  type ColumnMeta,
  createColumnHelper,
  createPaginatedRowModel,
  createSortedRowModel,
  metaHelper,
  type PaginationState,
  type Row,
  type RowData,
  rowPaginationFeature,
  rowSelectionFeature,
  type RowSelectionState,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_alphanumericCaseSensitive,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  type SortingState,
  tableFeatures,
  type TableOptions,
  type Updater,
  useTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type PaginationMeta } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { DataTablePagination } from "./DataTablePagination";
import { ErrorState } from "./ErrorState";

export interface DataTableColumnMeta {
  align?: "left" | "center" | "right";
  headerClassName?: string;
  cellClassName?: string;
}

/**
 * Shared TanStack Table v9 feature set for all application tables.
 * Must stay at module scope to prevent row-model invalidation on re-renders.
 */
export const dataTableFeatures = tableFeatures({
  columnMeta: metaHelper<DataTableColumnMeta>(),
  rowSelectionFeature,
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    alphanumericCaseSensitive: sortFn_alphanumericCaseSensitive,
    basic: sortFn_basic,
    datetime: sortFn_datetime,
    text: sortFn_text,
  },
});

/**
 * Creates a strictly typed TanStack v9 column helper bound to DataTable features.
 */
export function createDataTableColumnHelper<TData extends RowData>() {
  return createColumnHelper<typeof dataTableFeatures, TData>();
}

export type DataTableColumns<TData extends RowData> = TableOptions<
  typeof dataTableFeatures,
  TData
>["columns"];

/**
 * Converts TanStack SortingState into the Laravel API `?sort=` query convention
 * (`-field` for descending, `field` for ascending) per docs/06-api-standards.md §6.
 */
export function toApiSortParam(sorting: SortingState): string | undefined {
  if (sorting.length === 0) return undefined;
  const primary = sorting[0];
  return primary.desc ? `-${primary.id}` : primary.id;
}

/**
 * Parses an API `?sort=` string (`-created_at` or `created_at`) into TanStack SortingState.
 */
export function fromApiSortParam(sort?: string | null): SortingState {
  if (!sort || !sort.trim()) return [];
  const trimmed = sort.trim();
  if (trimmed.startsWith("-")) {
    return [{ id: trimmed.slice(1), desc: true }];
  }
  return [{ id: trimmed, desc: false }];
}

const ALIGN_CLASSES = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const;

const SELECT_COLUMN_ID = "__select__";

export interface BulkActionContext<TData extends RowData> {
  selectedRows: TData[];
  selectedCount: number;
  clearSelection: () => void;
}

export interface DataTableProps<TData extends RowData> {
  /** Column definitions created via createDataTableColumnHelper<TData>() or column objects */
  columns: DataTableColumns<TData>;
  /** Row records for the current page or full dataset */
  data: ReadonlyArray<TData>;
  /** Optional stable row ID extractor */
  getRowId?: (
    originalRow: TData,
    index: number,
    parent?: Row<typeof dataTableFeatures, TData>
  ) => string;
  /** Controlled API sort string (`created_at` or `-created_at`) */
  sort?: string | null;
  /** Callback when sort changes using API sort format */
  onSortChange?: (sort: string | undefined) => void;
  /** Disables automatic client sorting (defaults to true when onSortChange or pagination is provided) */
  manualSorting?: boolean;
  /** Server pagination metadata from ApiPaginatedResponse['meta'] */
  pagination?: PaginationMeta;
  /** Callback when page number changes (1-indexed) */
  onPageChange?: (page: number) => void;
  /** Callback when rows-per-page changes */
  onPerPageChange?: (perPage: number) => void;
  /** Available rows-per-page choices */
  perPageOptions?: number[];
  /** Controls visibility of pagination bar; defaults to true when server pagination is supplied */
  enablePagination?: boolean;
  /** Initial rows per page in client-side pagination mode (defaults to 15 per Doc 06) */
  defaultPageSize?: number;
  /** Enables row selection checkboxes (or per-row predicate) */
  enableRowSelection?:
    boolean | ((row: Row<typeof dataTableFeatures, TData>) => boolean);
  /** Controlled selected row ID map */
  rowSelection?: RowSelectionState;
  /** Callback when selected row ID map changes */
  onRowSelectionChange?: (selection: RowSelectionState) => void;
  /** Convenience callback returning currently selected original row objects */
  onSelectedRowsChange?: (selectedRows: TData[]) => void;
  /** Renders bulk actions bar above the table when one or more rows are selected */
  bulkActions?: (context: BulkActionContext<TData>) => React.ReactNode;
  /** Optional click handler for row inspection/navigation */
  onRowClick?: (row: TData) => void;
  /** Displays skeleton rows inside the table body while loading */
  isLoading?: boolean;
  /** Number of skeleton placeholder rows while isLoading is true */
  loadingRows?: number;
  /** Caught error rendered via safe ErrorState inside the table */
  error?: unknown;
  /** Retry handler shown inside ErrorState when error is present */
  onRetry?: () => void;
  /** Pending state on retry action */
  isRetrying?: boolean;
  /** Custom rich EmptyState component rendered when rows are empty */
  emptyState?: React.ReactNode;
  /** Content rendered inside the table body when no rows exist */
  emptyMessage?: React.ReactNode;
  /** Accessible caption for screen readers */
  caption?: string;
  className?: string;
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  getRowId,
  sort,
  onSortChange,
  manualSorting,
  pagination,
  onPageChange,
  onPerPageChange,
  perPageOptions,
  enablePagination,
  defaultPageSize = 15,
  enableRowSelection = false,
  rowSelection: controlledRowSelection,
  onRowSelectionChange,
  onSelectedRowsChange,
  bulkActions,
  onRowClick,
  isLoading = false,
  loadingRows = 5,
  error,
  onRetry,
  isRetrying = false,
  emptyState,
  emptyMessage = "No results found.",
  caption,
  className,
}: DataTableProps<TData>) {
  const isServerPaginated = Boolean(pagination);
  const isManualSorting = manualSorting ?? Boolean(onSortChange || pagination);
  const hasRowSelection = Boolean(enableRowSelection);

  const [internalSorting, setInternalSorting] = React.useState<SortingState>(
    () => fromApiSortParam(sort)
  );
  const activeSorting =
    sort !== undefined ? fromApiSortParam(sort) : internalSorting;

  const [internalPagination, setInternalPagination] =
    React.useState<PaginationState>({
      pageIndex: 0,
      pageSize: defaultPageSize,
    });

  const activePagination: PaginationState = pagination
    ? {
        pageIndex: Math.max(0, pagination.current_page - 1),
        pageSize: pagination.per_page,
      }
    : internalPagination;

  const [internalRowSelection, setInternalRowSelection] =
    React.useState<RowSelectionState>({});
  const activeRowSelection = controlledRowSelection ?? internalRowSelection;

  const effectiveColumns = React.useMemo<DataTableColumns<TData>>(() => {
    if (!hasRowSelection) {
      return columns;
    }

    const helper = createDataTableColumnHelper<TData>();
    const selectColumn = helper.display({
      id: SELECT_COLUMN_ID,
      enableSorting: false,
      meta: {
        headerClassName: "w-10 px-3",
        cellClassName: "w-10 px-3",
      },
      header: ({ table: tableInstance }) => {
        const allSelected = tableInstance.getIsAllPageRowsSelected();
        const someSelected = tableInstance.getIsSomePageRowsSelected();

        return (
          <Checkbox
            checked={
              allSelected ? true : someSelected ? "indeterminate" : false
            }
            onCheckedChange={(checked) =>
              tableInstance.toggleAllPageRowsSelected(Boolean(checked))
            }
            aria-label="Select all rows on page"
            className="data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground"
          />
        );
      },
      cell: ({ row }) => (
        <div
          className="flex items-center"
          onClick={(event) => event.stopPropagation()}
        >
          <Checkbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onCheckedChange={(checked) => row.toggleSelected(Boolean(checked))}
            aria-label={`Select row ${row.id}`}
          />
        </div>
      ),
    });

    return [selectColumn, ...columns];
  }, [columns, hasRowSelection]);

  const handleSortingChange = (updaterOrValue: Updater<SortingState>) => {
    const next =
      typeof updaterOrValue === "function"
        ? updaterOrValue(activeSorting)
        : updaterOrValue;

    if (sort === undefined) {
      setInternalSorting(next);
    }
    onSortChange?.(toApiSortParam(next));
  };

  const handlePaginationChange = (updaterOrValue: Updater<PaginationState>) => {
    const next =
      typeof updaterOrValue === "function"
        ? updaterOrValue(activePagination)
        : updaterOrValue;

    if (pagination) {
      if (next.pageSize !== activePagination.pageSize) {
        onPerPageChange?.(next.pageSize);
      } else if (next.pageIndex !== activePagination.pageIndex) {
        onPageChange?.(next.pageIndex + 1);
      }
      return;
    }

    setInternalPagination(next);
  };

  const handleRowSelectionChange = (
    updaterOrValue: Updater<RowSelectionState>
  ) => {
    const next =
      typeof updaterOrValue === "function"
        ? updaterOrValue(activeRowSelection)
        : updaterOrValue;

    if (controlledRowSelection === undefined) {
      setInternalRowSelection(next);
    }
    onRowSelectionChange?.(next);

    if (onSelectedRowsChange) {
      const selectedOriginals = table
        .getCoreRowModel()
        .flatRows.filter((row) => Boolean(next[row.id]))
        .map((row) => row.original);
      onSelectedRowsChange(selectedOriginals);
    }
  };

  const table = useTable({
    features: dataTableFeatures,
    columns: effectiveColumns,
    data,
    getRowId,
    enableMultiSort: false,
    enableRowSelection,
    manualSorting: isManualSorting,
    manualPagination: isServerPaginated,
    rowCount: pagination?.total,
    pageCount: pagination?.last_page,
    state: {
      sorting: activeSorting,
      pagination: activePagination,
      rowSelection: activeRowSelection,
    },
    onSortingChange: handleSortingChange,
    onPaginationChange: handlePaginationChange,
    onRowSelectionChange: handleRowSelectionChange,
  });

  const rows = table.getRowModel().rows;
  const selectedRows = hasRowSelection
    ? table.getSelectedRowModel().rows.map((row) => row.original)
    : [];
  const selectedCount = selectedRows.length;

  const clearSelection = () => {
    table.resetRowSelection(true);
  };

  const totalCount = pagination?.total ?? table.getRowCount();
  const pageCount = Math.max(1, pagination?.last_page ?? table.getPageCount());
  const currentPage =
    pagination?.current_page ?? activePagination.pageIndex + 1;
  const currentPerPage = pagination?.per_page ?? activePagination.pageSize;

  const showPaginationBar =
    enablePagination ?? (isServerPaginated || data.length > defaultPageSize);

  return (
    <div className={cn("space-y-3", className)}>
      {hasRowSelection && selectedCount > 0 && (
        <div
          role="region"
          aria-label="Bulk selection actions"
          className="border-border bg-surface flex flex-wrap items-center justify-between gap-3 rounded-md border px-4 py-2.5"
        >
          <div className="flex items-center gap-3">
            <span className="text-foreground text-sm font-medium">
              {selectedCount} selected
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              className="text-muted-foreground hover:text-foreground h-7 px-2 text-xs"
            >
              Clear selection
            </Button>
          </div>

          {bulkActions && (
            <div className="flex flex-wrap items-center gap-2">
              {bulkActions({ selectedRows, selectedCount, clearSelection })}
            </div>
          )}
        </div>
      )}

      <div className="border-border bg-card overflow-hidden rounded-md border shadow-none">
        <Table>
          {caption && <caption className="sr-only">{caption}</caption>}

          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta as
                    | (ColumnMeta<typeof dataTableFeatures, TData, unknown> &
                        DataTableColumnMeta)
                    | undefined;
                  const alignClass = ALIGN_CLASSES[meta?.align ?? "left"];
                  const canSort = header.column.getCanSort();
                  const sortDir = header.column.getIsSorted();
                  const ariaSort = canSort
                    ? sortDir === "asc"
                      ? "ascending"
                      : sortDir === "desc"
                        ? "descending"
                        : "none"
                    : undefined;

                  return (
                    <TableHead
                      key={header.id}
                      aria-sort={ariaSort}
                      className={cn(alignClass, meta?.headerClassName)}
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className={cn(
                            "hover:text-foreground focus-visible:ring-ring inline-flex items-center gap-1.5 rounded-md font-medium tracking-wider uppercase transition-colors focus-visible:ring-1 focus-visible:outline-none",
                            meta?.align === "right" &&
                              "ml-auto flex-row-reverse",
                            sortDir && "text-foreground"
                          )}
                        >
                          <table.FlexRender header={header} />
                          {sortDir === "asc" ? (
                            <ArrowUp
                              className="text-primary h-3.5 w-3.5 shrink-0"
                              aria-hidden="true"
                            />
                          ) : sortDir === "desc" ? (
                            <ArrowDown
                              className="text-primary h-3.5 w-3.5 shrink-0"
                              aria-hidden="true"
                            />
                          ) : (
                            <ArrowUpDown
                              className="text-muted-foreground/60 h-3.5 w-3.5 shrink-0"
                              aria-hidden="true"
                            />
                          )}
                        </button>
                      ) : (
                        <table.FlexRender header={header} />
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody aria-busy={isLoading || undefined}>
            {isLoading ? (
              Array.from({ length: Math.max(1, loadingRows) }).map(
                (_, rowIdx) => (
                  <TableRow
                    key={`loading-row-${rowIdx}`}
                    className="hover:bg-transparent"
                  >
                    {table.getAllLeafColumns().map((col) => (
                      <TableCell key={`loading-cell-${rowIdx}-${col.id}`}>
                        <Skeleton className="h-4 w-full max-w-[160px]" />
                      </TableCell>
                    ))}
                  </TableRow>
                )
              )
            ) : error !== undefined && error !== null ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={table.getAllLeafColumns().length}
                  className="p-0"
                >
                  <ErrorState
                    error={error}
                    onRetry={onRetry}
                    isRetrying={isRetrying}
                    bordered={false}
                  />
                </TableCell>
              </TableRow>
            ) : rows.length > 0 ? (
              rows.map((row) => {
                const isSelected = hasRowSelection && row.getIsSelected();
                return (
                  <TableRow
                    key={row.id}
                    data-state={isSelected ? "selected" : undefined}
                    onClick={
                      onRowClick ? () => onRowClick(row.original) : undefined
                    }
                    className={cn(onRowClick && "cursor-pointer")}
                  >
                    {row.getAllCells().map((cell) => {
                      const meta = cell.column.columnDef.meta as
                        | (ColumnMeta<
                            typeof dataTableFeatures,
                            TData,
                            unknown
                          > &
                            DataTableColumnMeta)
                        | undefined;
                      const alignClass = ALIGN_CLASSES[meta?.align ?? "left"];

                      return (
                        <TableCell
                          key={cell.id}
                          className={cn(alignClass, meta?.cellClassName)}
                        >
                          <table.FlexRender cell={cell} />
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            ) : emptyState ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={table.getAllLeafColumns().length}
                  className="p-0"
                >
                  {emptyState}
                </TableCell>
              </TableRow>
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={table.getAllLeafColumns().length}
                  className="text-muted-foreground h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {!isLoading &&
        (error === undefined || error === null) &&
        showPaginationBar && (
          <DataTablePagination
            currentPage={currentPage}
            lastPage={pageCount}
            perPage={currentPerPage}
            total={totalCount}
            onPageChange={(page) => {
              if (pagination) {
                onPageChange?.(page);
              } else {
                table.setPageIndex(page - 1);
              }
            }}
            onPerPageChange={
              pagination
                ? onPerPageChange
                : (perPage) => table.setPageSize(perPage)
            }
            perPageOptions={perPageOptions}
          />
        )}
    </div>
  );
}
