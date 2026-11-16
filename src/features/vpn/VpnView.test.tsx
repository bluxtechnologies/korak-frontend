import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { VpnView } from "./VpnView";
import {
  VPN_SERVER_NODES,
  MOCK_ACTIVE_VPN_SUBSCRIPTION,
  MOCK_VPN_SESSION_LOGS,
} from "./api";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("VpnView Component (Phase 4)", () => {
  it("renders the VPN console header, active tunnel, and server nodes", () => {
    render(
      <VpnView
        initialNodes={VPN_SERVER_NODES}
        initialSubscription={MOCK_ACTIVE_VPN_SUBSCRIPTION}
        initialLogs={MOCK_VPN_SESSION_LOGS}
      />
    );

    expect(screen.getByRole("heading", { level: 1, name: /Dedicated VPN Service/i })).toBeInTheDocument();
    expect(screen.getByText(/London Dedicated Node #1/i)).toBeInTheDocument();
    expect(screen.getByText("185.220.101.42")).toBeInTheDocument();
    expect(screen.getAllByText(/lon01.korakvpn.net:51820/i).length).toBeGreaterThan(0);
  });

  it("switches to Session Logs tab when clicked", async () => {
    render(
      <VpnView
        initialNodes={VPN_SERVER_NODES}
        initialSubscription={MOCK_ACTIVE_VPN_SUBSCRIPTION}
        initialLogs={MOCK_VPN_SESSION_LOGS}
      />
    );

    const logsTabBtn = screen.getByRole("button", { name: /Session Logs/i });
    fireEvent.click(logsTabBtn);

    expect(screen.getByText("sess_90214")).toBeInTheDocument();
    expect(screen.getByText("sess_90188")).toBeInTheDocument();
  });

  it("allows selecting a different server node and protocol", async () => {
    render(
      <VpnView
        initialNodes={VPN_SERVER_NODES}
        initialSubscription={MOCK_ACTIVE_VPN_SUBSCRIPTION}
        initialLogs={MOCK_VPN_SESSION_LOGS}
      />
    );

    // Click Frankfurt node
    const frankfurtBtn = screen.getByRole("button", { name: /Frankfurt/i });
    fireEvent.click(frankfurtBtn);

    // Switch to OpenVPN
    const openVpnBtn = screen.getByRole("button", { name: /Select OpenVPN protocol/i });
    fireEvent.click(openVpnBtn);

    // Verify button text updates
    expect(screen.getByText(/Provision Frankfurt Dedicated VPN/i)).toBeInTheDocument();
  });

  it("updates duration tier and calculated pricing", () => {
    render(
      <VpnView
        initialNodes={VPN_SERVER_NODES}
        initialSubscription={MOCK_ACTIVE_VPN_SUBSCRIPTION}
        initialLogs={MOCK_VPN_SESSION_LOGS}
      />
    );

    // Click 3 Months tier
    const threeMonthsBtn = screen.getByRole("button", { name: /3 Months/i });
    fireEvent.click(threeMonthsBtn);

    // ₦9,450 should be displayed as payable
    expect(screen.getAllByText(/₦9,450/i).length).toBeGreaterThan(0);
  });
});
