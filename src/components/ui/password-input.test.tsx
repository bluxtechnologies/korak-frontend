import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PasswordInput } from "./password-input";

describe("PasswordInput", () => {
  it("renders with type password by default and toggles visibility on button click", async () => {
    const user = userEvent.setup();
    render(<PasswordInput placeholder="Enter password" />);

    const input = screen.getByPlaceholderText("Enter password");
    expect(input).toHaveAttribute("type", "password");

    const toggleBtn = screen.getByRole("button", { name: "Show password" });
    expect(toggleBtn).toHaveAttribute("aria-pressed", "false");

    // Click to reveal password
    await user.click(toggleBtn);
    expect(input).toHaveAttribute("type", "text");
    expect(toggleBtn).toHaveAttribute("aria-label", "Hide password");
    expect(toggleBtn).toHaveAttribute("aria-pressed", "true");

    // Click again to hide password
    await user.click(toggleBtn);
    expect(input).toHaveAttribute("type", "password");
    expect(toggleBtn).toHaveAttribute("aria-label", "Show password");
    expect(toggleBtn).toHaveAttribute("aria-pressed", "false");
  });

  it("forwards ref to the underlying HTMLInputElement", () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<PasswordInput ref={ref} defaultValue="secret123" />);

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current?.value).toBe("secret123");
  });

  it("disables both input and toggle button when disabled prop is true", () => {
    render(<PasswordInput disabled placeholder="Disabled password" />);

    expect(screen.getByPlaceholderText("Disabled password")).toBeDisabled();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("applies aria-invalid styling attributes", () => {
    render(<PasswordInput aria-invalid="true" placeholder="Invalid field" />);

    const input = screen.getByPlaceholderText("Invalid field");
    expect(input).toHaveAttribute("aria-invalid", "true");
  });
});
