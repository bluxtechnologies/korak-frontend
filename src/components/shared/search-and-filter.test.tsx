import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  FilterPanel,
  type FilterDefinition,
  toApiFilterParams,
} from "./FilterPanel";
import { SearchInput } from "./SearchInput";

const SAMPLE_FILTERS: FilterDefinition[] = [
  {
    key: "status",
    label: "Status",
    options: [
      { label: "Pending", value: "pending" },
      { label: "Completed", value: "completed" },
      { label: "Failed", value: "failed" },
    ],
  },
  {
    key: "service_type",
    label: "Service",
    allLabel: "All Services",
    options: [
      { label: "Airtime", value: "airtime" },
      { label: "Data", value: "data" },
    ],
  },
];

describe("SearchInput and FilterPanel Components (F6.2)", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  describe("SearchInput", () => {
    it("debounces onSearchChange calls while typing", () => {
      vi.useFakeTimers();
      const handleSearchChange = vi.fn();

      render(
        <SearchInput
          onSearchChange={handleSearchChange}
          debounceMs={300}
          placeholder="Search orders..."
        />
      );

      const input = screen.getByRole("searchbox", { name: /search/i });
      fireEvent.change(input, { target: { value: "mtn" } });

      expect(handleSearchChange).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(299);
      });
      expect(handleSearchChange).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(handleSearchChange).toHaveBeenCalledTimes(1);
      expect(handleSearchChange).toHaveBeenCalledWith("mtn");
    });

    it("triggers search immediately on Enter and clears immediately on Clear button or Escape", () => {
      vi.useFakeTimers();
      const handleSearchChange = vi.fn();

      render(
        <SearchInput onSearchChange={handleSearchChange} debounceMs={500} />
      );

      const input = screen.getByRole("searchbox", { name: /search/i });
      fireEvent.change(input, { target: { value: "airtel" } });
      fireEvent.keyDown(input, { key: "Enter" });

      expect(handleSearchChange).toHaveBeenCalledWith("airtel");

      const clearBtn = screen.getByRole("button", { name: /clear search/i });
      fireEvent.click(clearBtn);

      expect(input).toHaveValue("");
      expect(handleSearchChange).toHaveBeenLastCalledWith("");
      expect(input).toHaveFocus();

      // Test Escape clear
      fireEvent.change(input, { target: { value: "vpn" } });
      fireEvent.keyDown(input, { key: "Escape" });
      expect(input).toHaveValue("");
      expect(handleSearchChange).toHaveBeenLastCalledWith("");
    });

    it("syncs displayed input when controlled value updates externally", () => {
      const { rerender } = render(
        <SearchInput value="initial" onSearchChange={vi.fn()} />
      );

      const input = screen.getByRole("searchbox", { name: /search/i });
      expect(input).toHaveValue("initial");

      rerender(<SearchInput value="" onSearchChange={vi.fn()} />);
      expect(input).toHaveValue("");
    });
  });

  describe("toApiFilterParams", () => {
    it("formats active filter values into filter[key] query params omitting empty entries", () => {
      expect(
        toApiFilterParams({
          status: "completed",
          service_type: undefined,
          notes: "   ",
        })
      ).toEqual({
        "filter[status]": "completed",
      });
    });
  });

  describe("FilterPanel", () => {
    it("renders search bar and filter selects and emits updated values", async () => {
      const user = userEvent.setup();
      const handleValuesChange = vi.fn();
      const handleSearchChange = vi.fn();

      render(
        <FilterPanel
          search=""
          onSearchChange={handleSearchChange}
          filters={SAMPLE_FILTERS}
          values={{}}
          onValuesChange={handleValuesChange}
          actions={<button type="button">Export</button>}
        />
      );

      expect(
        screen.getByRole("button", { name: /export/i })
      ).toBeInTheDocument();

      const statusTrigger = screen.getByRole("combobox", { name: /status/i });
      await user.click(statusTrigger);

      const completedOption = await within(document.body).findByRole("option", {
        name: "Completed",
      });
      await user.click(completedOption);

      expect(handleValuesChange).toHaveBeenCalledWith({ status: "completed" });
    });

    it("removes filter key when selecting All option", async () => {
      const user = userEvent.setup();
      const handleValuesChange = vi.fn();

      render(
        <FilterPanel
          filters={SAMPLE_FILTERS}
          values={{ status: "completed", service_type: "airtime" }}
          onValuesChange={handleValuesChange}
        />
      );

      expect(screen.getByText("2 active")).toBeInTheDocument();

      const statusTrigger = screen.getByRole("combobox", { name: /status/i });
      await user.click(statusTrigger);

      const allStatusOption = await within(document.body).findByRole("option", {
        name: "All Status",
      });
      await user.click(allStatusOption);

      expect(handleValuesChange).toHaveBeenCalledWith({
        service_type: "airtime",
      });
    });

    it("resets filters and search when clicking Clear filters", () => {
      const handleValuesChange = vi.fn();
      const handleSearchChange = vi.fn();

      render(
        <FilterPanel
          search="mtn"
          onSearchChange={handleSearchChange}
          filters={SAMPLE_FILTERS}
          values={{ status: "pending" }}
          onValuesChange={handleValuesChange}
        />
      );

      expect(screen.getByText("1 active")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: /clear filters/i }));

      expect(handleValuesChange).toHaveBeenCalledWith({});
      expect(handleSearchChange).toHaveBeenCalledWith("");
    });
  });
});
