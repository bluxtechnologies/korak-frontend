import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResetPasswordForm } from "./ResetPasswordForm";

// ---------------------------------------------------------------------------
// Mock next/navigation
// ---------------------------------------------------------------------------
const mockPush = vi.fn();
let mockSearchParams = new URLSearchParams();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams,
}));

// ---------------------------------------------------------------------------
// Mock the auth API
// ---------------------------------------------------------------------------
vi.mock("@/features/auth/api", () => ({
  resetPassword: vi.fn(),
}));
import { resetPassword } from "@/features/auth/api";
const mockResetPassword = vi.mocked(resetPassword);

// ---------------------------------------------------------------------------
// Mock sonner toast
// ---------------------------------------------------------------------------
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));
import { toast } from "sonner";
const mockToast = vi.mocked(toast);

describe("ResetPasswordForm (F9.2)", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockResetPassword.mockClear();
    mockToast.success.mockClear();
    mockSearchParams = new URLSearchParams();
  });

  it("shows invalid/missing reset link alert when no token is present", () => {
    render(<ResetPasswordForm />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(
      screen.getByText(/invalid or missing reset link/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /request a new reset link/i })
    ).toBeInTheDocument();
    expect(mockResetPassword).not.toHaveBeenCalled();
  });

  it("renders form fields and pre-populates email when token and email are in query params", () => {
    mockSearchParams = new URLSearchParams({
      token: "test_token_123",
      email: "alice@example.com",
    });

    render(<ResetPasswordForm />);

    const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement;
    expect(emailInput.value).toBe("alice@example.com");
    expect(screen.getByLabelText(/^new password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /reset password/i })
    ).toBeInTheDocument();
  });

  it("validates that passwords match and meet minimum length", async () => {
    mockSearchParams = new URLSearchParams({ token: "test_token_123" });
    const user = userEvent.setup();

    render(<ResetPasswordForm />);

    await user.type(screen.getByLabelText(/email address/i), "alice@example.com");
    await user.type(screen.getByLabelText(/^new password/i), "short");
    await user.type(screen.getByLabelText(/confirm new password/i), "mismatch");

    await user.click(screen.getByRole("button", { name: /reset password/i }));

    expect(mockResetPassword).not.toHaveBeenCalled();
    expect(
      screen.getByText(/password must be at least 8 characters/i)
    ).toBeInTheDocument();
  });

  it("validates that passwords do not match when length is valid", async () => {
    mockSearchParams = new URLSearchParams({ token: "test_token_123" });
    const user = userEvent.setup();

    render(<ResetPasswordForm />);

    await user.type(screen.getByLabelText(/email address/i), "alice@example.com");
    await user.type(screen.getByLabelText(/^new password/i), "validpassword1");
    await user.type(screen.getByLabelText(/confirm new password/i), "differentpass2");

    await user.click(screen.getByRole("button", { name: /reset password/i }));

    expect(mockResetPassword).not.toHaveBeenCalled();
    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it("submits valid form, shows toast, and redirects to login", async () => {
    mockSearchParams = new URLSearchParams({
      token: "valid_token_abc",
      email: "alice@example.com",
    });
    const user = userEvent.setup();
    mockResetPassword.mockResolvedValueOnce({
      message: "Password reset successful.",
    });

    render(<ResetPasswordForm />);

    await user.type(screen.getByLabelText(/^new password/i), "newSecurePass123!");
    await user.type(
      screen.getByLabelText(/confirm new password/i),
      "newSecurePass123!"
    );

    await user.click(screen.getByRole("button", { name: /reset password/i }));

    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith({
        token: "valid_token_abc",
        email: "alice@example.com",
        password: "newSecurePass123!",
        password_confirmation: "newSecurePass123!",
      });
    });

    expect(mockToast.success).toHaveBeenCalledWith(
      expect.stringMatching(/password reset successfully/i)
    );
    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  it("handles server error on expired or invalid token", async () => {
    const { ApiClientError } = await import("@/lib/api/client");
    mockSearchParams = new URLSearchParams({
      token: "expired_token",
      email: "alice@example.com",
    });
    const user = userEvent.setup();

    mockResetPassword.mockRejectedValueOnce(
      new ApiClientError("Invalid or expired reset token.", 422, "validation_failed", {
        token: ["This password reset token is invalid or expired."],
      })
    );

    render(<ResetPasswordForm />);

    await user.type(screen.getByLabelText(/^new password/i), "newSecurePass123!");
    await user.type(
      screen.getByLabelText(/confirm new password/i),
      "newSecurePass123!"
    );

    await user.click(screen.getByRole("button", { name: /reset password/i }));

    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
      expect(alert.textContent).toMatch(/token/i);
    });
  });
});
