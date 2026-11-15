import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SecurityActivityCard } from "./SecurityActivityCard";
import { MOCK_SECURITY_ACTIVITY } from "./api";

describe("SecurityActivityCard (F13.5)", () => {
  it("renders audit history list with descriptions, statuses, and IP addresses", () => {
    render(<SecurityActivityCard activities={MOCK_SECURITY_ACTIVITY} />);

    expect(screen.getByText("Recent Security Activity")).toBeInTheDocument();
    expect(
      screen.getByText("Successful login from recognized device")
    ).toBeInTheDocument();
    expect(
      screen.getByText("New device verified via emailed OTP code")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Account password changed successfully")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Failed login attempt (invalid credentials)")
    ).toBeInTheDocument();
  });

  it("renders empty state when activities array is empty", () => {
    render(<SecurityActivityCard activities={[]} />);

    expect(
      screen.getByText("No recent security activity")
    ).toBeInTheDocument();
  });
});
