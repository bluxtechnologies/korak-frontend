import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

// ---------------------------------------------------------------------------
// Mock the auth API
// ---------------------------------------------------------------------------
vi.mock("@/features/auth/api", () => ({
  forgotPassword: vi.fn(),
}));
import { forgotPassword } from "@/features/auth/api";
const mockForgotPassword = vi.mocked(forgotPassword);

describe("ForgotPasswordForm (F9.1)", () => {
  beforeEach(() => {
    mockForgotPassword.mockClear();
  });

  it("renders the email input, submit button, and sign in link", () => {
    render(<ForgotPasswordForm />);

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send reset instructions/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /sign in/i })
    ).toBeInTheDocument();
  });

  it("shows validation error when submitting an empty form", async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordForm />);

    await user.click(
      screen.getByRole("button", { name: /send reset instructions/i })
    );

    expect(mockForgotPassword).not.toHaveBeenCalled();
    expect(
      screen.getByText(/please enter your email address/i)
    ).toBeInTheDocument();
  });

  it("shows validation error on invalid email address format", async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText(/email address/i), "not-an-email");
    await user.click(
      screen.getByRole("button", { name: /send reset instructions/i })
    );

    expect(mockForgotPassword).not.toHaveBeenCalled();
    expect(
      screen.getByText(/please enter a valid email address/i)
    ).toBeInTheDocument();
  });

  it("calls forgotPassword API and displays generic success message", async () => {
    const user = userEvent.setup();
    mockForgotPassword.mockResolvedValueOnce({
      message: "If that email exists, we have sent instructions.",
    });

    render(<ForgotPasswordForm />);

    await user.type(
      screen.getByLabelText(/email address/i),
      "customer@example.com"
    );
    await user.click(
      screen.getByRole("button", { name: /send reset instructions/i })
    );

    await waitFor(() => {
      expect(mockForgotPassword).toHaveBeenCalledWith({
        email: "customer@example.com",
      });
    });

    // Check confirmation screen
    expect(screen.getByText(/check your email/i)).toBeInTheDocument();
    expect(screen.getByText(/customer@example\.com/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /try another email/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /back to sign in/i })
    ).toBeInTheDocument();
  });

  it("resets form when clicking 'Try another email'", async () => {
    const user = userEvent.setup();
    mockForgotPassword.mockResolvedValueOnce({
      message: "If that email exists, we have sent instructions.",
    });

    render(<ForgotPasswordForm />);

    await user.type(
      screen.getByLabelText(/email address/i),
      "customer@example.com"
    );
    await user.click(
      screen.getByRole("button", { name: /send reset instructions/i })
    );

    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /try another email/i }));

    // Back to form
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send reset instructions/i })
    ).toBeInTheDocument();
  });

  it("displays safe server error message when rate limited (429)", async () => {
    const { ApiClientError } = await import("@/lib/api/client");
    const user = userEvent.setup();

    mockForgotPassword.mockRejectedValueOnce(
      new ApiClientError("Too many attempts.", 429, "rate_limited")
    );

    render(<ForgotPasswordForm />);

    await user.type(
      screen.getByLabelText(/email address/i),
      "customer@example.com"
    );
    await user.click(
      screen.getByRole("button", { name: /send reset instructions/i })
    );

    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
      expect(alert.textContent).toMatch(/too many requests|please wait/i);
    });
  });
});
