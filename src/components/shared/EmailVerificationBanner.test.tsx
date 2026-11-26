import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { EmailVerificationBanner } from "./EmailVerificationBanner";
import * as authApi from "@/features/auth/api";
import { customerApi } from "@/lib/api/customer";
import { showToast } from "@/components/ui/sonner";

vi.mock("@/features/auth/api", async () => {
  const actual = await vi.importActual<typeof authApi>("@/features/auth/api");
  return {
    ...actual,
    resendEmailVerification: vi.fn(),
  };
});

vi.mock("@/lib/api/customer", () => ({
  customerApi: {
    getProfile: vi.fn(),
  },
}));

vi.mock("@/components/ui/sonner", () => ({
  showToast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe("EmailVerificationBanner", () => {
  const unverifiedUser: authApi.AuthUser = {
    id: "usr_unverified_1",
    name: "Collins Okeke",
    username: "collins",
    email: "collins@example.com",
    email_verified_at: null,
    created_at: "2026-11-20T10:00:00Z",
  };

  const verifiedUser: authApi.AuthUser = {
    id: "usr_verified_1",
    name: "Collins Okeke",
    username: "collins",
    email: "collins@example.com",
    email_verified_at: "2026-11-20T12:00:00Z",
    created_at: "2026-11-20T10:00:00Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render when the user email is already verified", () => {
    const { container } = render(<EmailVerificationBanner user={verifiedUser} />);
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByTestId("email-verification-banner")).not.toBeInTheDocument();
  });

  it("renders a persistent alert banner when the user email is unverified", () => {
    render(<EmailVerificationBanner user={unverifiedUser} />);

    const banner = screen.getByTestId("email-verification-banner");
    expect(banner).toBeInTheDocument();
    expect(screen.getByText(/Please verify your email address/i)).toBeInTheDocument();
    expect(screen.getByText("Action Required")).toBeInTheDocument();
    expect(screen.getByText("collins@example.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Resend Email/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /I've Verified/i })).toBeInTheDocument();
  });

  it("calls resendEmailVerification when clicking Resend Email button and starts cooldown", async () => {
    const user = userEvent.setup();
    vi.mocked(authApi.resendEmailVerification).mockResolvedValueOnce({
      message: "Verification email sent successfully.",
    });

    render(<EmailVerificationBanner user={unverifiedUser} />);

    const resendBtn = screen.getByRole("button", { name: /Resend Email/i });
    await user.click(resendBtn);

    expect(authApi.resendEmailVerification).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(showToast.success).toHaveBeenCalledWith(
        "Verification Email Sent",
        "Verification email sent successfully."
      );
    });

    // Check that button shows cooldown and is disabled
    expect(screen.getByRole("button", { name: /Resend in \d+s/i })).toBeDisabled();
  });

  it("handles failure when resending verification email", async () => {
    const user = userEvent.setup();
    vi.mocked(authApi.resendEmailVerification).mockRejectedValueOnce(
      new Error("Rate limit exceeded")
    );

    render(<EmailVerificationBanner user={unverifiedUser} />);

    const resendBtn = screen.getByRole("button", { name: /Resend Email/i });
    await user.click(resendBtn);

    await waitFor(() => {
      expect(showToast.error).toHaveBeenCalledWith(
        "Failed to Send",
        expect.stringContaining("Rate limit exceeded")
      );
    });
  });

  it("checks verification status and hides banner when verified", async () => {
    const user = userEvent.setup();
    vi.mocked(customerApi.getProfile).mockResolvedValueOnce({
      id: "usr_unverified_1",
      username: "collins",
      first_name: "Collins",
      last_name: "Okeke",
      full_name: "Collins Okeke",
      phone: null,
      email: "collins@example.com",
      email_verified_at: "2026-11-26T22:00:00Z",
      has_virtual_account: true,
      virtual_account: null,
      created_at: "2026-11-20T10:00:00Z",
    });

    render(<EmailVerificationBanner user={unverifiedUser} />);

    const checkBtn = screen.getByRole("button", { name: /I've Verified/i });
    await user.click(checkBtn);

    expect(customerApi.getProfile).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(showToast.success).toHaveBeenCalledWith(
        "Email Verified",
        expect.stringContaining("verified successfully")
      );
    });

    // Banner should disappear after verification
    expect(screen.queryByTestId("email-verification-banner")).not.toBeInTheDocument();
  });

  it("notifies the customer if email is still not verified after clicking check status", async () => {
    const user = userEvent.setup();
    vi.mocked(customerApi.getProfile).mockResolvedValueOnce({
      id: "usr_unverified_1",
      username: "collins",
      first_name: "Collins",
      last_name: "Okeke",
      full_name: "Collins Okeke",
      phone: null,
      email: "collins@example.com",
      email_verified_at: null,
      has_virtual_account: true,
      virtual_account: null,
      created_at: "2026-11-20T10:00:00Z",
    });

    render(<EmailVerificationBanner user={unverifiedUser} />);

    const checkBtn = screen.getByRole("button", { name: /I've Verified/i });
    await user.click(checkBtn);

    await waitFor(() => {
      expect(showToast.info).toHaveBeenCalledWith(
        "Not Yet Verified",
        expect.stringContaining("confirmation")
      );
    });

    // Banner remains visible
    expect(screen.getByTestId("email-verification-banner")).toBeInTheDocument();
  });
});
