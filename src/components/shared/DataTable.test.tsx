import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  createDataTableColumnHelper,
  DataTable,
  fromApiSortParam,
  toApiSortParam,
} from "./DataTable";
import { EmptyState } from "./EmptyState";

interface SampleOrder {
  id: string;
  service: string;
  amount: number;
  status: string;
}

const columnHelper = createDataTableColumnHelper<SampleOrder>();

const SAMPLE_COLUMNS = columnHelper.columns([
  columnHelper.accessor("id", {
    header: "Order ID",
    enableSorting: false,
  }),
  columnHelper.accessor("service", {
    header: "Service",
  }),
  columnHelper.accessor("amount", {
    header: "Amount",
    meta: { align: "right" },
    cell: (info) => `₦${info.getValue().toLocaleString()}`,
  }),
]);

const SAMPLE_DATA: SampleOrder[] = [
  { id: "ord_1", service: "MTN Airtime", amount: 500, status: "completed" },
  { id: "ord_2", service: "Airtel Data", amount: 2500, status: "pending" },
  { id: "ord_3", service: "Express VPN", amount: 1200, status: "completed" },
];

describe("DataTable Component (F6.1)", () => {
  describe("API sort param conversion helpers", () => {
    it("converts between TanStack SortingState and API sort strings", () => {
      expect(toApiSortParam([])).toBeUndefined();
      expect(toApiSortParam([{ id: "amount", desc: false }])).toBe("amount");
      expect(toApiSortParam([{ id: "created_at", desc: true }])).toBe(
        "-created_at"
      );

      expect(fromApiSortParam(undefined)).toEqual([]);
      expect(fromApiSortParam("")).toEqual([]);
      expect(fromApiSortParam("amount")).toEqual([
        { id: "amount", desc: false },
      ]);
      expect(fromApiSortParam("-created_at")).toEqual([
        { id: "created_at", desc: true },
      ]);
    });
  });

  describe("Rendering and columns", () => {
    it("renders headers, formatted cells, and alignment meta classes", () => {
      render(
        <DataTable
          columns={SAMPLE_COLUMNS}
          data={SAMPLE_DATA}
          enablePagination={false}
          caption="Customer orders"
        />
      );

      expect(screen.getByText("Order ID")).toBeInTheDocument();
      expect(screen.getByText("Service")).toBeInTheDocument();
      expect(screen.getByText("Amount")).toBeInTheDocument();

      expect(screen.getByText("ord_1")).toBeInTheDocument();
      expect(screen.getByText("MTN Airtime")).toBeInTheDocument();
      expect(screen.getByText("₦500")).toBeInTheDocument();

      const amountHeaderCell = screen.getByText("Amount").closest("th");
      expect(amountHeaderCell).toHaveClass("text-right");
    });

    it("renders fallback or custom emptyMessage when data is empty", () => {
      const { rerender } = render(
        <DataTable columns={SAMPLE_COLUMNS} data={[]} />
      );
      expect(screen.getByText("No results found.")).toBeInTheDocument();

      rerender(
        <DataTable
          columns={SAMPLE_COLUMNS}
          data={[]}
          emptyMessage="No orders match your filters."
        />
      );
      expect(
        screen.getByText("No orders match your filters.")
      ).toBeInTheDocument();
    });

    it("fires onRowClick with clicked row payload", () => {
      const handleRowClick = vi.fn();
      render(
        <DataTable
          columns={SAMPLE_COLUMNS}
          data={SAMPLE_DATA}
          onRowClick={handleRowClick}
        />
      );

      fireEvent.click(screen.getByText("Airtel Data"));
      expect(handleRowClick).toHaveBeenCalledTimes(1);
      expect(handleRowClick).toHaveBeenCalledWith(SAMPLE_DATA[1]);
    });
  });

  describe("Client-side sorting and pagination", () => {
    it("toggles column sort direction with accessible aria-sort state", () => {
      render(<DataTable columns={SAMPLE_COLUMNS} data={SAMPLE_DATA} />);

      // Order ID has enableSorting: false, so no button inside its th
      expect(
        screen.queryByRole("button", { name: /order id/i })
      ).not.toBeInTheDocument();

      const amountSortBtn = screen.getByRole("button", { name: /amount/i });
      const amountTh = amountSortBtn.closest("th")!;
      expect(amountTh).toHaveAttribute("aria-sort", "none");

      // First click sorts ascending (or descending depending on number inference)
      fireEvent.click(amountSortBtn);
      const firstDir = amountTh.getAttribute("aria-sort");
      expect(firstDir === "ascending" || firstDir === "descending").toBe(true);

      // Second click reverses direction
      fireEvent.click(amountSortBtn);
      const secondDir = amountTh.getAttribute("aria-sort");
      expect(secondDir).not.toBe(firstDir);
      expect(secondDir === "ascending" || secondDir === "descending").toBe(
        true
      );
    });

    it("paginates client dataset when exceeding defaultPageSize", () => {
      const manyRows: SampleOrder[] = Array.from({ length: 5 }, (_, i) => ({
        id: `ord_${i + 1}`,
        service: `Service ${i + 1}`,
        amount: (i + 1) * 100,
        status: "completed",
      }));

      render(
        <DataTable
          columns={SAMPLE_COLUMNS}
          data={manyRows}
          defaultPageSize={2}
        />
      );

      expect(screen.getByText("Showing 1–2 of 5")).toBeInTheDocument();
      expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
      expect(screen.getByText("ord_1")).toBeInTheDocument();
      expect(screen.queryByText("ord_3")).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: /go to next page/i }));

      expect(screen.getByText("Showing 3–4 of 5")).toBeInTheDocument();
      expect(screen.getByText("Page 2 of 3")).toBeInTheDocument();
      expect(screen.getByText("ord_3")).toBeInTheDocument();
    });
  });

  describe("Server-side sorting and pagination", () => {
    it("emits API sort string on header click without reordering rows locally", () => {
      const handleSortChange = vi.fn();

      render(
        <DataTable
          columns={SAMPLE_COLUMNS}
          data={SAMPLE_DATA}
          sort="service"
          onSortChange={handleSortChange}
        />
      );

      const serviceTh = screen
        .getByRole("button", { name: /service/i })
        .closest("th")!;
      expect(serviceTh).toHaveAttribute("aria-sort", "ascending");

      // Next click reverses ascending -> descending (`-service`)
      fireEvent.click(screen.getByRole("button", { name: /service/i }));
      expect(handleSortChange).toHaveBeenCalledWith("-service");
    });

    it("renders server PaginationMeta and emits 1-indexed page/perPage updates", async () => {
      const user = userEvent.setup();
      const handlePageChange = vi.fn();
      const handlePerPageChange = vi.fn();

      render(
        <DataTable
          columns={SAMPLE_COLUMNS}
          data={SAMPLE_DATA}
          pagination={{
            current_page: 2,
            per_page: 15,
            total: 45,
            last_page: 3,
          }}
          onPageChange={handlePageChange}
          onPerPageChange={handlePerPageChange}
        />
      );

      expect(screen.getByText("Showing 16–30 of 45")).toBeInTheDocument();
      expect(screen.getByText("Page 2 of 3")).toBeInTheDocument();

      fireEvent.click(
        screen.getByRole("button", { name: /go to previous page/i })
      );
      expect(handlePageChange).toHaveBeenCalledWith(1);

      fireEvent.click(screen.getByRole("button", { name: /go to next page/i }));
      expect(handlePageChange).toHaveBeenCalledWith(3);

      fireEvent.click(
        screen.getByRole("button", { name: /go to first page/i })
      );
      expect(handlePageChange).toHaveBeenCalledWith(1);

      fireEvent.click(screen.getByRole("button", { name: /go to last page/i }));
      expect(handlePageChange).toHaveBeenCalledWith(3);

      // Test rows per page selector
      const perPageTrigger = screen.getByRole("combobox", {
        name: /rows per page/i,
      });
      await user.click(perPageTrigger);
      const option25 = await within(document.body).findByRole("option", {
        name: "25",
      });
      await user.click(option25);
      expect(handlePerPageChange).toHaveBeenCalledWith(25);
    });

    it("disables boundary pagination buttons on first and last page", () => {
      const { rerender } = render(
        <DataTable
          columns={SAMPLE_COLUMNS}
          data={SAMPLE_DATA}
          pagination={{
            current_page: 1,
            per_page: 15,
            total: 30,
            last_page: 2,
          }}
          onPageChange={vi.fn()}
        />
      );

      expect(
        screen.getByRole("button", { name: /go to first page/i })
      ).toBeDisabled();
      expect(
        screen.getByRole("button", { name: /go to previous page/i })
      ).toBeDisabled();
      expect(
        screen.getByRole("button", { name: /go to next page/i })
      ).not.toBeDisabled();

      rerender(
        <DataTable
          columns={SAMPLE_COLUMNS}
          data={SAMPLE_DATA}
          pagination={{
            current_page: 2,
            per_page: 15,
            total: 30,
            last_page: 2,
          }}
          onPageChange={vi.fn()}
        />
      );

      expect(
        screen.getByRole("button", { name: /go to next page/i })
      ).toBeDisabled();
      expect(
        screen.getByRole("button", { name: /go to last page/i })
      ).toBeDisabled();
    });
  });

  describe("Bulk selection (F6.3)", () => {
    it("renders selection checkboxes and updates selected rows and indeterminate select-all state", async () => {
      const user = userEvent.setup();
      const handleSelectedRowsChange = vi.fn();

      render(
        <DataTable
          columns={SAMPLE_COLUMNS}
          data={SAMPLE_DATA}
          getRowId={(row) => row.id}
          enableRowSelection
          onSelectedRowsChange={handleSelectedRowsChange}
        />
      );

      const selectAllCheckbox = screen.getByRole("checkbox", {
        name: /select all rows on page/i,
      });
      const row1Checkbox = screen.getByRole("checkbox", {
        name: /select row ord_1/i,
      });
      const row2Checkbox = screen.getByRole("checkbox", {
        name: /select row ord_2/i,
      });

      expect(selectAllCheckbox).not.toBeChecked();

      // Select single row -> select-all enters indeterminate mixed state
      await user.click(row1Checkbox);

      expect(row1Checkbox).toBeChecked();
      expect(row1Checkbox.closest("tr")).toHaveAttribute(
        "data-state",
        "selected"
      );
      expect(selectAllCheckbox).toHaveAttribute("aria-checked", "mixed");
      expect(screen.getByText("1 selected")).toBeInTheDocument();
      expect(handleSelectedRowsChange).toHaveBeenLastCalledWith([
        SAMPLE_DATA[0],
      ]);

      // Select remaining via selectAll
      await user.click(selectAllCheckbox);
      expect(row2Checkbox).toBeChecked();
      expect(screen.getByText("3 selected")).toBeInTheDocument();
      expect(handleSelectedRowsChange).toHaveBeenLastCalledWith(SAMPLE_DATA);

      // Clear selection button
      await user.click(
        screen.getByRole("button", { name: /clear selection/i })
      );
      expect(screen.queryByText(/selected/i)).not.toBeInTheDocument();
      expect(row1Checkbox).not.toBeChecked();
      expect(handleSelectedRowsChange).toHaveBeenLastCalledWith([]);
    });

    it("prevents row click propagation when toggling row checkboxes and invokes bulkActions", async () => {
      const user = userEvent.setup();
      const handleRowClick = vi.fn();
      const handleBulkAction = vi.fn();

      render(
        <DataTable
          columns={SAMPLE_COLUMNS}
          data={SAMPLE_DATA}
          getRowId={(row) => row.id}
          enableRowSelection
          onRowClick={handleRowClick}
          bulkActions={({ selectedRows, clearSelection }) => (
            <button
              type="button"
              onClick={() => {
                handleBulkAction(selectedRows.map((r) => r.id));
                clearSelection();
              }}
            >
              Archive Selected
            </button>
          )}
        />
      );

      await user.click(
        screen.getByRole("checkbox", { name: /select row ord_2/i })
      );

      // Row click handler must NOT fire when clicking checkbox
      expect(handleRowClick).not.toHaveBeenCalled();

      const archiveBtn = screen.getByRole("button", {
        name: /archive selected/i,
      });
      await user.click(archiveBtn);

      expect(handleBulkAction).toHaveBeenCalledWith(["ord_2"]);
      expect(screen.queryByText(/selected/i)).not.toBeInTheDocument();
    });

    it("respects conditional enableRowSelection predicate per row", () => {
      render(
        <DataTable
          columns={SAMPLE_COLUMNS}
          data={SAMPLE_DATA}
          getRowId={(row) => row.id}
          enableRowSelection={(row) => row.original.status === "completed"}
        />
      );

      // ord_1 & ord_3 are completed, ord_2 is pending
      expect(
        screen.getByRole("checkbox", { name: /select row ord_1/i })
      ).not.toBeDisabled();
      expect(
        screen.getByRole("checkbox", { name: /select row ord_2/i })
      ).toBeDisabled();
      expect(
        screen.getByRole("checkbox", { name: /select row ord_3/i })
      ).not.toBeDisabled();
    });
  });

  describe("Table loading, error & empty states (F6.4)", () => {
    it("renders skeleton rows when isLoading is true", () => {
      const { container } = render(
        <DataTable
          columns={SAMPLE_COLUMNS}
          data={[]}
          isLoading
          loadingRows={3}
        />
      );

      const tbody = container.querySelector("tbody");
      expect(tbody).toHaveAttribute("aria-busy", "true");
      expect(tbody?.querySelectorAll("tr")).toHaveLength(3);
    });

    it("renders ErrorState with retry handler when error is present", () => {
      const handleRetry = vi.fn();
      render(
        <DataTable
          columns={SAMPLE_COLUMNS}
          data={[]}
          error={new Error("Temporary network timeout")}
          onRetry={handleRetry}
        />
      );

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("Temporary network timeout")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: /try again/i }));
      expect(handleRetry).toHaveBeenCalledTimes(1);
    });

    it("renders rich emptyState component when provided and rows are empty", () => {
      render(
        <DataTable
          columns={SAMPLE_COLUMNS}
          data={[]}
          emptyState={
            <EmptyState
              bordered={false}
              title="No matching orders"
              description="Try adjusting your search filters."
            />
          }
        />
      );

      expect(screen.getByText("No matching orders")).toBeInTheDocument();
      expect(
        screen.getByText("Try adjusting your search filters.")
      ).toBeInTheDocument();
    });
  });
});
