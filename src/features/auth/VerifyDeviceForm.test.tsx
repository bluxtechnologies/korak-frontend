import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VerifyDeviceForm } from "./VerifyDeviceForm";

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
  verifyDevice: vi.fn(),
  resendVerificationCode: vi.fn(),
}));
import { verifyDevice, resendVerificationCode } from "@/features/auth/api";
const mockVerifyDevice = vi.mocked(verifyDevice);
const mockResendVerificationCode = vi.mocked(resendVerificationCode);

// ---------------------------------------------------------------------------
// Mock sonner toast
// ---------------------------------------------------------------------------
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));
import { toast } from "sonner";
const mockToast = vi.mocked(toast);

describe("VerifyDeviceForm (F10)", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockVerifyDevice.mockClear();
    mockResendVerificationCode.mockClear();
    mockToast.success.mockClear();
    mockToast.error.mockClear();
    mockSearchParams = new URLSearchParams("token=tok_test_123");
  });

  it("renders OTP digit inputs, remember device checkbox, and action buttons", () => {
    render(<VerifyDeviceForm />);

    expect(screen.getAllByRole("textbox")).toHaveLength(6);
    expect(
      screen.getByLabelText(/remember this device for 30 days/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /verify and continue/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /resend code/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /back to sign in/i })
    ).toBeInTheDocument();
  });

  it("shows validation error when submitting with incomplete code", async () => {
    const user = userEvent.setup();
    render(<VerifyDeviceForm />);

    const inputs = screen.getAllByRole("textbox");
    await user.type(inputs[0], "1");
    await user.type(inputs[1], "2");

    await user.click(
      screen.getByRole("button", { name: /verify and continue/i })
    );

    expect(mockVerifyDevice).not.toHaveBeenCalled();
    expect(
      screen.getByText(/please enter all 6 digits/i)
    ).toBeInTheDocument();
  });

  it("submits valid 6-digit code and redirects to overview on success", async () => {
    const user = userEvent.setup();
    mockVerifyDevice.mockResolvedValueOnce({
      user: {
        id: "cust_123",
        name: "Alice",
        email: "alice@example.com",
        username: "alice",
        email_verified_at: "2026-01-01",
        created_at: "2026-01-01",
      },
    });

    render(<VerifyDeviceForm />);

    const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
    inputs[0].focus();
    await user.paste("123456");

    await user.click(
      screen.getByRole("button", { name: /verify and continue/i })
    );

    await waitFor(() => {
      expect(mockVerifyDevice).toHaveBeenCalledWith({
        challenge_token: "tok_test_123",
        code: "123456",
        remember_device: false,
      });
    });

    expect(mockToast.success).toHaveBeenCalledWith(
      expect.stringMatching(/device verified successfully/i)
    );
    expect(mockPush).toHaveBeenCalledWith("/overview");
  });

  it("supports checking 'Remember this device' and submits true", async () => {
    const user = userEvent.setup();
    mockVerifyDevice.mockResolvedValueOnce({
      user: {
        id: "cust_123",
        name: "Alice",
        email: "alice@example.com",
        username: "alice",
        email_verified_at: "2026-01-01",
        created_at: "2026-01-01",
      },
    });

    render(<VerifyDeviceForm />);

    const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
    inputs[0].focus();
    await user.paste("654321");

    await user.click(screen.getByLabelText(/remember this device for 30 days/i));
    await user.click(
      screen.getByRole("button", { name: /verify and continue/i })
    );

    await waitFor(() => {
      expect(mockVerifyDevice).toHaveBeenCalledWith({
        challenge_token: "tok_test_123",
        code: "654321",
        remember_device: true,
      });
    });
  });

  it("preserves intended destination upon verification", async () => {
    mockSearchParams = new URLSearchParams({ token: "tok_test_123", intended: "/orders" });
    const user = userEvent.setup();
    mockVerifyDevice.mockResolvedValueOnce({
      user: {
        id: "cust_123",
        name: "Alice",
        email: "alice@example.com",
        username: "alice",
        email_verified_at: "2026-01-01",
        created_at: "2026-01-01",
      },
    });

    render(<VerifyDeviceForm />);

    const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
    inputs[0].focus();
    await user.paste("123456");

    await user.click(
      screen.getByRole("button", { name: /verify and continue/i })
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/orders");
    });
  });

  it("sanitizes open redirects and falls back to /overview", async () => {
    mockSearchParams = new URLSearchParams({ token: "tok_test_123", intended: "https://evil.com" });
    const user = userEvent.setup();
    mockVerifyDevice.mockResolvedValueOnce({
      user: {
        id: "cust_123",
        name: "Alice",
        email: "alice@example.com",
        username: "alice",
        email_verified_at: "2026-01-01",
        created_at: "2026-01-01",
      },
    });

    render(<VerifyDeviceForm />);

    const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
    inputs[0].focus();
    await user.paste("123456");

    await user.click(
      screen.getByRole("button", { name: /verify and continue/i })
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/overview");
    });
  });

  it("displays safe server error message when code is invalid or expired (422)", async () => {
    const { ApiClientError } = await import("@/lib/api/client");
    const user = userEvent.setup();
    mockVerifyDevice.mockRejectedValueOnce(
      new ApiClientError("Invalid verification code.", 422, "validation_failed", {
        code: ["The verification code is incorrect or has expired."],
      })
    );

    render(<VerifyDeviceForm />);

    const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
    inputs[0].focus();
    await user.paste("000000");

    await user.click(
      screen.getByRole("button", { name: /verify and continue/i })
    );

    await waitFor(() => {
      expect(
        screen.getByText(/the verification code is incorrect or has expired/i)
      ).toBeInTheDocument();
    });
  });

  it("displays attempt-limit / throttling banner when rate limited (429)", async () => {
    const { ApiClientError } = await import("@/lib/api/client");
    const user = userEvent.setup();
    mockVerifyDevice.mockRejectedValueOnce(
      new ApiClientError("Too many attempts.", 429, "rate_limited")
    );

    render(<VerifyDeviceForm />);

    const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
    inputs[0].focus();
    await user.paste("123456");

    await user.click(
      screen.getByRole("button", { name: /verify and continue/i })
    );

    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
      expect(alert.textContent).toMatch(/too many requests|please wait/i);
    });
  });

  it("handles resending verification code with cooldown timer and toast", async () => {
    const user = userEvent.setup();
    mockResendVerificationCode.mockResolvedValueOnce({
      message: "A new code has been sent.",
    });

    render(<VerifyDeviceForm />);

    const resendBtn = screen.getByRole("button", { name: /resend code/i });
    await user.click(resendBtn);

    await waitFor(() => {
      expect(mockResendVerificationCode).toHaveBeenCalledTimes(1);
      expect(mockResendVerificationCode).toHaveBeenCalledWith({
        challenge_token: "tok_test_123",
      });
    });

    expect(mockToast.success).toHaveBeenCalledWith(
      "A new code has been sent."
    );

    // Cooldown indicator should now appear
    expect(screen.getByText(/resend in 60s/i)).toBeInTheDocument();
  });

  it("redirects to /login when resend receives 400 invalid_or_expired_challenge", async () => {
    const user = userEvent.setup();
    mockResendVerificationCode.mockRejectedValueOnce({
      status: 400,
      code: "invalid_or_expired_challenge",
      message: "Invalid or expired verification challenge. Please log in again.",
    });

    render(<VerifyDeviceForm />);

    const resendBtn = screen.getByRole("button", { name: /resend code/i });
    await user.click(resendBtn);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        "Invalid or expired verification challenge. Please log in again."
      );
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("handles 429 too_many_requests on resend and displays cooldown banner", async () => {
    const user = userEvent.setup();
    mockResendVerificationCode.mockRejectedValueOnce({
      status: 429,
      code: "too_many_requests",
      message: "Too many requests. Please try again later.",
      retryAfter: 45,
    });

    render(<VerifyDeviceForm />);

    const resendBtn = screen.getByRole("button", { name: /resend code/i });
    await user.click(resendBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/too many requests\. please try again in 45 seconds\./i)
      ).toBeInTheDocument();
      expect(screen.getByText(/resend in 45s/i)).toBeInTheDocument();
    });
  });

  it("displays error banner when challenge token is missing from query params", async () => {
    mockSearchParams = new URLSearchParams(); // No token
    const user = userEvent.setup();
    render(<VerifyDeviceForm />);

    const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
    inputs[0].focus();
    await user.paste("123456");

    await user.click(
      screen.getByRole("button", { name: /verify and continue/i })
    );

    expect(mockVerifyDevice).not.toHaveBeenCalled();
    expect(
      screen.getByText(/verification session expired or missing token/i)
    ).toBeInTheDocument();
  });
});
