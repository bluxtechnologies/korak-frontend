import * as React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { VpnActiveConsole } from "./VpnActiveConsole";
import { MOCK_ACTIVE_VPN_SUBSCRIPTION } from "./api";

// Mock sonner
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("VpnActiveConsole Component (Phase 4)", () => {
  beforeEach(() => {
    // Mock navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    // Mock URL.createObjectURL and revokeObjectURL
    window.URL.createObjectURL = vi.fn().mockReturnValue("blob:mock-url");
    window.URL.revokeObjectURL = vi.fn();
    global.URL.createObjectURL = window.URL.createObjectURL;
    global.URL.revokeObjectURL = window.URL.revokeObjectURL;
  });

  it("renders active tunnel credentials and stats", () => {
    render(<VpnActiveConsole subscription={MOCK_ACTIVE_VPN_SUBSCRIPTION} />);

    expect(screen.getByText(/London Dedicated Node #1/i)).toBeInTheDocument();
    expect(screen.getByText("185.220.101.42")).toBeInTheDocument();
    expect(screen.getByText("lon01.korakvpn.net:51820")).toBeInTheDocument();
    expect(screen.getByText(/Active Tunnel/i)).toBeInTheDocument();
    expect(screen.getByText(/14.2 GB/i)).toBeInTheDocument();
  });

  it("opens WireGuard mobile setup QR modal when clicking Setup on Phone", () => {
    render(<VpnActiveConsole subscription={MOCK_ACTIVE_VPN_SUBSCRIPTION} />);

    const setupBtn = screen.getByRole("button", { name: /Setup on Phone/i });
    fireEvent.click(setupBtn);

    expect(screen.getByText(/WireGuard Mobile Setup/i)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /WireGuard Configuration QR Code/i })).toBeInTheDocument();
  });

  it("triggers WireGuard .conf file download", () => {
    render(<VpnActiveConsole subscription={MOCK_ACTIVE_VPN_SUBSCRIPTION} />);

    const downloadBtn = screen.getByRole("button", { name: /Download \.conf/i });
    fireEvent.click(downloadBtn);

    expect(global.URL.createObjectURL).toHaveBeenCalled();
  });

  it("opens confirmation dialog for key regeneration", () => {
    render(<VpnActiveConsole subscription={MOCK_ACTIVE_VPN_SUBSCRIPTION} />);

    const regenBtn = screen.getByRole("button", { name: /Regenerate Client Keys/i });
    fireEvent.click(regenBtn);

    expect(screen.getByText(/Regenerate WireGuard Keys\?/i)).toBeInTheDocument();
  });
});
