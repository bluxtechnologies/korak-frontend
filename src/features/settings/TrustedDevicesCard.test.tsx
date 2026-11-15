import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { TrustedDevicesCard } from "./TrustedDevicesCard";
import * as settingsApi from "./api";

vi.mock("./api", async (importOriginal) => {
  const actual = await importOriginal<typeof settingsApi>();
  return {
    ...actual,
    revokeTrustedDevice: vi.fn(),
  };
});

describe("TrustedDevicesCard (F13.4)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders trusted devices with device name and IP", () => {
    render(
      <TrustedDevicesCard devices={settingsApi.MOCK_TRUSTED_DEVICES} />
    );

    expect(screen.getByText("Trusted Devices")).toBeInTheDocument();
    expect(
      screen.getByText("Work PC (Chrome on Windows)")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Personal iPhone (Safari on iOS)")
    ).toBeInTheDocument();
  });

  it("opens destructive confirm dialog and revokes trusted device on confirmation", async () => {
    const user = userEvent.setup();
    const handleRevoked = vi.fn();
    vi.mocked(settingsApi.revokeTrustedDevice).mockResolvedValueOnce({
      message: "Device revoked",
    });

    render(
      <TrustedDevicesCard
        devices={settingsApi.MOCK_TRUSTED_DEVICES}
        onDeviceRevoked={handleRevoked}
      />
    );

    const revokeBtn = screen.getByRole("button", {
      name: /revoke personal iphone \(safari on ios\)/i,
    });
    await user.click(revokeBtn);

    // Confirm dialog title
    expect(
      screen.getByText("Revoke trusted device?")
    ).toBeInTheDocument();

    const confirmBtn = screen.getByRole("button", {
      name: /^revoke device$/i,
    });
    await user.click(confirmBtn);

    await waitFor(() => {
      expect(settingsApi.revokeTrustedDevice).toHaveBeenCalledWith("dev_02");
      expect(handleRevoked).toHaveBeenCalledWith("dev_02");
      expect(
        screen.queryByText("Personal iPhone (Safari on iOS)")
      ).not.toBeInTheDocument();
    });
  });

  it("renders empty state when there are no trusted devices", () => {
    render(<TrustedDevicesCard devices={[]} />);

    expect(screen.getByText("No trusted devices")).toBeInTheDocument();
  });
});
