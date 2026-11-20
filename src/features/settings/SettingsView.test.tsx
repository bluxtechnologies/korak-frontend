import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { SettingsView } from "./SettingsView";
import * as settingsApi from "./api";

describe("SettingsView (F13)", () => {
  it("renders tab navigation and defaults to General Profile tab", () => {
    render(
      <SettingsView
        initialProfile={settingsApi.MOCK_PROFILE}
        initialSessions={settingsApi.MOCK_SESSIONS}
        initialDevices={settingsApi.MOCK_TRUSTED_DEVICES}
        initialActivities={settingsApi.MOCK_SECURITY_ACTIVITY}
      />
    );

    expect(screen.getByRole("tab", { name: /general profile/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /password & security/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /sessions & devices/i })).toBeInTheDocument();

    // Default tab is profile
    expect(screen.getByTestId("profile-edit-form-card")).toBeInTheDocument();
  });

  it("switches tabs when tab buttons are clicked", async () => {
    const user = userEvent.setup();
    render(
      <SettingsView
        initialProfile={settingsApi.MOCK_PROFILE}
        initialSessions={settingsApi.MOCK_SESSIONS}
        initialDevices={settingsApi.MOCK_TRUSTED_DEVICES}
        initialActivities={settingsApi.MOCK_SECURITY_ACTIVITY}
      />
    );

    // Switch to Password & Security tab
    const securityTab = screen.getByRole("tab", { name: /password & security/i });
    await user.click(securityTab);

    expect(screen.getByTestId("device-verification-card")).toBeInTheDocument();
    expect(screen.getByTestId("change-password-card")).toBeInTheDocument();
    expect(screen.getByTestId("security-activity-card")).toBeInTheDocument();

    // Switch to Sessions & Devices tab
    const sessionsTab = screen.getByRole("tab", { name: /sessions & devices/i });
    await user.click(sessionsTab);

    expect(screen.getByTestId("active-sessions-card")).toBeInTheDocument();
    expect(screen.getByTestId("trusted-devices-card")).toBeInTheDocument();
  });
});
