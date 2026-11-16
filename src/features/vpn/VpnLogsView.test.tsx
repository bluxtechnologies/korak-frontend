import * as React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { VpnLogsView } from "./VpnLogsView";
import { MOCK_VPN_SESSION_LOGS } from "./api";

// Mock sonner
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("VpnLogsView Component (Phase 4)", () => {
  beforeEach(() => {
    window.URL.createObjectURL = vi.fn().mockReturnValue("blob:mock-csv");
    window.URL.revokeObjectURL = vi.fn();
    global.URL.createObjectURL = window.URL.createObjectURL;
    global.URL.revokeObjectURL = window.URL.revokeObjectURL;
  });

  it("renders connection sessions in the data table", () => {
    render(<VpnLogsView initialLogs={MOCK_VPN_SESSION_LOGS} />);

    expect(screen.getByText("sess_90214")).toBeInTheDocument();
    expect(screen.getByText("sess_90188")).toBeInTheDocument();
    expect(screen.getByText("sess_90112")).toBeInTheDocument();
    expect(screen.getAllByText(/London Dedicated Node/i).length).toBe(2);
  });

  it("filters sessions when typing into the search field", () => {
    render(<VpnLogsView initialLogs={MOCK_VPN_SESSION_LOGS} />);

    const searchInput = screen.getByPlaceholderText(/Search by session ID/i);
    fireEvent.change(searchInput, { target: { value: "Frankfurt" } });

    expect(screen.getByText("sess_90112")).toBeInTheDocument();
    expect(screen.queryByText("sess_90214")).not.toBeInTheDocument();
  });

  it("triggers CSV export when clicking the export button", () => {
    render(<VpnLogsView initialLogs={MOCK_VPN_SESSION_LOGS} />);

    const exportBtn = screen.getByRole("button", { name: /Export Audit Logs/i });
    fireEvent.click(exportBtn);

    expect(global.URL.createObjectURL).toHaveBeenCalled();
  });
});
