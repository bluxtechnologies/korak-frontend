import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { ProfileEditForm } from "./ProfileEditForm";
import * as settingsApi from "./api";

vi.mock("./api", async (importOriginal) => {
  const actual = await importOriginal<typeof settingsApi>();
  return {
    ...actual,
    updateProfile: vi.fn(),
  };
});

describe("ProfileEditForm (F13.1)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders profile details and initial form values", () => {
    render(<ProfileEditForm profile={settingsApi.MOCK_PROFILE} />);

    expect(screen.getByText("Amara Nwosu")).toBeInTheDocument();
    expect(screen.getByText("Verified")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Amara Nwosu")).toBeInTheDocument();
    expect(screen.getByDisplayValue("amaranwosu")).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("amara.nwosu@example.com")
    ).toBeInTheDocument();
  });

  it("validates required fields and name length", async () => {
    const user = userEvent.setup();
    render(<ProfileEditForm profile={settingsApi.MOCK_PROFILE} />);

    const nameInput = screen.getByLabelText(/full name/i);
    await user.clear(nameInput);
    await user.type(nameInput, "A"); // less than 2 chars

    const saveButton = screen.getByRole("button", { name: /save changes/i });
    await user.click(saveButton);

    expect(
      await screen.findByText("Full name must be at least 2 characters")
    ).toBeInTheDocument();
  });

  it("successfully submits updated profile and fires onProfileUpdated callback", async () => {
    const user = userEvent.setup();
    const handleUpdated = vi.fn();
    const updatedUser = {
      ...settingsApi.MOCK_PROFILE,
      name: "Amara Okonkwo",
    };
    vi.mocked(settingsApi.updateProfile).mockResolvedValueOnce(updatedUser);

    render(
      <ProfileEditForm
        profile={settingsApi.MOCK_PROFILE}
        onProfileUpdated={handleUpdated}
      />
    );

    const nameInput = screen.getByLabelText(/full name/i);
    await user.clear(nameInput);
    await user.type(nameInput, "Amara Okonkwo");

    const saveButton = screen.getByRole("button", { name: /save changes/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(settingsApi.updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Amara Okonkwo" })
      );
      expect(handleUpdated).toHaveBeenCalledWith(updatedUser);
    });
  });

  it("handles profile with missing or undefined name safely without throwing TypeError", () => {
    const profileWithoutName = {
      id: "usr_no_name",
      username: "collins",
      email: "collins@example.com",
      email_verified_at: null,
      created_at: "2026-11-01T00:00:00Z",
    } as unknown as settingsApi.UserProfile;

    expect(() => {
      render(<ProfileEditForm profile={profileWithoutName} />);
    }).not.toThrow();

    expect(screen.getByText("collins")).toBeInTheDocument();
    expect(screen.getByText("Unverified")).toBeInTheDocument();
  });
});
