import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LiveWaitingTerminal } from "./LiveWaitingTerminal";
import { MOCK_ACTIVE_OTP_ORDER } from "./api";

describe("LiveWaitingTerminal Component", () => {
  it("renders active phone number and countdown timer", () => {
    render(<LiveWaitingTerminal order={MOCK_ACTIVE_OTP_ORDER} />);

    expect(screen.getByTestId("live-waiting-terminal")).toBeInTheDocument();
    expect(screen.getByTestId("terminal-phone-number")).toHaveTextContent(
      MOCK_ACTIVE_OTP_ORDER.phone_number
    );
    expect(screen.getByText(/Waiting for SMS/i)).toBeInTheDocument();
    expect(screen.getByTestId("terminal-timer")).toBeInTheDocument();
  });

  it("simulates receiving SMS code upon clicking simulate arrival", () => {
    const handleReceiveCode = vi.fn();
    render(
      <LiveWaitingTerminal
        order={MOCK_ACTIVE_OTP_ORDER}
        onReceiveCode={handleReceiveCode}
      />
    );

    const simulateBtn = screen.getByRole("button", { name: /Simulate Arrival/i });
    fireEvent.click(simulateBtn);

    expect(screen.getByTestId("received-sms-box")).toBeInTheDocument();
    expect(screen.getByTestId("received-sms-code")).toBeInTheDocument();
    expect(handleReceiveCode).toHaveBeenCalled();
  });

  it("triggers cancel callback when clicking cancel & refund", async () => {
    const handleCancel = vi.fn().mockResolvedValue(undefined);
    render(
      <LiveWaitingTerminal
        order={MOCK_ACTIVE_OTP_ORDER}
        onCancelOrder={handleCancel}
      />
    );

    const cancelBtn = screen.getByRole("button", { name: /Cancel & Refund/i });
    fireEvent.click(cancelBtn);

    expect(handleCancel).toHaveBeenCalledWith(MOCK_ACTIVE_OTP_ORDER.id);
  });
});
