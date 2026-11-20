import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";
import { DeviceVerificationCard } from "./DeviceVerificationCard";
import * as settingsApi from "./api";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("./api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./api")>();
  return {
    ...actual,
    toggleDeviceVerification: vi.fn(),
  };
});

describe("DeviceVerificationCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with initial state disabled (unchecked)", () => {
    render(<DeviceVerificationCard enabled={false} />);

    expect(screen.getByRole("switch", { name: /toggle device verification/i })).toBeInTheDocument();
    expect(screen.getByRole("switch")).not.toBeChecked();
    expect(screen.getByText("Disabled")).toBeInTheDocument();
    expect(screen.getByText(/Device Verification \(OTP\)/i)).toBeInTheDocument();
  });

  it("renders with initial state enabled (checked)", () => {
    render(<DeviceVerificationCard enabled={true} />);

    expect(screen.getByRole("switch")).toBeChecked();
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("enables device verification when switch is clicked and shows success toast", async () => {
    const user = userEvent.setup();
    const onStatusChanged = vi.fn();
    vi.mocked(settingsApi.toggleDeviceVerification).mockResolvedValueOnce({
      ...settingsApi.MOCK_PROFILE,
      device_verification_enabled: true,
    });

    render(
      <DeviceVerificationCard enabled={false} onStatusChanged={onStatusChanged} />
    );

    const toggle = screen.getByRole("switch");
    await user.click(toggle);

    await waitFor(() => {
      expect(settingsApi.toggleDeviceVerification).toHaveBeenCalledWith(true);
      expect(toast.success).toHaveBeenCalledWith(
        "Device verification enabled. You will receive an OTP when logging in from new devices."
      );
      expect(onStatusChanged).toHaveBeenCalledWith(true);
      expect(toggle).toBeChecked();
    });
  });

  it("disables device verification when switch is turned off and shows success toast", async () => {
    const user = userEvent.setup();
    const onStatusChanged = vi.fn();
    vi.mocked(settingsApi.toggleDeviceVerification).mockResolvedValueOnce({
      ...settingsApi.MOCK_PROFILE,
      device_verification_enabled: false,
    });

    render(
      <DeviceVerificationCard enabled={true} onStatusChanged={onStatusChanged} />
    );

    const toggle = screen.getByRole("switch");
    await user.click(toggle);

    await waitFor(() => {
      expect(settingsApi.toggleDeviceVerification).toHaveBeenCalledWith(false);
      expect(toast.success).toHaveBeenCalledWith("Device verification disabled.");
      expect(onStatusChanged).toHaveBeenCalledWith(false);
      expect(toggle).not.toBeChecked();
    });
  });

  it("reverts switch state and shows error toast when API fails", async () => {
    const user = userEvent.setup();
    vi.mocked(settingsApi.toggleDeviceVerification).mockRejectedValueOnce(
      new Error("Failed to update security settings.")
    );

    render(<DeviceVerificationCard enabled={false} />);

    const toggle = screen.getByRole("switch");
    await user.click(toggle);

    await waitFor(() => {
      expect(settingsApi.toggleDeviceVerification).toHaveBeenCalledWith(true);
      expect(toast.error).toHaveBeenCalled();
      expect(toggle).not.toBeChecked();
    });
  });
});
