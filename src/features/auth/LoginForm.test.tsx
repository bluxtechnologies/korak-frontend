import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "./LoginForm";

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
vi.mock("@/features/auth/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/features/auth/api")>();
  return {
    ...actual,
    login: vi.fn(),
  };
});
import { login } from "@/features/auth/api";
const mockLogin = vi.mocked(login);

// ---------------------------------------------------------------------------
// Mock sonner toast
// ---------------------------------------------------------------------------
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function renderLoginForm() {
  render(<LoginForm />);
  return {
    loginInput: () => screen.getByLabelText(/username or email/i),
    passwordInput: () => screen.getByPlaceholderText("••••••••"),
    submitBtn: () => screen.getByRole("button", { name: /^sign in$/i }),
  };
}

describe("LoginForm (F8.2)", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockLogin.mockClear();
  });

  it("renders all required fields, remember me checkbox, forgot password link, social buttons, and submit button", () => {
    renderLoginForm();

    expect(screen.getByLabelText(/username or email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
    expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /forgot password/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^sign in$/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /continue with google/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /continue with facebook/i })
    ).toBeInTheDocument();
  });

  it("supports checking 'Remember me'", async () => {
    const user = userEvent.setup();
    renderLoginForm();

    const checkbox = screen.getByLabelText(/remember me/i);
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it("shows Zod validation errors when submitting empty form", async () => {
    const user = userEvent.setup();
    renderLoginForm();

    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    expect(mockLogin).not.toHaveBeenCalled();
    expect(
      screen.getByText(/please enter your username or email/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/please enter your password/i)
    ).toBeInTheDocument();
  });

  it("focuses the first invalid field (username or email) on failed submit", async () => {
    const user = userEvent.setup();
    renderLoginForm();

    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    expect(screen.getByLabelText(/username or email/i)).toHaveFocus();
  });

  it("calls login API and redirects to overview on success", async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce({
      user: {
        id: "u_01",
        name: "Collins Okeke",
        email: "collins@example.com",
        username: "collins",
        email_verified_at: null,
        created_at: "2026-01-01T00:00:00Z",
      },
    });

    renderLoginForm();

    await user.type(
      screen.getByLabelText(/username or email/i),
      "collins@example.com"
    );
    await user.type(screen.getByPlaceholderText("••••••••"), "Secret123!");
    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        login: "collins@example.com",
        password: "Secret123!",
        remember_me: false,
      });
      expect(mockPush).toHaveBeenCalledWith("/overview");
    });
  });

  it("redirects to verify-device when API signals unrecognised device", async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce({
      user: {
        id: "u_01",
        name: "Collins",
        email: "collins@example.com",
        username: "collins",
        email_verified_at: null,
        created_at: "2026-01-01T00:00:00Z",
      },
      requires_device_verification: true,
    });

    renderLoginForm();

    await user.type(
      screen.getByLabelText(/username or email/i),
      "collins@example.com"
    );
    await user.type(screen.getByPlaceholderText("••••••••"), "Secret123!");
    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/verify-device");
    });
  });

  it("forwards challenge_token to verify-device when returned by API", async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce({
      user: {
        id: "u_01",
        name: "Collins",
        email: "collins@example.com",
        username: "collins",
        email_verified_at: null,
        created_at: "2026-01-01T00:00:00Z",
      },
      requires_device_verification: true,
      challenge_token: "tok_xyz_999",
    });

    renderLoginForm();

    await user.type(
      screen.getByLabelText(/username or email/i),
      "collins@example.com"
    );
    await user.type(screen.getByPlaceholderText("••••••••"), "Secret123!");
    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/verify-device?token=tok_xyz_999");
    });
  });

  it("displays a safe error banner and maps field errors from a 422 response", async () => {
    const { ApiClientError } = await import("@/lib/api/client");
    const user = userEvent.setup();

    mockLogin.mockRejectedValueOnce(
      new ApiClientError("The given data was invalid.", 422, "validation_error", {
        login: ["These credentials do not match our records."],
      })
    );

    renderLoginForm();

    await user.type(
      screen.getByLabelText(/username or email/i),
      "wrong@example.com"
    );
    await user.type(screen.getByPlaceholderText("••••••••"), "wrongpassword");
    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/these credentials do not match our records/i)
      ).toBeInTheDocument();
    });
  });

  it("shows a safe generic error banner on a 429 throttle response (F8.4)", async () => {
    const { ApiClientError } = await import("@/lib/api/client");
    const user = userEvent.setup();

    mockLogin.mockRejectedValueOnce(
      new ApiClientError("Too many requests.", 429, "throttled")
    );

    renderLoginForm();

    await user.type(
      screen.getByLabelText(/username or email/i),
      "user@example.com"
    );
    await user.type(screen.getByPlaceholderText("••••••••"), "password123");
    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() => {
      // Alert role must be present with safe message (from getSafeErrorMessage CODE_MESSAGE_MAP)
      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
      expect(alert.textContent).toMatch(/too many|please wait/i);
    });
  });

  it("shows a safe generic error banner on a 423 account locked response (F8.4)", async () => {
    const { ApiClientError } = await import("@/lib/api/client");
    const user = userEvent.setup();

    mockLogin.mockRejectedValueOnce(
      new ApiClientError("Account locked.", 423, "account_locked")
    );

    renderLoginForm();

    await user.type(
      screen.getByLabelText(/username or email/i),
      "user@example.com"
    );
    await user.type(screen.getByPlaceholderText("••••••••"), "password123");
    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
      expect(alert.textContent).toMatch(/locked|contact support/i);
    });
  });

  it("shows a safe server connection error banner on a csrf_handshake_failed response", async () => {
    const { ApiClientError } = await import("@/lib/api/client");
    const user = userEvent.setup();

    mockLogin.mockRejectedValueOnce(
      new ApiClientError(
        "Unable to initialize security session (HTTP 500).",
        500,
        "csrf_handshake_failed"
      )
    );

    renderLoginForm();

    await user.type(
      screen.getByLabelText(/username or email/i),
      "user@example.com"
    );
    await user.type(screen.getByPlaceholderText("••••••••"), "password123");
    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
      expect(alert.textContent).toMatch(/could not connect to the authentication server/i);
    });
  });

  it("redirects to safe intended path if query param is set", async () => {
    mockSearchParams = new URLSearchParams({ intended: "/orders" });
    const user = userEvent.setup();

    mockLogin.mockResolvedValueOnce({
      user: {
        id: "cust_123",
        name: "Alice",
        email: "alice@example.com",
        username: "alice",
        email_verified_at: null,
        created_at: "2026-01-01T00:00:00Z",
      },
    });

    renderLoginForm();

    await user.type(
      screen.getByLabelText(/username or email/i),
      "alice@example.com"
    );
    await user.type(screen.getByPlaceholderText("••••••••"), "password123");
    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/orders");
    });
  });

  it("rejects malicious open redirect and falls back to /overview", async () => {
    mockSearchParams = new URLSearchParams({ intended: "https://evil.com" });
    const user = userEvent.setup();

    mockLogin.mockResolvedValueOnce({
      user: {
        id: "cust_123",
        name: "Alice",
        email: "alice@example.com",
        username: "alice",
        email_verified_at: null,
        created_at: "2026-01-01T00:00:00Z",
      },
    });

    renderLoginForm();

    await user.type(
      screen.getByLabelText(/username or email/i),
      "alice@example.com"
    );
    await user.type(screen.getByPlaceholderText("••••••••"), "password123");
    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/overview");
    });
  });
});
