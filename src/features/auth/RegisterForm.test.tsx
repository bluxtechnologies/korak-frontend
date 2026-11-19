import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RegisterForm } from "./RegisterForm";

// ---------------------------------------------------------------------------
// Mock next/navigation
// ---------------------------------------------------------------------------
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// ---------------------------------------------------------------------------
// Mock the auth API
// ---------------------------------------------------------------------------
vi.mock("@/features/auth/api", () => ({
  register: vi.fn(),
}));
import { register } from "@/features/auth/api";
const mockRegister = vi.mocked(register);

// ---------------------------------------------------------------------------
// Mock sonner toast
// ---------------------------------------------------------------------------
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function renderRegisterForm() {
  render(<RegisterForm />);
  return {
    nameInput: () => screen.getByLabelText(/full name/i),
    emailInput: () => screen.getByLabelText(/email address/i),
    phoneInput: () => screen.getByLabelText(/phone number/i),
    // Both password fields share the same placeholder — select by label
    passwordInput: () =>
      screen.getByRole("textbox", { hidden: true, name: /^password$/i }) ||
      screen.getAllByPlaceholderText("Min. 8 characters")[0],
    confirmInput: () => screen.getAllByPlaceholderText("Re-enter password")[0],
    termsCheckbox: () => screen.getByRole("checkbox"),
    submitBtn: () => screen.getByRole("button", { name: /create account/i }),
  };
}

/** Fill in every field with valid data */
async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/full name/i), "Collins Okeke");
  await user.type(screen.getByLabelText(/email address/i), "collins@example.com");
  await user.type(screen.getByLabelText(/phone number/i), "+2348012345678");
  // Min-8-characters password field
  const [pwField, confirmField] = screen.getAllByPlaceholderText(/characters|password/i);
  await user.type(pwField, "Secret123!");
  await user.type(confirmField, "Secret123!");
  await user.click(screen.getByRole("checkbox"));
}

describe("RegisterForm (F8.3)", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockRegister.mockClear();
  });

  it("renders all required fields and the submit button", () => {
    renderRegisterForm();

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Min. 8 characters")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Re-enter password")).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create account/i })
    ).toBeInTheDocument();
  });

  it("validates all required fields on empty submit", async () => {
    const user = userEvent.setup();
    renderRegisterForm();

    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(mockRegister).not.toHaveBeenCalled();
    expect(
      screen.getByText(/full name must be at least 2 characters/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/please enter your email address/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/phone number must be at least 7 digits/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/password must be at least 8 characters/i)
    ).toBeInTheDocument();
  });

  it("shows password mismatch error", async () => {
    const user = userEvent.setup();
    renderRegisterForm();

    await user.type(screen.getByLabelText(/full name/i), "Collins Okeke");
    await user.type(
      screen.getByLabelText(/email address/i),
      "collins@example.com"
    );
    await user.type(screen.getByLabelText(/phone number/i), "+2348012345678");
    await user.type(
      screen.getByPlaceholderText("Min. 8 characters"),
      "Secret123!"
    );
    await user.type(
      screen.getByPlaceholderText("Re-enter password"),
      "DifferentPass!"
    );
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(mockRegister).not.toHaveBeenCalled();
    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it("shows terms error when terms not accepted", async () => {
    const user = userEvent.setup();
    renderRegisterForm();

    await user.type(screen.getByLabelText(/full name/i), "Collins Okeke");
    await user.type(
      screen.getByLabelText(/email address/i),
      "collins@example.com"
    );
    await user.type(screen.getByLabelText(/phone number/i), "+2348012345678");
    await user.type(
      screen.getByPlaceholderText("Min. 8 characters"),
      "Secret123!"
    );
    await user.type(
      screen.getByPlaceholderText("Re-enter password"),
      "Secret123!"
    );
    // Do NOT tick checkbox
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(mockRegister).not.toHaveBeenCalled();
    expect(
      screen.getByText(/you must accept the terms/i)
    ).toBeInTheDocument();
  });

  it("validates phone number format (rejects non-numeric characters)", async () => {
    const user = userEvent.setup();
    renderRegisterForm();

    await user.type(screen.getByLabelText(/full name/i), "Collins Okeke");
    await user.type(
      screen.getByLabelText(/email address/i),
      "collins@example.com"
    );
    await user.type(screen.getByLabelText(/phone number/i), "not-a-phone!!");
    await user.type(
      screen.getByPlaceholderText("Min. 8 characters"),
      "Secret123!"
    );
    await user.type(
      screen.getByPlaceholderText("Re-enter password"),
      "Secret123!"
    );
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(
      screen.getByText(/please enter a valid phone number/i)
    ).toBeInTheDocument();
  });

  it("calls register API and redirects to overview on success", async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValueOnce({
      user: {
        id: "u_01",
        name: "Collins Okeke",
        email: "collins@example.com",
        username: "collins_ok",
        email_verified_at: null,
        created_at: "2026-01-01T00:00:00Z",
      },
    });

    renderRegisterForm();
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        name: "Collins Okeke",
        email: "collins@example.com",
        phone_number: "+2348012345678",
        password: "Secret123!",
        password_confirmation: "Secret123!",
        terms: true,
      });
      expect(mockPush).toHaveBeenCalledWith("/overview");
    });
  });

  it("redirects to verify-device when API signals unrecognised device", async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValueOnce({
      user: {
        id: "u_01",
        name: "Collins Okeke",
        email: "collins@example.com",
        username: "collins_ok",
        email_verified_at: null,
        created_at: "2026-01-01T00:00:00Z",
      },
      requires_device_verification: true,
    });

    renderRegisterForm();
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/verify-device");
    });
  });

  it("maps server field errors from 422 response onto the correct fields", async () => {
    const { ApiClientError } = await import("@/lib/api/client");
    const user = userEvent.setup();

    mockRegister.mockRejectedValueOnce(
      new ApiClientError("The given data was invalid.", 422, "validation_error", {
        email: ["The email has already been taken."],
        phone_number: ["The phone number has already been taken."],
      })
    );

    renderRegisterForm();
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/the email has already been taken/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/the phone number has already been taken/i)
      ).toBeInTheDocument();
    });
  });
});
