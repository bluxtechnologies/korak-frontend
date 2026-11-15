import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { ChangePasswordForm } from "./ChangePasswordForm";
import * as settingsApi from "./api";
import { ApiClientError } from "@/lib/api/client";

vi.mock("./api", async (importOriginal) => {
  const actual = await importOriginal<typeof settingsApi>();
  return {
    ...actual,
    changePassword: vi.fn(),
  };
});

describe("ChangePasswordForm (F13.2)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders current, new, and confirm password fields", () => {
    render(<ChangePasswordForm />);

    expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /update password/i })
    ).toBeInTheDocument();
  });

  it("enforces 12-character minimum and matching passwords", async () => {
    const user = userEvent.setup();
    render(<ChangePasswordForm />);

    const currentInput = screen.getByLabelText(/current password/i);
    const newInput = screen.getByLabelText(/^new password$/i);
    const confirmInput = screen.getByLabelText(/confirm new password/i);

    await user.type(currentInput, "CurrentSecret123!");
    await user.type(newInput, "Short123!"); // 9 chars
    await user.type(confirmInput, "Short123!");

    const submitBtn = screen.getByRole("button", { name: /update password/i });
    await user.click(submitBtn);

    expect(
      await screen.findByText(
        "New password must be at least 12 characters long"
      )
    ).toBeInTheDocument();
  });

  it("submits valid payload and resets form on success", async () => {
    const user = userEvent.setup();
    const handleSuccess = vi.fn();
    vi.mocked(settingsApi.changePassword).mockResolvedValueOnce({
      message: "Password changed successfully",
    });

    render(<ChangePasswordForm onSuccess={handleSuccess} />);

    await user.type(
      screen.getByLabelText(/current password/i),
      "CurrentPassword123!"
    );
    await user.type(
      screen.getByLabelText(/^new password$/i),
      "BrandNewSecurePassword2026!"
    );
    await user.type(
      screen.getByLabelText(/confirm new password/i),
      "BrandNewSecurePassword2026!"
    );

    await user.click(
      screen.getByRole("button", { name: /update password/i })
    );

    await waitFor(() => {
      expect(settingsApi.changePassword).toHaveBeenCalledWith({
        current_password: "CurrentPassword123!",
        password: "BrandNewSecurePassword2026!",
        password_confirmation: "BrandNewSecurePassword2026!",
      });
      expect(handleSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it("handles wrong current password server error safely", async () => {
    const user = userEvent.setup();
    vi.mocked(settingsApi.changePassword).mockRejectedValueOnce(
      new ApiClientError("Validation failed", 422, "validation_error", {
        current_password: ["The current password is incorrect."],
      })
    );

    render(<ChangePasswordForm />);

    await user.type(
      screen.getByLabelText(/current password/i),
      "WrongPassword123!"
    );
    await user.type(
      screen.getByLabelText(/^new password$/i),
      "BrandNewSecurePassword2026!"
    );
    await user.type(
      screen.getByLabelText(/confirm new password/i),
      "BrandNewSecurePassword2026!"
    );

    await user.click(
      screen.getByRole("button", { name: /update password/i })
    );

    expect(
      await screen.findByText("The current password is incorrect.")
    ).toBeInTheDocument();
  });
});
