import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { ActiveSessionsCard } from "./ActiveSessionsCard";
import * as settingsApi from "./api";

vi.mock("./api", async (importOriginal) => {
  const actual = await importOriginal<typeof settingsApi>();
  return {
    ...actual,
    revokeOtherSessions: vi.fn(),
  };
});

describe("ActiveSessionsCard (F13.3)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders active sessions list with current session badge", () => {
    render(<ActiveSessionsCard sessions={settingsApi.MOCK_SESSIONS} />);

    expect(screen.getByText("Active Sessions")).toBeInTheDocument();
    expect(screen.getByText("Chrome 130 on Windows 11")).toBeInTheDocument();
    expect(screen.getByText("Current Session")).toBeInTheDocument();
    expect(screen.getByText("Safari on iPhone 15 Pro")).toBeInTheDocument();
  });

  it("opens destructive confirm dialog and revokes other sessions on confirmation", async () => {
    const user = userEvent.setup();
    const handleRevoked = vi.fn();
    vi.mocked(settingsApi.revokeOtherSessions).mockResolvedValueOnce({
      message: "All other sessions signed out",
    });

    render(
      <ActiveSessionsCard
        sessions={settingsApi.MOCK_SESSIONS}
        onSessionsRevoked={handleRevoked}
      />
    );

    const signoutBtn = screen.getByTestId("revoke-others-button");
    await user.click(signoutBtn);

    // Confirm dialog appears
    expect(
      screen.getByText("Sign out other active sessions?")
    ).toBeInTheDocument();

    const confirmBtn = screen.getByRole("button", {
      name: /sign out other sessions/i,
    });
    await user.click(confirmBtn);

    await waitFor(() => {
      expect(settingsApi.revokeOtherSessions).toHaveBeenCalledTimes(1);
      expect(handleRevoked).toHaveBeenCalledTimes(1);
      // Other sessions are removed from UI
      expect(
        screen.queryByText("Safari on iPhone 15 Pro")
      ).not.toBeInTheDocument();
      // Current session remains
      expect(
        screen.getByText("Chrome 130 on Windows 11")
      ).toBeInTheDocument();
    });
  });
});
