import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SocialAuthButtons } from "./SocialAuthButtons";

describe("SocialAuthButtons Component", () => {
  it("renders Google and Facebook buttons", () => {
    render(<SocialAuthButtons />);

    expect(
      screen.getByRole("button", { name: /continue with google/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /continue with facebook/i })
    ).toBeInTheDocument();
  });

  it("handles clicking social buttons without errors", async () => {
    const user = userEvent.setup();
    render(<SocialAuthButtons />);

    const googleBtn = screen.getByRole("button", { name: /continue with google/i });
    const facebookBtn = screen.getByRole("button", { name: /continue with facebook/i });

    await user.click(googleBtn);
    expect(window.location.hash).toBe("#google");

    await user.click(facebookBtn);
    expect(window.location.hash).toBe("#facebook");
  });
});
