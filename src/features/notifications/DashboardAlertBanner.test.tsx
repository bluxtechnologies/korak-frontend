import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DashboardAlertBanner } from "./DashboardAlertBanner";

describe("DashboardAlertBanner (F14.4)", () => {
  it("renders warning alert title and description", () => {
    render(
      <DashboardAlertBanner
        level="warning"
        title="Email Verification Required"
        description="Please verify your email address to unlock full wallet limits."
      />
    );

    expect(screen.getByTestId("dashboard-alert-banner")).toBeInTheDocument();
    expect(
      screen.getByText("Email Verification Required")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Please verify your email address to unlock full wallet limits."
      )
    ).toBeInTheDocument();
  });

  it("handles action button clicks", async () => {
    const user = userEvent.setup();
    const handleAction = vi.fn();

    render(
      <DashboardAlertBanner
        title="Action required"
        description="Verify now"
        action={{ label: "Verify", onClick: handleAction }}
      />
    );

    const actionBtn = screen.getByRole("button", { name: "Verify" });
    await user.click(actionBtn);

    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it("dismisses alert when clicking dismiss button", async () => {
    const user = userEvent.setup();
    const handleDismiss = vi.fn();

    render(
      <DashboardAlertBanner
        title="Dismissible notice"
        description="This can be dismissed"
        dismissible={true}
        onDismiss={handleDismiss}
      />
    );

    const dismissBtn = screen.getByRole("button", {
      name: /dismiss alert/i,
    });
    await user.click(dismissBtn);

    expect(handleDismiss).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByTestId("dashboard-alert-banner")
    ).not.toBeInTheDocument();
  });
});
